import { test, expect } from '@playwright/test';

test.describe('EmployeeForm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees/create');
    await page.getByRole('heading', { name: 'Registrar empleado' }).waitFor();
  });

  test('Debería mostrar el formulario vacío al cargar', async ({ page }) => {
    await expect(page.getByLabel('Identificación')).toBeEmpty();
    await expect(page.getByLabel('Nombre')).toBeEmpty();
    await expect(page.getByLabel('Apellidos')).toBeEmpty();
    await expect(page.getByLabel('Turno')).toHaveValue('Diurno');
    await expect(page.getByLabel('Salario')).toBeEmpty();
  });

  test('Debería validar que la identificación tenga exactamente 9 dígitos', async ({ page }) => {
    await page.getByLabel('Identificación').fill('123');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=La identificación debe tener exactamente 9 números.')).toBeVisible();
  });

  test('Debería validar que nombre y apellidos no estén vacíos', async ({ page }) => {
    await page.getByLabel('Identificación').fill('123456789');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=El nombre es requerido.')).toBeVisible();
    await expect(page.locator('text=Los apellidos son requeridos.')).toBeVisible();
  });

  test('Debería validar que el salario sea un número mayor a 0', async ({ page }) => {
    await page.getByLabel('Identificación').fill('123456789');
    await page.getByLabel('Nombre').fill('Dayron');
    await page.getByLabel('Apellidos').fill('Ortiz');
    await page.getByLabel('Salario').fill('0');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=Por favor ingresa un salario válido')).toBeVisible();
  });

  test('Debería permitir solo números en identificación y salario', async ({ page }) => {
    await page.getByLabel('Identificación').fill('123456789a');
    await expect(page.getByLabel('Identificación')).toHaveValue('123456789');
    await page.getByLabel('Salario').fill('100000a');
    await expect(page.getByLabel('Salario')).toHaveValue('100000');
  });

  test('Debería permitir solo letras y espacios en nombre y apellidos', async ({ page }) => {
    await page.getByLabel('Nombre').fill('Dayron123');
    await expect(page.getByLabel('Nombre')).toHaveValue('Dayron');
    await page.getByLabel('Apellidos').fill('Ortiz123');
    await expect(page.getByLabel('Apellidos')).toHaveValue('Ortiz');
  });

  test('Debería enviar los datos correctamente al submit', async ({ page }) => {
    await page.getByLabel('Identificación').fill('123456789');
    await page.getByLabel('Nombre').fill('Dayron');
    await page.getByLabel('Apellidos').fill('Ortiz');
    await page.getByLabel('Turno').selectOption('Nocturno');
    await page.getByLabel('Salario').fill('300000');
    await page.getByRole('button', { name: 'Guardar' }).click();
    // Aquí podrías validar que se llamó a onSubmit con los datos correctos
  });
});
