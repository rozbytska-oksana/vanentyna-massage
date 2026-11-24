// robots.txt генерується під час збірки. Поки сайт закритий (indexable = false), сторінки мають
// noindex у meta; обхід не забороняємо, інакше пошуковик не побачить noindex.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '');
  const lines = ['User-agent: *', 'Allow: /'];
  if (config.public.indexable && siteUrl) {
    lines.push('', `Sitemap: ${siteUrl}${config.app.baseURL}sitemap.xml`);
  }
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return `${lines.join('\n')}\n`;
});
