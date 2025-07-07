export interface PlatformInfo {
  id: string
  name: string
  emoji: string
  category: 'linux' | 'macos' | 'windows'
}

export const detectPlatformInfo = (platformId: string): PlatformInfo => {
  const id = platformId.toLowerCase()

  if (id.startsWith('windows')) {
    const isArm = id.includes('arm64')
    return {
      id: platformId,
      name: isArm ? 'Windows ARM64' : 'Windows',
      emoji: '🪟',
      category: 'windows',
    }
  }

  if (id.startsWith('macos')) {
    const isArm = id.includes('arm64')
    return {
      id: platformId,
      name: isArm ? 'macOS Apple Silicon' : 'macOS',
      emoji: '🍎',
      category: 'macos',
    }
  }

  let name = platformId

  // We format common Linux distros
  if (id.startsWith('ubuntu')) {
    const version = id.replace('ubuntu', '')
    name = `Ubuntu ${version}`
  } else if (id.startsWith('debian')) {
    const version = id.replace('debian', '')
    name = `Debian ${version}`
  } else if (id.startsWith('rockylinux')) {
    const suffix = id.replace('rockylinux', '')
    name = `Rocky Linux ${suffix}`
  } else if (id.startsWith('centos')) {
    const version = id.replace('centos', '')
    name = `CentOS ${version}`
  } else if (id.startsWith('fedora')) {
    const version = id.replace('fedora', '')
    name = `Fedora ${version}`
  }

  if (id.includes('arm64') && !name.includes('ARM')) {
    name += ' ARM64'
  }

  return {
    id: platformId,
    name: name,
    emoji: '🐧',
    category: 'linux',
  }
}

export const getPlatformsByCategory = (platforms: string[]) => {
  const categorized = {
    linux: [] as PlatformInfo[],
    macos: [] as PlatformInfo[],
    windows: [] as PlatformInfo[],
  }

  platforms.forEach((platformId) => {
    const platformInfo = detectPlatformInfo(platformId)
    categorized[platformInfo.category].push(platformInfo)
  })

  return categorized
}

export const hasWindowsSupport = (platforms: string[]): boolean => {
  return platforms.some((platform) => platform.startsWith('windows'))
}
