import { test, expect } from "@playwright/test";

test.describe.serial("Ingredientes - CRUD completo", () => {
  const ROUTES = {
    login: "/login",
    list: "/ingredients",
    create: "/ingredientes/crear",
    editPrefix: "/ingredientes/editar",
  };

  function uniqueName(prefix = "Ingrediente QA") {
    return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async function login(page: any) {
    await page.goto(ROUTES.login);

    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    await page.waitForLoadState("networkidle");
    await expect(page).not.toHaveURL(/\/login$/);
  }

  async function goList(page: any) {
    await page.goto(ROUTES.list);
    await page.waitForLoadState("networkidle");
  }

  async function search(page: any, q: string) {
    const input = page.getByPlaceholder("Buscar ingrediente");
    await input.fill("");
    await input.fill(q);
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("CREATE: crear ingrediente y verlo en la tabla", async ({ page }) => {
    const name = uniqueName();

    await page.goto(ROUTES.create);

    await page.getByPlaceholder("Nombre").fill(name);
    await page.getByPlaceholder("Precio").fill("1500");
    await page.getByPlaceholder("Stock").fill("25");

    await page.getByRole("button", { name: /^guardar$/i }).click();

    await expect(page).toHaveURL(/\/ingredients$/, { timeout: 15000 });

    await search(page, name);
    await expect(page.locator("tbody tr", { hasText: name })).toBeVisible({ timeout: 20000 });
  });

  test("VALIDACIÓN: no permite guardar con campos vacíos", async ({ page }) => {
    await page.goto(ROUTES.create);

    await page.getByRole("button", { name: /^guardar$/i }).click();

    await expect(page).not.toHaveURL(/\/ingredients$/);
  });

  test("UPDATE: editar ingrediente (modal confirmar) y ver cambios", async ({ page }) => {
    const name = uniqueName();
    const nameEdited = `${name} EDIT`;

    // 1) crear
    await page.goto(ROUTES.create);
    await page.getByPlaceholder("Nombre").fill(name);
    await page.getByPlaceholder("Precio").fill("2000");
    await page.getByPlaceholder("Stock").fill("30");
    await page.getByRole("button", { name: /^guardar$/i }).click();

    await expect(page).toHaveURL(/\/ingredients$/, { timeout: 15000 });

    // 2) abrir editar desde la tabla
    await search(page, name);
    const row = page.locator("tbody tr", { hasText: name });
    await expect(row).toBeVisible({ timeout: 20000 });

    await row.locator('button[title="Editar"]').click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.editPrefix}/\\d+$`), { timeout: 15000 });

    // 3) editar campos
    await page.getByPlaceholder("Nombre").fill(nameEdited);
    await page.getByPlaceholder("Precio").fill("2500");
    await page.getByPlaceholder("Stock").fill("40");

    await page.getByRole("button", { name: /^actualizar$/i }).click();

    // 4) modal confirmar (scoped + force)
    const modal = page.locator("div", { hasText: "Actualizar ingrediente" }).first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    await modal.getByRole("button", { name: /confirmar/i }).click({ force: true });

    // 5) volver a lista y validar (refresco real con goto)
    await expect(page).toHaveURL(/\/ingredients$/, { timeout: 15000 });

    await expect
      .poll(async () => {
        await goList(page);
        await search(page, nameEdited);
        return await page.locator("tbody tr", { hasText: nameEdited }).count();
      }, { timeout: 25000 })
      .toBeGreaterThan(0);
  });

  test("DELETE: eliminar ingrediente y que desaparezca de la tabla", async ({ page }) => {
    const name = uniqueName();

    // 1) crear
    await page.goto(ROUTES.create);
    await page.getByPlaceholder("Nombre").fill(name);
    await page.getByPlaceholder("Precio").fill("1000");
    await page.getByPlaceholder("Stock").fill("10");
    await page.getByRole("button", { name: /^guardar$/i }).click();

    await expect(page).toHaveURL(/\/ingredients$/, { timeout: 15000 });

    // 2) eliminar desde la tabla
    await search(page, name);
    const row = page.locator("tbody tr", { hasText: name });
    await expect(row).toBeVisible({ timeout: 20000 });

    await row.locator('button[title="Eliminar"]').click();

    // modal eliminar (scoped + force)
    const modal = page.locator("div", { hasText: "Eliminar ingrediente" }).first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    await modal.getByRole("button", { name: "Eliminar", exact: true }).last().click({ force: true });
    // 3) validar que ya no está (refresco real)
    await expect
      .poll(async () => {
        await goList(page);
        await search(page, name);
        return await page.locator("tbody tr", { hasText: name }).count();
      }, { timeout: 25000 })
      .toBe(0);
  });
});