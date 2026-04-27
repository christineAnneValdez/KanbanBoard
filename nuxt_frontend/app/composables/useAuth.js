import { computed } from "vue";
import { useApi } from "./useApi";

const AUTH_STORAGE_KEY = "kanban_auth_user";

const authUser = () => useState("auth-user", () => null);
const authToken = () =>
  useState("auth-token", () => useCookie("token", { default: () => null }).value || null);
const authLoading = () => useState("auth-loading", () => false);
const authCheckPromise = () => useState("auth-check-promise", () => null);

const syncCookieToken = (token) => {
  const tokenCookie = useCookie("token", { default: () => null });
  tokenCookie.value = token || null;
};

const persistAuth = (user, token) => {
  authUser().value = user || null;
  authToken().value = token || null;
  syncCookieToken(token || null);

  if (import.meta.client) {
    if (user || token) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: user || null,
          token: token || null,
        })
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
};

const clearAuth = () => {
  persistAuth(null, null);
};

const normalizeUserPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { user: null, token: null };
  }

  return {
    user: payload.user || payload,
    token: payload.token || payload.user?.token || null,
  };
};

export const useAuth = () => {
  const { api } = useApi();
  const user = authUser();
  const token = authToken();
  const isLoading = authLoading();
  const checkPromise = authCheckPromise();
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const hydrateFromStorage = () => {
    if (!import.meta.client) {
      return;
    }

    if (user.value && token.value) {
      return;
    }

    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      persistAuth(parsed?.user || null, parsed?.token || null);
    } catch {
      clearAuth();
    }
  };

  const authHeaders = () =>
    token.value
      ? {
          Authorization: `Bearer ${token.value}`,
        }
      : {};

  const login = async (emailOrCredentials, passwordArg) => {
    const credentials =
      typeof emailOrCredentials === "object" && emailOrCredentials !== null
        ? emailOrCredentials
        : { email: emailOrCredentials, password: passwordArg };

    try {
      isLoading.value = true;
      const { data } = await api.post("/login", credentials);
      const normalized = normalizeUserPayload(data);
      persistAuth(normalized.user, normalized.token);
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (nameOrPayload, emailArg, passwordArg) => {
    const payload =
      typeof nameOrPayload === "object" && nameOrPayload !== null
        ? {
            name:
              nameOrPayload.name ||
              [nameOrPayload.firstName, nameOrPayload.lastName].filter(Boolean).join(" ").trim(),
            email: nameOrPayload.email,
            password: nameOrPayload.password,
            password_confirmation:
              nameOrPayload.password_confirmation || nameOrPayload.confirmPassword,
          }
        : {
            name: nameOrPayload,
            email: emailArg,
            password: passwordArg,
          };

    try {
      isLoading.value = true;
      const { data } = await api.post("/register", payload);
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    if (!import.meta.client) {
      return;
    }

    if (checkPromise.value) {
      return checkPromise.value;
    }

    hydrateFromStorage();

    if (!token.value) {
      clearAuth();
      return null;
    }

    const runCheck = async () => {
      try {
        isLoading.value = true;
        const { data } = await api.get("/me", {
          headers: authHeaders(),
        });
        const normalized = normalizeUserPayload(data);
        persistAuth(normalized.user, token.value || normalized.token);
        return normalized.user;
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 419) {
          clearAuth();
          return null;
        }

        // Transient network/dev-server aborts should not force logout.
        return user.value || null;
      } finally {
        isLoading.value = false;
        checkPromise.value = null;
      }
    };

    checkPromise.value = runCheck();
    return checkPromise.value;
  };

  const logout = async () => {
    try {
      isLoading.value = true;
      if (token.value) {
        await api.post(
          "/logout",
          {},
          {
            headers: authHeaders(),
          }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuth();
      isLoading.value = false;
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    hydrateFromStorage,
    login,
    register,
    checkAuth,
    logout,
  };
};
