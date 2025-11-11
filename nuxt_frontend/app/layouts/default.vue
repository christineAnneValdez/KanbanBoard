<script setup>
import Sidebar from '~/components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <main class="flex-1 bg-gray-50 dark:bg-gray-900 p-0 p-6 pb-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
