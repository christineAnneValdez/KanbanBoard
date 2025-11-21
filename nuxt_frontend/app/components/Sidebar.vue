<template>
  <!-- HIDDEN on login/register -->
  <div v-if="!hideSidebar">
    <!-- Mobile Toggle Button -->
    <button
      @click="toggleSidebar"
      class="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-md lg:hidden dark:border-gray-700 dark:bg-gray-900"
    >
      <UIcon
        :name="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
        class="h-6 w-6 text-gray-800 dark:text-gray-100"
      />
    </button>

    <!-- Overlay -->
    <div
      v-if="isOpen"
      @click="toggleSidebar"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 flex h-screen w-64 transform flex-col border-r border-gray-200 bg-white px-4 py-6 transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-950',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:static lg:z-auto lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="mb-6 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="font-semibold text-gray-800 dark:text-gray-100">Kanban Board</span>
        </NuxtLink>
      </div>

      <!-- Nav Links -->
      <nav class="flex flex-col gap-1">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          active-class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
        >
          <UIcon name="i-heroicons-home" class="h-5 w-5" />
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/projects/project"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          active-class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
        >
          <UIcon name="i-heroicons-clipboard-document-list" class="h-5 w-5" />
          Project
        </NuxtLink>

        <NuxtLink
          to="/settings"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          active-class="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="h-5 w-5" />
          Settings
        </NuxtLink>
      </nav>

      <!-- Logout -->
      <div class="mt-auto border-t border-gray-200 pt-4 dark:border-gray-800">
        <button
          @click="logoutUser"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <UIcon name="i-heroicons-arrow-right-start-on-rectangle" class="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
  import { navigateTo, useRoute } from "#imports";
  import { useAuth } from "~/composables/useAuth";
  import { computed, ref } from "vue";

  // For sidebar open/close state
  const isOpen = ref(false);
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  // Hide sidebar on login & register pages
  const route = useRoute();
  const hideSidebar = computed(() => route.path === "/login" || route.path === "/register");

  // Logout logic (from useAuth)
  const { logout } = useAuth();
  const logoutUser = async () => {
    await logout();
    navigateTo("/login");
  };
</script>
