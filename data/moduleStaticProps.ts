import {
  extractModuleInfo,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
  hasAttestationFile,
  moduleInfo,
  ModuleInfo,
  reverseDependencies,
} from './utils'
import { getGithubRepositoryMetadata } from './githubMetadata'

export interface VersionInfo {
  version: string
  submission: {
    hash: string
    authorDateIso: string
  }
  moduleInfo: ModuleInfo
  isYanked: boolean
  yankReason: string | null
  hasAttestationFile: boolean
}

// [module]/[version] needs to reuse the same logic
export const getStaticPropsModulePage = async (
  module: string,
  version: string | null
) => {
  const metadata = await getModuleMetadata(module)
  let { versions } = metadata
  versions = sortVersions(versions)
  let yankedVersions = metadata.yanked_versions || {}

  const versionInfos: VersionInfo[] = await Promise.all(
    versions.map(async (version) => ({
      version,
      submission: await getSubmissionCommitOfVersion(module, version),
      moduleInfo: await moduleInfo(module, version),
      isYanked: Object.keys(yankedVersions).includes(version),
      yankReason: yankedVersions[version] || null,
      hasAttestationFile: await hasAttestationFile(module, version),
    }))
  )

  const latestVersion = versions[0]
  const selectedVersion = version || latestVersion

  // Get GitHub metadata from static JSON files
  const githubMetadata = await getGithubRepositoryMetadata(module)
  if (!githubMetadata) {
    console.warn(`No GitHub metadata found for module ${module}`)
  }

  return {
    props: {
      metadata,
      versionInfos,
      selectedVersion,
      reverseDependencies: await reverseDependencies(module),
      githubMetadata,
    },
  }
}

/**
 * Parse and sort versions according to https://bazel.build/external/module#version_format.
 *
 * This is a placeholder until we switch to a common "Bzlmod semver" library
 * (see https://github.com/bazel-contrib/bcr-ui/issues/54#issuecomment-1521844089).
 */

type Version = {
  release: string[]
  prerelease: string[]
  original: string
}

const parseVersion = (v: string): Version => {
  const firstDash = v.indexOf('-')
  if (firstDash === -1) {
    return { release: v.split('.'), prerelease: [], original: v }
  }
  return {
    release: v.slice(0, firstDash).split('.'),
    prerelease: v.slice(firstDash + 1).split('.'),
    original: v,
  }
}

type Cmp<T> = (a: T, b: T) => number

function natural<T>(a: T, b: T): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function comparing<T, U>(f: (t: T) => U, innerCmp: Cmp<U> = natural): Cmp<T> {
  return (a: T, b: T): number => innerCmp(f(a), f(b))
}

function lexicographically<T>(elementCmp: Cmp<T> = natural): Cmp<T[]> {
  return (as: T[], bs: T[]): number => {
    for (let i = 0; i < as.length && i < bs.length; i++) {
      const result = elementCmp(as[i], bs[i])
      if (result !== 0) return result
    }
    return as.length - bs.length
  }
}

function composeCmps<T>(...cmps: Cmp<T>[]): Cmp<T> {
  return (a: T, b: T): number => {
    for (const cmp of cmps) {
      const result = cmp(a, b)
      if (result !== 0) return result
    }
    return 0
  }
}

const compareIdentifiers: Cmp<string> = composeCmps(
  comparing((id) => !/^\d+$/.test(id)), // pure numbers compare less than non-numbers
  comparing((id) => (/^\d+$/.test(id) ? parseInt(id) : 0)),
  natural
)

const compareVersions: Cmp<Version> = composeCmps(
  comparing((v) => v.release, lexicographically(compareIdentifiers)),
  comparing((v) => v.prerelease.length === 0), // nonempty prerelease compares less than empty prerelease
  comparing((v) => v.prerelease, lexicographically(compareIdentifiers))
)

const sortVersions = (versions: string[]): string[] => {
  const parsed = versions.map(parseVersion)
  parsed.sort(compareVersions)
  parsed.reverse()
  return parsed.map((v) => v.original)
}
