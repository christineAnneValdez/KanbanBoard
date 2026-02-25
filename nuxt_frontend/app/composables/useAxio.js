import axios from "axios";

export const useAxio = () => {
  const runtimeConfig = useRuntimeConfig();

  const api = axios.create({
    baseURL: runtimeConfig.public.apiBase || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
    withCredentials: true,
  });

  return { api };
};
