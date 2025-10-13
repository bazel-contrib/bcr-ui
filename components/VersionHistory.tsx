import React from 'react'
import Link from 'next/link'
import { formatDistance, parseISO } from 'date-fns'
import { Badges } from './Badges'
import { VersionInfo } from '../data/moduleStaticProps'
import { Metadata } from '../data/utils'
import { GithubRepositoryMetadata } from '../data/githubMetadata'

interface VersionHistoryProps {
  module: string
  shownVersions: VersionInfo[]
  displayShowAllVersionsButton: boolean
  versionInfos: VersionInfo[]
  setTriggeredShowAllVersions: (value: boolean) => void
  githubMetadata: GithubRepositoryMetadata | null
  deprecated: boolean
  metadata: Metadata
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  module,
  shownVersions,
  displayShowAllVersionsButton,
  versionInfos,
  setTriggeredShowAllVersions,
  githubMetadata,
  deprecated,
  metadata,
}) => {
  return (
    <>
      <h2 id="version-history" className="text-2xl font-bold mt-4">
        Version history
      </h2>
      <div>
        <ul className="mt-4">
          {shownVersions.map((version) => (
            <li key={version.version} className="mt-2">
              {version.isYanked ? (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-3xl">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-500 text-xl">🚫</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        <a
                          href="https://bazel.build/external/module#yanked_versions"
                          className="underline decoration-dashed decoration-yellow-600 hover:decoration-yellow-800"
                        >
                          Version yanked
                        </a>
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        {version.yankReason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-stretch gap-4">
                    <div className="flex flex-1 justify-between">
                      <div className="flex p-2 flex-col gap-2 justify-between border-r hover:border-link-color hover:border-r-4">
                        <Link href={`/modules/${module}/${version.version}`}>
                          <div className="place-items-center hover:border-gray-800 flex items-center gap-2">
                            {version.version}
                            <Badges
                              hasAttestationFile={version.hasAttestationFile}
                              isArchived={githubMetadata?.isArchived || false}
                              deprecated={deprecated}
                              deprecationMessage={metadata.deprecated}
                            />
                          </div>
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
                              parseISO(version.submission.authorDateIso),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-stretch gap-4">
                  <div className="flex flex-1 justify-between">
                    <div className="flex p-2 flex-col gap-2 justify-between border-r hover:border-link-color hover:border-r-4">
                      <Link href={`/modules/${module}/${version.version}`}>
                        <div className="place-items-center hover:border-gray-800 flex items-center gap-2">
                          {version.version}
                          <Badges
                            hasAttestationFile={version.hasAttestationFile}
                            isArchived={githubMetadata?.isArchived || false}
                            deprecated={deprecated}
                            deprecationMessage={metadata.deprecated}
                          />
                        </div>
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
                            parseISO(version.submission.authorDateIso),
                            new Date(),
                            { addSuffix: true }
                          )}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        {displayShowAllVersionsButton && (
          <button
            className="font-semibold p-2 mt-4 w-full hover:shadow-lg"
            onClick={() => setTriggeredShowAllVersions(true)}
          >
            Show all {versionInfos.length} versions
          </button>
        )}
      </div>
    </>
  )
}
