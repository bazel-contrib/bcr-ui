import { detectPlatformInfo } from '../data/platformMapping'

interface PlatformSupportProps {
  platforms: string[]
}

export const PlatformSupport = ({ platforms }: PlatformSupportProps) => {
  if (!platforms || platforms.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Platform support information not available
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mt-4 mb-2">Tested on</h2>

      <div className="space-y-1">
        {platforms.map((platformId) => {
          const platformInfo = detectPlatformInfo(platformId)

          return (
            <div
              key={platformId}
              className="flex items-center text-sm"
              title={platformInfo.name}
            >
              <span className="mr-2">{platformInfo.emoji}</span>
              <span>{platformInfo.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
