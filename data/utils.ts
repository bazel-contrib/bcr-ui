import path from 'path'
import { formatISO, parse } from 'date-fns'
import { execa } from 'execa'
import { promises as fs } from 'fs'
import { gitlogPromise } from 'gitlog'
import * as os from 'os'
import pMemoize from 'p-memoize'
import yaml from 'js-yaml'

export const MODULES_ROOT_DIR = path.join(
  process.cwd(),
  'data',
  'bazel-central-registry',
  'modules'
)

export interface Metadata {
  homepage?: string
  maintainers?: Array<{
    email?: string
    github?: string
    name?: string
  }>
  repository?: string[]
  versions: Array<string>
  yanked_versions?: {
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

export const getModuleMetadataInner = async (
  module: string
): Promise<Metadata> => {
  const metadataJsonPath = path.join(MODULES_ROOT_DIR, module, 'metadata.json')
  const metadataContents = await fs.readFile(metadataJsonPath)
  const metadata: Metadata = JSON.parse(metadataContents.toString())

  return metadata
}

export const getModuleMetadata = pMemoize(getModuleMetadataInner)

export interface SearchIndexEntry {
  module: string
  version: string
  authorDateIso: string
  hasAttestationFile: boolean
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
        hasAttestationFile: await hasAttestationFile(module, latestVersion),
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

const getSubmissionCommitOfVersionInternal = async (
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

export const getSubmissionCommitOfVersion = pMemoize(
  getSubmissionCommitOfVersionInternal,
  {
    cacheKey: (arguments_) => JSON.stringify(arguments_),
  }
)

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
  supportedPlatforms?: string[]
  supportedBazelVersions?: string[]
}

interface Dependency {
  dev: boolean
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
    'buildozer',
    ['print compatibility_level', ':%module'],
    { cwd: directory }
  )
  const compatibilityLevel = parseInt(compatibilityLevelOut, 10) || 0

  const { stdout: listDepNamesOut } = await execa(
    'buildozer',
    ['print name', ':%bazel_dep'],
    { cwd: directory }
  )
  const { stdout: listDepVersionsOut } = await execa(
    'buildozer',
    ['print version', ':%bazel_dep'],
    { cwd: directory }
  )
  const { stdout: listDepDevOut } = await execa(
    'buildozer',
    ['print dev_dependency', ':%bazel_dep'],
    { cwd: directory }
  )
  const depNames = listDepNamesOut.split(/\r?\n/)
  const depVersions = listDepVersionsOut.split(/\r?\n/)
  const depDevStatuses = listDepDevOut.split(/\r?\n/)

  const dependencies: Dependency[] = []

  if (listDepVersionsOut !== '') {
    depNames.forEach((name, i) => {
      const version = depVersions[i]
      const dev = depDevStatuses[i] === 'True'

      dependencies.push({
        module: name,
        dev,
        version,
      } as Dependency)
    })
  }

  const supportedPlatforms = await getPresubmitPlatforms(module, version)
  const supportedBazelVersions = await getPresubmitBazelVersions(
    module,
    version
  )

  return {
    compatibilityLevel,
    dependencies,
    supportedPlatforms,
    supportedBazelVersions,
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

export const hasAttestationFile = async (
  module: string,
  version: string
): Promise<boolean> => {
  const attestationsFilePath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'attestations.json'
  )

  try {
    await fs.access(attestationsFilePath)
    return true
  } catch {
    return false
  }
}

export const reverseDependencies = async (
  module: string
): Promise<string[]> => {
  const all = await allModuleInfo()
  const reverseDeps = Array.from(all.reverseDependencies[module] || [])
  reverseDeps.sort()
  return reverseDeps
}

interface PresubmitConfig {
  bcr_test_module?: {
    matrix?: {
      platform?: string[]
      bazel?: string[]
    }
  }
  matrix?: {
    platform?: string[]
    bazel?: string[]
  }
  tasks?: {
    [taskName: string]: {
      platform?: string
      bazel?: string
    }
  }
}

export const getPresubmitPlatforms = async (
  module: string,
  version: string
): Promise<string[]> => {
  const presubmitYmlPath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'presubmit.yml'
  )
  const presubmitYamlPath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'presubmit.yaml'
  )

  let presubmitContents: string
  try {
    presubmitContents = await fs.readFile(presubmitYmlPath, 'utf8')
  } catch {
    try {
      presubmitContents = await fs.readFile(presubmitYamlPath, 'utf8')
    } catch {
      return []
    }
  }

  try {
    const config = yaml.load(presubmitContents) as PresubmitConfig

    const allPlatforms: string[] = []

    // Collect from bcr_test_module.matrix.platform (newer format)
    const bcrPlatforms = config?.bcr_test_module?.matrix?.platform
    if (bcrPlatforms && bcrPlatforms.length > 0) {
      allPlatforms.push(...bcrPlatforms)
    }

    // Collect from root matrix.platform (older format)
    const matrixPlatforms = config?.matrix?.platform
    if (matrixPlatforms && matrixPlatforms.length > 0) {
      allPlatforms.push(...matrixPlatforms)
    }

    // Collect from individual task platforms (rules_apple/rules_swift format)
    if (config?.tasks) {
      for (const taskConfig of Object.values(config.tasks)) {
        if (taskConfig.platform) {
          allPlatforms.push(taskConfig.platform)
        }
      }
    }

    // Filter out template variables and return unique platforms
    const filteredPlatforms = allPlatforms.filter(
      (platform) => !platform.includes('${{') && !platform.includes('}}')
    )
    return Array.from(new Set(filteredPlatforms))
  } catch (error) {
    return []
  }
}

export const getPresubmitBazelVersions = async (
  module: string,
  version: string
): Promise<string[]> => {
  const presubmitYmlPath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'presubmit.yml'
  )
  const presubmitYamlPath = path.join(
    MODULES_ROOT_DIR,
    module,
    version,
    'presubmit.yaml'
  )

  let presubmitContents: string
  try {
    presubmitContents = await fs.readFile(presubmitYmlPath, 'utf8')
  } catch {
    try {
      presubmitContents = await fs.readFile(presubmitYamlPath, 'utf8')
    } catch {
      return []
    }
  }

  try {
    const config = yaml.load(presubmitContents) as PresubmitConfig

    const allBazelVersions: string[] = []

    const bcrBazelVersions = config?.bcr_test_module?.matrix?.bazel
    if (bcrBazelVersions && bcrBazelVersions.length > 0) {
      allBazelVersions.push(...bcrBazelVersions)
    }

    const matrixBazelVersions = config?.matrix?.bazel
    if (matrixBazelVersions && matrixBazelVersions.length > 0) {
      allBazelVersions.push(...matrixBazelVersions)
    }

    if (config?.tasks) {
      for (const taskConfig of Object.values(config.tasks)) {
        if (taskConfig.bazel) {
          allBazelVersions.push(taskConfig.bazel)
        }
      }
    }

    const filteredVersions = allBazelVersions.filter(
      (version) => !version.includes('${{') && !version.includes('}}')
    )
    return Array.from(new Set(filteredVersions))
  } catch (error) {
    return []
  }
}
