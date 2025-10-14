import React from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faStar } from '@fortawesome/free-regular-svg-icons'
import {
  faGlobe,
  faScaleBalanced,
  faEnvelope,
  faBook,
} from '@fortawesome/free-solid-svg-icons'
import { PlatformSupport } from './PlatformSupport'
import { BazelVersionSupport } from './BazelVersionSupport'
import { VersionInfo } from '../data/moduleStaticProps'
import { GithubRepositoryMetadata } from '../data/githubMetadata'
import { Metadata } from '../data/utils'

interface ModuleMetadataProps {
  metadata: Metadata
  versionInfo: VersionInfo
  githubMetadata: GithubRepositoryMetadata | null
  deprecated: boolean
  firstGithubRepository?: string
  moduleName?: string
  version?: string
}

export const ModuleMetadata: React.FC<ModuleMetadataProps> = ({
  metadata,
  versionInfo,
  githubMetadata,
  deprecated,
  firstGithubRepository,
  moduleName,
  version,
}) => {
  // Process GitHub metadata
  const repoDescription = githubMetadata?.description || undefined
  const repoLicense = githubMetadata?.license || undefined
  const repoTopics = githubMetadata?.topics || undefined
  const repoStargazers = githubMetadata?.stargazers || undefined
  const githubLink = firstGithubRepository?.replace(
    'github:',
    'https://github.com/'
  )
  return (
    <aside className="md:float-right md:p-4 md:w-64 md:overflow-y-auto md:flex-shrink-0">
      <div id="metadata" className="sm:pl-2 basis-8 md:basis-[12rem]">
        <h2 className="text-lg font-bold mt-4 mb-2">About</h2>
        {deprecated && metadata.deprecated && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-3xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  This module is deprecated
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {metadata.deprecated}
                </div>
              </div>
            </div>
          </div>
        )}
        {githubMetadata?.isArchived && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-3xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-500 text-xl">📦</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  This repository is archived
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  This module&apos;s repository is archived and no longer
                  actively maintained.
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          {repoDescription && (
            <div className="mb-2">
              <p className="text-md">{repoDescription}</p>
            </div>
          )}
          <div className="space-y-1">
            {repoTopics && (
              <div className="mb-4 mt-4 flex flex-row flex-wrap gap-1">
                {repoTopics.map((topic) => {
                  return (
                    <span
                      className="rounded-xl pl-3 pr-3 pt-0.5 pb-0.5 font-semibold mr-1 text-sm text-[#0b713b] bg-[#0b713b1a]"
                      key={topic}
                    >
                      {topic}
                    </span>
                  )
                })}
              </div>
            )}

            {metadata.homepage !== githubLink ? (
              <a
                href={metadata.homepage}
                className="block text-link-color hover:text-link-color-hover"
                title={metadata.homepage}
              >
                <FontAwesomeIcon icon={faGlobe} className="mr-1 min-w-[30px]" />
                Homepage
              </a>
            ) : null}

            {repoStargazers && (
              <div className="text-black">
                <FontAwesomeIcon className="mr-1 min-w-[30px]" icon={faStar} />
                {repoStargazers} {repoStargazers === 1 ? 'Star' : 'Stars'}
              </div>
            )}

            {repoLicense && (
              <a
                href={repoLicense.url}
                className="block text-link-color hover:text-link-color-hover cursor-pointer"
                title={repoLicense.spdx_id}
              >
                <FontAwesomeIcon
                  className="mr-1 min-w-[30px]"
                  icon={faScaleBalanced}
                />
                {repoLicense.name}
              </a>
            )}

            {githubLink && (
              <div>
                <a
                  href={githubLink}
                  className="text-link-color hover:text-link-color-hover"
                  title={githubLink}
                >
                  <FontAwesomeIcon
                    icon={faGithub}
                    className="mr-1 min-w-[30px]"
                  />
                  GitHub repository
                </a>
              </div>
            )}
          </div>
        </div>

        {moduleName && versionInfo.stardocs.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-bold mt-4 mb-2">Documentation</h2>
            <div>
              <Link
                href={`/docs/${moduleName}${version ? `/${version}` : ''}`}
                className="flex items-center text-sm text-link-color hover:text-link-color-hover transition-colors"
              >
                <FontAwesomeIcon icon={faBook} className="mr-2" />
                View API Documentation
              </Link>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-lg font-bold mt-4 mb-2">Tested on</h2>
          <PlatformSupport
            platforms={versionInfo.moduleInfo.supportedPlatforms || []}
          />
          <BazelVersionSupport
            versions={versionInfo.moduleInfo.supportedBazelVersions || []}
          />
        </div>

        <h2 className="text-lg font-bold mt-4 mb-2">Maintainers</h2>
        <div>
          <ul>
            {metadata.maintainers?.map(({ name, email, github }) => (
              <li key={name} className="ml-1.5">
                <span className="flex">
                  {email && (
                    <a
                      className="text-black hover:text-green-800 hover:scale-125 cursor-pointer mr-1"
                      href={`mailto:${email}`}
                    >
                      <FontAwesomeIcon icon={faEnvelope} />
                    </a>
                  )}
                  {github && (
                    <a
                      className="text-black hover:text-green-600 hover:scale-125 cursor-pointer mr-1"
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
    </aside>
  )
}
