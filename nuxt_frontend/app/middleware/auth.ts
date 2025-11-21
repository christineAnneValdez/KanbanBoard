export default defineNuxtRouteMiddleware(() => {
  const token = useCookie("token").value;

  if (!token) {
    return navigateTo("/login");
  }
});
