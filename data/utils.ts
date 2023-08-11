import path from 'path'
import { formatISO, parse } from 'date-fns'
import { execa } from 'execa'
import { promises as fs } from 'fs'
import { gitlogPromise } from 'gitlog'
import * as os from 'os'
import pMemoize from 'p-memoize'
import allModules from '../pages/all-modules'

export const MODULES_ROOT_DIR = path.join(
  process.cwd(),
  'data',
  'bazel-central-registry',
  'modules'
)

export const BUILDOZER_BIN = path.join(process.cwd(), 'bin', 'buildozer')

export interface Metadata {
  homepage?: string
  maintainers: Array<{
    email?: string
    github?: string
    name?: string
  }>
  repository?: string[]
  versions: Array<string>
  yanked_versions: {
    [key: string]: string
  }
}

export const listModuleNames = async (): Promise<string[]> => {
  return await fs.readdir(MODULES_ROOT_DIR)
}

export const listModuleVersions = async (module: string): Promise<string[]> => {
  const metadata = await getModuleMetadata(module)
  return metadata.versions
}

export const getModuleMetadata = async (module: string): Promise<Metadata> => {
  const metadataJsonPath = path.join(MODULES_ROOT_DIR, module, 'metadata.json')
  const metadataContents = await fs.readFile(metadataJsonPath)
  const metadata: Metadata = JSON.parse(metadataContents.toString())

  return metadata
}

export interface SearchIndexEntry {
  module: string
  version: string
  authorDateIso: string
}

export const buildSearchIndex = async (): Promise<SearchIndexEntry[]> => {
  const moduleNames = await listModuleNames()
  return Promise.all(
    moduleNames.map(async (module) => {
      const metadata = await getModuleMetadata(module)
      const latestVersion = metadata.versions[metadata.versions.length - 1]

      const { authorDateIso } = await getSubmissionCommitOfVersion(
        module,
        latestVersion
      )

      return {
        module,
        version: latestVersion,
        authorDateIso,
      }
    })
  )
}

export interface Commit {
  hash: string
  authorDate: string
  authorDateIso: string
  authorDateRel: string
}

export const getSubmissionCommitOfVersion = async (
  module: string,
  version: string
): Promise<Commit> => {
  const options = {
    repo: path.join(process.cwd(), 'data', 'bazel-central-registry'),
    number: 10,
    file: `modules/${module}/${version}/source.json`,
    fields: ['hash', 'authorDate', 'authorDateRel'] as any,
  }

  const commits = await gitlogPromise(options)

  const commitInfo = commits[commits.length - 1] as any
  const authorDateIso = formatISO(
    parse(commitInfo.authorDate, 'yyyy-MM-dd HH:mm:ss xxxx', new Date())
  )
  return {
    ...commitInfo,
    authorDateIso,
  }
}

// TODO: find a more robust way to do this
export const getCompatibilityLevelOfVersion = async (
  module: string,
  version: string
): Promise<number> => {
  const moduleFilePath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'MODULE.bazel'
  )
  const moduleFileContents = (await fs.readFile(moduleFilePath)).toString()

  const PATTERN = 'compatibility_level = '
  const pos = moduleFileContents.search(PATTERN)
  const posAfterPattern = pos + PATTERN.length
  const nextCharsAfterPos = moduleFileContents.slice(posAfterPattern)
  const [level] = nextCharsAfterPos.split(',')

  return Promise.resolve(parseInt(level, 10))
}

export interface ModuleInfo {
  compatibilityLevel: number
  dependencies: Dependency[]
}

interface Dependency {
  module: string
  version: string
}

/**
 * Extract information from `MODULE.bazel` file via buildozer
 */
export const extractModuleInfo = async (
  module: string,
  version: string
): Promise<ModuleInfo> => {
  const moduleFilePath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'MODULE.bazel'
  )

  // Copy `MODULE.bazel` to `BUILD.bazel` file so it is found by buildozer
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'buildozer-analyze-'),
    {
      encoding: 'utf8',
    }
  )
  await fs.cp(moduleFilePath, path.join(directory, 'BUILD.bazel'))

  const { stdout: compatibilityLevelOut } = await execa(
    BUILDOZER_BIN,
    ['print compatibility_level', ':%module'],
    { cwd: directory }
  )
  const compatibilityLevel = parseInt(compatibilityLevelOut, 10) || 0

  const { stdout: listDepNamesOut } = await execa(
    BUILDOZER_BIN,
    ['print name', ':%bazel_dep'],
    { cwd: directory }
  )
  const { stdout: listDepVersionsOut } = await execa(
    BUILDOZER_BIN,
    ['print version', ':%bazel_dep'],
    { cwd: directory }
  )
  const depNames = listDepNamesOut.split(/\r?\n/)
  const depVersions = listDepVersionsOut.split(/\r?\n/)

  const dependencies: Dependency[] = []

  if (listDepVersionsOut !== '') {
    depNames.forEach((name, i) => {
      const version = depVersions[i]
      dependencies.push({
        module: name,
        version,
      } as Dependency)
    })
  }

  return {
    compatibilityLevel,
    dependencies,
  }
}

type AllModuleInfo = {
  allModules: {
    // key = module name
    [key: string]: {
      // key = module version
      [key: string]: ModuleInfo
    }
  }
  // Map of module names to their dependents (currently doesn't track version information)
  reverseDependencies: {
    // key = module name of module that is the dependency
    // value = all modules that depend on the dependency
    [key: string]: Set<string>
  }
}

/**
 * Builds a list of all module info.
 *
 * This is done because we will need all module info anyways to build the site, and this acts as a cache for
 * all the slower filesystem dependant actions.
 *
 * @see allModuleInfo
 */
const buildAllModuleInfoInner = async (): Promise<AllModuleInfo> => {
  const allModuleInfo: AllModuleInfo = {
    allModules: {},
    reverseDependencies: {},
  }

  const modulesNames = await listModuleNames()
  for (const moduleName of modulesNames) {
    const versions = await listModuleVersions(moduleName)
    for (const moduleVersion of versions) {
      const moduleInfo = await extractModuleInfo(moduleName, moduleVersion)
      allModuleInfo.allModules[moduleName] ||= {}
      allModuleInfo.allModules[moduleName][moduleVersion] = moduleInfo

      for (const dependency of moduleInfo.dependencies) {
        allModuleInfo.reverseDependencies[dependency.module] ||= new Set()
        allModuleInfo.reverseDependencies[dependency.module].add(moduleName)
      }
    }
  }

  return allModuleInfo
}

export const allModuleInfo = pMemoize(buildAllModuleInfoInner)

export const moduleInfo = async (
  module: string,
  version: string
): Promise<ModuleInfo> => {
  const all = await allModuleInfo()
  return all.allModules[module][version]
}

export const reverseDependencies = async (
  module: string
): Promise<string[]> => {
  const all = await allModuleInfo()
  const reverseDeps = Array.from(all.reverseDependencies[module] || [])
  reverseDeps.sort()
  return reverseDeps
}
