import compareVersions from 'compare-versions'
import {
  extractModuleInfo,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
  ModuleInfo,
} from './utils'

export interface VersionInfo {
  version: string
  submission: {
    hash: string
    authorDate: string
    authorDateRel: string
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
  const { versions } = metadata
  versions.sort(compareVersions)

  const versionInfos: VersionInfo[] = await Promise.all(
    versions.map(async (version) => ({
      version,
      submission: await getSubmissionCommitOfVersion(module, version),
      moduleInfo: await extractModuleInfo(module, version),
      isYanked: Object.keys(metadata.yanked_versions).includes(version),
      yankReason: metadata.yanked_versions[version] || null,
    }))
  )

  const latestVersion = versions[metadata.versions.length - 1]
  const selectedVersion = version || latestVersion

  return {
    props: {
      metadata,
      versionInfos,
      selectedVersion,
    },
  }
}
