import { test, expect } from "@playwright/test";

test.describe.serial("Mesas - CRUD completo", () => {
  const ROUTES = {
    login: "/login",
    list: "/tables",
    create: "/tables/create",
  };

  const API_ADD = "http://localhost:5151/api/Table/Add";

  const uniqueNumber = () => String(8000 + Math.floor(Math.random() * 1000));

  
  // login
  async function login(page: any) {
    await page.goto(ROUTES.login);
    await page.fill('input[name="name"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForLoadState("networkidle");
  }
  const inputByLabel = (page: any, labelText: string) =>
    page
      .locator(`label:has-text("${labelText}")`)
      .locator("..")
      .locator("input") 

  
  async function setNumberRobust(locator: any, value: string) {
    await expect(locator).toBeVisible({ timeout: 10000 });

    await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: true });
    await locator.fill(value);

    const current = await locator.inputValue();

    // fallback por si React no detecta el cambio
    if (current !== value) {
      await locator.evaluate((el: HTMLInputElement, val: string) => {
        el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, value);
    }

    await expect(locator).toHaveValue(value, { timeout: 5000 });
  }

  
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  
  //create 
  test("CREATE: crear mesa y verla en lista", async ({ page }) => {
    const number = uniqueNumber();

    await page.goto(ROUTES.create);
    await page.waitForLoadState("networkidle"); 

    const numberInp = inputByLabel(page, "Número de mesa");
    const capacityInp = inputByLabel(page, "Capacidad");

    await setNumberRobust(numberInp, number);
    await setNumberRobust(capacityInp, "4");

    // esperar request POST
    const [res] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes("/api/Table/Add") && r.request().method() === "POST",
        { timeout: 15000 }
      ),
      page.getByRole("button", { name: /guardar/i }).click(),
    ]);

    expect([200, 201]).toContain(res.status());

    // validar en lista
    await page.goto(ROUTES.list);
    await page.waitForLoadState("networkidle");

    await expect
      .poll(async () => {
        const candidates = [
          new RegExp(`#${number}\\b`),
          new RegExp(`\\b${number}\\b`),
          new RegExp(`mesa\\s*#?\\s*${number}\\b`, "i"),
        ];

        for (const re of candidates) {
          const count = await page.getByText(re).count();
          if (count > 0) return count;
        }
        return 0;
      }, { timeout: 25000 })
      .toBeGreaterThan(0);
  });

  
  // validación 
  
  test("VALIDACIÓN: no permite guardar sin capacidad", async ({ page }) => {
    const number = uniqueNumber();

    await page.goto(ROUTES.create);
    await page.waitForLoadState("networkidle");

    const numberInp = inputByLabel(page, "Número de mesa");

    await setNumberRobust(numberInp, number);

    await page.getByRole("button", { name: /guardar/i }).click();

    await expect(page).toHaveURL(/\/tables\/create$/);
  });
});