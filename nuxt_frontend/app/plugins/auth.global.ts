export default defineNuxtPlugin(async () => {
  const token = useCookie("token").value;
  const user = useState("user");

  if (token && !user.value) {
    try {
      const { api } = useAxio();
      const { data } = await api.get("/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      user.value = data;
    } catch {
      user.value = null;
    }
  }
});
