<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p class="mt-2 text-slate-600">
          Hello, <span class="font-semibold text-slate-900">{{ displayName }}</span>.
        </p>
      </div>
      <button
        @click="loadAnalytics"
        :disabled="isLoading"
        class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ isLoading ? "Refreshing..." : "Refresh" }}
      </button>
    </header>

    <div
      v-if="analyticsError"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ analyticsError }}
    </div>

    <section class="grid gap-4 sm:grid-cols-3">
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Projects</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.projectCount }}</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Groups</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.groupCount }}</p>
      </article>
      <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tasks</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.taskCount }}</p>
      </article>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-base font-semibold text-slate-900">Tasks by Project</h2>
        <p class="mt-1 text-sm text-slate-500">Workload distribution per project</p>

        <div v-if="projectBreakdown.length" class="mt-5 space-y-4">
          <div v-for="project in projectBreakdown" :key="project.id" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-slate-700">{{ project.name }}</span>
              <span class="text-slate-500">{{ project.taskCount }} tasks</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100">
              <div
                class="h-2 rounded-full bg-blue-500"
                :style="{ width: `${Math.max(4, (project.taskCount / maxProjectTasks) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
        <p v-else class="mt-5 text-sm text-slate-500">No project analytics yet.</p>
      </article>

      <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-base font-semibold text-slate-900">Task Status</h2>
        <p class="mt-1 text-sm text-slate-500">Inferred from group names</p>

        <div class="mt-5 flex items-center gap-6">
          <div
            class="relative h-36 w-36 rounded-full"
            :style="{ background: statusDonutBackground }"
          >
            <div
              class="absolute inset-5 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700"
            >
              {{ metrics.taskCount }}
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              <span class="text-slate-700">Todo: {{ statusCounts.todo }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <span class="text-slate-700">In Progress: {{ statusCounts.inProgress }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-slate-700">Done: {{ statusCounts.done }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              <span class="text-slate-700">Other: {{ statusCounts.other }}</span>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-5">
      <h2 class="text-base font-semibold text-slate-900">Top Groups by Tasks</h2>
      <p class="mt-1 text-sm text-slate-500">Highest-volume groups across all projects</p>

      <div v-if="groupBreakdown.length" class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="group in groupBreakdown"
          :key="`${group.projectId}-${group.groupId}`"
          class="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <p class="text-sm font-semibold text-slate-800">{{ group.groupName }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ group.projectName }}</p>
          <p class="mt-3 text-lg font-bold text-slate-900">{{ group.taskCount }}</p>
        </article>
      </div>
      <p v-else class="mt-5 text-sm text-slate-500">No group analytics yet.</p>
    </section>
  </div>
</template>

<script setup>
  import { useAxio } from "~/composables/useAxio";
  import { useAuth } from "~/composables/useAuth";
  import { computed, onMounted, ref } from "vue";

  definePageMeta({
    middleware: "auth",
  });

  const { user, token } = useAuth();
  const { api } = useAxio();

  const displayName = computed(() => user.value?.name || "User");

  const isLoading = ref(false);
  const analyticsError = ref("");
  const metrics = ref({
    projectCount: 0,
    groupCount: 0,
    taskCount: 0,
  });

  const projectBreakdown = ref([]);
  const groupBreakdown = ref([]);
  const statusCounts = ref({
    todo: 0,
    inProgress: 0,
    done: 0,
    other: 0,
  });

  const authHeaders = computed(() =>
    token.value
      ? {
          Authorization: `Bearer ${token.value}`,
        }
      : {}
  );

  const maxProjectTasks = computed(() => {
    if (!projectBreakdown.value.length) return 1;
    return Math.max(...projectBreakdown.value.map((p) => p.taskCount), 1);
  });

  const statusDonutBackground = computed(() => {
    const total = metrics.value.taskCount || 1;
    const todoPct = (statusCounts.value.todo / total) * 100;
    const inProgressPct = (statusCounts.value.inProgress / total) * 100;
    const donePct = (statusCounts.value.done / total) * 100;

    return `conic-gradient(
      #3b82f6 0% ${todoPct}%,
      #f59e0b ${todoPct}% ${todoPct + inProgressPct}%,
      #10b981 ${todoPct + inProgressPct}% ${todoPct + inProgressPct + donePct}%,
      #94a3b8 ${todoPct + inProgressPct + donePct}% 100%
    )`;
  });

  const inferStatus = (groupName = "") => {
    const name = groupName.toLowerCase();

    if (name.includes("done") || name.includes("complete")) return "done";
    if (name.includes("progress") || name.includes("doing") || name.includes("in progress"))
      return "inProgress";
    if (name.includes("todo") || name.includes("to do") || name.includes("backlog")) return "todo";

    return "other";
  };

  const loadAnalytics = async () => {
    isLoading.value = true;
    analyticsError.value = "";

    try {
      const { data: projects } = await api.get("/projects", {
        headers: authHeaders.value,
      });

      const projectList = Array.isArray(projects) ? projects : [];

      const kanbanResponses = await Promise.all(
        projectList.map((project) =>
          api
            .get(`/projects/${project.id}/kanban`, {
              headers: authHeaders.value,
            })
            .then((res) => ({ project, data: res.data }))
        )
      );

      const nextProjectBreakdown = [];
      const nextGroupBreakdown = [];
      const nextStatus = { todo: 0, inProgress: 0, done: 0, other: 0 };

      let totalGroups = 0;
      let totalTasks = 0;

      for (const item of kanbanResponses) {
        const groups = Array.isArray(item?.data?.groups) ? item.data.groups : [];
        totalGroups += groups.length;

        let projectTaskCount = 0;

        for (const group of groups) {
          const tasks = Array.isArray(group.tasks) ? group.tasks : [];
          const taskCount = tasks.length;

          projectTaskCount += taskCount;
          totalTasks += taskCount;

          nextGroupBreakdown.push({
            projectId: item.project.id,
            groupId: group.id,
            projectName: item.project.name || "Untitled Project",
            groupName: group.name || "Untitled Group",
            taskCount,
          });

          nextStatus[inferStatus(group.name)] += taskCount;
        }

        nextProjectBreakdown.push({
          id: item.project.id,
          name: item.project.name || "Untitled Project",
          taskCount: projectTaskCount,
        });
      }

      metrics.value = {
        projectCount: projectList.length,
        groupCount: totalGroups,
        taskCount: totalTasks,
      };

      projectBreakdown.value = nextProjectBreakdown.sort((a, b) => b.taskCount - a.taskCount);
      groupBreakdown.value = nextGroupBreakdown
        .sort((a, b) => b.taskCount - a.taskCount)
        .slice(0, 9);
      statusCounts.value = nextStatus;
    } catch (error) {
      analyticsError.value = "Failed to load dashboard analytics.";
      console.error("Dashboard analytics error:", error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(loadAnalytics);
</script>
