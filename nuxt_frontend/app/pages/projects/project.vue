<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Projects</h1>

    <div v-if="pending">Loading projects...</div>
    <div v-else-if="error">Error loading projects.</div>
    <div v-else class="grid gap-4">
      <div
        v-for="project in projects"
        :key="project.id"
        class="border border-gray-200 dark:border-gray-800 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition"
      >
        <h2 class="text-lg font-medium">{{ project.name }}</h2>
        <p class="text-sm text-gray-700">Created by: {{ project.user?.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: projects, pending, error } = await useFetch('http://127.0.0.1:8000/api/projects')
</script>
