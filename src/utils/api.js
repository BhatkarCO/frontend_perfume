import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured.",
  );
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const csrfClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let csrfToken = null;
let csrfPromise = null;

const getCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfPromise) {
    csrfPromise = csrfClient
      .get("/auth/csrf")
      .then((response) => {
        const token = response.data?.csrfToken;

        if (!token) {
          throw new Error(
            "CSRF token was not returned by the server.",
          );
        }

        csrfToken = token;

        return csrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || "GET").toUpperCase();

    const safeMethods = [
      "GET",
      "HEAD",
      "OPTIONS",
    ];

    if (!safeMethods.includes(method)) {
      const token = await getCsrfToken();

      config.headers = config.headers || {};
      config.headers["X-CSRF-Token"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isCsrfError =
      error.response?.status === 403 &&
      error.response?.data?.message ===
        "CSRF validation failed.";

    if (
      isCsrfError &&
      originalRequest &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;

      csrfToken = null;

      try {
        const newToken = await getCsrfToken();

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers["X-CSRF-Token"] =
          newToken;

        return api.request(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;