// axios
import axios from "axios";
import router from "@/router";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (result) => {
    // normally just return data
    return result.data;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // 1. 401 Unauthorized (not logged in)
    if (status === 401 && !url.includes('/auth/login')) {
      router.navigate('/login');
      window.location.reload();
    }

    // 2. Other errors (400, 500, network)
    return Promise.reject(error);
  }
);


export default instance;