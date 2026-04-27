import { expect, test } from "@playwright/test";

test("user can login", async ({ page }) => {
  await page.route("**/api/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: "e2e-token",
        user: {
          id: 999999,
          name: "E2E User",
          email: "e2e@example.com",
        },
      }),
    });
  });

  await page.goto("/login");
  await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
  const loginButton = page.getByRole("button", { name: "Login" });
  await expect(loginButton).toBeEnabled();
  await page.getByPlaceholder("Enter your email").fill("e2e@example.com");
  await page.getByPlaceholder("Enter your password").fill("Password123");
  await loginButton.click();

  await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
});
