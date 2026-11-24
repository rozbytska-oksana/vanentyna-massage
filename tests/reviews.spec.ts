import { expect, test } from '@playwright/test';

test('шість реальних відгуків у SSG перед FAQ, фото AVIF', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/#reviews');
  expect(await response?.text()).toContain('Турбота, про яку говорять');
  await expect(page.locator('#reviews + #faq')).toHaveCount(1);
  const section = page.locator('#reviews');
  await expect(section.locator('.reviews__slide')).toHaveCount(6);
  await expect(section.locator('.reviews__viewport--ready')).toHaveCount(1);
  const first = section.locator('.reviews__frame img').first();
  await first.scrollIntoViewIfNeeded();
  await expect
    .poll(() => first.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await expect
    .poll(() => first.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/review-9236-.*\.avif$/);
  await expect(first).toHaveAttribute('src', /\.webp$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('відгуки: стрілки по колу, точки, діалог і фокус', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#reviews');
  const section = page.locator('#reviews');
  const controls = section.locator('.reviews__controls');
  const slides = section.locator('.reviews__slide');
  await expect(controls).toBeVisible();
  await controls.getByRole('button', { name: 'Наступний відгук' }).click();
  await expect(slides.nth(1)).toHaveClass(/reviews__slide--active/);
  await controls.getByRole('button', { name: 'Попередній відгук' }).click();
  await controls.getByRole('button', { name: 'Попередній відгук' }).click();
  await expect(slides.nth(5)).toHaveClass(/reviews__slide--active/);
  await controls.getByRole('button', { name: 'Наступний відгук' }).click();
  await expect(slides.nth(0)).toHaveClass(/reviews__slide--active/);
  await controls.getByRole('button', { name: 'Відгук 3', exact: true }).click();
  await expect(slides.nth(2)).toHaveClass(/reviews__slide--active/);
  const link = section.getByRole('link', { name: 'Збільшити відгук 3', exact: true });
  await link.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('.reviews__dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 3');
  await expect(dialog.getByRole('button', { name: 'Закрити відгук' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 4');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(link).toBeFocused();
});

test('карусель відгуків перемикається жестом', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#reviews');
  const viewport = page.locator('.reviews__viewport--ready');
  await expect(viewport).toBeVisible();
  const box = await viewport.boundingBox();
  if (!box) throw new Error('Viewport каруселі не має розмірів');
  const x = box.x + box.width * 0.65;
  const y = box.y + Math.min(box.height / 2, 200);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - box.width * 0.6, y, { steps: 15 });
  await page.mouse.up();
  await expect(page.locator('.reviews__slide').first()).not.toHaveClass(/reviews__slide--active/);
});

test.describe('відгуки без JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('усі кадри доступні нативним горизонтальним скролом і прямими посиланнями', async ({
    page,
  }) => {
    await page.goto('/#reviews');
    const viewport = page.locator('.reviews__viewport');
    await expect(page.locator('.reviews__frame')).toHaveCount(6);
    await expect(viewport).toHaveCSS('overflow-x', 'auto');
    await viewport.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    expect(await viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(page.locator('.reviews__frame').last()).toHaveAttribute(
      'href',
      /review-9231-1320\.webp$/,
    );
  });
});

test('кругова карусель не має кінця на mobile, tablet і широкому desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 768, 1024, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#reviews');
    const controls = page.locator('.reviews__controls');
    const previous = controls.getByRole('button', { name: 'Попередній відгук' });
    const next = controls.getByRole('button', { name: 'Наступний відгук' });
    const slides = page.locator('.reviews__slide');
    await expect(page.locator('.reviews__viewport--ready')).toHaveCount(1);
    await expect(previous).toBeEnabled();
    await previous.click();
    await expect(slides.last()).toHaveClass(/reviews__slide--active/);
    await expect(next).toBeEnabled();
    await next.click();
    await expect(slides.first()).toHaveClass(/reviews__slide--active/);
    await expect(previous).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('збільшений відгук: стиль сертифікатів, стрілки по центру й свайп', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#reviews');
  await expect(page.locator('.reviews__viewport--ready')).toBeVisible();
  await page.getByRole('link', { name: 'Збільшити відгук 1', exact: true }).click();
  const dialog = page.locator('.reviews__dialog');
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 1');
  // Без нижньої панелі з лічильником; стрілки — по вертикальному центру зображення.
  await expect(dialog.locator('.reviews__modal-controls')).toHaveCount(0);
  await expect(dialog.getByText(/\d+ \/ \d+/)).toHaveCount(0);
  const image = dialog.locator('.reviews__expanded');
  const next = dialog.getByRole('button', { name: 'Наступний відгук' });
  const imageBox = await image.boundingBox();
  const nextBox = await next.boundingBox();
  if (!imageBox || !nextBox) throw new Error('Немає розмірів зображення чи стрілки');
  const center = imageBox.y + imageBox.height / 2;
  expect(Math.abs(nextBox.y + nextBox.height / 2 - center)).toBeLessThan(2);

  // Свайп ліворуч — наступний, праворуч — попередній.
  const swipe = async (distance: number): Promise<void> => {
    const x = imageBox.x + imageBox.width / 2;
    await page.mouse.move(x, center);
    await page.mouse.down();
    await page.mouse.move(x + distance, center, { steps: 10 });
    await page.mouse.up();
  };
  await swipe(-160);
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 2');
  await swipe(160);
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 1');
  await swipe(160);
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 6');
  // Короткий рух не перемикає.
  await swipe(-20);
  await expect(dialog).toHaveAttribute('aria-label', 'Відгук 6');
  await dialog.getByRole('button', { name: 'Закрити відгук' }).click();
  await expect(dialog).not.toBeVisible();
});
