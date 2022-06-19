import React from 'react'

export interface ModuleCardProps {
  module: string
  version: string
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, version }) => {
  return (
    <a href={`/modules/${module}`}>
      <div className="w-48 h-24 border rounded flex flex-col items-center justify-center shadow-sm hover:shadow-lg">
        <div className="font-bold">{module}</div>
        <div>{version}</div>
      </div>
    </a>
  )
}
