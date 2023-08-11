import { compareVersions, validate as validateVersion } from 'compare-versions'
import {
  extractModuleInfo,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
  moduleInfo,
  ModuleInfo,
} from './utils'

export interface VersionInfo {
  version: string
  submission: {
    hash: string
    authorDateIso: string
  }
  moduleInfo: ModuleInfo
  isYanked: boolean
  yankReason: string | null
}

// [module]/[version] needs to reuse the same logic
export const getStaticPropsModulePage = async (
  module: string,
  version: string | null
) => {
  const metadata = await getModuleMetadata(module)
  let { versions } = metadata
  versions = sortVersions(versions)

  const versionInfos: VersionInfo[] = await Promise.all(
    versions.map(async (version) => ({
      version,
      submission: await getSubmissionCommitOfVersion(module, version),
      moduleInfo: await moduleInfo(module, version),
      isYanked: Object.keys(metadata.yanked_versions).includes(version),
      yankReason: metadata.yanked_versions[version] || null,
    }))
  )

  const latestVersion = versions[0]
  const selectedVersion = version || latestVersion

  return {
    props: {
      metadata,
      versionInfos,
      selectedVersion,
    },
  }
}

/**
 * Sort versions, by splitting them into sortable and unsortable ones.
 *
 * The sortable versions will form the start of the list and are sorted, while the unsortable ones will
 * form the end of it.
 *
 * This is mostly a placeholder until we have proper version parsing and comparison
 * (see discussion in https://github.com/bazel-contrib/bcr-ui/issues/54).
 */
const sortVersions = (versions: string[]): string[] => {
  const sortableVersions = versions.filter((version) =>
    validateVersion(version)
  )
  const unsortableVersions = versions.filter(
    (version) => !validateVersion(version)
  )
  sortableVersions.sort(compareVersions)
  sortableVersions.reverse()

  return [...sortableVersions, ...unsortableVersions]
}
