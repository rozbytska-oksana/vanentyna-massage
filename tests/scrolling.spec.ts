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

test('кнопка Нагору не перекриває авторство у футері', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const button = page.getByRole('button', { name: 'Нагору', exact: true });
    const credit = page.getByRole('link', { name: 'Created by Oksana', exact: true });
    await expect(button).toBeVisible();
    await expect(credit).toBeInViewport();
    const buttonBox = await button.boundingBox();
    const creditBox = await credit.boundingBox();
    if (!buttonBox || !creditBox) throw new Error('Немає розмірів кнопки або підпису');
    const overlap =
      buttonBox.x < creditBox.x + creditBox.width &&
      buttonBox.x + buttonBox.width > creditBox.x &&
      buttonBox.y < creditBox.y + creditBox.height &&
      buttonBox.y + buttonBox.height > creditBox.y;
    expect(overlap, `Перекриття на ${width}px`).toBe(false);
    await expect(credit).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
