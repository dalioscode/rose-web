<script setup lang="ts">
import type { GithubRelease, GithubReleasesResponse } from '~/shared/types/github'

const { data } = await useFetch<GithubReleasesResponse>('/api/github/releases')
const { public: { discordUrl } } = useRuntimeConfig()

const installerAsset = (release: GithubRelease) =>
  release.assets.find(a => a.content_type === 'application/x-msdownload')

const getReleaseDownloads = (release: GithubRelease) =>
  release.assets.reduce((sum, a) => sum + a.download_count, 0)

const releases = computed(() => data.value?.releases ?? [])
const totalDownloads = computed(() => data.value?.totalDownloads ?? 0)
</script>

<template>
   <div class="grid grid-cols-[280px_1fr] items-start gap-16">
     <div class="sticky top-44 self-start flex flex-col gap-2">
       <h1 class="text-3xl font-bold tracking-tight">Changelogs</h1>
       <p class="text-lg">Latest versions of Rose featuring changes, improvements and fixes.</p>
       <p class="text-sm text-muted">{{ totalDownloads.toLocaleString() }} total downloads across all releases.</p>
       <div class="flex items-center gap-2 flex-wrap">
         <UButton
             color="neutral"
             to="https://github.com/Alban1911/Rose"
             target="_blank"
             icon="i-simple-icons-github"
         ></UButton>
         <UButton
             color="neutral"
             :to="discordUrl"
             target="_blank"
             icon="i-simple-icons-discord"
         ></UButton>
       </div>
     </div>

     <UChangelogVersions>
       <UChangelogVersion
           v-for="release in releases"
           :key="release.id"
           :title="release.name"
           :date="release.published_at"
           :to="release.html_url"
           target="_blank"
           :badge="release.prerelease ? { label: 'Pre-release', color: 'warning', variant: 'soft' } : undefined"
           :authors="[{
          name: release.author.login,
          avatar: { src: release.author.avatar_url, alt: release.author.login },
          to: release.author.html_url,
          target: '_blank'
        }]"
           :ui="{
          container: 'max-w-lg',
          indicator: 'sticky top-(--ui-header-height) pt-4 -mt-4'
        }"
       >
         <template #body>
           <div class="flex flex-col gap-8">
             <MDC :value="release.body" class="prose prose-sm dark:prose-invert max-w-none" />

             <div v-if="release.assets.length" class="flex flex-wrap items-center gap-3 mb-4">
               <UButton
                   v-if="installerAsset(release)"
                   :to="installerAsset(release)!.browser_download_url"
                   color="primary"
                   target="_blank"
                   icon="i-lucide-download"
                   :label="`Download ${release.tag_name}`"
               />
               <span class="text-xs text-muted">
                {{ getReleaseDownloads(release).toLocaleString() }} downloads
              </span>
             </div>
           </div>
         </template>
       </UChangelogVersion>
     </UChangelogVersions>
   </div>
</template>
