import { test, expect } from "@playwright/test";

test.describe("UserForm (CreateUserPage)", () => {
 test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Nombre de usuario").fill("admin");
  await page.getByPlaceholder("Contraseña").fill("admin");

//await page.getByRole("button", { name: /iniciar|login|entrar/i }).click();
await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  await page.goto("/usuarios/crear");
  await expect(page.getByRole("heading", { name: /registrar usuario|crear usuario/i })).toBeVisible();
});

  test("Debería mostrar el formulario vacío al cargar (create)", async ({ page }) => {
    await expect(page.getByPlaceholder("Nombre de usuario")).toBeEmpty();
    await expect(page.getByPlaceholder("Contraseña")).toBeEmpty();
    const rol = page.locator('select[name="idRol"]');
    await expect(rol).toHaveValue("1");
    const emp = page.locator('select[name="idEmploye"]');
    await expect(emp).toHaveValue("0");
  });

  test("Debería validar nombre vacío o solo espacios", async ({ page }) => {
    await page.getByPlaceholder("Nombre de usuario").fill("   ");
    await page.getByPlaceholder("Contraseña").fill("1234");
    await page.locator('select[name="idEmploye"]').selectOption({ value: "0" });
    await page.getByRole("button", { name: "Registrar usuario" }).click();
    await expect(page.getByText("El nombre de usuario no puede estar vacío ni contener solo espacios.")).toBeVisible();
  });

  test("Debería validar contraseña vacía en create", async ({ page }) => {
    await page.getByPlaceholder("Nombre de usuario").fill("usuario_test");
    await page.getByPlaceholder("Contraseña").fill("   ");
    const emp = page.locator('select[name="idEmploye"]');
    const options = await emp.locator("option").all();
    if (options.length < 2) test.skip(true, "No hay empleados cargados para seleccionar");
    const value = await options[1].getAttribute("value");
    await emp.selectOption(value ?? "");
    await page.getByRole("button", { name: "Registrar usuario" }).click();
    await expect(page.getByText("La contraseña no puede estar vacía ni contener solo espacios.")).toBeVisible();
  });

  test("Debería validar que se seleccione un empleado", async ({ page }) => {
    await page.getByPlaceholder("Nombre de usuario").fill("usuario_test");
    await page.getByPlaceholder("Contraseña").fill("1234");
    await page.getByRole("button", { name: "Registrar usuario" }).click();
    await expect(page.getByText("Debes seleccionar un empleado.")).toBeVisible();
  });

  test("Debería crear usuario correctamente (muestra modal éxito)", async ({ page }) => {
    const unique = `user_${Date.now()}`;
    await page.getByPlaceholder("Nombre de usuario").fill(unique);
    await page.getByPlaceholder("Contraseña").fill("1234");
    await page.locator('select[name="idRol"]').selectOption({ value: "2" });
    const emp = page.locator('select[name="idEmploye"]');
    const options = await emp.locator("option").all();
    if (options.length < 2) test.skip(true, "No hay empleados cargados para seleccionar");
    const value = await options[1].getAttribute("value");
    await emp.selectOption(value ?? "");
    await page.getByRole("button", { name: "Registrar usuario" }).click();
    await expect(page.getByText("¡Operación exitosa!")).toBeVisible();
    await expect(page.getByText("Usuario creado correctamente")).toBeVisible();
    await page.getByRole("button", { name: "Aceptar" }).click();
    await expect(page).toHaveURL(/\/usuarios$/);
  });
});
