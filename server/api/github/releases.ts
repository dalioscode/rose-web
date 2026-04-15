import type { GithubRelease, GithubReleasesResponse } from '~/shared/types/github'

function getLatestDownloadUrl(releases: GithubRelease[]): string | null {
  const installerAsset = releases
    .flatMap(release => release.assets)
    .find(asset => asset.content_type === 'application/x-msdownload')

  return installerAsset?.browser_download_url ?? null
}

function getTotalDownloads(releases: GithubRelease[]): number {
  return releases.reduce((total, release) => {
    return total + release.assets.reduce((releaseTotal, asset) => releaseTotal + asset.download_count, 0)
  }, 0)
}

export default cachedEventHandler(async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }
  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`
  }

  const releases = await $fetch<GithubRelease[]>('https://api.github.com/repos/Alban1911/Rose/releases', { headers })

  return <GithubReleasesResponse>{
    releases,
    totalDownloads: getTotalDownloads(releases),
    latestDownloadUrl: getLatestDownloadUrl(releases),
  }
}, {
  maxAge: 60 * 10,
  name: 'github-releases',
  getKey: () => 'github-releases',
})
