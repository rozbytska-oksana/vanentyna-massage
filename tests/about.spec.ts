import { expect, test } from '@playwright/test';

test('про Валентину: справжнє фото, біографія й навчання є у SSG', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/#about');
  const html = (await response?.text()) ?? '';
  expect(html).toContain('Валентина Нечипоренко');
  expect(html).toContain('Професійний розвиток');
  expect(html).toContain('images/valentyna/portrait-');
  const about = page.locator('#about');
  await expect(about.locator('.about__header .section-eyebrow')).toHaveText('Про мене');
  await expect(about.getByRole('heading', { level: 2 })).toHaveText(
    'Масажистка та мануальна терапевтка',
  );
  await expect(about.getByText('Знайомтеся, Валентина')).toHaveCount(0);
  const image = about.getByRole('img', { name: /Валентини Нечипоренко/ });
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/portrait-.*\.avif$/);
  await expect(
    about.getByText('Масажистка та мануальна терапевтка', { exact: true }),
  ).toBeVisible();
  const learning = about.locator('#certificates');
  await learning.scrollIntoViewIfNeeded();
  await expect(learning.getByRole('heading', { name: 'Професійний розвиток' })).toBeVisible();
  await expect(learning.locator('.certificates__slide')).toHaveCount(7);
  // Тексти під каруселлю прибрані: лише заголовок і документи.
  await expect(learning.locator('p')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
