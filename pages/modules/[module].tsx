import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Header, USER_GUIDE_LINK } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { listModuleNames, Metadata } from '../../data/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faStar } from '@fortawesome/free-regular-svg-icons'
import { CopyCode } from '../../components/CopyCode'
import { Badges } from '../../components/Badges'
import { PlatformSupport } from '../../components/PlatformSupport'
import { BazelVersionSupport } from '../../components/BazelVersionSupport'
import React, { useEffect, useState } from 'react'
import {
  getStaticPropsModulePage,
  VersionInfo,
} from '../../data/moduleStaticProps'
import { GithubRepositoryMetadata } from '../../data/githubMetadata'
import { faGlobe, faScaleBalanced } from '@fortawesome/free-solid-svg-icons'
import { StardocRenderer } from '../../components/Stardoc'
import { LeftNav } from '../../components/LeftNav'
import { VersionHistory } from '../../components/VersionHistory'
import { Dependencies } from '../../components/Dependencies'
import { ModuleMetadata } from '../../components/ModuleMetadata'

interface ModulePageProps {
  metadata: Metadata
  versionInfos: VersionInfo[]
  selectedVersion: string
  reverseDependencies: string[]
  githubMetadata: GithubRepositoryMetadata | null
  deprecated: boolean
}

const GITHUB_API_USER_AGENT = 'Bazel Central Registry UI'
const GITHUB_API_VERSION = '2022-11-28'

// The number of versions that should be displayed on initial page-load (before clicking "show all").
const NUM_VERSIONS_ON_PAGE_LOAD = 5
// The number of reverse dependencies that should be displayed on initial page-load (before clicking "show all").
const NUM_REVERSE_DEPENDENCIES_ON_PAGE_LOAD = 5

const ModulePage: NextPage<ModulePageProps> = ({
  metadata,
  versionInfos,
  selectedVersion,
  reverseDependencies,
  githubMetadata,
  deprecated,
}) => {
  const router = useRouter()
  const { module } = router.query
  // There may be multiple GitHub repositories specified for a module, but for now
  // the UI will only display information about the first one in the list.
  const firstGithubRepository = metadata.repository?.find((repo) =>
    repo.startsWith('github:')
  )

  const [triggeredShowAllVersions, setTriggeredShowAllVersions] =
    useState(false)
  const [
    triggeredShowAllReverseDependencies,
    setTriggeredShowAllReverseDependencies,
  ] = useState(false)

  const releaseTagFormat = useDetectReleaseFormatViaGithubApi(
    firstGithubRepository,
    selectedVersion
  )

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
  const githubLink = firstGithubRepository?.replace(
    'github:',
    'https://github.com/'
  )
  const releaseNotesLink = buildReleaseNotesLink(
    githubLink,
    selectedVersion,
    releaseTagFormat
  )

  if (!versionInfo) {
    throw Error(
      `Version information for version \`${selectedVersion}\` of module \`${module}\` could not be retrieved`
    )
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>{`${module}`}</title>
      </Head>

      <Header />

      <div className="flex flex-1 min-h-screen">
        <main className="flex-1 overflow-y-auto lg:ml-0">
          <section className="relative">
            <ModuleMetadata
              metadata={metadata}
              versionInfo={versionInfo}
              githubMetadata={githubMetadata}
              deprecated={deprecated}
              firstGithubRepository={firstGithubRepository}
              moduleName={module as string}
              version={selectedVersion}
            />

            <div className="max-w-7xl w-7xl mx-auto p-6 md:mr-80">
              <div className="divide-y">
                <div id="overview" className="flex items-center gap-1">
                  {(versionInfo.hasAttestationFile ||
                    githubMetadata?.isArchived ||
                    deprecated) && (
                    <span className="w-7 h-7 inline-block">
                      <Badges
                        hasAttestationFile={versionInfo.hasAttestationFile}
                        isArchived={githubMetadata?.isArchived || false}
                        deprecated={deprecated}
                        deprecationMessage={metadata.deprecated}
                        placement="bottom-start"
                      />
                    </span>
                  )}
                  <span
                    role="heading"
                    aria-level={1}
                    className="text-3xl translate-y-[-3px] text-bold"
                  >
                    {module}
                  </span>
                  <span className="text-lg ml-2">{selectedVersion}</span>
                </div>
                <div className="mt-4 flex flex-col md:flex-row flex-wrap sm:divide-x gap-2">
                  <div
                    id="install_history_dependencies"
                    className="basis-0 grow"
                  >
                    <h2 id="install" className="text-2xl font-bold mt-4">
                      Install
                    </h2>
                    <div className="mt-2">
                      <p>
                        To start using this module, make sure you have set up
                        Bzlmod according to the{' '}
                        <a href={USER_GUIDE_LINK}>user guide</a>, and add the
                        following to your <code>MODULE.bazel</code> file:
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
                    <VersionHistory
                      module={module as string}
                      shownVersions={shownVersions}
                      displayShowAllVersionsButton={
                        displayShowAllVersionsButton
                      }
                      versionInfos={versionInfos}
                      setTriggeredShowAllVersions={setTriggeredShowAllVersions}
                      githubMetadata={githubMetadata}
                      deprecated={deprecated}
                      metadata={metadata}
                    />
                    <Dependencies
                      versionInfo={versionInfo}
                      selectedVersion={selectedVersion}
                      reverseDependencies={reverseDependencies}
                      shownReverseDependencies={shownReverseDependencies}
                      displayShowAllReverseDependenciesButton={
                        displayShowAllReverseDependenciesButton
                      }
                      setTriggeredShowAllReverseDependencies={
                        setTriggeredShowAllReverseDependencies
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clear the float so later sections don't wrap */}
            <div className="clear-both"></div>
          </section>
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

/**
 * Encodes the format that release tags on the GitHub repository have.
 *
 * Allows us to build correct links to the release notes.
 */
enum ReleaseTagFormat {
  /**
   * Tag `1.2.3` for the version number `1.2.3`.
   */
  NO_PREFIX,
  /**
   * Tag `v1.2.3` for the version number `1.2.3`.
   */
  V_PREFIX,
  /**
   * Other tag format. Can occur if our heuristics can't detect a concrete format.
   */
  UNKNOWN,
}

const buildReleaseNotesLink = (
  githubLink: string | undefined,
  moduleVersion: string,
  releaseTagFormat: ReleaseTagFormat
): string | undefined => {
  if (!githubLink) {
    return undefined
  }

  switch (releaseTagFormat) {
    case ReleaseTagFormat.NO_PREFIX:
      return `${githubLink}/releases/tag/${moduleVersion}`
    case ReleaseTagFormat.V_PREFIX:
      return `${githubLink}/releases/tag/v${moduleVersion}`
    case ReleaseTagFormat.UNKNOWN:
      // If we don't know to format, we'll link to the release search for that module version.
      // For many cases (typo in repo, multiple modules per repo), this is still more desirable than a 404.
      return `${githubLink}/releases?q=${moduleVersion}`
  }
  // @ts-ignore: Unreachable code error
  throw new Error(
    'Unable to generate release notes link due to unknown release tag format. Should be unreachable.'
  )
}

type UseDetectReleaseFormatViaGithubApiReturns = ReleaseTagFormat

/**
 * Hook that detects the applicable `ReleaseTagFormat` for a module by sending 1-2 requests to the Github API from the browser.
 */
const useDetectReleaseFormatViaGithubApi = (
  metadataRepository: string | undefined,
  moduleVersion: string
): UseDetectReleaseFormatViaGithubApiReturns => {
  const githubOwnerAndRepo = metadataRepository?.replace('github:', '')
  // We default to `UNKNOWN`, so that we still have a reasonable default in case that e.g. the API request fails.
  const [releaseTagFormat, setReleaseTagFormat] = useState(
    ReleaseTagFormat.UNKNOWN
  )
  useEffect(() => {
    const detectReleaseFormat = async () => {
      // Don't send any requests if we don't have a repo.
      if (!githubOwnerAndRepo) {
        return
      }
      // First try is with v-prefix, as that is the most common.
      const vPrefixResponse = await fetch(
        `https://api.github.com/repos/${githubOwnerAndRepo}/releases/tags/v${moduleVersion}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'Bazel Central Registry UI',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      )
      if (vPrefixResponse.ok) {
        setReleaseTagFormat(ReleaseTagFormat.V_PREFIX)
        return
      }
      // Second try without prefix
      const noPrefixResponse = await fetch(
        `https://api.github.com/repos/${githubOwnerAndRepo}/releases/tags/${moduleVersion}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': GITHUB_API_USER_AGENT,
            'X-GitHub-Api-Version': GITHUB_API_VERSION,
          },
        }
      )
      if (noPrefixResponse.ok) {
        setReleaseTagFormat(ReleaseTagFormat.NO_PREFIX)
        return
      }
      // Neither matches -> Leave format as default value.
    }
    detectReleaseFormat()
  }, [githubOwnerAndRepo, moduleVersion])

  return releaseTagFormat
}

export default ModulePage
