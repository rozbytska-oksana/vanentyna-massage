import { expect, test, type Page } from '@playwright/test';

// Справжній сенсорний свайп (через CDP) у збільшеному перегляді відгуків і сертифікатів.
// Мишачий свайп перевіряють reviews.spec.ts і certificates.spec.ts.
const touchSwipe = async (page: Page, selector: string, distance: number): Promise<void> => {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`Немає розмірів ${selector}`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 10; step += 1) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + (distance * step) / 10, y }],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
};

test('свайп пальцем перемикає відгуки й сертифікати у збільшеному вигляді', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Сенсорний ввід — лише на mobile');

  await page.goto('/#reviews');
  await expect(page.locator('.reviews__viewport--ready')).toBeVisible();
  await page.getByRole('link', { name: 'Збільшити відгук 1', exact: true }).click();
  const reviews = page.locator('.reviews__dialog');
  await touchSwipe(page, '.reviews__expanded', -150);
  await expect(reviews).toHaveAttribute('aria-label', 'Відгук 2');
  await touchSwipe(page, '.reviews__expanded', 150);
  await expect(reviews).toHaveAttribute('aria-label', 'Відгук 1');
  await page.keyboard.press('Escape');
  await expect(reviews).not.toBeVisible();

  await page.goto('/#certificates');
  await expect(page.locator('.certificates__viewport--ready')).toHaveCount(1);
  await page.locator('.certificates__frame').first().click();
  const certificates = page.locator('.certificates__dialog');
  await expect(certificates).toHaveAttribute('aria-label', /^PROBODY Forum Lviv 2026/);
  await touchSwipe(page, '.certificates__expanded', -150);
  await expect(certificates).toHaveAttribute(
    'aria-label',
    /^Мануальні практики: корекція та голкотерапія/,
  );
});
