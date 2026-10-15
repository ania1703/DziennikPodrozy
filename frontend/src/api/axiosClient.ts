import axios, { type AxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRequest = error.config?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("roles");
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export default axiosClient;