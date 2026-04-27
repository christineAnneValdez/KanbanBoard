export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    return;
  }

  const { token, hydrateFromStorage, checkAuth } = useAuth();
  hydrateFromStorage();

  if (token.value) {
    await checkAuth();
  }
});
