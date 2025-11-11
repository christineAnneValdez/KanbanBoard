<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-xl sm:text-2xl font-bold mb-4">Projects</h1>

    <div v-if="pending" class="text-gray-500">Loading projects...</div>
    <div v-else-if="error" class="text-red-500">Error loading projects.</div>

    <!-- Responsive grid -->
    <div
      v-else
      class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="project in projects"
        :key="project.id"
        class="border border-gray-200 dark:border-gray-800 p-4 rounded-xl
               hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200
               shadow-sm hover:shadow-md flex flex-col justify-between"
      >
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <h2 class="text-lg font-semibold truncate">{{ project.name }}</h2>
            <UiButton
              @click="goToKanban(project.id)"
              class="w-full sm:w-auto text-sm"
            >
              View Board
            </UiButton>
          </div>

          <p class="text-sm text-gray-700 dark:text-gray-300">
            <span class="font-semibold">Created by:</span>
            {{ project.user?.name || 'Unknown' }}
          </p>
        </div>

        <div class="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><span class="font-semibold">Created:</span> {{ formatDate(project.created_at) }}</p>
          <p><span class="font-semibold">Updated:</span> {{ formatDate(project.updated_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProjects } from '~/composables/useProjects'
import { formatDate } from '~/utils/formatDate'
import { useRouter } from 'vue-router'

const { projects, pending, error } = useProjects()
const router = useRouter()

const goToKanban = (projectId) => {
  router.push(`/kanban/${projectId}`)
}
</script>
