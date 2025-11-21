<template>
  <div class="p-4 sm:p-6">
    <h1 class="mb-4 text-xl font-bold sm:text-2xl">Projects</h1>

    <div v-if="pending" class="text-gray-500">Loading projects...</div>
    <div v-else-if="error" class="text-red-500">Error loading projects.</div>

    <!-- Responsive grid -->
    <div
      v-else
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="project in projects"
        :key="project.id"
        class="flex flex-col justify-between rounded-xl border border-gray-200 p-4 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-800 dark:hover:bg-gray-900"
      >
        <div>
          <div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="truncate text-lg font-semibold">{{ project.name }}</h2>
            <UiButton @click="goToKanban(project.id)" class="w-full text-sm sm:w-auto">
              View Board
            </UiButton>
          </div>

          <p class="text-sm text-gray-700 dark:text-gray-300">
            <span class="font-semibold">Created by:</span>
            {{ project.user?.name || "Unknown" }}
          </p>
        </div>

        <div class="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <p><span class="font-semibold">Created:</span> {{ formatDate(project.created_at) }}</p>
          <p><span class="font-semibold">Updated:</span> {{ formatDate(project.updated_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useAuth } from "~/composables/useAuth";
  import { useProjects } from "~/composables/useProjects";
  import { formatDate } from "~/utils/formatDate";
  import { useRouter } from "vue-router";

  const { projects, pending, error } = useProjects();
  const router = useRouter();

  const goToKanban = (projectId) => {
    router.push(`/kanban/${projectId}`);
  };

  definePageMeta({
    middleware: "auth",
  });

  const { user } = useAuth();
</script>
