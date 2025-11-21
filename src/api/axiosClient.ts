import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

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

// MAIN (write) client
export const mainAxiosClient = createAxiosClient("http://localhost:8000/api");
// CACHED (read) client
export const getAxiosClient = setupCache(
  createAxiosClient("http://localhost:8001/api"),
  {
    ttl: 0,
    cacheTakeover: false,
    interpretHeader: false,
  }
);

getAxiosClient.interceptors.response.use((response) => {
  if (response.cached) {
    console.log("🔥 CACHE HIT:", response.config.url);
  } else {
    console.log("🌐 NETWORK REQUEST:", response.config.url);
  }
  return response;
});


// export const mainAxiosClient = createAxiosClient("https://backend-api.ramyaconstructions.com/api");
// export const getAxiosClient = setupCache(
//   createAxiosClient("https://frontend-api.ramyaconstructions.com/api"),
//   {
//     ttl: 0,
//     cacheTakeover: false,
//     interpretHeader: false,
//   }
// );