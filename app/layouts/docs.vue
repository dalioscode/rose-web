<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'))
provide<Ref<ContentNavigationItem[]>>('navigation', navigation as Ref<ContentNavigationItem[]>)
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <template #top>
            <UButton to="/" color="neutral" variant="link">
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              Back to home
            </UButton>
          </template>
          <UContentNavigation highlight :navigation="navigation" />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
