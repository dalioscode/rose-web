const RAW_BASE = 'https://raw.githubusercontent.com/Alban1911/Rose/main'

function processReadme(content: string): string {
  return content
    // Strip HTML blocks: <div ...>...</div> (including align="center" wrappers)
    .replace(/<div[^>]*>[\s\S]*?<\/div>/gi, '')
    // Strip inline HTML img tags
    .replace(/<img[^>]*>/gi, '')
    // Strip badge links: [![alt](badge-url)](link)
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    // Fix relative image URLs in markdown: ![alt](relative/path)
    .replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, `![$1](${RAW_BASE}/$2)`)
    // Collapse multiple blank lines left by removals
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
