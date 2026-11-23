import { expect, test } from '@playwright/test';

test('зображення віддаються в AVIF із JPEG як запасним варіантом', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const hero = page.locator('.hero__image');
  await expect
    .poll(() => hero.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/\.avif$/);
  await expect(hero).toHaveAttribute('src', /\.jpg$/);

  const illustration = page.locator('.service-card__illustration').first();
  await illustration.scrollIntoViewIfNeeded();
  await expect
    .poll(() => illustration.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/\.avif$/);
  await expect(illustration).toHaveAttribute('src', /\.jpg$/);

  const sources = page.locator('.service-card picture').first().locator('source');
  await expect(sources).toHaveCount(2);
  await expect(sources.nth(0)).toHaveAttribute('type', 'image/avif');
  await expect(sources.nth(1)).toHaveAttribute('type', 'image/webp');
});
