import { expect, test } from '@playwright/test';

test('прев’ю для соцмереж: фото кабінету 1200×630 і noindex', async ({ page, request }) => {
  const response = await page.goto('/');
  const html = (await response?.text()) ?? '';
  // Мета-теги є вже в SSG HTML, бо сервіси прев’ю не виконують JavaScript.
  expect(html).toContain('property="og:image"');

  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute('content', /images\/og-cabinet\.jpg$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

  const image = await request.get('/images/og-cabinet.jpg');
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/jpeg');
});

test('SEO: заголовок, опис, H1, структуровані дані, robots.txt і sitemap', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Масаж у Хорошеві — Валентина Нечипоренко');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /^Масаж у Хорошеві від масажистки Валентини Нечипоренко/,
  );
  // Рядки H1 розділені пробілом, а не злиті в «турботоюпро».
  expect((await page.locator('h1').textContent())?.replace(/\s+/g, ' ').trim()).toBe(
    'Масаж із турботою про вас.',
  );
  await expect(page.locator('h1')).toHaveCount(1);

  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  const graph = JSON.parse(jsonLd ?? '{}')['@graph'] as Record<string, unknown>[];
  const business = graph.find((node) => node['@type'] === 'HealthAndBeautyBusiness');
  expect(business?.telephone).toBe('+380689046643');
  expect(business?.priceRange).toBe('200–700 грн');
  const catalog = business?.hasOfferCatalog as { itemListElement: { price: number }[] };
  expect(catalog.itemListElement).toHaveLength(9);
  expect(catalog.itemListElement[0]?.price).toBe(500);

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('User-agent: *');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('<urlset');
});
