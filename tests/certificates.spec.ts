import { expect, test } from '@playwright/test';

const order = [
  'PROBODY Forum Lviv 2026',
  'Мануальні практики: корекція та голкотерапія',
  'Антицелюлітний масаж',
  'Вісцеральна терапія (вісцеральний масаж)',
  'Масаж обличчя',
  'Facial Massage',
  'Майстер масажу-універсал',
];

test('сертифікати: від новіших до старіших, AVIF, усі сім документів', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/#certificates');
  const html = (await response?.text()) ?? '';
  expect(html).toContain('PROBODY Forum Lviv 2026');
  expect(html).toContain('Вісцеральна терапія');

  const frames = page.locator('.certificates__frame');
  await expect(frames).toHaveCount(order.length);
  for (const [index, title] of order.entries()) {
    await expect(frames.nth(index)).toHaveAttribute(
      'aria-label',
      new RegExp(`^Збільшити: ${title.replace(/[()]/g, '\\$&')}, `),
    );
  }
  await expect(page.locator('.certificates__viewport--ready')).toHaveCount(1);

  const firstImage = frames.first().locator('img');
  await firstImage.scrollIntoViewIfNeeded();
  await expect
    .poll(() => firstImage.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/probody-forum-lviv-\d+\.avif$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('карусель: стрілки по колу й точки', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#certificates');
  const slides = page.locator('.certificates__slide');
  const controls = page.locator('.certificates__controls');
  const dots = page.locator('.certificates__dots button');
  await expect(page.locator('.certificates__viewport--ready')).toHaveCount(1);
  await expect(slides.nth(0)).toHaveClass(/certificates__slide--active/);

  await controls.getByRole('button', { name: 'Наступні сертифікати' }).click();
  await expect(slides.nth(1)).toHaveClass(/certificates__slide--active/);
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');

  await controls.getByRole('button', { name: 'Попередні сертифікати' }).click();
  await controls.getByRole('button', { name: 'Попередні сертифікати' }).click();
  await expect(slides.nth(order.length - 1)).toHaveClass(/certificates__slide--active/);

  await dots.nth(2).click();
  await expect(slides.nth(2)).toHaveClass(/certificates__slide--active/);
});

test('перегляд сертифіката: клавіатура, стрілки, повернення фокуса', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#certificates');
  await expect(page.locator('.certificates__viewport--ready')).toHaveCount(1);
  const frames = page.locator('.certificates__frame');
  await frames.nth(1).focus();
  await page.keyboard.press('Enter');

  const dialog = page.locator('.certificates__dialog');
  await expect(page.getByRole('dialog', { name: new RegExp(`^${order[1]}`) })).toBeVisible();
  await expect(dialog.locator('.certificates__full')).toHaveClass(/certificates__full--ready/);

  await page.keyboard.press('ArrowRight');
  await expect(dialog).toHaveAttribute('aria-label', new RegExp(`^${order[2]}`));
  await expect(page.locator('.certificates__slide').nth(2)).toHaveClass(
    /certificates__slide--active/,
  );
  await dialog.getByRole('button', { name: 'Попередній сертифікат' }).click();
  await expect(dialog).toHaveAttribute('aria-label', new RegExp(`^${order[1]}`));

  await dialog.getByRole('button', { name: 'Закрити сертифікат' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(frames.nth(1)).toBeFocused();
});
