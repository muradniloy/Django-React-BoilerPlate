import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalState } from "../../state/provider";
import { domain } from "../../env";
import axios from "axios";

const AdminNavbar = () => {
  const [{ profile, access }, dispatch] = useGlobalState();
  const navigate = useNavigate();
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
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
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
  <div className="nav-profile dropdown">
    {/* Profile Image */}
    <img
      src={profile.image ? `${domain}${profile.image}` : "/default.png"}
      className="navbar-profile-img rounded-circle dropdown-toggle"
      alt="Profile"
      style={{ width: "38px", height: "38px", objectFit: "cover", cursor: "pointer" }}
      id="profileDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    />

    {/* Dropdown Menu */}
    <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="profileDropdown">
      <li className="px-3 py-2">
        <Link className="dropdown-item" to="/profile">
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
