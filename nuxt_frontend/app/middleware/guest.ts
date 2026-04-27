export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const { isAuthenticated, token, hydrateFromStorage, checkAuth } = useAuth();

  hydrateFromStorage();

  if (isAuthenticated.value) {
    return navigateTo("/");
  }

  if (token.value) {
    const currentUser = await checkAuth();
    if (currentUser) {
      return navigateTo("/");
    }
  }
});
