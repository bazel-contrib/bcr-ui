import React from 'react'
import Link from 'next/link'
import { formatDistance, parseISO } from 'date-fns'
import { Badges } from './Badges'

export interface ModuleCardProps {
  module: string
  version: string
  authorDate?: string
  hasAttestationFile?: boolean
  hasStardocs?: boolean
  hasFundingLinks?: boolean
  isArchived?: boolean
  deprecated?: boolean
  deprecationMessage?: string | null
  repoDescription?: string | null
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  version,
  authorDate,
  hasAttestationFile = false,
  hasStardocs = false,
  hasFundingLinks = false,
  isArchived = false,
  deprecated = false,
  deprecationMessage,
  repoDescription,
}) => {
  const authorDateRel = authorDate
    ? formatDistance(parseISO(authorDate), new Date(), { addSuffix: true })
    : null

  return (
    <Link href={`/modules/${module}`}>
      <div className={`w-full border rounded flex flex-col shadow-sm hover:shadow-lg ${repoDescription ? 'min-h-[120px]' : 'h-24'}`}>
        <div className="w-full p-4 flex justify-between flex-col">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="font-bold">{module}</div>
              <div className="flex items-center gap-2">
                {version}
                <Badges
                  hasAttestationFile={hasAttestationFile}
                  hasStardocs={hasStardocs}
                  hasFundingLinks={hasFundingLinks}
                  isArchived={isArchived}
                  deprecated={deprecated}
                  deprecationMessage={deprecationMessage}
                />
              </div>
            </div>
            <div className="flex ml-4">
              {authorDateRel && (
                <div className="text-gray-500 self-start text-sm" suppressHydrationWarning>
                  updated {authorDateRel}
                </div>
              )}
            </div>
          </div>
          {repoDescription && (
            <div className="mt-2 text-sm text-gray-600 overflow-hidden">
              <p className="overflow-hidden text-ellipsis" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {repoDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
