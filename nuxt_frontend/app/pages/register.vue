<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
    <div
      class="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">Create Account</h2>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
          <input
            name="name"
            v-model="name"
            type="text"
            placeholder="Your full name"
            required
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
          <input
            name="email"
            v-model="email"
            type="email"
            placeholder="Your email address"
            required
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-900"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
          <input
            ref="passwordInputEl"
            name="password"
            v-model="password"
            type="password"
            placeholder="Create a password"
            required
            minlength="8"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-900"
          />
        </div>

        <button
          type="submit"
          :disabled="!isHydrated"
          class="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Register
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-blue-600 hover:underline dark:text-blue-400">Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
  import { useAuth } from "~/composables/useAuth";
  import { onMounted, ref } from "vue";
  import { useToast } from "vue-toastification";

  const toast = useToast();
  const isHydrated = ref(false);

  definePageMeta({
    middleware: "guest",
  });

  const name = ref("");
  const email = ref("");
  const password = ref("");
  const passwordInputEl = ref(null);
  const { register } = useAuth();

  onMounted(() => {
    isHydrated.value = true;
  });

  const submit = async (event) => {
    try {
      const formEl =
        event?.target?.closest?.("form") || passwordInputEl.value?.closest?.("form");
      const formData = formEl ? new FormData(formEl) : null;

      const resolvedName = String(formData?.get("name") || name.value || "");
      const resolvedEmail = String(formData?.get("email") || email.value || "");
      const resolvedPassword = String(
        passwordInputEl.value?.value || formData?.get("password") || password.value || ""
      );
      const normalizedPassword = resolvedPassword.trim();

      name.value = resolvedName;
      email.value = resolvedEmail;
      password.value = normalizedPassword;
      await register(resolvedName, resolvedEmail, normalizedPassword);
      toast.success("Registration successful.");
      await navigateTo("/login");
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
        error?.message;
      const isNetworkError = !error?.response;
      const fallbackMessage = isNetworkError
        ? "Cannot reach API server at 127.0.0.1:8000. Start Laravel backend."
        : "Registration failed. Please try again.";

      toast.error(apiMessage || fallbackMessage);
      console.log(error);
    }
  };
</script>
