<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-3xl font-bold text-slate-900">Settings</h1>
      <p class="mt-2 text-slate-600">Manage your profile details and password.</p>
    </header>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">Profile</h2>
      <p class="mt-1 text-sm text-slate-500">Update your display name and profile picture.</p>

      <div
        v-if="profileSuccess"
        class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ profileSuccess }}
      </div>
      <div
        v-if="profileError"
        class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ profileError }}
      </div>

      <form @submit.prevent="updateName" class="mt-4 space-y-4">
        <div class="flex items-center gap-4">
          <div
            class="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
          >
            <img
              v-if="profilePhotoPreview"
              :src="profilePhotoPreview"
              alt="Profile picture preview"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ userInitials }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <label
              class="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onProfilePhotoSelected"
              />
            </label>
            <button
              v-if="profilePhotoPreview"
              type="button"
              @click="removeProfilePhoto"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Remove Photo
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Your full name"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          :disabled="isUpdatingName"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isUpdatingName ? "Saving..." : "Save Profile Changes" }}
        </button>
        <p class="text-xs text-slate-500">
          Click <strong>Save Profile Changes</strong> after changing name or photo.
        </p>
      </form>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">Password</h2>
      <p class="mt-1 text-sm text-slate-500">Change your account password.</p>

      <div
        v-if="passwordSuccess"
        class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        {{ passwordSuccess }}
      </div>
      <div
        v-if="passwordError"
        class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ passwordError }}
      </div>

      <form @submit.prevent="updatePassword" class="mt-4 space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Current password</label>
          <input
            v-model="currentPassword"
            type="password"
            placeholder="Current password"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">New password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="At least 8 characters"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
          <input
            v-model="newPasswordConfirmation"
            type="password"
            placeholder="Re-enter new password"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          :disabled="isUpdatingPassword"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isUpdatingPassword ? "Updating..." : "Update Password" }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from "vue";
  import { useAuth } from "~/composables/useAuth";
  import { useAxio } from "~/composables/useAxio";

  definePageMeta({
    middleware: "auth",
  });

  const { user, token } = useAuth();
  const { api } = useAxio();

  const name = ref(user.value?.name || "");
  const profilePhotoFile = ref(null);
  const profilePhotoPreview = ref(user.value?.profile_photo_url || "");
  const shouldRemoveProfilePhoto = ref(false);
  const currentPassword = ref("");
  const newPassword = ref("");
  const newPasswordConfirmation = ref("");

  const isUpdatingName = ref(false);
  const isUpdatingPassword = ref(false);

  const profileError = ref("");
  const profileSuccess = ref("");
  const passwordError = ref("");
  const passwordSuccess = ref("");

  watch(
    () => user.value?.name,
    (nextName) => {
      if (typeof nextName === "string") {
        name.value = nextName;
      }
    }
  );

  watch(
    () => user.value?.profile_photo_url,
    (nextUrl) => {
      if (!profilePhotoFile.value) {
        profilePhotoPreview.value = nextUrl || "";
      }
    }
  );

  const authHeaders = computed(() =>
    token.value
      ? {
          Authorization: `Bearer ${token.value}`,
        }
      : {}
  );

  const extractErrorMessage = (error, fallbackMessage) => {
    const validationErrors = error?.response?.data?.errors;
    if (validationErrors && typeof validationErrors === "object") {
      const firstError = Object.values(validationErrors)[0];
      if (Array.isArray(firstError) && firstError.length) return firstError[0];
    }

    return error?.response?.data?.message || fallbackMessage;
  };

  const userInitials = computed(() => {
    const source = name.value || user.value?.name || "U";
    const parts = source.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "U";
  });

  const onProfilePhotoSelected = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    profilePhotoFile.value = file;
    shouldRemoveProfilePhoto.value = false;
    profilePhotoPreview.value = URL.createObjectURL(file);
    await updateName();
  };

  const removeProfilePhoto = () => {
    profilePhotoFile.value = null;
    shouldRemoveProfilePhoto.value = true;
    profilePhotoPreview.value = "";
  };

  const updateName = async () => {
    profileError.value = "";
    profileSuccess.value = "";

    const trimmedName = name.value.trim() || (user.value?.name || "").trim();
    if (!trimmedName) {
      profileError.value = "Name is required.";
      return;
    }

    isUpdatingName.value = true;

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);

      if (profilePhotoFile.value) {
        formData.append("profile_photo", profilePhotoFile.value);
      }

      if (shouldRemoveProfilePhoto.value) {
        formData.append("remove_profile_photo", "1");
      }

      const { data } = await api.post("/profile", formData, {
        headers: {
          ...authHeaders.value,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data?.user) {
        user.value = data.user;
      } else if (user.value) {
        user.value = { ...user.value, name: trimmedName };
      }

      profilePhotoFile.value = null;
      shouldRemoveProfilePhoto.value = false;
      profileSuccess.value = "Profile updated successfully.";
    } catch (error) {
      profileError.value = extractErrorMessage(error, "Failed to update name.");
    } finally {
      isUpdatingName.value = false;
    }
  };

  const updatePassword = async () => {
    passwordError.value = "";
    passwordSuccess.value = "";

    if (newPassword.value.length < 8) {
      passwordError.value = "New password must be at least 8 characters.";
      return;
    }

    if (newPassword.value !== newPasswordConfirmation.value) {
      passwordError.value = "Password confirmation does not match.";
      return;
    }

    isUpdatingPassword.value = true;

    try {
      const { data } = await api.patch(
        "/profile/password",
        {
          current_password: currentPassword.value,
          password: newPassword.value,
          password_confirmation: newPasswordConfirmation.value,
        },
        { headers: authHeaders.value }
      );

      currentPassword.value = "";
      newPassword.value = "";
      newPasswordConfirmation.value = "";
      passwordSuccess.value = data?.message || "Password updated successfully.";
    } catch (error) {
      passwordError.value = extractErrorMessage(error, "Failed to update password.");
    } finally {
      isUpdatingPassword.value = false;
    }
  };
</script>
