import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGlobalState } from "../../state/provider"; // আপনার পাথ অনুযায়ী ঠিক করুন
import axiosInstance from "../../state/axiosInstance";
import Swal from "sweetalert2";
import "../../CSS/LoginPage.css";

const Login = () => {
  // ১. স্টেট এবং হুক ডিফাইন করা (এগুলো মিসিং ছিল)
  const [{}, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // ১. টোকেন জেনারেট করা
    await axiosInstance.post("/api/token/", { username, password });
    
    // ২. প্রোফাইল ডাটা সংগ্রহ করা
    const profileRes = await axiosInstance.get("/api/profile/");
    const profileData = profileRes.data;

    // গ্লোবাল স্টেটে ডাটা সেভ করা
    dispatch({
      type: "ADD_PROFILE",
      profile: profileData,
    });

    // ৩. প্রোফাইল কমপ্লিট কি না তা চেক করা (এখান থেকেই রিডাইরেক্ট হবে)
    // ধরুন আপনার এপিআই 'is_profile_complete' ফিল্ডটি পাঠাচ্ছে
    if (profileData.is_profile_complete === false) {
      Swal.fire({
        title: "Welcome!",
        text: "Please complete your profile to continue.",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Go to Profile Update",
        allowOutsideClick: false // ইউজার যাতে আপডেট না করে বের হতে না পারে
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/update-profile");
        }
      });
    } else {
      // প্রোফাইল কমপ্লিট থাকলে ড্যাশবোর্ডে যাবে
      Swal.fire({
        title: "Login Success!",
        text: `Welcome ${profileData?.prouser?.username || "User"}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
    
  } catch (err) {
    console.error("Login error:", err);
    Swal.fire({
      title: "Login Failed!",
      text: err.response?.data?.detail || "Username or Password incorrect",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};

  return (
   <div className="container">
  <div className="login-bg">
    <div className="login-card shadow-lg">
      <h3 className="login-title">Welcome Back 👋</h3>
      <p className="text-muted small text-center mb-4">Please enter your details to sign in</p>
      
      <form onSubmit={handleLogin}>
        {/* Username Field */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Username"
            className="form-control custom-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="form-control custom-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Forgot Password */}
        <div className="d-flex justify-content-center mb-4">
          <Link 
            to="/reset-password" 
            className="text-decoration-none fw-medium transition-all"
            style={{ fontSize: "13px", color: "#6c757d" }}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-pill" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Signing in...
            </>
          ) : "Login"}
        </button>
      </form>

      {/* Registration Section - Added Here */}
      <div className="mt-4 pt-3 border-top text-center">
        <p className="small text-muted mb-2">Don't have an account yet?</p>
        <Link 
          to="/register" 
          className="btn btn-outline-dark btn-sm w-100 py-2 rounded-pill fw-bold transition-all"
          style={{ fontSize: "13px", letterSpacing: "0.5px" }}
        >
          Create New Account
        </Link>
      </div>
    </div>
  </div>
</div>
  );
};

export default Login;