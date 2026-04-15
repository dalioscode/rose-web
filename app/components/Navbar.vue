<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { public: { discordUrl } } = useRuntimeConfig()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Docs',
    to: '/docs/introduction',
    active: route.path.startsWith('/docs')
  },
  {
    label: 'Features',
    to: '/',
    active: route.path.startsWith('/features')
  },
  {
    label: 'Changelogs',
    to: '/changelogs',
    active: route.path.startsWith('/changelogs')
  },
])
</script>

<template>
  <UHeader class="mb-24">
    <template #title>
      <UButton to="/" color="neutral" variant="ghost">
        <NuxtImg
            src="/logo.png"
            alt="Rose Logo"
            class="size-8"
        />
        <span class="text-2xl font-bold">Rose</span>
      </UButton>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Join the Discord">
        <UButton
            color="neutral"
            variant="ghost"
            :to="discordUrl"
            target="_blank"
            icon="i-simple-icons-discord"
            aria-label="Discord"
        />
      </UTooltip>
      <UTooltip text="Open on GitHub">
        <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/Alban1911/Rose"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
        />
      </UTooltip>
      <UButton
          color="primary"
          to="/"
          target="_blank"
          icon="i-lucide-download"
          aria-label="Download Rose"
      >
        Download Rose
      </UButton>
    </template>
  </UHeader>
</template>
