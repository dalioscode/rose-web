const RAW_BASE = 'https://raw.githubusercontent.com/Alban1911/Rose/main'

function processReadme(content: string): string {
  return content
    .replace(/<div[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, `![$1](${RAW_BASE}/$2)`)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default cachedEventHandler(async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.raw+json',
  }
  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`
  }

  const raw = await $fetch<string>('https://api.github.com/repos/Alban1911/Rose/readme', { headers })
  return processReadme(raw)
}, {
  maxAge: 60 * 10,
  name: 'github-readme',
  getKey: () => 'github-readme',
})
