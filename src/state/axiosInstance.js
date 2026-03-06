import axios from "axios";
import { domain } from "../env";
import * as CM from "../componentExporter";

const axiosInstance = axios.create({
  baseURL: domain,
  withCredentials: true, // এটি কুকি অটোমেটিক পাঠাবে
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// রেসপন্স ইন্টারসেপ্টর
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ১. যদি রিফ্রেশ টোকেন রিকোয়েস্ট নিজেই ৪০১/৪০০ দেয় (অর্থাৎ রিফ্রেশ টোকেন আর কাজ করছে না)
    if (originalRequest.url.includes('/token/refresh/') && (error.response.status === 401 || error.response.status === 400)) {
      
      // সেশন ক্লিয়ার করুন (লগআউট লজিক)
      localStorage.clear();
      sessionStorage.clear();
      
      // [Saved Instruction] Logout Alert
      CM.Swal.fire({
        icon: 'warning',
        title: 'সেশন শেষ!',
        text: 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        window.location.href = '/'; 
      });

      return Promise.reject(error);
    }

    // ২. সাধারণ ৪০১ এরর (এক্সেস টোকেন এক্সপায়ার হলে রিফ্রেশ করার চেষ্টা করবে)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // নতুন টোকেন পাওয়ার চেষ্টা
        await axiosInstance.post('/token/refresh/');
        // সাকসেস হলে অরিজিনাল রিকোয়েস্ট আবার করবে
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // রিফ্রেশ ফেইল করলে (যেমন রিফ্রেশ টোকেন অবৈধ) লুপ বন্ধ করবে
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;