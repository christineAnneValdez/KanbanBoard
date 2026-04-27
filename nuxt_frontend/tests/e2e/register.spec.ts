import { expect, test } from "@playwright/test";

test("user can register", async ({ page }) => {
  await page.route("**/*register*", async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const isRegisterApi =
      req.method() === "POST" && /\/(?:api\/)?register\/?$/.test(path);

    if (!isRegisterApi) {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        token: "e2e-register-token",
        user: {
          id: 1000000,
          name: "E2E Register User",
          email: "e2e-register@example.com",
        },
      }),
    });
  });

  await page.goto("/register");
  await page.waitForFunction(() => {
    const nuxtRoot = document.querySelector("#__nuxt");
    return Boolean(nuxtRoot && "__vue_app__" in nuxtRoot);
  });
  const registerButton = page.getByRole("button", { name: "Register" });
  await expect(registerButton).toBeEnabled();

  const nameInput = page.getByPlaceholder("Your full name");
  const emailInput = page.getByPlaceholder("Your email address");

  await expect(nameInput).toBeVisible();
  await nameInput.fill("E2E Register User");
  await emailInput.fill("e2e-register@example.com");
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill("Password12345");
  await expect(passwordInput).toHaveValue("Password12345");

  const registerRequest = page.waitForRequest((request) => {
    const path = new URL(request.url()).pathname;
    return request.method() === "POST" && /\/(?:api\/)?register\/?$/.test(path);
  });
  await Promise.all([registerRequest, registerButton.click()]);

  const registerError = page.getByText(
    /registration failed|password must be at least/i
  );
  if (await registerError.isVisible().catch(() => false)) {
    const errorText = (await registerError.textContent()) || "";
    if (/password must be at least/i.test(errorText)) {
      await passwordInput.fill("");
      await passwordInput.fill("Password12345");
      await registerButton.click();
    }
  }

  if (await registerError.isVisible().catch(() => false)) {
    throw new Error(`UI register failed: ${await registerError.textContent()}`);
  }

  await expect(page).toHaveURL(/\/login$/, { timeout: 15000 });
});
