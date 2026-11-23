import { expect, test } from '@playwright/test';

test('контакти й авторство є в SSG з підтвердженими посиланнями', async ({ page }) => {
  const response = await page.goto('/');
  const html = (await response?.text()) ?? '';
  expect(html).toContain('Знайдіть час для себе');
  expect(html).toContain('Хорошів, Будинок культури');
  const section = page.locator('#contacts');
  const background = section.locator('img');
  await background.scrollIntoViewIfNeeded();
  await expect
    .poll(() => background.evaluate((img: HTMLImageElement) => img.currentSrc))
    .toMatch(/\.avif$/);
  await expect(background).toHaveAttribute('src', /\.webp$/);
  // Логотип у хедері (у мобільному меню — окремий екземпляр).
  await expect(page.locator('.site-header__inner .site-logo')).toHaveCount(1);
  await expect(page.locator('.site-footer .site-logo')).toHaveCount(1);
  await expect(
    section.getByRole('link', { name: '+380 68 904 66 43', exact: true }),
  ).toHaveAttribute('href', 'tel:+380689046643');
  await expect(section.locator('.contacts__details a').first()).toHaveAttribute(
    'href',
    'tel:+380689046643',
  );
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Знайдіть час для себе');
  await expect(section.getByRole('link', { name: 'Хорошів, Будинок культури' })).toHaveAttribute(
    'href',
    /google\.com\/maps\/place\/.*50\.5956426.*28\.4458046/,
  );
  await expect(section.getByRole('link', { name: 'Instagram', exact: true })).toHaveAttribute(
    'href',
    /instagram\.com\/massage\.valentyna\.khoroshiv/,
  );
  await expect(section.getByRole('link', { name: 'Facebook', exact: true })).toHaveAttribute(
    'href',
    'https://www.facebook.com/share/1CVYRKLabq/?mibextid=wwXIfr',
  );
  await expect(section.getByRole('link', { name: 'Viber', exact: true })).toHaveAttribute(
    'href',
    'viber://chat?number=%2B380689046643',
  );
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Created by Oksana' }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/oksana-rozbytska-4a29291a2/');
  await expect(section.getByText('Telegram')).toHaveCount(0);

  const button = section.getByRole('button', { name: 'Записатися', exact: true });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Запис на масаж' });
  await expect(dialog).toBeVisible();
  // Логотип зверху (як у мобільному меню) + 4 способи зв’язку в нумерованому списку.
  await expect(dialog.locator('.booking-dialog__channels').getByRole('link')).toHaveCount(4);
  await expect(dialog.getByRole('link', { name: /Зателефонувати/ })).toHaveAttribute(
    'href',
    'tel:+380689046643',
  );
  await expect(dialog.getByRole('button', { name: 'Закрити', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();
});

test('навігація Контакти відкриває секцію з клавіатури', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Відкрити меню', exact: true });
  if (await menu.isVisible()) await menu.click();
  const link = page.getByRole('link', { name: 'Контакти', exact: true }).filter({ visible: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contacts$/);
  await expect(page.locator('#contacts')).toBeFocused();
  await expect(page.locator('#contacts h2')).toBeInViewport();
  await expect(page.getByRole('dialog', { name: 'Головна навігація' })).not.toBeVisible();
});
