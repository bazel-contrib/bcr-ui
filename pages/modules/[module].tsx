import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Header, USER_GUIDE_LINK } from '../../components/Header'
import { Footer } from '../../components/Footer'
import {
  extractModuleInfo,
  getCompatibilityLevelOfVersion,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
  listModuleNames,
  Metadata,
  ModuleInfo,
} from '../../data/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'

interface ModulePageProps {
  metadata: Metadata
  versionInfos: VersionInfo[]
}

const ModulePage: NextPage<ModulePageProps> = ({ metadata, versionInfos }) => {
  const router = useRouter()
  const { module } = router.query

  const latestVersion = metadata.versions[metadata.versions.length - 1]
  const version = latestVersion

  const versionInfo = versionInfos.find((n) => n.version === version)
  if (!versionInfo) {
    throw Error(
      `Version information for version \`${version}\` of module \`${module}\` could not be retrieved`
    )
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>Bazel Central Registry | {module}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main>
        <div className="max-w-4xl w-4xl mx-auto mt-8">
          <div className="border rounded p-4 divide-y">
            <div>
              <span className="text-3xl">{module}</span>
              <span className="text-lg ml-2">{latestVersion}</span>
            </div>
            <div className="mt-4 flex divide-x gap-2">
              <div>
                <h2 className="text-2xl font-bold mt-4">Install</h2>
                <div className="mt-2">
                  <p>
                    To start using this module, make sure you have set up Bzlmod
                    according to the <a href={USER_GUIDE_LINK}>user guide</a>,
                    and add the following to your <code>MODULE.bazel</code>{' '}
                    file:
                  </p>
                  <div className="p-2 mt-4 rounded bg-gray-200">
                    <code>{`bazel_dep(name = "${module}", version = "${latestVersion}")`}</code>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mt-4">Version history</h2>
                <div>
                  <ul className="mt-4">
                    {versionInfos.reverse().map((version) => (
                      <li
                        key={version.version}
                        className="border rounded p-2 mt-2 flex items-center gap-4"
                      >
                        <div className="rounded-full border h-14 w-14 grid place-items-center">
                          {version.version}
                        </div>
                        <div className="self-end text-gray-500">
                          compatibility level{' '}
                          {version.moduleInfo.compatibilityLevel}
                        </div>
                        <a
                          href={`https://github.com/bazelbuild/bazel-central-registry/commit/${version.submission.hash}`}
                          className="ml-auto self-end text-link-color hover:text-link-color-hover"
                        >
                          published {version.submission.authorDateRel}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <h2 className="text-2xl font-bold mt-4">Dependencies</h2>
                <div>
                  <ul className="mt-4">
                    {versionInfo.moduleInfo.dependencies.map((dependency) => (
                      <a
                        key={dependency.module}
                        href={`/modules/${dependency.module}`}
                      >
                        <li className="border rounded p-2 mt-2 flex items-center gap-4">
                          <div className="rounded-full border h-14 w-14 grid place-items-center">
                            {dependency.version}
                          </div>
                          <div>{dependency.module}</div>
                        </li>
                      </a>
                    ))}
                    {versionInfo.moduleInfo.dependencies.length === 0 && (
                      <span>No dependencies</span>
                    )}
                  </ul>
                </div>
              </div>
              <div id="metadata" className="mt-4 pl-2">
                <h2 className="text-2xl font-bold mt-4">Metadata</h2>
                <div>
                  <h3 className="font-bold text-xl mt-2">Homepage</h3>
                  <div>
                    <a
                      href={metadata.homepage}
                      className="text-link-color hover:text-link-color-hover"
                    >
                      {metadata.homepage}
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mt-2">Maintainers</h3>
                  <div>
                    <ul>
                      {metadata.maintainers.map(({ name, email, github }) => (
                        <li key="name">
                          <span>
                            {email && (
                              <a
                                className="text-link-color hover:text-link-color-hover cursor-pointer mr-1"
                                href={`mailto:${email}`}
                              >
                                <FontAwesomeIcon icon={faEnvelope} />
                              </a>
                            )}
                            {github && (
                              <a
                                className="text-link-color hover:text-link-color-hover cursor-pointer mr-1"
                                href={`https://github.com/${github}`}
                              >
                                <FontAwesomeIcon icon={faGithub} />
                              </a>
                            )}
                            {name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="flex-grow" />
      <Footer />
    </div>
  )
}

interface VersionInfo {
  version: string
  submission: {
    hash: string
    authorDate: string
    authorDateRel: string
  }
  moduleInfo: ModuleInfo
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { module } = params as any
  const metadata = await getModuleMetadata(module)

  const versionInfos: VersionInfo[] = await Promise.all(
    metadata.versions.map(async (version) => ({
      version,
      submission: await getSubmissionCommitOfVersion(module, version),
      moduleInfo: await extractModuleInfo(module, version),
    }))
  )

  return {
    props: {
      metadata,
      versionInfos,
    },
  }
}

export async function getStaticPaths() {
  const modulesNames = await listModuleNames()

  const paths = modulesNames.map((name) => ({
    params: { module: name },
  }))

  return {
    paths,
    // TODO: fallback true?
    fallback: false,
    // fallback: true, false or "blocking" // See the "fallback" section below
  }
}

export default ModulePage
