import axios from "axios";

const createAxiosClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("auth_token");
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

// export const mainAxiosClient = createAxiosClient("https://backend-api.ramyaconstructions.com/api");
// export const getAxiosClient = createAxiosClient("https://frontend-api.ramyaconstructions.com/api");

export const mainAxiosClient=createAxiosClient("http://localhost:8000/api");
export const getAxiosClient=createAxiosClient("http://localhost:8001/api")