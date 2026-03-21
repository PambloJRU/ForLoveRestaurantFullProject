import { test, expect } from '@playwright/test';

test.describe('SupplierForm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/suppliers/create'); // 🔧 ajusta la ruta si cambia
    await page.getByRole('heading', { name: /Registrar proveedor/i }).waitFor();
  });

  test('Debería mostrar el formulario vacío al cargar', async ({ page }) => {
    await expect(
      page.getByPlaceholder('Ej: Distribuidora XYZ')
    ).toBeEmpty();

    await expect(
      page.getByPlaceholder('Cédula/Jurídica/RUC')
    ).toBeEmpty();

    await expect(
      page.getByPlaceholder('Ej: 8888-8888')
    ).toBeEmpty();

    await expect(
      page.getByPlaceholder('ejemplo@correo.com')
    ).toBeEmpty();

    await expect(page.locator('text=Sin foto')).toBeVisible();
  });

  test('Debería validar que el nombre es obligatorio', async ({ page }) => {
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(
      page.locator('text=El nombre es obligatorio.')
    ).toBeVisible();
  });

  test('Debería permitir solo letras en el nombre', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Ej: Distribuidora XYZ');

    await nameInput.fill('Proveedor123');
    await expect(nameInput).toHaveValue('Proveedor');
  });

  test('Debería permitir solo números en teléfono', async ({ page }) => {
    const phoneInput = page.getByPlaceholder('Ej: 8888-8888');

    await phoneInput.fill('8888-ABCD');
    await expect(phoneInput).toHaveValue('8888');
  });

  test('Debería permitir solo números en identificación', async ({ page }) => {
    const idInput = page.getByPlaceholder('Cédula/Jurídica/RUC');

    await idInput.fill('123ABC456');
    await expect(idInput).toHaveValue('123456');
  });

  test('Debería mostrar preview al subir foto', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'proveedor.png',
      mimeType: 'image/png',
      buffer: new Uint8Array([1, 2, 3, 4]),
    });

    await expect(page.locator('img[alt="Foto proveedor"]')).toBeVisible();
  });

  test('Debería quitar la foto al presionar "Quitar foto"', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'proveedor.png',
      mimeType: 'image/png',
      buffer: new Uint8Array([1, 2, 3, 4]),
    });

    await page.getByRole('button', { name: 'Quitar foto' }).click();

    await expect(page.locator('text=Sin foto')).toBeVisible();
  });

  test('Debería enviar el formulario correctamente', async ({ page }) => {
    await page
      .getByPlaceholder('Ej: Distribuidora XYZ')
      .fill('Distribuidora Norte');

    await page
      .getByPlaceholder('Ej: 8888-8888')
      .fill('88888888');

    await page
      .getByPlaceholder('ejemplo@correo.com')
      .fill('proveedor@test.com');

    await page
      .getByPlaceholder('Cédula/Jurídica/RUC')
      .fill('123456789');

    await page.getByRole('button', { name: 'Guardar' }).click();
  });
});
