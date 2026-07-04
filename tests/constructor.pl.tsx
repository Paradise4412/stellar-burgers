import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';

const harsDir = path.join(__dirname, 'hars');

const setupApiMocks = async (page: Page) => {
  await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
    url: '**/api/ingredients',
    update: false
  });

  await page.routeFromHAR(path.join(harsDir, 'auth-user.har'), {
    url: '**/api/auth/user',
    update: false
  });

  await page.routeFromHAR(path.join(harsDir, 'orders.har'), {
    url: '**/api/orders',
    update: false
  });
};

const setAuthTokens = async (context: BrowserContext, page: Page) => {
  await context.addCookies([
    {
      name: 'accessToken',
      value: 'Bearer test-access-token',
      domain: 'localhost',
      path: '/'
    }
  ]);

  await page.addInitScript(() => {
    localStorage.setItem('refreshToken', 'test-refresh-token');
  });
};

const clearAuthTokens = async (context: BrowserContext, page: Page) => {
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
};

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test.describe('Добавление ингредиентов в конструктор', () => {
    test('должен добавлять булку и начинку в конструктор', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.locator('li').filter({ hasText: 'Краторная булка N-200i' })
      ).toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await expect(
        page.getByText('Краторная булка N-200i (верх)')
      ).toBeVisible();
      await expect(
        page.getByText('Краторная булка N-200i (низ)')
      ).toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await expect(
        page
          .locator('span.constructor-element__text')
          .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
      ).toBeVisible();
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test('должен открывать модальное окно с данными выбранного ингредиента', async ({
      page
    }) => {
      await page.goto('/');

      await page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' })
        .getByRole('link')
        .click();

      await expect(
        page.getByRole('heading', { name: 'Детали ингредиента' })
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Краторная булка N-200i', level: 3 })
      ).toBeVisible();
      await expect(page.getByText('420', { exact: true })).toBeVisible();

      await page.locator('#modals button').click();

      await expect(
        page.getByRole('heading', { name: 'Детали ингредиента' })
      ).not.toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
        .getByRole('link')
        .click();

      await expect(
        page.getByRole('heading', {
          name: 'Биокотлета из марсианской Магнолии',
          level: 3
        })
      ).toBeVisible();
      await expect(page.getByText('4242', { exact: true })).toBeVisible();
    });

    test('должен закрывать модальное окно по клику на крестик и оверлей', async ({
      page
    }) => {
      await page.goto('/');

      await page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' })
        .getByRole('link')
        .click();

      await expect(
        page.getByRole('heading', { name: 'Детали ингредиента' })
      ).toBeVisible();

      await page.locator('#modals button').click();

      await expect(
        page.getByRole('heading', { name: 'Детали ингредиента' })
      ).not.toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' })
        .getByRole('link')
        .click();

      await expect(
        page.getByRole('heading', { name: 'Детали ингредиента' })
      ).toBeVisible();

      const { height = 720 } = page.viewportSize() ?? {};
      await page.mouse.click(5, height / 2);

      await expect(
        page.getByRole('heading', { name: 'Детали ингредиента' })
      ).not.toBeVisible();
    });
  });

  test.describe('Создание заказа', () => {
    test.beforeEach(async ({ page, context }) => {
      await setAuthTokens(context, page);
    });

    test.afterEach(async ({ page, context }) => {
      await clearAuthTokens(context, page);
    });

    test('должен оформлять заказ, показывать номер и очищать конструктор', async ({
      page
    }) => {
      await page.goto('/');

      await page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await page
        .locator('li')
        .filter({ hasText: 'Биокотлета из марсианской Магнолии' })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await page.getByRole('button', { name: 'Оформить заказ' }).click();

      await expect(page.getByText('12345')).toBeVisible();
      await expect(page.getByText('идентификатор заказа')).toBeVisible();

      await expect(page.getByText('Выберите булки')).toHaveCount(2);
      await expect(page.getByText('Выберите начинку')).toBeVisible();

      await page.locator('#modals button').click();

      await expect(page.getByText('12345')).not.toBeVisible();
    });
  });
});
