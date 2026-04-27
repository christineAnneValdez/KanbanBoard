export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  const { isAuthenticated, token, hydrateFromStorage, checkAuth } = useAuth();
  const redirectCookie = useCookie("auth_redirect", { sameSite: "lax" });

  hydrateFromStorage();

  if (isAuthenticated.value) {
    return;
  }

  // If we have a token but no hydrated user yet, validate session before redirecting.
  if (token.value) {
    const currentUser = await checkAuth();
    if (currentUser) {
      return;
    }
  }

  if (!isAuthenticated.value) {
    redirectCookie.value = to.fullPath;
    return navigateTo("/auth");
  }
});
