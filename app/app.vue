<template>
  <NuxtPage />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const assetBase = config.app.baseURL;

// Блоки з появою при прокрутці мають бути приховані ще до першого відмальовування, інакше вони
// спершу видимі, потім зникають і проявляються («стрибок»). Скрипт у <head> ставить клас до
// рендера body; без JS класу немає й контент видимий. Якщо анімації так і не запустилися
// (помилка JS), через 3 с клас знімається й контент знову видимий.
useHead({
  script: [
    {
      key: 'reveal-ready',
      tagPosition: 'head',
      innerHTML:
        "(function(d){d.classList.add('reveal-ready');setTimeout(function(){if(!d.classList.contains('reveal-active'))d.classList.remove('reveal-ready')},3000)})(document.documentElement)",
    },
  ],
});

// Прев’ю в соцмережах і месенджерах: фото кабінету з банера замість фавікона.
// Сервіси прев’ю потребують абсолютної адреси; локально без siteUrl лишається шлях від кореня.
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '');
const ogImage = `${siteUrl}${assetBase}images/og-cabinet.jpg`;
const ogTitle = 'Масаж у Хорошеві — Валентина Нечипоренко';
const ogDescription =
  'Масаж і мануальна терапія в Хорошеві: загальний, спортивний, дитячий, вісцеральний масаж та інші послуги. Запис телефоном, в Instagram, Facebook або Viber.';
// Головна сторінка: повна адреса, коли відомий домен (у деплої — з налаштувань GitHub Pages).
const pageUrl = `${siteUrl}${assetBase}`;

// SEO: robots, canonical і структуровані дані. Поки indexable = false, сторінка лишається
// noindex (технічна чернетка); решта вже готова до запуску.
useHead({
  meta: [
    {
      name: 'robots',
      content: config.public.indexable
        ? 'index, follow, max-image-preview:large'
        : 'noindex, nofollow',
    },
  ],
  link: siteUrl ? [{ rel: 'canonical', href: pageUrl }] : [],
  script: [
    {
      key: 'structured-data',
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildStructuredData(pageUrl, ogImage)),
    },
  ],
});

useSeoMeta({
  ogType: 'website',
  ogLocale: 'uk_UA',
  ogSiteName: 'Валентина Нечипоренко',
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl: siteUrl ? pageUrl : undefined,
  ogImageType: 'image/jpeg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Затишний масажний кабінет із гірляндою на шторі та масажним столом.',
  twitterCard: 'summary_large_image',
  twitterTitle: ogTitle,
  twitterDescription: ogDescription,
  twitterImage: ogImage,
});

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
