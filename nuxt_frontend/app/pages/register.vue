<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Create Account</h2>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Your full name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Your email address"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Create a password"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          class="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-blue-600 hover:underline"> Login </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
  import { useAuth } from "~/composables/useAuth";
  import { ref } from "vue";
  import { useToast } from "vue-toastification";

  const toast = useToast();

  definePageMeta({
    middleware: "guest",
  });

  const name = ref("");
  const email = ref("");
  const password = ref("");
  const { register } = useAuth();

  const submit = async () => {
    try {
      await register(name.value, email.value, password.value);

      toast.success("Registration successful! 🎉");

      navigateTo("/login");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.log(error);
    }
  };
</script>
