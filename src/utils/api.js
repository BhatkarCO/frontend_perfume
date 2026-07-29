import axios from "axios";

// Same-origin path — goes through the Next.js rewrite proxy, not directly to Render
const apiBaseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5000/api" // server-side (SSR) can hit Render directly, no cookie issue there
    : "/api"; // client-side must go through the rewrite for same-site cookies

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== "/auth/me") {
      console.warn("Unauthorized or expired token.");
    }

    return Promise.reject(error);
  },
);

export default api;
