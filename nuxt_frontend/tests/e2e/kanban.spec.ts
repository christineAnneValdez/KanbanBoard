import { type BrowserContext, expect, test } from "@playwright/test";

const addAuthCookie = async (
  context: BrowserContext,
  baseURL?: string
) => {
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
};

test("user can add a task in kanban board", async ({ context, page, baseURL }) => {
  await addAuthCookie(context, baseURL);

  await page.route(/\/api\/projects\/1(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") {
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

  await page.route(/\/api\/me(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        name: "User",
        email: "user@example.com",
      }),
    });
  });

  await page.route(/\/api\/projects\/1\/kanban(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") {
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
            tasks: [],
          },
        ],
      }),
    });
  });

  await page.route("**/api/tasks", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    const payload = request.postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        name: payload.name,
        group_id: payload.group_id,
        project_id: payload.project_id,
        sort: payload.sort,
        ticket_no: "TK-101",
        labels: [],
      }),
    });
  });

  const projectReq = page.waitForResponse((response) =>
    /\/api\/projects\/1(?:\?.*)?$/.test(response.url())
  );
  const kanbanReq = page.waitForResponse((response) =>
    /\/api\/projects\/1\/kanban(?:\?.*)?$/.test(response.url())
  );

  await page.goto("/kanban/1");
  await Promise.all([projectReq, kanbanReq]);
  await expect(page.getByText("Loading project...")).toBeHidden();

  await expect(page.getByRole("heading", { name: "Website Redesign" })).toBeVisible();

  await page.getByRole("button", { name: "+ Add Task" }).first().click();
  await page
    .getByPlaceholder("Enter a title for this task...")
    .first()
    .fill("Create API contract");
  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(page.locator("li", { hasText: "Create API contract" })).toBeVisible();
});

test("user can update description assignee and dates in task modal", async ({
  context,
  page,
  baseURL,
}) => {
  await addAuthCookie(context, baseURL);

  const taskUpdates: Array<Record<string, unknown>> = [];
  const taskState = {
    id: 101,
    name: "Draft API contract",
    group_id: 11,
    project_id: 1,
    description: "",
    assigned_user_id: null as number | null,
    start_date: null as string | null,
    due_date: null as string | null,
  };

  await page.route(/\/api\/projects\/1(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 1, name: "Website Redesign" }),
    });
  });

  await page.route(/\/api\/me(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        name: "User",
        email: "user@example.com",
      }),
    });
  });

  await page.route(/\/api\/me(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        name: "User",
        email: "user@example.com",
      }),
    });
  });

  await page.route(/\/api\/me(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        name: "User",
        email: "user@example.com",
      }),
    });
  });

  await page.route(/\/api\/projects\/1\/kanban(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
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
                ...taskState,
                ticket_no: "TK-101",
                labels: [],
                assignee: null,
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route(/\/api\/tasks\/101\/comments(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/tasks\/101\/mentionable-users(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 7, name: "Alice Johnson", email: "alice@example.com", profile_photo_url: null },
      ]),
    });
  });

  await page.route(/\/api\/labels(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/tasks\/101\/labels(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/tasks\/101(?:\?.*)?$/, async (route) => {
    const request = route.request();
    if (!["PUT", "PATCH"].includes(request.method())) return route.continue();

    const payload = request.postDataJSON() as Record<string, unknown>;
    taskUpdates.push(payload);

    if (typeof payload.description === "string") {
      taskState.description = payload.description;
    }
    if ("assigned_user_id" in payload) {
      taskState.assigned_user_id =
        typeof payload.assigned_user_id === "number" ? payload.assigned_user_id : null;
    }
    if ("start_date" in payload) {
      taskState.start_date = typeof payload.start_date === "string" ? payload.start_date : null;
    }
    if ("due_date" in payload) {
      taskState.due_date = typeof payload.due_date === "string" ? payload.due_date : null;
    }

    const assignee =
      taskState.assigned_user_id === 7
        ? {
            id: 7,
            name: "Alice Johnson",
            email: "alice@example.com",
            profile_photo_url: null,
          }
        : null;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...taskState,
        ticket_no: "TK-101",
        labels: [],
        assignee,
      }),
    });
  });

  const projectReq = page.waitForResponse((response) =>
    /\/api\/projects\/1(?:\?.*)?$/.test(response.url())
  );
  const kanbanReq = page.waitForResponse((response) =>
    /\/api\/projects\/1\/kanban(?:\?.*)?$/.test(response.url())
  );
  const meReq = page.waitForResponse((response) =>
    response.request().method() === "GET" && /\/api\/me(?:\?.*)?$/.test(response.url())
  );

  await page.goto("/kanban/1");
  await Promise.all([projectReq, kanbanReq, meReq]);
  await expect(page.getByText("Loading project...")).toBeHidden();

  const mentionableReq = page.waitForResponse((response) =>
    /\/api\/tasks\/101\/mentionable-users(?:\?.*)?$/.test(response.url())
  );

  await page.locator("li", { hasText: "Draft API contract" }).click();
  await mentionableReq;

  const descriptionReq = page.waitForRequest((request) => {
    if (!/\/api\/tasks\/101(?:\?.*)?$/.test(request.url())) return false;
    if (!["PUT", "PATCH"].includes(request.method())) return false;
    const payload = request.postDataJSON() as Record<string, unknown>;
    return typeof payload.description === "string";
  });

  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator(".ql-editor").first().fill("Implementation details for v1");
  await Promise.all([descriptionReq, page.getByRole("button", { name: "Save" }).click()]);

  await page.getByRole("button", { name: /Unassigned/i }).first().click();
  await page.getByRole("button", { name: /Alice Johnson/i }).click();

  await page.getByRole("button", { name: /Pick a start date/i }).click();
  await page.locator(".calendar-popover button", { hasText: "15" }).first().click();

  await page.getByRole("button", { name: /Pick a due date/i }).click();
  await page.locator(".calendar-popover button", { hasText: "20" }).first().click();

  const descriptionPayload = (await descriptionReq).postDataJSON() as Record<string, unknown>;
  expect(String(descriptionPayload.description)).toContain("Implementation details for v1");

  const latestUpdate = taskUpdates[taskUpdates.length - 1];
  expect(latestUpdate.assigned_user_id).toBe(7);
  expect(String(latestUpdate.start_date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(String(latestUpdate.due_date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  const start = String(latestUpdate.start_date);
  const due = String(latestUpdate.due_date);
  expect(start <= due).toBeTruthy();
});

test("user can add reply edit and delete comments in task modal", async ({
  context,
  page,
  baseURL,
}) => {
  await addAuthCookie(context, baseURL);

  type MockComment = {
    id: number;
    content: string;
    author_name: string;
    user_id: number | null;
    parent_id: number | null;
    created_at: string;
  };

  const commentsStore: MockComment[] = [];
  let nextCommentId = 1;

  const buildCommentsResponse = () => {
    const toNode = (comment: MockComment) => ({
      id: comment.id,
      content: comment.content,
      user_id: comment.user_id,
      author_name: comment.author_name,
      parent_id: comment.parent_id,
      created_at: comment.created_at,
      replies: commentsStore
        .filter((reply) => reply.parent_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.content,
          user_id: reply.user_id,
          author_name: reply.author_name,
          parent_id: reply.parent_id,
          created_at: reply.created_at,
          user: {
            id: reply.user_id ?? 7,
            name: reply.author_name || "User",
          },
        })),
      user: {
        id: comment.user_id ?? 7,
        name: comment.author_name || "User",
      },
    });

    return commentsStore
      .filter((comment) => comment.parent_id === null)
      .map(toNode);
  };

  await page.route(/\/api\/projects\/1(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 1, name: "Website Redesign" }),
    });
  });

  await page.route(/\/api\/me(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        name: "User",
        email: "user@example.com",
      }),
    });
  });

  await page.route(/\/api\/projects\/1\/kanban(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
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
                name: "Draft API contract",
                group_id: 11,
                project_id: 1,
                description: "",
                ticket_no: "TK-101",
                labels: [],
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route(/\/api\/tasks\/101\/mentionable-users(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/labels(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/tasks\/101\/labels(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/api\/tasks\/101\/comments(?:\/\d+)?(?:\?.*)?$/, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();

    if (method === "GET" && /\/api\/tasks\/101\/comments(?:\?.*)?$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildCommentsResponse()),
      });
      return;
    }

    if (method === "POST" && /\/api\/tasks\/101\/comments(?:\?.*)?$/.test(url)) {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const parentId =
        typeof payload.parent_id === "number" ? (payload.parent_id as number) : null;
      const now = new Date().toISOString();

      const next: MockComment = {
        id: nextCommentId++,
        content: String(payload.content || ""),
        author_name: String(payload.author_name || "User"),
        user_id: 7,
        parent_id: parentId,
        created_at: now,
      };
      commentsStore.push(next);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ...next,
          user: {
            id: next.user_id ?? 7,
            name: next.author_name || "User",
          },
        }),
      });
      return;
    }

    const match = url.match(/\/api\/tasks\/101\/comments\/(\d+)(?:\?.*)?$/);
    if (match && (method === "PATCH" || method === "PUT")) {
      const commentId = Number(match[1]);
      const payload = request.postDataJSON() as Record<string, unknown>;
      const target = commentsStore.find((comment) => comment.id === commentId);
      if (target) {
        target.content = String(payload.content || target.content);
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...(target || {
            id: commentId,
            content: String(payload.content || ""),
            author_name: "User",
            user_id: null,
            parent_id: null,
            created_at: new Date().toISOString(),
          }),
          user: {
            id: target?.user_id ?? 7,
            name: target?.author_name || "User",
          },
        }),
      });
      return;
    }

    if (match && method === "DELETE") {
      const commentId = Number(match[1]);
      const idsToDelete = new Set<number>([commentId]);
      commentsStore
        .filter((comment) => comment.parent_id === commentId)
        .forEach((reply) => idsToDelete.add(reply.id));

      const remaining = commentsStore.filter((comment) => !idsToDelete.has(comment.id));
      commentsStore.length = 0;
      commentsStore.push(...remaining);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Deleted" }),
      });
      return;
    }

    await route.continue();
  });

  const projectReq = page.waitForResponse((response) =>
    /\/api\/projects\/1(?:\?.*)?$/.test(response.url())
  );
  const kanbanReq = page.waitForResponse((response) =>
    /\/api\/projects\/1\/kanban(?:\?.*)?$/.test(response.url())
  );
  const meReq = page.waitForResponse((response) =>
    response.request().method() === "GET" && /\/api\/me(?:\?.*)?$/.test(response.url())
  );

  await page.goto("/kanban/1");
  await Promise.all([projectReq, kanbanReq, meReq]);
  await expect(page.getByText("Loading project...")).toBeHidden();

  await page.locator("li", { hasText: "Draft API contract" }).click();
  await expect(page.getByText("No comments yet.")).toBeVisible();

  await page.getByRole("button", { name: "Add a comment..." }).click();
  await page.locator("form .ql-editor").first().fill("First comment");
  await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === "POST" &&
      /\/api\/tasks\/101\/comments(?:\?.*)?$/.test(response.url())
    ),
    page.getByRole("button", { name: "Post" }).click(),
  ]);
  await expect(page.getByText("First comment")).toBeVisible();

  await page.getByRole("button", { name: "Reply" }).first().click();
  await page.locator(".rounded-md.bg-slate-50 .ql-editor").first().fill("Reply comment");
  await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === "POST" &&
      /\/api\/tasks\/101\/comments(?:\?.*)?$/.test(response.url())
    ),
    page.getByRole("button", { name: "Post reply" }).click(),
  ]);
  await expect(page.getByText("Reply comment")).toBeVisible();

  const firstCommentBlock = page
    .locator("div.rounded-md.p-3")
    .filter({ has: page.locator("p", { hasText: "First comment" }) })
    .first();
  await expect(firstCommentBlock).toBeVisible();
  await expect(firstCommentBlock.locator("p", { hasText: "First comment" })).toBeVisible();
  const firstCommentEdit = firstCommentBlock.locator(':scope > div.mt-2 button[aria-label="Edit"]');
  await expect(firstCommentEdit).toBeVisible();
  await firstCommentEdit.click();
  const saveEditedCommentButton = page.getByRole("button", { name: "Save" }).last();
  await expect(saveEditedCommentButton).toBeVisible();
  await firstCommentBlock
    .locator('.ql-editor[contenteditable="true"]')
    .first()
    .fill("First comment updated");
  const patchRequest = page.waitForRequest((request) => {
    const method = request.method();
    return (
      (method === "PATCH" || method === "PUT") &&
      /\/api\/tasks\/101\/comments\/\d+(?:\?.*)?$/.test(request.url())
    );
  });
  await Promise.all([
    patchRequest,
    saveEditedCommentButton.click({ force: true }),
  ]);
  await expect(page.getByText("First comment updated")).toBeVisible();

  const replyBlock = page
    .locator("div.rounded-md.p-2")
    .filter({ has: page.getByText("Reply comment", { exact: true }) })
    .first();
  const replyDelete = replyBlock.locator(':scope > div.mt-2 button[aria-label="Delete"]');
  await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === "DELETE" &&
      /\/api\/tasks\/101\/comments\/\d+(?:\?.*)?$/.test(response.url())
    ),
    replyDelete.click(),
  ]);
  await expect(page.getByText("Reply comment")).not.toBeVisible();
});

test("user can move tasks and columns in kanban board", async ({ context, page, baseURL }) => {
  await addAuthCookie(context, baseURL);

  const taskMovePayloads: Array<Record<string, unknown>> = [];
  const columnMovePayloads: Array<Record<string, unknown>> = [];
  const observedGroupRequests: Array<Record<string, unknown>> = [];

  page.on("request", (request) => {
    if (!["PUT", "PATCH"].includes(request.method())) return;
    const path = new URL(request.url()).pathname;
    if (!/\/(?:api\/)?groups\/\d+\/?$/.test(path)) return;
    const payload = request.postDataJSON?.();
    if (payload && typeof payload === "object") {
      observedGroupRequests.push(payload as Record<string, unknown>);
    }
  });

  await page.route(/\/api\/projects\/1(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 1, name: "Website Redesign" }),
    });
  });

  await page.route(/\/api\/me(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 7,
        name: "User",
        email: "user@example.com",
      }),
    });
  });

  await page.route(/\/api\/projects\/1\/kanban(?:\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
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
                name: "Task Alpha",
                group_id: 11,
                sort: 1,
                ticket_no: "TK-101",
                labels: [],
              },
            ],
          },
          {
            id: 12,
            name: "Doing",
            sort: 2,
            tasks: [],
          },
        ],
      }),
    });
  });

  await page.route(/\/api\/tasks\/\d+(?:\?.*)?$/, async (route) => {
    const request = route.request();
    if (!["PUT", "PATCH"].includes(request.method())) return route.continue();

    const payload = request.postDataJSON() as Record<string, unknown>;
    taskMovePayloads.push(payload);
    const taskIdMatch = request.url().match(/\/api\/tasks\/(\d+)/);
    const taskId = taskIdMatch ? Number(taskIdMatch[1]) : 101;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: taskId,
        ...payload,
        ticket_no: "TK-101",
        labels: [],
      }),
    });
  });

  await page.route(/\/api\/groups\/\d+(?:\?.*)?$/, async (route) => {
    const request = route.request();
    if (!["PUT", "PATCH"].includes(request.method())) return route.continue();

    const payload = request.postDataJSON() as Record<string, unknown>;
    columnMovePayloads.push(payload);
    const groupIdMatch = request.url().match(/\/api\/groups\/(\d+)/);
    const groupId = groupIdMatch ? Number(groupIdMatch[1]) : 11;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: groupId,
        ...payload,
      }),
    });
  });

  const projectReq = page.waitForResponse((response) =>
    /\/api\/projects\/1(?:\?.*)?$/.test(response.url())
  );
  const kanbanReq = page.waitForResponse((response) =>
    /\/api\/projects\/1\/kanban(?:\?.*)?$/.test(response.url())
  );
  const meReq = page.waitForResponse((response) =>
    response.request().method() === "GET" && /\/api\/me(?:\?.*)?$/.test(response.url())
  );

  await page.goto("/kanban/1");
  await Promise.all([projectReq, kanbanReq, meReq]);
  await expect(page.getByText("Loading project...")).toBeHidden();
  await expect(page.locator("li", { hasText: "Task Alpha" })).toBeVisible();

  const taskMoveReq = page.waitForRequest((request) => {
    if (!["PUT", "PATCH"].includes(request.method())) return false;
    if (!/\/api\/tasks\/\d+(?:\?.*)?$/.test(request.url())) return false;
    const payload = request.postDataJSON() as Record<string, unknown>;
    return Number(payload.group_id) === 12;
  });

  const taskCard = page.locator("li", { hasText: "Task Alpha" }).first();
  const targetColumn = page
    .locator("div.w-\\[85\\%\\].sm\\:w-80")
    .filter({ has: page.getByRole("heading", { name: "Doing" }) })
    .first();
  await expect(targetColumn).toBeVisible();

  const taskCardBox = await taskCard.boundingBox();
  const targetColumnBox = await targetColumn.boundingBox();
  if (!taskCardBox || !targetColumnBox) {
    throw new Error("Could not get bounding boxes for task drag-and-drop.");
  }

  await page.mouse.move(taskCardBox.x + taskCardBox.width / 2, taskCardBox.y + taskCardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    targetColumnBox.x + targetColumnBox.width / 2,
    targetColumnBox.y + Math.min(120, targetColumnBox.height / 2),
    { steps: 12 }
  );
  await page.mouse.up();
  const movedTaskRequest = await taskMoveReq;
  const movedTaskPayload = movedTaskRequest.postDataJSON() as Record<string, unknown>;
  expect(Number(movedTaskPayload.group_id)).toBe(12);
  expect(Number(movedTaskPayload.sort)).toBe(1);

  const todoColumn = page
    .locator("div.w-\\[85\\%\\].sm\\:w-80")
    .filter({ has: page.getByRole("heading", { name: "Todo" }) })
    .first();
  const doingColumn = page
    .locator("div.w-\\[85\\%\\].sm\\:w-80")
    .filter({ has: page.getByRole("heading", { name: "Doing" }) })
    .first();
  await expect(todoColumn).toBeVisible();
  await expect(doingColumn).toBeVisible();
  const todoBefore = await todoColumn.boundingBox();
  const doingBefore = await doingColumn.boundingBox();
  if (!todoBefore || !doingBefore) {
    throw new Error("Could not get bounding boxes for column drag-and-drop.");
  }

  // Drop Todo to the right of Doing to force reorder (not insert-before).
  await page.mouse.move(todoBefore.x + todoBefore.width / 2, todoBefore.y + 24);
  await page.mouse.down();
  await page.mouse.move(doingBefore.x + doingBefore.width + 60, doingBefore.y + 24, {
    steps: 14,
  });
  await page.mouse.up();

  const todoAfter = await todoColumn.boundingBox();
  const doingAfter = await doingColumn.boundingBox();
  if (!todoAfter || !doingAfter) {
    throw new Error("Could not read column positions after drag-and-drop.");
  }
  expect(todoAfter.x).toBeGreaterThan(doingAfter.x);

  const sentSortValues = [...columnMovePayloads, ...observedGroupRequests]
    .map((payload) => Number(payload.sort))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b);
  if (sentSortValues.length > 0) {
    expect(sentSortValues.includes(1)).toBeTruthy();
  }
});
