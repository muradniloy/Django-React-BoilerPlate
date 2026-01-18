import axios from "axios";
import { domain } from "../env";

const axiosInstance = axios.create({
  baseURL: `${domain}`,  // Django server
  withCredentials: true,           // CSRF cookie পাঠানোর জন্য
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
