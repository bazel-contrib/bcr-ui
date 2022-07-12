import React from 'react'
import Link from 'next/link'

export interface ModuleCardProps {
  module: string
  version: string
  authorDateRel?: string
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  version,
  authorDateRel,
}) => {
  return (
    <Link href={`/modules/${module}`}>
      <a>
        <div className="w-96 h-24 border rounded flex flex-col items-center justify-center shadow-sm hover:shadow-lg">
          <div className="w-full p-4 flex justify-between">
            <div>
              <div className="font-bold">{module}</div>
              <div>{version}</div>
            </div>
            <div className="flex">
              {authorDateRel && (
                <div className="text-gray-500 self-end">
                  updated {authorDateRel}
                </div>
              )}
            </div>
          </div>
        </div>
      </a>
    </Link>
  )
}
