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
    setLoading(true); // এখন এটি কাজ করবে

    try {
      // ২. লগইন রিকোয়েস্ট
      await axiosInstance.post("/api/token/", { username, password });
      
      // ৩. প্রোফাইল ডাটা সংগ্রহ
      const profileRes = await axiosInstance.get("/api/profile/");
      
      dispatch({
        type: "ADD_PROFILE",
        profile: profileRes.data,
      });

      // ✅ [Saved Instruction] Sweet Alert Setup
      Swal.fire({
        title: "Login Success!",
        text: `Welcome ${profileRes.data?.prouser?.username || "User"}, to user dashboard`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (err) {
      console.error("Login error:", err);
      // ভুল লগইনের জন্য SweetAlert
      Swal.fire({
        title: "Login Failed !",
        text: err.response?.data?.detail || "Username or Password incorrect",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false); // লোডিং বন্ধ করা
    }
  };

  return (
    <div className="container">
      <div className="login-bg">
        <div className="login-card shadow-lg">
          <h3 className="login-title">Welcome Back 👋</h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? "Login page is loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;