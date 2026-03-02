<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
    <div
      class="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">Login</h2>
      <div v-if="error" class="mb-4 text-center text-sm text-red-600">{{ error }}</div>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-900"
          />
        </div>

        <button
          type="button"
          :disabled="!isHydrated"
          @click="submit"
          class="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Login
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
        No account?
        <NuxtLink to="/register" class="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Register here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
  import { useAuth } from "~/composables/useAuth";
  import { onMounted, ref } from "vue";

  const error = ref("");
  const isHydrated = ref(false);

  definePageMeta({
    middleware: "guest",
  });

  const email = ref("");
  const password = ref("");
  const { login } = useAuth();

  onMounted(() => {
    isHydrated.value = true;
  });

  const submit = async () => {
    error.value = "";

    try {
      await login(email.value, password.value);
      await navigateTo("/");
    } catch (e) {
      const apiMessage =
        e?.response?.data?.message ||
        Object.values(e?.response?.data?.errors || {})?.[0]?.[0] ||
        e?.message;
      error.value = apiMessage || "Invalid email or password.";
    }
  };
</script>
