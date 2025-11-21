import axios from "axios";

export const useAxio = () => {
  const runtimeConfig = useRuntimeConfig();

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    withCredentials: true,
  });

  return { api };
};
