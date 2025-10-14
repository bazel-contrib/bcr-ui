import DocsPage from '../[module]'
import { GetStaticProps } from 'next'
import { listModuleNames, listModuleVersions } from '../../../data/utils'
import { getStaticPropsModulePage } from '../../../data/moduleStaticProps'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { module, version } = params as any

  return await getStaticPropsModulePage(module, version)
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

export default DocsPage
