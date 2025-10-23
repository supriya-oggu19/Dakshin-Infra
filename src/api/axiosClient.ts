import axios from "axios";

const axiosClient = axios.create({
  //baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response || err.message);
    return Promise.reject(err);
  }
);

export default axiosClient;
