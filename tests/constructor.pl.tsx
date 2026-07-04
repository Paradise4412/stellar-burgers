import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';

const ingredientsHar = path.join(__dirname, 'fixtures/ingredients.har');

const mockUser = {
  success: true,
  user: {
    email: 'test@test.com',
    name: 'Test User'
  }
};

const mockOrder = {
  success: true,
  name: 'Space флюоресцентный бургер',
  order: {
    _id: '662f8aa5aabbcc0012345678',
    status: 'done',
    name: 'Space флюоресцентный бургер',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    number: 12345,
    price: 5000,
    owner: {
      name: 'Test User',
      email: 'test@test.com',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  }
};

const setupIngredientsMock = async (page: Page) => {
  await page.routeFromHAR(ingredientsHar, {
    url: '**/api/ingredients',
    update: false
  });
};

const setupAuth = async (context: BrowserContext, page: Page) => {
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

  await page.route('**/api/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser)
    });
  });
};

test.beforeEach(async ({ page }) => {
  await setupIngredientsMock(page);
});

test('добавление булки и начинки в конструктор', async ({ page }) => {
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

test('модальное окно ингредиента: открытие и закрытие', async ({ page }) => {
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

test('создание заказа', async ({ page, context }) => {
  await setupAuth(context, page);

  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrder)
      });
      return;
    }

    await route.continue();
  });

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
