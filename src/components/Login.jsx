import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useGlobalState } from "../state/provider";
import { domain } from "../env";
import "../CSS/LoginPage.css";

const Login = () => {
  const [, dispatch] = useGlobalState();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1️⃣ JWT token
      const res = await axios.post(`${domain}/api/token/`, {
        username,
        password,
      });

      dispatch({
        type: "SET_TOKENS",
        access: res.data.access,
        refresh: res.data.refresh,
      });

      // 2️⃣ Profile fetch
      const profileRes = await axios.get(`${domain}/api/profile/`, {
        headers: {
          Authorization: `Bearer ${res.data.access}`,
        },
      });

      dispatch({ type: "SET_PROFILE", profile: profileRes.data });

      // ✅ success message
      setSuccess("Login successful ✅");
      setLoading(false);

      // ⏳ 1 sec delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError("Username বা Password ভুল");
    }
  };

  return (
    <div className="container">
    <div className="login-bg">
      <div className="login-card">
        <h3 className="login-title">Welcome Back 👋</h3>
        <p className="login-subtitle">Login to continue</p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-links d-flex justify-content-between gap-3 mt-2">
          <Link to="/reset-password">Forgot Password?</Link>
          <Link to="/signup">Create Account</Link>
        </div>

      </div>
    </div>
    </div>
  );
};

export default Login;
