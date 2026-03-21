import { test, expect } from '@playwright/test';

test.describe('Login - Autenticación', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login exitoso crea sesión y redirige', async ({ page }) => {
    await page.fill('input[name="name"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => {
      return sessionStorage.getItem('user') !== null;
    });

    const user = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem('user')!)
    );

    expect(user).toBeTruthy();
    expect(user.role).toBe('Administrador');

    await expect(page).not.toHaveURL(/\/login$/);
  });

  test('login falla con credenciales incorrectas', async ({ page }) => {
    await page.fill('input[name="name"]', 'admin');
    await page.fill('input[name="password"]', 'incorrecto');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByText(/usuario no existente|contraseña incorrecta|error/i)
    ).toBeVisible();
  });

  test('no permite login con campos vacíos', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login$/);

    const user = await page.evaluate(() =>
      sessionStorage.getItem('user')
    );
    expect(user).toBeNull();
  });

  test('usuario autenticado no puede acceder a /login', async ({ page }) => {
    await page.fill('input[name="name"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    await page.waitForFunction(() =>
      sessionStorage.getItem('user') !== null
    );

    await page.goto('/login');

    await expect(page).not.toHaveURL(/\/login$/);

    const user = await page.evaluate(() =>
      sessionStorage.getItem('user')
    );
    expect(user).not.toBeNull();
  });

});
