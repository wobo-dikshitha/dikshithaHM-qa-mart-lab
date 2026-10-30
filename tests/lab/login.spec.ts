import { test, expect } from '../fixtures';
import { users } from '../test-data';

test.describe('Login (US-104)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('valid credentials open the product list', async ({ page }) => {
    await page.getByLabel('Email').fill(users.standard.email);
    await page.getByLabel('Password').fill(users.standard.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('wrong password shows an error and stays on login', async ({ page }) => {
    await page.getByLabel('Email').fill(users.standard.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('locked account is rejected with a support message', async ({ page }) => {
    await page.getByLabel('Email').fill(users.locked.email);
    await page.getByLabel('Password').fill(users.locked.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('locked');
  });

  test('login API returns 401 for bad credentials and 423 for a locked account', async ({ api }) => {
    expect((await api.login({ email: users.standard.email, password: 'nope' })).status).toBe(401);
    expect((await api.login(users.locked)).status).toBe(423);
  });
});
