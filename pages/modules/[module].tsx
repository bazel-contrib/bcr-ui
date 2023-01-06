import type { GetStaticProps, NextPage } from 'next'
import compareVersions from 'compare-versions'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Header, USER_GUIDE_LINK } from '../../components/Header'
import { Footer } from '../../components/Footer'
import {
  extractModuleInfo,
  getModuleMetadata,
  getSubmissionCommitOfVersion,
  listModuleNames,
  Metadata,
  ModuleInfo,
} from '../../data/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { CopyCode } from '../../components/CopyCode'
import React, { useState } from 'react'
import {
  getStaticPropsModulePage,
  VersionInfo,
} from '../../data/moduleStaticProps'

interface ModulePageProps {
  metadata: Metadata
  versionInfos: VersionInfo[]
  selectedVersion: string
}

// The number of versions that should be displayed on initial page-load (before clicking "show all").
const NUM_VERSIONS_ON_PAGE_LOAD = 5

const ModulePage: NextPage<ModulePageProps> = ({
  metadata,
  versionInfos,
  selectedVersion,
}) => {
  const router = useRouter()
  const { module } = router.query

  const [triggeredShowAll, setTriggeredShowAll] = useState(false)

  const isQualifiedForShowAll = versionInfos.length > NUM_VERSIONS_ON_PAGE_LOAD
  const displayShowAllButton = isQualifiedForShowAll && !triggeredShowAll

  const versionInfo = versionInfos.find((n) => n.version === selectedVersion)
  const versionsInOrder = versionInfos.slice().reverse()

  const githubLink = metadata.repository
    ?.find((repo) => repo.startsWith('github:'))
    ?.replace('github:', 'https://github.com/')
  const releaseNotesLink = githubLink
    ? `${githubLink}/releases/tag/v${selectedVersion}`
    : undefined

  const shownVersions = triggeredShowAll
    ? versionsInOrder
    : versionsInOrder.slice(0, NUM_VERSIONS_ON_PAGE_LOAD)

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
                          className="border rounded mt-2"
                        >
                          {version.isYanked && (
                            <div
                              key={`${version.version}-yanked`}
                              className="p-2 mb-2 bg-amber-300"
                            >
                              Version yanked with comment:{' '}
                              <p>{version.yankReason}</p>
                            </div>
                          )}
                          <div className="p-2 flex items-stretch gap-4">
                            <Link
                              href={`/modules/${module}/${version.version}`}
                            >
                              <a>
                                <div className="rounded-full border h-14 w-14 grid place-items-center hover:border-gray-800">
                                  {version.version}
                                </div>
                              </a>
                            </Link>
                            <div className="flex flex-1 justify-between">
                              <div className="flex flex-col justify-between">
                                <div />
                                <div className="self-end text-gray-500">
                                  compatibility level{' '}
                                  {version.moduleInfo.compatibilityLevel}
                                </div>
                              </div>
                              <div className="flex justify-end">
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
                                  >
                                    published {version.submission.authorDateRel}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </>
                    ))}
                  </ul>
                  {displayShowAllButton && (
                    <button
                      className="font-semibold border rounded p-2 mt-4 w-full hover:shadow-lg"
                      onClick={() => setTriggeredShowAll(true)}
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
