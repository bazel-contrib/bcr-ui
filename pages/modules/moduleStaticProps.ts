import compareVersions from 'compare-versions'
import {
  extractModuleInfo,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
} from '../../data/utils'
import { VersionInfo } from './[module]'

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
