import { test, expect } from '@playwright/test';

test.describe('MenuItemForm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu-items/create');
    await page.getByRole('heading', { name: 'Registrar platillo' }).waitFor();
  });

  test('Debería mostrar el formulario vacío al cargar', async ({ page }) => {
    await expect(page.getByPlaceholder('Ej: Cantones')).toBeEmpty();
    await expect(
      page.getByPlaceholder('Ej: Arroz chino, bueno bonito y barato')
    ).toBeEmpty();
    await expect(page.getByPlaceholder('Ej: 5000.00')).toBeEmpty();
    await expect(page.locator('#isactive')).toBeChecked();
  });

  test('Debería validar que el nombre sea obligatorio', async ({ page }) => {
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(
      page.locator('text=El nombre es obligatorio.')
    ).toBeVisible();
  });

  test('Debería validar que el nombre solo tenga letras y espacios', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Ej: Cantones');
    await nameInput.fill('Cantones123');
    await expect(nameInput).toHaveValue('Cantones');
  });

  test('Debería validar que la descripción sea obligatoria', async ({ page }) => {
    await page.getByPlaceholder('Ej: Cantones').fill('Cantones');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(
      page.locator('text=La descripción es obligatoria.')
    ).toBeVisible();
  });

  test('Debería validar que el precio sea obligatorio', async ({ page }) => {
    await page.getByPlaceholder('Ej: Cantones').fill('Cantones');
    await page
      .getByPlaceholder('Ej: Arroz chino, bueno bonito y barato')
      .fill('Descripción válida');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(
      page.locator('text=El precio es obligatorio.')
    ).toBeVisible();
  });

  test('Debería permitir solo números y un punto en el precio', async ({ page }) => {
    const priceInput = page.getByPlaceholder('Ej: 5000.00');
    await priceInput.fill('5000abc..55');
    await expect(priceInput).toHaveValue('5000.55');
  });

  test('Debería mostrar error si el precio es inválido', async ({ page }) => {
    await page.getByPlaceholder('Ej: Cantones').fill('Cantones');
    await page
      .getByPlaceholder('Ej: Arroz chino, bueno bonito y barato')
      .fill('Descripción válida');
    await page.getByPlaceholder('Ej: 5000.00').fill('12.999');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(
      page.locator('text=Precio inválido')
    ).toBeVisible();
  });

  test('Debería permitir activar y desactivar disponibilidad', async ({ page }) => {
    const checkbox = page.locator('#isactive');
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('Debería cargar preview al seleccionar una foto', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: new Uint8Array([1, 2, 3, 4]),
    });
    await expect(page.locator('img[alt="Foto platillo"]')).toBeVisible();
  });

  test('Debería enviar los datos correctamente al submit', async ({ page }) => {
    await page.getByPlaceholder('Ej: Cantones').fill('Cantones');
    await page
      .getByPlaceholder('Ej: Arroz chino, bueno bonito y barato')
      .fill('Muy rico');
    await page.getByPlaceholder('Ej: 5000.00').fill('5000');
    await page.getByRole('button', { name: 'Guardar' }).click();
  });
});