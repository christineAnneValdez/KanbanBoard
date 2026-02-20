<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-3xl font-bold text-slate-900">
        Welcome Dashboard
      </h1>
      <p class="mt-2 text-slate-600">
        Hello, <span class="font-semibold text-slate-900">{{ displayName }}</span>.
      </p>
    </header>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">Overview</h2>
      <p class="mt-2 text-sm text-slate-600">
        You are logged in and ready to manage your tasks.
      </p>
    </section>
  </div>
</template>

<script setup>
  import { useAuth } from "~/composables/useAuth";
  import { computed } from "vue";

  definePageMeta({
    middleware: "auth",
  });

  const { user } = useAuth();

  const displayName = computed(() => user.value?.name || "User");
</script>
