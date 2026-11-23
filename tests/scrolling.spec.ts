import { expect, test } from '@playwright/test';

test('вікно запису не прокручує сторінку нагору', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#services');
  const booking = page.locator('.service-card__booking').first();
  await booking.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(300);
  await booking.click();
  await expect(page.getByRole('dialog', { name: 'Запис на масаж' })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test('кнопка «Нагору» з’являється після прокрутки й повертає на початок', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Нагору', exact: true });
  await expect(button).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(button).toBeVisible();
  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button).toBeHidden();
  await expect(page.locator('.site-header__inner a').first()).toBeFocused();
});
