import React from 'react'
import Link from 'next/link'
import { formatDistance, parseISO } from 'date-fns'

export interface ModuleCardProps {
  module: string
  version: string
  authorDate?: string
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  version,
  authorDate,
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
            <div>{version}</div>
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
