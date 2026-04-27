<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div class="border-b border-slate-200 px-6 py-6 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg
              v-if="isLogin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">
            {{ isLogin ? "Welcome back" : "Create your account" }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ isLogin ? "Sign in to continue to your kanban workspace." : "Register to start managing your projects." }}
          </p>
        </div>

        <div class="px-6 py-6">
          <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ errorMessage }}
          </div>

          <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-1.5">
              <label for="login-email" class="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                required
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                :class="loginErrors.email ? 'border-red-500' : ''"
                placeholder="you@example.com"
              />
              <p v-if="loginErrors.email" class="text-xs text-red-600">{{ loginErrors.email }}</p>
            </div>

            <div class="space-y-1.5">
              <label for="login-password" class="block text-sm font-medium text-slate-700">Password</label>
              <div class="relative">
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  required
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  :class="loginErrors.password ? 'border-red-500' : ''"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  {{ showLoginPassword ? "Hide" : "Show" }}
                </button>
              </div>
              <p v-if="loginErrors.password" class="text-xs text-red-600">{{ loginErrors.password }}</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span v-if="isLoading">Signing in...</span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label for="register-first-name" class="block text-sm font-medium text-slate-700">First name</label>
                <input
                  id="register-first-name"
                  v-model="registerForm.firstName"
                  type="text"
                  required
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  :class="registerErrors.firstName ? 'border-red-500' : ''"
                  placeholder="First name"
                />
                <p v-if="registerErrors.firstName" class="text-xs text-red-600">{{ registerErrors.firstName }}</p>
              </div>

              <div class="space-y-1.5">
                <label for="register-last-name" class="block text-sm font-medium text-slate-700">Last name</label>
                <input
                  id="register-last-name"
                  v-model="registerForm.lastName"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label for="register-email" class="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                required
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                :class="registerErrors.email ? 'border-red-500' : ''"
                placeholder="you@example.com"
              />
              <p v-if="registerErrors.email" class="text-xs text-red-600">{{ registerErrors.email }}</p>
            </div>

            <div class="space-y-1.5">
              <label for="register-password" class="block text-sm font-medium text-slate-700">Password</label>
              <div class="relative">
                <input
                  id="register-password"
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  :class="registerErrors.password ? 'border-red-500' : ''"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  {{ showRegisterPassword ? "Hide" : "Show" }}
                </button>
              </div>
              <p v-if="registerErrors.password" class="text-xs text-red-600">{{ registerErrors.password }}</p>
            </div>

            <div class="space-y-1.5">
              <label for="register-confirm-password" class="block text-sm font-medium text-slate-700">Confirm password</label>
              <div class="relative">
                <input
                  id="register-confirm-password"
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  :class="registerErrors.confirmPassword ? 'border-red-500' : ''"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  {{ showConfirmPassword ? "Hide" : "Show" }}
                </button>
              </div>
              <p v-if="registerErrors.confirmPassword" class="text-xs text-red-600">{{ registerErrors.confirmPassword }}</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span v-if="isLoading">Creating account...</span>
              <span v-else>Register</span>
            </button>
          </form>

          <div class="my-6 flex items-center gap-3">
            <div class="h-px flex-1 bg-slate-200"></div>
            <span class="text-xs uppercase tracking-wide text-slate-400">or</span>
            <div class="h-px flex-1 bg-slate-200"></div>
          </div>

          <div class="text-center text-sm text-slate-500">
            <template v-if="isLogin">
              No account yet?
              <button type="button" class="font-medium text-blue-600 hover:underline" @click="setMode('register')">
                Register
              </button>
            </template>
            <template v-else>
              Already have an account?
              <button type="button" class="font-medium text-blue-600 hover:underline" @click="setMode('login')">
                Sign in
              </button>
            </template>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

definePageMeta({ middleware: "guest", layout: false });

const router = useRouter();
const route = useRoute();
const redirectCookie = useCookie("auth_redirect", { sameSite: "lax" });
const { login, register, isLoading } = useAuth();

const next = computed(() => String(route.query.next || route.query.redirect || redirectCookie.value || "/"));
const mode = ref(route.query.mode === "register" ? "register" : "login");
const isLogin = computed(() => mode.value === "login");

const errorMessage = ref("");
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showConfirmPassword = ref(false);

const loginForm = ref({
  email: "",
  password: "",
});

const registerForm = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loginErrors = ref({
  email: "",
  password: "",
});

const registerErrors = ref({
  firstName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const consumeNext = () => {
  const target = next.value;
  redirectCookie.value = null;
  return target;
};

const setMode = (newMode) => {
  mode.value = newMode;
  errorMessage.value = "";
  loginErrors.value = { email: "", password: "" };
  registerErrors.value = { firstName: "", email: "", password: "", confirmPassword: "" };
  router.replace({ query: { ...route.query, mode: newMode } });
};

const validateLogin = () => {
  loginErrors.value = { email: "", password: "" };
  let valid = true;

  if (!loginForm.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.email)) {
    loginErrors.value.email = "Please enter a valid email address.";
    valid = false;
  }

  if (!loginForm.value.password) {
    loginErrors.value.password = "Password is required.";
    valid = false;
  }

  return valid;
};

const validateRegister = () => {
  registerErrors.value = { firstName: "", email: "", password: "", confirmPassword: "" };
  let valid = true;

  if (!registerForm.value.firstName.trim()) {
    registerErrors.value.firstName = "First name is required.";
    valid = false;
  }

  if (
    !registerForm.value.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)
  ) {
    registerErrors.value.email = "Please enter a valid email address.";
    valid = false;
  }

  if (registerForm.value.password.length < 8) {
    registerErrors.value.password = "Password must be at least 8 characters.";
    valid = false;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerErrors.value.confirmPassword = "Passwords do not match.";
    valid = false;
  }

  return valid;
};

const handleLogin = async () => {
  if (!validateLogin()) {
    return;
  }

  try {
    errorMessage.value = "";
    await login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    });
    await router.push(consumeNext());
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
      error?.message ||
      "Login failed. Please check your credentials.";
  }
};

const handleRegister = async () => {
  if (!validateRegister()) {
    return;
  }

  try {
    errorMessage.value = "";
    const name = [registerForm.value.firstName, registerForm.value.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    await register({
      name,
      firstName: registerForm.value.firstName,
      lastName: registerForm.value.lastName,
      email: registerForm.value.email,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword,
    });

    await login({
      email: registerForm.value.email,
      password: registerForm.value.password,
    });

    await router.push(consumeNext());
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message ||
      Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
      error?.message ||
      "Registration failed. Please try again.";
  }
};
</script>
