import axios from "axios";

export const resolveApiBase = (runtimeConfig) => {
  const configuredBase =
    runtimeConfig?.public?.apiBase ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api";

  const trimmed = String(configuredBase || "").trim().replace(/\/+$/, "");

  // In dev, avoid hard dependency on Nuxt proxy. If apiBase is relative (/api),
  // call Laravel directly so /api 404 from dev server does not break dashboard/projects.
  if (import.meta.client && import.meta.dev && trimmed === "/api") {
    const host = window.location.hostname || "127.0.0.1";
    return `http://${host}:8000/api`;
  }

  if (/^https?:\/\//i.test(trimmed) && !/\/api$/i.test(trimmed)) {
    return `${trimmed}/api`;
  }

  if (trimmed === "") {
    return "/api";
  }

  return trimmed;
};

export const useAxio = () => {
  const runtimeConfig = useRuntimeConfig();

  const api = axios.create({
    baseURL: resolveApiBase(runtimeConfig),
    withCredentials: true,
  });

  return { api };
};
