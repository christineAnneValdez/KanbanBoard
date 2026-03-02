import { useAxio } from "./useAxio";

export const useAuth = () => {
  const { api } = useAxio();

  // persistent token
  const token = useCookie("token", { default: () => null });
  const user = useState("user", () => null);

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    token.value = data.token;
    user.value = data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/register", {
      name,
      email,
      password,
    });
    return data;
  };

  const logout = async () => {
    try {
      if (token.value) {
        await api.post(
          "/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
            },
          }
        );
      }
    } catch (error) {
      // Still clear local auth state even if server logout fails.
      console.error("Logout API error:", error);
    } finally {
      token.value = null;
      user.value = null;
    }
  };

  return { user, token, login, register, logout };
};
