// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN ?? '',
    public: {
      discordUrl: 'https://discord.gg/Cj85n9tvzU'
    }
  },
  app: {
    head: {
      meta: [
        { name: 'robots', content: 'noindex, nofollow' }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@tresjs/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'info',
        'success',
        'warning',
        'error'
      ],
    },
  },
  fonts: {
    families: [
      { name: 'Jetbrains Mono', provider: 'google' }
    ]
  }
})