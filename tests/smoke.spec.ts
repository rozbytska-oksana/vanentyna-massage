import { expect, test } from '@playwright/test';

test('повноекранне меню плавно відкривається й закривається Escape', async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Відкрити меню', exact: true });
  await page.locator('#mobile-navigation').evaluate((element) => {
    const animate = element.animate.bind(element);
    element.animate = (...args) => {
      const animation = animate(...args);
      element.setAttribute(
        'data-qa-animation-duration',
        String(animation.effect?.getTiming().duration),
      );
      return animation;
    };
  });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Головна навігація' });
  await expect(menu).toBeVisible();
  expect(Number(await menu.getAttribute('data-qa-animation-duration'))).toBeGreaterThan(100);
  await expect.poll(async () => Math.round((await menu.boundingBox())?.y ?? -100)).toBe(0);
  const bounds = await menu.boundingBox();
  expect(bounds?.width).toBe(440);
  expect(bounds?.height).toBe(956);
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  expect(
    Number(await page.locator('#mobile-navigation').getAttribute('data-qa-animation-duration')),
  ).toBeGreaterThan(100);
  await expect(trigger).toBeFocused();
});

test.describe('контент без JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('основні тексти залишаються видимими', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(page.locator('.about__introduction')).toBeVisible();
    await expect(page.locator('.about__introduction')).toHaveCSS('opacity', '1');
  });
});

test('зменшений рух вимикає появу текстів', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('animation-name', 'none');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('.about__introduction')).toHaveCSS('opacity', '1');
  expect(
    await page
      .locator('#about')
      .evaluate((element) => element.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test('фото hero залишається нерухомим під час природного скролу', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const image = page.locator('.hero__image');
  const heading = page.getByRole('heading', { level: 1 });
  const initialImage = await image.boundingBox();
  const initialHeading = await heading.boundingBox();
  expect(initialImage).not.toBeNull();
  expect(initialHeading).not.toBeNull();

  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect.poll(async () => (await image.boundingBox())?.y).toBe(initialImage?.y);
  expect((await heading.boundingBox())?.y).toBeLessThan(initialHeading?.y ?? 0);
});

test('головна сторінка з hero доступна українською', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      browserErrors.push(message.text());
    }
  });
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Масаж із турботою\s*про вас\./);
  await expect(page.getByText('Масаж у Хорошеві', { exact: true })).toBeVisible();
  await expect(
    page.locator('.site-header').getByRole('link', { name: 'Валентина Нечипоренко — на головну' }),
  ).toBeVisible();
  const image = page.locator('.hero__image');
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  expect(await image.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    'studio-hero-',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(browserErrors).toEqual([]);
});

test('діалог запису закривається Escape та повертає фокус', async ({ page }) => {
  await page.goto('/');
  const bookingButton = page
    .locator('.hero')
    .getByRole('button', { name: 'Записатися на масаж', exact: true });
  await bookingButton.click();
  const dialog = page.getByRole('dialog', { name: 'Запис на масаж' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Закрити', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(bookingButton).toBeFocused();
});

test('адаптивне меню доступне з клавіатури', async ({ page }) => {
  await page.goto('/');
  const menuButton = page.getByRole('button', { name: 'Відкрити меню', exact: true });
  if (await menuButton.isVisible()) {
    await menuButton.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('dialog', { name: 'Головна навігація' });
    await expect(menu).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('button', { name: 'Закрити меню' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Послуги', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Про мене', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Відео', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Відгуки', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Контакти', exact: true })).toBeFocused();
    // Внизу меню — телефон і канали зв’язку, потім кнопка запису.
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: '+380 68 904 66 43' })).toBeFocused();
    for (const channel of ['Instagram', 'Facebook', 'Viber']) {
      await page.keyboard.press('Tab');
      await expect(menu.getByRole('link', { name: channel, exact: true })).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('button', { name: 'Записатися', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).not.toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Запис на масаж' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menuButton).toBeFocused();
  } else {
    await expect(page.locator('.site-header__navigation')).toBeVisible();
  }
});

test('посилання Про мене відкриває секцію та закриває мобільне меню', async ({ page }) => {
  const response = await page.goto('/');
  expect(await response?.text()).toContain('Масажистка та мануальна терапевтка');
  const menuButton = page.getByRole('button', { name: 'Відкрити меню', exact: true });
  const isMobileMenu = await menuButton.isVisible();
  if (isMobileMenu) {
    await menuButton.click();
  }
  const link = page.getByRole('link', { name: 'Про мене', exact: true }).filter({ visible: true });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#about$/);
  await expect(
    page.getByRole('heading', { name: 'Масажистка та мануальна терапевтка' }),
  ).toBeInViewport();
  await expect(page.locator('#about')).toBeFocused();
  if (isMobileMenu) {
    await expect(page.getByRole('dialog', { name: 'Головна навігація' })).not.toBeVisible();
  }
});

test('пункти Відео й Відгуки ведуть до секцій та закривають мобільне меню', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [label, id] of [
    ['Відео', 'process'],
    ['Відгуки', 'reviews'],
  ]) {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Відкрити меню', exact: true });
    const mobile = await trigger.isVisible();
    if (mobile) await trigger.click();
    const navigation = page.locator(mobile ? '#mobile-navigation' : '.site-header__navigation');
    const link = navigation.getByRole('link', { name: label, exact: true });
    await expect(link).toHaveAttribute('href', `#${id}`);
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
    if (mobile) {
      await expect(page.locator('#mobile-navigation')).not.toBeVisible();
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
  }
});

test('після переходу з меню верх секції збігається з верхом екрана', async ({ page }) => {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const [label, id] of [
      ['Послуги', 'services'],
      ['Про мене', 'about'],
      ['Відео', 'process'],
      ['Відгуки', 'reviews'],
    ]) {
      await page.goto('/');
      const trigger = page.getByRole('button', { name: 'Відкрити меню', exact: true });
      if (await trigger.isVisible()) await trigger.click();
      await page.getByRole('link', { name: label, exact: true }).filter({ visible: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect
        .poll(async () =>
          Math.abs(await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top)),
        )
        .toBeLessThanOrEqual(1);
    }
  }
});
