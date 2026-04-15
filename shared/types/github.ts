export interface GithubReleaseAsset {
  name: string
  browser_download_url: string
  size: number
  download_count: number
  content_type: string
}

export interface GithubReleaseAuthor {
  login: string
  avatar_url: string
  html_url: string
}

export interface GithubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
  prerelease: boolean
  assets: GithubReleaseAsset[]
  author: GithubReleaseAuthor
}

export interface GithubReleasesResponse {
  releases: GithubRelease[]
  totalDownloads: number
  latestDownloadUrl: string | null
}
