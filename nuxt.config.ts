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
  runtimeConfig: {
    public: { buildDate: new Date().toISOString().slice(0, 10) },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'uk' },
      title: 'Валентина Нечипоренко — сайт у розробці',
      meta: [
        {
          name: 'description',
          content:
            'Технічна чернетка сайту масажної практики Валентини Нечипоренко в Хорошеві, Україна.',
        },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
    },
  },
  nitro: {
    prerender: { routes: ['/'], failOnError: true },
  },
});
