import { detectBazelVersionInfo } from '../data/bazelVersionMapping'

interface BazelVersionSupportProps {
  versions: string[]
}

export const BazelVersionSupport = ({ versions }: BazelVersionSupportProps) => {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Bazel version support information not available
      </div>
    )
  }

  const sortedVersions = versions.map(detectBazelVersionInfo).sort((a, b) => {
    if (a.category === 'rolling' && b.category !== 'rolling') return 1
    if (b.category === 'rolling' && a.category !== 'rolling') return -1
    return a.sortOrder - b.sortOrder
  })

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold mt-4 mb-2">Bazel versions</h3>

      <div className="space-y-1">
        {sortedVersions.map((versionInfo) => {
          const emoji =
            versionInfo.category === 'rolling'
              ? '🔄'
              : versionInfo.category === 'lts'
              ? '🛡️'
              : '⚡'

          return (
            <div
              key={versionInfo.id}
              className="flex items-center text-sm"
              title={`${versionInfo.name} (${versionInfo.category})`}
            >
              <span className="mr-2">{emoji}</span>
              <span>{versionInfo.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
