import React from 'react'
import Link from 'next/link'
import { VersionInfo } from '../data/moduleStaticProps'

interface DependenciesProps {
  versionInfo: VersionInfo
  selectedVersion: string
  reverseDependencies: string[]
  shownReverseDependencies: string[]
  displayShowAllReverseDependenciesButton: boolean
  setTriggeredShowAllReverseDependencies: (value: boolean) => void
}

export const Dependencies: React.FC<DependenciesProps> = ({
  versionInfo,
  selectedVersion,
  reverseDependencies,
  shownReverseDependencies,
  displayShowAllReverseDependenciesButton,
  setTriggeredShowAllReverseDependencies,
}) => {
  return (
    <>
      <div className="mt-4">
        <h2 id="dependencies" className="text-2xl font-bold mt-4">
          Dependency graph
        </h2>
      </div>
      <div className="mt-4">
        <details open>
          <summary>
            <span role="heading" aria-level={2} className="text-1xl mt-4">
              <span className="font-bold">Direct</span> (
              {versionInfo.moduleInfo.dependencies.filter((d) => !d.dev)
                .length || 'None'}
              ){' '}
              <small className="text-sm font-normal text-gray-500">
                at version {selectedVersion}
              </small>
            </span>
          </summary>
          <ul className="mt-4">
            {versionInfo.moduleInfo.dependencies
              .filter((d) => !d.dev)
              .map((dependency) => (
                <Link
                  key={dependency.module}
                  href={`/modules/${dependency.module}/${dependency.version}`}
                >
                  <li className="p-2 mt-2 flex items-center gap-4 hover:border-gray-800">
                    <div className="rounded-full border h-14 w-14 grid place-items-center">
                      {dependency.version}
                    </div>
                    <div>{dependency.module}</div>
                  </li>
                </Link>
              ))}
            {versionInfo.moduleInfo.dependencies.filter((d) => !d.dev)
              .length === 0 && <span>No dependencies</span>}
          </ul>
        </details>
      </div>
      <div className="mt-4">
        <details>
          <summary>
            <span role="heading" aria-level={2} className="text-1xl mt-4">
              <span className="font-bold">Dev Dependencies</span> (
              {versionInfo.moduleInfo.dependencies.filter((d) => d.dev)
                .length || 'None'}
              ){' '}
            </span>
          </summary>
          <ul className="mt-4">
            {versionInfo.moduleInfo.dependencies
              .filter((d) => d.dev)
              .map((dependency) => (
                <Link
                  key={dependency.module}
                  href={`/modules/${dependency.module}/${dependency.version}`}
                >
                  <li className="p-2 mt-2 flex items-center gap-4 hover:border-gray-800">
                    <div className="rounded-full border h-14 w-14 grid place-items-center">
                      {dependency.version}
                    </div>
                    <div>{dependency.module}</div>
                  </li>
                </Link>
              ))}
            {versionInfo.moduleInfo.dependencies.length === 0 && (
              <span>No dependencies</span>
            )}
          </ul>
        </details>
      </div>
      <div className="mt-4">
        <details>
          <summary>
            <span role="heading" aria-level={2} className="text-1xl mt-4">
              <span className="font-bold">Dependents</span>{' '}
              {reverseDependencies.length > 0
                ? `(${reverseDependencies.length})`
                : ''}
            </span>
          </summary>
          <ul className="mt-4">
            {shownReverseDependencies.map((revDependency) => (
              <Link key={revDependency} href={`/modules/${revDependency}`}>
                <li className="p-2 mt-2 flex items-center gap-4 hover:border-gray-800">
                  <div>{revDependency}</div>
                </li>
              </Link>
            ))}
            {reverseDependencies.length === 0 && (
              <span>No dependent modules yet</span>
            )}
          </ul>
          {displayShowAllReverseDependenciesButton && (
            <button
              className="font-semibold p-2 mt-4 w-full hover:shadow-lg"
              onClick={() => setTriggeredShowAllReverseDependencies(true)}
            >
              Show all {reverseDependencies.length} dependent modules
            </button>
          )}
        </details>
      </div>
    </>
  )
}
