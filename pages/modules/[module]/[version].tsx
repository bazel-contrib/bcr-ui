import ModulePage, { VersionInfo } from '../[module]'
import { GetStaticProps } from 'next'
import {
  extractModuleInfo,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
  listModuleNames,
  listModuleVersions,
} from '../../../data/utils'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { module, version } = params as any
  const metadata = await getModuleMetadata(module)

  const versionInfos: VersionInfo[] = await Promise.all(
    metadata.versions.map(async (version) => ({
      version,
      submission: await getSubmissionCommitOfVersion(module, version),
      moduleInfo: await extractModuleInfo(module, version),
    }))
  )

  const selectedVersion = version

  return {
    props: {
      metadata,
      versionInfos,
      selectedVersion,
    },
  }
}

export async function getStaticPaths() {
  const modulesNames = await listModuleNames()

  const paths = (
    await Promise.all(
      modulesNames.map(async (name) => {
        const versions = await listModuleVersions(name)
        return versions.map((version) => {
          return {
            params: { module: name, version },
          }
        })
      })
    )
  ).flatMap((n) => n)

  return {
    paths,
    // TODO: fallback true?
    fallback: false,
  }
}

export default ModulePage
