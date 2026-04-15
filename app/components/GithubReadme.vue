<script setup lang="ts">
const { data: readme } = await useFetch<string>('/api/github/readme')
</script>

<template>
  <MDC v-if="readme" :value="readme" class="prose dark:prose-invert max-w-none" />
  <p v-else class="text-muted">Failed to load README.</p>
</template>
