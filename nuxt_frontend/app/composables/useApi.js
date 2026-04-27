export const resolveApiBase = (runtimeConfig) => {
  const configuredBase =
    runtimeConfig?.public?.apiBase ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api";

  const trimmed = String(configuredBase || "").trim().replace(/\/+$/, "");

  // In dev, avoid routing API requests through Nuxt's proxy layer when the configured
  // base is relative. Direct backend calls are more stable for local Laravel integration.
  if (import.meta.dev && trimmed === "/api") {
    const devProxyTarget = (
      process.env.NUXT_DEV_PROXY_TARGET || "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    if (import.meta.client) {
      const url = new URL(devProxyTarget);
      url.hostname = window.location.hostname || url.hostname || "127.0.0.1";
      return `${url.toString().replace(/\/+$/, "")}/api`;
    }

    return `${devProxyTarget}/api`;
  }

  if (/^https?:\/\//i.test(trimmed) && !/\/api$/i.test(trimmed)) {
    return `${trimmed}/api`;
  }

  if (trimmed === "") {
    return "/api";
  }

  return trimmed;
};

const normalizeError = (error) => {
  const normalized = new Error(
    error?.data?.message || error?.message || "Request failed"
  );

  normalized.response = {
    status: error?.response?.status ?? error?.status ?? 500,
    data: error?.data ?? error?.response?._data ?? null,
  };

  return normalized;
};

const buildRequest = (baseURL) => {
  const request = async (method, url, data, config = {}) => {
    const { headers, params, body, ...rest } = config;

    try {
      const response = await $fetch.raw(url, {
        baseURL,
        method,
        headers,
        params,
        body: body ?? data,
        credentials: "include",
        ...rest,
      });

      return {
        data: response._data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  };

  return {
    get(url, config = {}) {
      return request("GET", url, undefined, config);
    },
    post(url, data, config = {}) {
      return request("POST", url, data, config);
    },
    put(url, data, config = {}) {
      return request("PUT", url, data, config);
    },
    patch(url, data, config = {}) {
      return request("PATCH", url, data, config);
    },
    delete(url, config = {}) {
      return request("DELETE", url, undefined, config);
    },
  };
};

export const useApi = () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = resolveApiBase(runtimeConfig);

  return {
    api: buildRequest(baseURL),
  };
};
