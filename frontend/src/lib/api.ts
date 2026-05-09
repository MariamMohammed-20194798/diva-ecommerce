import axios from "axios";

const fallbackApiBaseUrl = "http://127.0.0.1:3001/api";
const CART_SESSION_STORAGE_KEY = "cartSessionId";

export const getStoredCartSessionId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CART_SESSION_STORAGE_KEY);
};

export const storeCartSessionId = (sessionId: string | null | undefined) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!sessionId) {
    window.localStorage.removeItem(CART_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CART_SESSION_STORAGE_KEY, sessionId);
};

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? fallbackApiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("accessToken");
    const sessionId = getStoredCartSessionId();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const sessionId = response.headers["x-session-id"];
    if (typeof sessionId === "string" && sessionId.trim().length > 0) {
      storeCartSessionId(sessionId);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Avoid infinite loops if refresh itself fails
      if (originalRequest.url?.includes("/auth/refresh")) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("accessToken");
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const { accessToken } = response.data;

        if (accessToken) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("accessToken", accessToken);
          }
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("accessToken");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
