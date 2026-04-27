<script setup>
import { computed } from "vue";
import Sidebar from "~/components/Sidebar.vue";

const route = useRoute();
const { isAuthenticated, hydrateFromStorage } = useAuth();

if (import.meta.client) {
  hydrateFromStorage();
}

const showSidebar = computed(() => {
  if (route.path === "/auth" || route.path === "/login" || route.path === "/register") {
    return false;
  }

  return isAuthenticated.value;
});
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar v-if="showSidebar" />

    <main class="flex-1 bg-gray-50 dark:bg-gray-900 p-0 p-6 pb-0 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
