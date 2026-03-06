import { useEffect, useRef, useState, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useGlobalState } from "../state/provider";
import axiosInstance from "../state/axiosInstance"; // ✅ আপনার তৈরি করা axiosInstance ব্যবহার করুন

const ProtectedRoute = () => {
  const location = useLocation();
  const timerRef = useRef(null);
  const [{ profile }, dispatch] = useGlobalState();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ১. অথেনটিকেশন চেক: শুধু গ্লোবাল প্রোফাইল স্টেটের ওপর নির্ভর করবে
  const isAuth = !!profile;

  // ২. অটো লগআউট হ্যান্ডলার (সার্ভার সাইড থেকেও সেশন ক্লিয়ার করবে)
  const handleLogout = useCallback(async () => {
    // [Saved Instruction] Sweet Alert for inactivity logout
    Swal.fire({
      title: 'সেশন শেষ!',
      text: 'দীর্ঘক্ষণ নিষ্ক্রিয় থাকার কারণে আপনাকে লগআউট করা হচ্ছে।',
      icon: 'warning',
      confirmButtonText: 'আবার লগইন করুন',
      confirmButtonColor: '#3085d6',
    }).then(async () => {
      try {
        // ✅ axiosInstance ব্যবহার করলে HttpOnly কুকি অটোমেটিক ক্লিয়ার হবে
        await axiosInstance.post("/api/logout/"); 
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.clear();
        sessionStorage.clear();
        dispatch({ type: "LOGOUT" }); // প্রোফাইল স্টেট ক্লিয়ার করবে
        window.location.href = "/"; // সরাসরি লগইন পেজে (রুট পাথ)
      }
    });
  }, [dispatch]);

  // ৩. ইনঅ্যাক্টিভিটি টাইমার রিসেট (১৫ মিনিট)
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, 15 * 60 * 1000);
  }, [handleLogout]);

  useEffect(() => {
    // ৪. ইউজার অ্যাক্টিভিটি ট্র্যাকিং
    if (isAuth) {
      setCheckingAuth(false);
      
      const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        events.forEach((event) => window.removeEventListener(event, resetTimer));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      // ৫. অ্যাপ লোড হওয়ার সময় App.jsx-এর প্রোফাইল ফেচ করার জন্য ১ সেকেন্ড বাফার টাইম
      const timeout = setTimeout(() => setCheckingAuth(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isAuth, resetTimer]);

  // ৬. নিরাপত্তা যাচাইয়ের লোডিং স্টেট
  if (checkingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-3 text-white fw-bold">নিরাপত্তা নিশ্চিত করা হচ্ছে...</div>
        </div>
      </div>
    );
  }

  // ৭. প্রোফাইল না থাকলে লগইন পেজে রিডাইরেক্ট (HttpOnly মোডে এটিই প্রধান গেটওয়ে)
  if (!isAuth) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;