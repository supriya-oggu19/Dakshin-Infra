import axios from "axios";

const createAxiosClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error(`API Error (${baseURL}):`, err.response || err.message);
      return Promise.reject(err);
    }
  );

  return client;
};

export const mainAxiosClient = createAxiosClient("http://127.0.0.1:8000/api");
export const getAxiosClient = createAxiosClient("http://127.0.0.1:8001/api");
