import { expect, test } from '@playwright/test';

test('переваги: після «Про мене», шість пунктів, цифри з даних сайту', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/#advantages');
  const html = (await response?.text()) ?? '';
  expect(html).toContain('Чому саме я');

  const order = await page
    .locator('main > section')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(order.indexOf('advantages')).toBe(order.indexOf('about') + 1);

  const section = page.locator('#advantages');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Чому саме я');
  await expect(section.locator('.advantages__item')).toHaveCount(6);
  await expect(section.locator('.advantages__item svg')).toHaveCount(6);
  // Кількість документів, рік першого диплома й кількість послуг рахуються з даних.
  await expect(section).toContainText('7 документів про навчання з 2022 року');
  await expect(section).toContainText('9 видів послуг');
  // Досвід — повні роки від першого диплома (30.10.2022) до дати збірки (≈ дата прогону тестів).
  const now = new Date();
  const years = now.getFullYear() - 2022 - (now < new Date(now.getFullYear(), 9, 30) ? 1 : 0);
  const word =
    years % 10 === 1 && years % 100 !== 11
      ? 'рік'
      : [2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)
        ? 'роки'
        : 'років';
  await expect(section.locator('.advantages__name').first()).toHaveText(`${years} ${word} досвіду`);
  await expect(section).not.toContainText('Увага й турбота');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('анімації: поява блоків і лічильник переваг, без них при reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const section = page.locator('#advantages');
  const count = section.locator('.advantages__count').first();
  // Прокручуємо до підпису: на mobile секція висока, і центрування лишило б його поза екраном.
  await section.locator('.section-eyebrow').scrollIntoViewIfNeeded();
  await expect(section.locator('.section-eyebrow')).toHaveAttribute('data-revealed', '');
  // Лічильник завершується кінцевим числом із заголовка.
  await expect(count).toHaveText(/^\d+$/);
  await expect(section.locator('h3').first()).toHaveText(/^\d+ (рік|роки|років) досвіду$/);
  await expect
    .poll(async () => Number(await count.textContent()), { timeout: 5000 })
    .toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await section.locator('.section-eyebrow').scrollIntoViewIfNeeded();
  // Без анімацій контент одразу видимий (не прихований до появи), число одразу кінцеве.
  const opacities = await section
    .locator('[data-text-reveal]')
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity));
  expect(opacities.every((opacity) => opacity === '1')).toBe(true);
  await expect(section.locator('h3').first()).toHaveText(/^[1-9]\d* (рік|роки|років) досвіду$/);
});

test('поява без «стрибка»: блок нижче екрана прихований до прокрутки, потім проявляється', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const response = await page.goto('/');
  // Клас ставиться inline-скриптом у <head> ще до відмальовування body.
  expect((await response?.text()) ?? '').toContain("classList.add('reveal-ready')");
  await expect(page.locator('html')).toHaveClass(/reveal-ready/);

  const title = page.locator('#faq-title');
  const opacity = (): Promise<string> =>
    title.evaluate((element) => getComputedStyle(element).opacity);
  // До прокрутки блок не видимий (а не видимий-потім-зниклий).
  expect(await opacity()).toBe('0');
  await title.scrollIntoViewIfNeeded();
  await expect(title).toHaveAttribute('data-revealed', '');
  await expect.poll(opacity, { timeout: 5000 }).toBe('1');
});
