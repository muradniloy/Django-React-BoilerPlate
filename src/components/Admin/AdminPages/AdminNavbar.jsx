import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalState } from "../../../state/provider";
import { domain } from "../../../env";
import axios from "axios";
import Swal from 'sweetalert2';
import { axiosInstance } from "../../../componentExporter";

const AdminNavbar = () => {
  const [{ profile, access }, dispatch] = useGlobalState();
   const [currentUser, setCurrentUser] = useState(null);
 
  // Fetch profile on mount if logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (access && !profile) {
        try {
          const res = await axios.get(`${domain}/api/profile/`, {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          });
          dispatch({ type: "SET_PROFILE", profile: res.data });
        } catch (err) {
          console.log("Profile fetch error:", err);
          dispatch({ type: "LOGOUT" });
        }
      }
    };

    fetchProfile();
  }, [access, profile, dispatch]);

  // Logout function
const handleSessionExpired = () => {
    localStorage.removeItem('access');
    setCurrentUser(null);
    Swal.fire({
        title: 'Session End!',
        text: 'Your credentials have expired. Please log in again to continue.',
        icon: 'warning',
        confirmButtonText: 'Go to login page'
    }).then(() => {
        window.location.href = "/"; // হার্ড রিফ্রেশ নিশ্চিত করবে
    });
};

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
            title: 'You have been logged out',
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

const displayName = () => {
  if (!profile?.prouser) return "Update Profile";
  const { first_name, last_name } = profile.prouser;
  return first_name && last_name ? `${first_name} ${last_name}` : "Update Profile";
};
  return (
    <nav className="navbar glass-nav px-4">
      <span className="navbar-brand fw-bold text-white">
        🚀 AdminPanel
      </span>

      <div className="d-flex align-items-center gap-3 ms-auto">
        <form className="d-flex" role="search">
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="Search..."
        aria-label="Search"
      />
      <button className="btn btn-primary" type="submit">
        🔍
      </button>
    </div>
  </form>
      

       
    {profile && profile.prouser ? (
      <div className="nav-profile dropdown" style={{ marginRight: "50px" }}> {/* ডান পাশে ফাকা রাখার জন্য margin যোগ করা হয়েছে */}
  {/* Profile Image */}
  <img
    src={profile?.image ? `${domain}${profile.image}` : "/default.png"}
    className="navbar-profile-img rounded-circle dropdown-toggle"
    alt="Profile"
    style={{ 
        width: "38px", 
        height: "38px", 
        objectFit: "cover", 
        cursor: "pointer",
        border: "1px solid #ddd" 
    }}
    id="profileDropdown"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  />

  {/* Dropdown Menu */}
  {/* dropdown-menu-end ব্যবহার করা হয়েছে যাতে মেনু বাম দিকে খুলে এবং স্ক্রিনে জায়গা পায় */}
 <ul 
  className="dropdown-menu dropdown-menu-end shadow border-0" 
  aria-labelledby="profileDropdown" 
  style={{ 
    minWidth: "180px", 
    position: "absolute",
    right: "0",
    left: "auto",
    // নিচের ৩টি লাইন খুব গুরুত্বপূর্ণ
    visibility: "hidden", // ডিফল্টভাবে লুকানো থাকবে
    opacity: "0",        // স্বচ্ছ থাকবে
    transform: "translateY(10px)", // একটু নিচে থাকবে
    transition: "all 0.2s ease-in-out",
    display: "block",     // বুটস্ট্র্যাপের সাথে কনফ্লিক্ট এড়াতে
    marginTop: "10px"
  }}
>
  {/* মেনুর ভেতরটা একটু নিচে নামিয়ে দেওয়ার জন্য একটি কন্টেইনার */}
  <div style={{ marginTop: "5px", backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
    <li className="px-3 py-2 border-bottom bg-light">
      <div className="d-flex flex-column">
        <span className="text-dark fw-bold" style={{ fontSize: "12px" }}>
          {profile?.prouser?.username || "Guest User"}
        </span>
     
      </div>
    </li>
    
    <li>
      <Link className="dropdown-item py-2 mt-1" to="/profile">
        <i className="bi bi-person me-2"></i> My Profile
      </Link>
    </li>
    <li className="px-2">
  <Link 
    className="dropdown-item py-2 d-flex align-items-center rounded-2" 
    to="/change-password"
    style={{ transition: 'all 0.3s' }}
  >
    <i className="bi bi-shield-lock text-warning"></i>
    <span style={{ color: "#344767", fontWeight: "500", fontSize: "14.5px" }}>
      Change Password
    </span>
  </Link>
</li>
   
    <li><hr className="dropdown-divider" /></li>
    
    <li>
      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right me-2"></i> Logout
      </button>
    </li>
  </div>
</ul>
</div>
        
) : (
  <li className="nav-item">
    <Link className="btn btn-outline-light btn-sm" to={`/login`}>
      Login
    </Link>
  </li>
)}

      </div>
    </nav>
  );
};

export default AdminNavbar;
