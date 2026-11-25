import { expect, test } from '@playwright/test';

test('відео не завантажуються до кліку; гортання кругове, попереднє відео зупиняється', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (/\/videos\/process\/.*\.mp4/.test(request.url())) requests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/#process');
  expect(await response?.text()).toContain('Масаж у деталях');
  const section = page.locator('#process');
  const covers = section.locator('.process-video__cover');
  await expect(covers).toHaveCount(19);
  await expect(section.locator('.process__viewport--ready')).toHaveCount(1);
  await expect(section.locator('video')).toHaveCount(0);
  expect(requests).toEqual([]);
  await section.getByRole('button', { name: 'Попереднє відео' }).click();
  await expect(section.locator('.process__slide').last()).toHaveClass(/--active/);
  await section.getByRole('button', { name: 'Наступне відео' }).click();
  await covers.first().focus();
  await page.keyboard.press('Enter');
  const player = section.locator('video').first();
  await expect(player).toHaveAttribute('preload', 'none');
  await expect
    .poll(() => player.evaluate((el: HTMLVideoElement) => !el.paused && el.readyState >= 2))
    .toBe(true);
  expect(requests.length).toBeGreaterThan(0);
  expect(new Set(requests).size).toBe(1);
  await section.getByRole('button', { name: 'Наступне відео' }).click();
  await expect.poll(() => player.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await section.locator('.process__slide').nth(1).locator('a').click();
  const second = section.locator('video').nth(1);
  await expect
    .poll(() => second.evaluate((el: HTMLVideoElement) => !el.paused && el.readyState >= 2))
    .toBe(true);
  expect(new Set(requests).size).toBe(2);
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect.poll(() => second.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('без JS прев’ю та прямі посилання на всі відео доступні', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) requests.push(r.url());
  });
  await page.goto('/#process');
  await expect(page.locator('.process-video__cover')).toHaveCount(19);
  await expect(page.locator('.process__viewport')).toHaveCSS('overflow-x', 'auto');
  await expect(page.locator('#process video')).toHaveCount(0);
  expect(requests).toEqual([]);
  await context.close();
});

test('відеоблок перед перевагами, розміри карток як у відгуках', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#process');
    await expect(page.locator('#process + #advantages')).toHaveCount(1);
    await expect(page.locator('.process__viewport--ready')).toHaveCount(1);
    const dimensions = await page.evaluate(() => {
      const video = document.querySelector<HTMLElement>('.process__slide')!;
      const review = document.querySelector<HTMLElement>('.reviews__slide')!;
      const viewport = document.querySelector<HTMLElement>('.process__viewport')!;
      const gap = parseFloat(getComputedStyle(video).marginRight);
      return {
        video: video.offsetWidth,
        review: review.offsetWidth,
        visible: (viewport.clientWidth + gap) / (video.offsetWidth + gap),
      };
    });
    expect(Math.abs(dimensions.video - dimensions.review)).toBeLessThanOrEqual(1);
    if (width >= 768) expect(dimensions.visible).toBeCloseTo(width >= 1200 ? 5 : 3, 1);
  }
});
