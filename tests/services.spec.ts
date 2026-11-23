import { expect, test } from '@playwright/test';

test('послуги є у SSG HTML, ціни видимі, сітка адаптивна', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/');
  expect(await response?.text()).toContain('Загальний масаж усього тіла');
  const section = page.locator('#services');
  const cards = section.locator('.service-card');
  await expect(cards).toHaveCount(9);
  // На mobile частина послуг прихована за кнопкою — розгортаємо список.
  const showAll = section.locator('.services__toggle');
  if (await showAll.isVisible()) await showAll.click();
  await expect(section.getByRole('heading', { level: 3 })).toHaveCount(9);
  await expect(cards.first().locator('.service-card__price')).toHaveText(/500\s*грн/);
  await expect(cards.last().locator('.service-card__price')).toHaveText(/200\s*грн/);
  await expect(cards.first().locator('.service-card__description')).toContainText(
    'зменшення м’язового напруження',
  );
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  if (page.viewportSize()!.width >= 768) {
    // Сітка: сусідні картки в одному ряду, ціни вирівняні по одній лінії.
    expect(Math.abs(second!.y - first!.y)).toBeLessThan(1);
    expect(second!.x).toBeGreaterThan(first!.x + first!.width);
    const firstPrice = await cards.nth(0).locator('.service-card__price').boundingBox();
    const secondPrice = await cards.nth(1).locator('.service-card__price').boundingBox();
    expect(Math.abs(secondPrice!.y - firstPrice!.y)).toBeLessThan(1);
  } else {
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
  }
  const illustrations = section.locator('.service-card__illustration');
  await expect(illustrations).toHaveCount(9);
  for (let index = 0; index < 2; index += 1) {
    const media = await cards.nth(index).locator('.service-card__media').boundingBox();
    const content = await cards.nth(index).locator('.service-card__content').boundingBox();
    expect(media).not.toBeNull();
    expect(content).not.toBeNull();
    expect(media!.y + media!.height).toBeLessThanOrEqual(content!.y);
  }
  for (const illustration of await illustrations.all()) {
    await illustration.scrollIntoViewIfNeeded();
    await expect
      .poll(() => illustration.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(illustration).toHaveAttribute('alt', /.+/);
  }
  await expect(cards.nth(5).locator('img')).toHaveAttribute('src', /back-massage-720/);
  await expect(section.getByText('Фото незабаром')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

// Посилання «Переглянути послуги» прибране з банера; до списку веде пункт навігації «Послуги».
test('посилання Послуги в навігації веде до списку послуг', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: 'Відкрити меню', exact: true });
  const isMobileMenu = await menuButton.isVisible();
  if (isMobileMenu) {
    await menuButton.click();
  }
  const link = page.getByRole('link', { name: 'Послуги', exact: true }).filter({ visible: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#services$/);
  await expect(page.getByRole('heading', { name: 'Послуги та ціни' })).toBeInViewport();
  if (isMobileMenu) {
    await expect(page.getByRole('dialog', { name: 'Головна навігація' })).not.toBeVisible();
  }
});

test('картка послуги відкриває діалог і повертає фокус', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#services');
  const showAll = page.locator('.services__toggle');
  if (await showAll.isVisible()) await showAll.click();
  const button = page.getByRole('button', { name: 'Записатися — Масаж спини', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Запис на масаж' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Запис на масаж' })).not.toBeVisible();
  await expect(button).toBeFocused();
});

test('детальний опис послуги розгортається з клавіатури', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#services');
  const card = page.locator('.service-card').first();
  const details = card.locator('.service-card__details');
  await expect(details).toBeHidden();
  // Назва кнопки змінюється на «Згорнути», тому локатор — за класом.
  const toggle = card.locator('.service-card__more-toggle');
  await expect(toggle).toHaveText('Детальніше');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(details).toBeVisible();
  await expect(details).toContainText('Силу натиску');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveText('Згорнути');
  // Кнопка лишається під розгорнутим текстом.
  const detailsBox = await details.boundingBox();
  const toggleBox = await toggle.boundingBox();
  expect(toggleBox!.y).toBeGreaterThanOrEqual(detailsBox!.y + detailsBox!.height - 1);
  await page.keyboard.press('Enter');
  await expect(details).toBeHidden();
});

test('на mobile і tablet видно три ряди послуг, решта — за кнопкою', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#services');
  const section = page.locator('#services');
  const cards = section.locator('.service-card');
  // Назва кнопки змінюється на «Згорнути список», тому локатор — за класом.
  const toggle = section.locator('.services__toggle');
  if (page.viewportSize()!.width >= 1200) {
    await expect(toggle).toBeHidden();
    await expect(cards.filter({ visible: true })).toHaveCount(9);
    return;
  }
  const initialCount = page.viewportSize()!.width >= 768 ? 6 : 3;
  await expect(cards.filter({ visible: true })).toHaveCount(initialCount);
  await expect(toggle).toHaveText('Показати всі послуги (9)');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-controls', 'services-list');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(cards.filter({ visible: true })).toHaveCount(9);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveText('Згорнути список');
  await page.keyboard.press('Enter');
  await expect(cards.filter({ visible: true })).toHaveCount(initialCount);
  await expect(toggle).toBeInViewport();
  await expect(toggle).toBeFocused();
});
