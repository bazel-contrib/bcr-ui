export interface BazelVersionInfo {
  id: string
  name: string
  category: 'stable' | 'rolling' | 'lts'
  sortOrder: number
}

export function detectBazelVersionInfo(versionId: string): BazelVersionInfo {
  const version = versionId.toLowerCase().trim()

  if (version === 'rolling') {
    return {
      id: versionId,
      name: 'Bazel Rolling',
      category: 'rolling',
      sortOrder: 999,
    }
  }

  const versionMatch = version.match(/^(\d+)\.x$/)
  if (versionMatch) {
    const majorVersion = parseInt(versionMatch[1])
    return {
      id: versionId,
      name: `Bazel ${majorVersion}.x`,
      category: majorVersion >= 7 ? 'stable' : 'lts',
      sortOrder: majorVersion,
    }
  }

  const specificVersionMatch = version.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (specificVersionMatch) {
    const majorVersion = parseInt(specificVersionMatch[1])
    return {
      id: versionId,
      name: `Bazel ${versionId}`,
      category: majorVersion >= 7 ? 'stable' : 'lts',
      sortOrder:
        majorVersion * 1000 +
        parseInt(specificVersionMatch[2]) * 10 +
        parseInt(specificVersionMatch[3]),
    }
  }

  return {
    id: versionId,
    name: `Bazel ${versionId}`,
    category: 'stable',
    sortOrder: 0,
  }
}

export function getBazelVersionsByCategory(
  versions: string[]
): Record<string, BazelVersionInfo[]> {
  const versionInfos = versions.map(detectBazelVersionInfo)

  return {
    lts: versionInfos
      .filter((v) => v.category === 'lts')
      .sort((a, b) => a.sortOrder - b.sortOrder),
    stable: versionInfos
      .filter((v) => v.category === 'stable')
      .sort((a, b) => a.sortOrder - b.sortOrder),
    rolling: versionInfos
      .filter((v) => v.category === 'rolling')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }
}

export function hasRollingSupport(versions: string[]): boolean {
  return versions.some((version) => version.toLowerCase().trim() === 'rolling')
}

export function getLatestStableVersion(
  versions: string[]
): BazelVersionInfo | undefined {
  const versionInfos = versions
    .map(detectBazelVersionInfo)
    .filter((v) => v.category === 'stable')
    .sort((a, b) => b.sortOrder - a.sortOrder)

  return versionInfos[0]
}
