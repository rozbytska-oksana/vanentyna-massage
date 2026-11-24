// Карта сайту з однією сторінкою (односторінковий сайт). Адреса — з siteUrl, дата — дата збірки.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '');
  const urls = siteUrl
    ? `  <url>\n    <loc>${siteUrl}${config.app.baseURL}</loc>\n    <lastmod>${config.public.buildDate}</lastmod>\n  </url>\n`
    : '';
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`;
});
