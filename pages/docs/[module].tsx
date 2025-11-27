import type { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { StardocRenderer } from '../../components/Stardoc'
import { StardocNav } from '../../components/StardocNav'
import {
  getStaticPropsModulePage,
  VersionInfo,
} from '../../data/moduleStaticProps'

interface DocsPageProps {
  versionInfos: VersionInfo[]
  selectedVersion: string | null
}

const DocsPage: NextPage<DocsPageProps> = ({
  versionInfos,
  selectedVersion,
}) => {
  const router = useRouter()
  const { module } = router.query

  // If no selectedVersion or version not found, use the latest version
  const latestVersion = versionInfos[0]?.version
  const targetVersion = selectedVersion || latestVersion
  const versionInfo = versionInfos.find((n) => n.version === targetVersion)

  if (!versionInfo) {
    throw Error(
      `Version information for version \`${targetVersion}\` of module \`${module}\` could not be retrieved`
    )
  }

  return (
    <div className="flex flex-col">
      <Header />
      <div id="overview" className="p-6 border-b-2 border-bzl-green-light">
        <span
          role="heading"
          aria-level={1}
          className="text-3xl translate-y-[-3px] text-bold"
        >
          {module}
        </span>
        <span className="text-lg ml-2">API docs @{targetVersion}</span>
      </div>

      <div className="flex flex-1 min-h-screen">
        <div className="hidden lg:block">
          <StardocNav
            moduleName={module as string}
            version={targetVersion}
            stardocs={versionInfo.stardocs}
          />
        </div>

        <main className="flex-1 overflow-y-auto lg:ml-0">
          <div className="max-w-7xl w-7xl mx-auto p-6">
            {versionInfo.stardocs.length > 0 ? (
              <div className="space-y-4">
                {versionInfo.stardocs.map((stardoc, index) => (
                  <StardocRenderer
                    key={stardoc.file || index}
                    stardoc={stardoc}
                    moduleName={module as string}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No API Documentation Available
                </h2>
                <p className="text-gray-500">
                  This module does not publish Starlark API documentation yet.
                  <br />
                  Module authors: you can add documentation. Read the
                  instructions at:
                  <br />
                  <a href="https://github.com/bazelbuild/bazel-central-registry/blob/main/docs/stardoc.md">
                    https://github.com/bazelbuild/bazel-central-registry/blob/main/docs/stardoc.md
                  </a>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { module } = params as any

  return await getStaticPropsModulePage(module, null)
}

export async function getStaticPaths() {
  // For now, we'll use the same module list as the main module pages
  // In the future, we might want to filter this to only modules that have documentation
  const { listModuleNames } = await import('../../data/utils')
  const modulesNames = await listModuleNames()

  // Next.js would write the static props snapshot for a "modules/boost" dynamic route to "boost.json"
  // but there is also a BCR module of that name. So skip build-time pre-rendering of the boost module.
  const paths = modulesNames
    .filter((name) => name != 'boost')
    .map((name) => ({
      params: { module: name },
    }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export default DocsPage
