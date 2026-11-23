import { expect, test } from '@playwright/test';

test('часті запитання є у SSG HTML і розкриваються з клавіатури', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto('/');
  const html = (await response?.text()) ?? '';
  expect(html).toContain('Чи можна робити масаж при грижі або протрузії хребта?');
  expect(html).toContain('Клієнт самостійно відповідає');
  expect(html).not.toContain('Чи буде боляче?');

  const lastSection = page.locator('main > section').last();
  await expect(lastSection).toHaveAttribute('id', 'contacts');
  await expect(page.locator('#faq + #contacts')).toHaveCount(1);

  const section = page.locator('#faq');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Часті запитання');
  await expect(section.locator('.section-eyebrow')).toHaveText('Перед візитом');
  const items = section.locator('details');
  await expect(items).toHaveCount(10);

  const first = items.nth(0);
  const second = items.nth(1);
  await expect(first.locator('.faq__answer')).toBeHidden();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first.locator('.faq__answer')).toBeVisible();
  // Застереження про відповідальність клієнта — у запитанні про протипоказання.
  await expect(first.locator('summary')).toHaveText('Які є протипоказання до масажу?');
  await expect(first.locator('.faq__note')).toContainText('відповідальністю клієнта');

  // Відкрите лише одне запитання за раз.
  await second.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(second.locator('.faq__answer')).toBeVisible();
  await expect(first).not.toHaveAttribute('open');

  await expect(
    section.getByRole('button', { name: 'Записатися на масаж', exact: true }),
  ).toHaveCount(0);
});
