<template>
  <NuxtPage />
</template>

<script setup lang="ts">
const assetBase = useRuntimeConfig().app.baseURL;

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: `${assetBase}favicon.ico`,
      sizes: '16x16 32x32 48x48',
    },
    { rel: 'icon', type: 'image/png', href: `${assetBase}favicon-48.png`, sizes: '48x48' },
    { rel: 'icon', type: 'image/svg+xml', href: `${assetBase}favicon.svg`, sizes: 'any' },
    { rel: 'apple-touch-icon', href: `${assetBase}apple-touch-icon.png`, sizes: '180x180' },
  ],
});
</script>
