import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalState } from "../state/provider";
import { domain } from "../env";
import axios from "axios";

const Navbar = () => {
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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to={`/`}>My Online Shop</Link>
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
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-4">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to={`/`}>Home</Link>
            </li>

            {profile && profile.prouser ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">About</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Admin Pannel</Link>
                </li>

                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={profile.image ? `${domain}${profile.image}` : "/default.png"}
                      className="navbar-profile-img rounded-circle"
                      alt="Profile"
                      style={{ width: "35px", height: "35px", objectFit: "cover" }}
                    />
                  </Link>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        {displayName()}
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to={`/register`}>Sign Up</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/login`}>Login</Link>
                </li>
              </>
            )}
          </ul>

          <form className="d-flex ms-3">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
