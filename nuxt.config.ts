export default defineNuxtConfig({
  compatibilityDate: '2026-11-16',
  ssr: true,
  devtools: { enabled: false },
  telemetry: false,
  modules: ['@nuxt/eslint'],
  css: [
    '@fontsource/cormorant-garamond/cyrillic-500.css',
    '@fontsource/cormorant-garamond/latin-500.css',
    '@fontsource/cormorant-garamond/cyrillic-500-italic.css',
    '@fontsource/cormorant-garamond/latin-500-italic.css',
    '@fontsource-variable/manrope/wght.css',
    '~/assets/styles/main.scss',
  ],
  typescript: { strict: true },
  // Дата збірки: від неї рахуються роки досвіду, однаково на сервері й у браузері.
  // siteUrl — повна адреса сайту для абсолютного og:image. Домен не зашивається в код:
  // у деплої його передає workflow (NUXT_PUBLIC_SITE_URL з налаштувань GitHub Pages).
  // indexable — чи відкрито сайт для пошукових систем. Поки false (технічна чернетка, noindex);
  // для запуску достатньо NUXT_PUBLIC_INDEXABLE=true у workflow або змінити значення тут.
  runtimeConfig: {
    public: {
      buildDate: new Date().toISOString().slice(0, 10),
      siteUrl: '',
      indexable: false,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'uk' },
      title: 'Масаж у Хорошеві — Валентина Нечипоренко',
      meta: [
        {
          name: 'description',
          content:
            'Масаж у Хорошеві від масажистки Валентини Нечипоренко: загальний, спортивний, дитячий, вісцеральний масаж, масаж обличчя. Запис за телефоном або в месенджерах.',
        },
        { name: 'theme-color', content: '#674532' },
      ],
    },
  },
  nitro: {
    prerender: { routes: ['/', '/robots.txt', '/sitemap.xml'], failOnError: true },
  },
});
