<template>
  <aside
    class="flex flex-col h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <NuxtLink to="/" class="flex items-center gap-2">
        <UIcon name="i-heroicons-cube-transparent" class="w-6 h-6 text-primary-500" />
        <span class="font-semibold text-gray-800 dark:text-gray-100">TaskBoard</span>
      </NuxtLink>
    </div>

    <!-- Nav -->
    <nav class="flex flex-col gap-1">
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        active-class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
      >
        <UIcon name="i-heroicons-home" class="w-5 h-5" />
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/projects/project"
        class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        active-class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
      >
        <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5" />
        Project
      </NuxtLink>

      <NuxtLink
        to="/settings"
        class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        active-class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
      >
        <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
        Settings
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="mt-auto border-t border-gray-200 dark:border-gray-800 pt-4">
      <button
        class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg"
      >
        <UIcon name="i-heroicons-arrow-right-start-on-rectangle" class="w-5 h-5" />
        Logout
      </button>
    </div>
  </aside>
</template>
