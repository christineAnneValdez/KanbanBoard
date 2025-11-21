<template>
  <div>
    <h1 class="mb-4 text-2xl font-bold">Welcome to the Dashboard</h1>
    <p>This is the index page content.</p>
  </div>
</template>

<script setup>
  import { useAuth } from "~/composables/useAuth";

  definePageMeta({
    middleware: "auth",
  });

  const { user } = useAuth();
</script>
