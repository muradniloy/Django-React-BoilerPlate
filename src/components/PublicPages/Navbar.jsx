import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalState } from "../../state/provider";
import { domain } from "../../env";
import axios from "axios";
import Swal from 'sweetalert2';
import Cookies from "js-cookie"; // Cookies ইমপোর্ট করা হয়েছে
import { axiosInstance } from "../../componentExporter";

const Navbar = () => {
  const [{ profile, access }, dispatch] = useGlobalState();
  const navigate = useNavigate();

  // ১. সেশন কুকি থেকে টোকেন নেওয়া
  const token = Cookies.get("access") || access;

  // ২. লগআউট ফাংশন
const handleLogout = async () => {
    try {
        // ১. সার্ভারকে বলা কুকি ডিলিট করতে
        await axiosInstance.post('/api/logout/'); 
        
        // ২. ফ্রন্টএন্ডের বাকি সব ক্লিয়ার করা
        localStorage.clear();
        sessionStorage.clear();
        
        // [Saved Instruction] Logout Success Alert
        Swal.fire({
            icon: 'success',
            title: 'লগআউট সফল',
            timer: 1000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "/";
        });
    } catch (err) {
        // যদি API ফেল করে তাও জোর করে ক্লিয়ার করার চেষ্টা
        localStorage.clear();
        window.location.href = "/";
    }
};

  // ৩. প্রোফাইলে প্রদর্শিত নাম ঠিক করা
  const displayName = () => {
    if (!profile?.prouser) return "Update Profile";
    const { first_name, last_name, username } = profile.prouser;
    if (first_name && last_name) return `${first_name} ${last_name}`;
    return username || "Update Profile";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">My Online Shop</Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link active" to="/">Home</Link>
            </li>

            {/* যদি ইউজার লগইন থাকে */}
            {profile && profile.prouser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Admin Panel</Link>
                </li>

                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    to="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={profile.image ? (profile.image.startsWith('http') ? profile.image : `${domain}${profile.image}`) : "/default.png"}
                      className="rounded-circle border"
                      alt="Profile"
                      style={{ width: "35px", height: "35px", objectFit: "cover" }}
                    />
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item fw-bold" to="/profile">
                        {displayName()}
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              /* যদি ইউজার লগইন না থাকে */
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Sign Up</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>

          <form className="d-flex ms-lg-3 mt-2 mt-lg-0">
            <input className="form-control me-2" type="search" placeholder="Search" />
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;