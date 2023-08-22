import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Header, USER_GUIDE_LINK } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { listModuleNames, Metadata } from '../../data/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { CopyCode } from '../../components/CopyCode'
import React, { useState } from 'react'
import {
  getStaticPropsModulePage,
  VersionInfo,
} from '../../data/moduleStaticProps'
import { formatDistance, parseISO } from 'date-fns'

interface ModulePageProps {
  metadata: Metadata
  versionInfos: VersionInfo[]
  selectedVersion: string
  reverseDependencies: string[]
}

// The number of versions that should be displayed on initial page-load (before clicking "show all").
const NUM_VERSIONS_ON_PAGE_LOAD = 5
// The number of reverse dependencies that should be displayed on initial page-load (before clicking "show all").
const NUM_REVERSE_DEPENDENCIES_ON_PAGE_LOAD = 5

const ModulePage: NextPage<ModulePageProps> = ({
  metadata,
  versionInfos,
  selectedVersion,
  reverseDependencies,
}) => {
  const router = useRouter()
  const { module } = router.query

  const [triggeredShowAllVersions, setTriggeredShowAllVersions] =
    useState(false)
  const [
    triggeredShowAllReverseDependencies,
    setTriggeredShowAllReverseDependencies,
  ] = useState(false)

  const isQualifiedForShowAllVersions =
    versionInfos.length > NUM_VERSIONS_ON_PAGE_LOAD
  const displayShowAllVersionsButton =
    isQualifiedForShowAllVersions && !triggeredShowAllVersions
  const shownVersions = triggeredShowAllVersions
    ? versionInfos
    : versionInfos.slice(0, NUM_VERSIONS_ON_PAGE_LOAD)

  const isQualifiedForShowAllReverseDependencies =
    reverseDependencies.length > NUM_REVERSE_DEPENDENCIES_ON_PAGE_LOAD
  const displayShowAllReverseDependenciesButton =
    isQualifiedForShowAllReverseDependencies &&
    !triggeredShowAllReverseDependencies
  const shownReverseDependencies = triggeredShowAllReverseDependencies
    ? reverseDependencies
    : reverseDependencies.slice(0, NUM_REVERSE_DEPENDENCIES_ON_PAGE_LOAD)

  const versionInfo = versionInfos.find((n) => n.version === selectedVersion)

  const githubLink = metadata.repository
    ?.find((repo) => repo.startsWith('github:'))
    ?.replace('github:', 'https://github.com/')
  const releaseNotesLink = githubLink
    ? `${githubLink}/releases/tag/v${selectedVersion}`
    : undefined

  if (!versionInfo) {
    throw Error(
      `Version information for version \`${selectedVersion}\` of module \`${module}\` could not be retrieved`
    )
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>{`Bazel Central Registry | ${module}`}</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Header />
      <main>
        <div className="max-w-4xl w-4xl mx-auto mt-8">
          <div className="border rounded p-4 divide-y">
            <div>
              <span className="text-3xl">{module}</span>
              <span className="text-lg ml-2">{selectedVersion}</span>
            </div>
            <div className="mt-4 flex flex-wrap sm:divide-x gap-2">
              <div className="basis-0 grow-[999]">
                <h2 className="text-2xl font-bold mt-4">Install</h2>
                <div className="mt-2">
                  <p>
                    To start using this module, make sure you have set up Bzlmod
                    according to the <a href={USER_GUIDE_LINK}>user guide</a>,
                    and add the following to your <code>MODULE.bazel</code>{' '}
                    file:
                  </p>
                  <CopyCode
                    code={`bazel_dep(name = "${module}", version = "${selectedVersion}")`}
                  />
                  {!!releaseNotesLink && (
                    <p>
                      Read the{' '}
                      <a
                        href={releaseNotesLink}
                        className="text-link-color hover:text-link-color-hover"
                      >
                        Release Notes
                      </a>
                    </p>
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-4">Version history</h2>
                <div>
                  <ul className="mt-4">
                    {shownVersions.map((version) => (
                      <>
                        <li
                          key={version.version}
                          className="border rounded mt-2 "
                        >
                          {version.isYanked && (
                            <div
                              key={`${version.version}-yanked`}
                              className="p-2 mb-2 bg-amber-300"
                            >
                              <a
                                href="https://bazel.build/external/module#yanked_versions"
                                className="underline decoration-dashed decoration-gray-500 hover:decoration-black"
                              >
                                Version yanked
                              </a>{' '}
                              with comment: <p>{version.yankReason}</p>
                            </div>
                          )}
                          <div className="flex items-stretch gap-4">
                            <div className="flex flex-1 justify-between">
                              <div className="flex p-2 flex-col gap-2 justify-between border-r hover:border-link-color hover:border-r-4">
                                <Link
                                  href={`/modules/${module}/${version.version}`}
                                >
                                  <a>
                                    <div className="place-items-center hover:border-gray-800">
                                      {version.version}
                                    </div>
                                  </a>
                                </Link>
                                <div className="self-end text-gray-500">
                                  <a
                                    href="https://bazel.build/external/module#compatibility_level"
                                    className="underline decoration-dashed decoration-gray-500 hover:decoration-black"
                                  >
                                    compatibility level
                                  </a>{' '}
                                  {version.moduleInfo.compatibilityLevel}
                                </div>
                              </div>
                              <div className="flex p-2 justify-end">
                                <div className="flex flex-col justify-between items-end">
                                  <a
                                    href={`https://github.com/bazelbuild/bazel-central-registry/tree/main/modules/${module}/${version.version}`}
                                    className="text-link-color hover:text-link-color-hover"
                                  >
                                    view registry source
                                  </a>
                                  <a
                                    href={`https://github.com/bazelbuild/bazel-central-registry/commit/${version.submission.hash}`}
                                    className="text-link-color hover:text-link-color-hover"
                                    suppressHydrationWarning
                                  >
                                    published{' '}
                                    {formatDistance(
                                      parseISO(
                                        version.submission.authorDateIso
                                      ),
                                      new Date(),
                                      { addSuffix: true }
                                    )}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </>
                    ))}
                  </ul>
                  {displayShowAllVersionsButton && (
                    <button
                      className="font-semibold border rounded p-2 mt-4 w-full hover:shadow-lg"
                      onClick={() => setTriggeredShowAllVersions(true)}
                    >
                      Show all {versionInfos.length} versions
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-4">
                  Dependencies{' '}
                  <small className="text-sm font-normal text-gray-500">
                    (of version {selectedVersion})
                  </small>
                </h2>
                <div>
                  <ul className="mt-4">
                    {versionInfo.moduleInfo.dependencies.map((dependency) => (
                      <Link
                        key={dependency.module}
                        href={`/modules/${dependency.module}/${dependency.version}`}
                      >
                        <a>
                          <li className="border rounded p-2 mt-2 flex items-center gap-4 hover:border-gray-800">
                            <div className="rounded-full border h-14 w-14 grid place-items-center">
                              {dependency.version}
                            </div>
                            <div>{dependency.module}</div>
                          </li>
                        </a>
                      </Link>
                    ))}
                    {versionInfo.moduleInfo.dependencies.length === 0 && (
                      <span>No dependencies</span>
                    )}
                  </ul>
                </div>
                <h2 className="text-2xl font-bold mt-4">Dependents</h2>
                <div>
                  <ul className="mt-4">
                    {shownReverseDependencies.map((revDependency) => (
                      <Link
                        key={revDependency}
                        href={`/modules/${revDependency}`}
                      >
                        <a>
                          <li className="border rounded p-2 mt-2 flex items-center gap-4 hover:border-gray-800">
                            <div>{revDependency}</div>
                          </li>
                        </a>
                      </Link>
                    ))}
                    {reverseDependencies.length === 0 && (
                      <span>No dependent modules</span>
                    )}
                  </ul>
                  {displayShowAllReverseDependenciesButton && (
                    <button
                      className="font-semibold border rounded p-2 mt-4 w-full hover:shadow-lg"
                      onClick={() =>
                        setTriggeredShowAllReverseDependencies(true)
                      }
                    >
                      Show all {reverseDependencies.length} dependent modules
                    </button>
                  )}
                </div>
              </div>
              <div id="metadata" className="mt-4 sm:pl-2 basis-8 grow">
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
                        <li key={name}>
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { module } = params as any

  return await getStaticPropsModulePage(module, null)
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
  }
}

export default ModulePage
