<script setup>
import Sidebar from '~/components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar />
    <main class="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
      <slot />
    </main>
  </div>
</template>
