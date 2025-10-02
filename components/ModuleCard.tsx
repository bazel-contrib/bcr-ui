import React from 'react'
import Link from 'next/link'
import { formatDistance, parseISO } from 'date-fns'
import { Badges } from './Badges'

export interface ModuleCardProps {
  module: string
  version: string
  authorDate?: string
  hasAttestationFile?: boolean
  isArchived?: boolean
  deprecated?: boolean
  deprecationMessage?: string | null
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  version,
  authorDate,
  hasAttestationFile = false,
  isArchived = false,
  deprecated = false,
  deprecationMessage,
}) => {
  const authorDateRel = authorDate
    ? formatDistance(parseISO(authorDate), new Date(), { addSuffix: true })
    : null

  return (
    <Link href={`/modules/${module}`}>
      <div className="w-full h-24 border rounded flex flex-col items-center justify-center shadow-sm hover:shadow-lg">
        <div className="w-full p-4 flex justify-between">
          <div>
            <div className="font-bold">{module}</div>
            <div className="flex items-center gap-2">
              {version}
              <Badges
                hasAttestationFile={hasAttestationFile}
                isArchived={isArchived}
                deprecated={deprecated}
                deprecationMessage={deprecationMessage}
              />
            </div>
          </div>
          <div className="flex">
            {authorDateRel && (
              <div className="text-gray-500 self-end" suppressHydrationWarning>
                updated {authorDateRel}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
