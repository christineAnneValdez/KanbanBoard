import { expect, test } from "@playwright/test";

test("user can view projects and open kanban board", async ({ context, page, baseURL }) => {
  const appUrl = new URL(baseURL || "http://127.0.0.1:3000");

  await context.addCookies([
    {
      name: "token",
      value: "e2e-token",
      domain: appUrl.hostname,
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.route("**/api/projects", async (route) => {
    const request = route.request();

    if (request.method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          name: "Website Redesign",
          user: { name: "Project Owner" },
          created_at: "2026-02-01T08:00:00.000000Z",
          updated_at: "2026-02-10T08:00:00.000000Z",
        },
      ]),
    });
  });

  await page.route("**/api/projects/1/kanban", async (route) => {
    const request = route.request();

    if (request.method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        project: { id: 1, name: "Website Redesign" },
        groups: [
          {
            id: 11,
            name: "Todo",
            sort: 1,
            tasks: [
              {
                id: 101,
                name: "Create wireframes",
                sort: 1,
                ticket_no: "TK-101",
                labels: [],
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route("**/api/projects/1", async (route) => {
    const request = route.request();

    if (request.method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        name: "Website Redesign",
      }),
    });
  });

  await page.goto("/projects/project");

  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByText("Website Redesign")).toBeVisible();
  await expect(page.getByText("Project Owner")).toBeVisible();

  await page.getByRole("button", { name: "View Board" }).click();

  await expect(page).toHaveURL(/\/kanban\/1$/);
  await expect(page.getByRole("button", { name: /\+ Add Column/i })).toBeVisible();
  await expect(page.locator("li", { hasText: "Create wireframes" })).toBeVisible();
});
