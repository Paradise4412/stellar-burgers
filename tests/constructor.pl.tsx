import { test, expect, Page, BrowserContext, Locator } from '@playwright/test';
import path from 'path';

import { mockBun, mockMain, mockOrderNumber } from './har-data';

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

const getConstructor = (page: Page): Locator =>
  page.getByTestId('burger-constructor');

const getModal = (page: Page): Locator => page.locator('#modals');

test.describe('Страница конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test.describe('Добавление ингредиентов в конструктор', () => {
    test('должен добавлять булку и начинку в конструктор', async ({ page }) => {
      await page.goto('/');

      const constructor = getConstructor(page);

      await expect(
        page.locator('li').filter({ hasText: mockBun.name })
      ).toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: mockBun.name })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await expect(constructor.getByTestId('constructor-bun-top')).toContainText(
        `${mockBun.name} (верх)`
      );
      await expect(
        constructor.getByTestId('constructor-bun-bottom')
      ).toContainText(`${mockBun.name} (низ)`);

      await page
        .locator('li')
        .filter({ hasText: mockMain.name })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await expect(constructor.getByTestId('constructor-filling-list')).toContainText(
        mockMain.name
      );
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test('должен открывать модальное окно с данными выбранного ингредиента', async ({
      page
    }) => {
      await page.goto('/');

      const modal = getModal(page);

      await page
        .locator('li')
        .filter({ hasText: mockBun.name })
        .getByRole('link')
        .click();

      const bunDetails = modal.getByTestId('ingredient-details');

      await expect(bunDetails.getByTestId('ingredient-details-name')).toHaveText(
        mockBun.name
      );
      await expect(
        bunDetails.getByTestId('ingredient-details-calories')
      ).toHaveText(String(mockBun.calories));

      await modal.locator('button').click();

      await expect(modal.getByTestId('ingredient-details')).not.toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: mockMain.name })
        .getByRole('link')
        .click();

      const mainDetails = modal.getByTestId('ingredient-details');

      await expect(mainDetails.getByTestId('ingredient-details-name')).toHaveText(
        mockMain.name
      );
      await expect(
        mainDetails.getByTestId('ingredient-details-calories')
      ).toHaveText(String(mockMain.calories));
    });

    test('должен закрывать модальное окно по клику на крестик и оверлей', async ({
      page
    }) => {
      await page.goto('/');

      const modal = getModal(page);

      await page
        .locator('li')
        .filter({ hasText: mockBun.name })
        .getByRole('link')
        .click();

      await expect(modal.getByTestId('ingredient-details')).toBeVisible();

      await modal.locator('button').click();

      await expect(modal.getByTestId('ingredient-details')).not.toBeVisible();

      await page
        .locator('li')
        .filter({ hasText: mockBun.name })
        .getByRole('link')
        .click();

      await expect(modal.getByTestId('ingredient-details')).toBeVisible();

      const { height = 720 } = page.viewportSize() ?? {};
      await page.mouse.click(5, height / 2);

      await expect(modal.getByTestId('ingredient-details')).not.toBeVisible();
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

      const constructor = getConstructor(page);
      const modal = getModal(page);

      await page
        .locator('li')
        .filter({ hasText: mockBun.name })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await page
        .locator('li')
        .filter({ hasText: mockMain.name })
        .getByRole('button', { name: 'Добавить' })
        .click();

      await constructor.getByRole('button', { name: 'Оформить заказ' }).click();

      await expect(modal.getByTestId('order-number')).toHaveText(
        String(mockOrderNumber)
      );

      await expect(constructor.getByTestId('constructor-empty-buns')).toHaveCount(
        2
      );
      await expect(
        constructor.getByTestId('constructor-empty-filling')
      ).toBeVisible();

      await modal.locator('button').click();

      await expect(modal.getByTestId('order-number')).not.toBeVisible();
    });
  });
});
