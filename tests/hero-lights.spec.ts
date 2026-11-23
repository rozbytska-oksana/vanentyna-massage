import { expect, test } from '@playwright/test';

test('гірлянда в hero мерехтить і вимикається при reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const layer = page.locator('.hero__lights');
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(layer.locator('.hero__light')).toHaveCount(64);
  await expect(layer).toBeVisible();
  const animation = await layer
    .locator('.hero__light')
    .first()
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toContain('hero-light-twinkle');

  // Поза екраном анімація ставиться на паузу, на банері — відновлюється.
  const hero = page.locator('.hero');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(hero).toHaveClass(/hero--lights-paused/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(hero).not.toHaveClass(/hero--lights-paused/);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toBeHidden();
});
