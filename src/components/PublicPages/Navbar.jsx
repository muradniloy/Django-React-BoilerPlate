import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGlobalState } from "../../state/provider";
import { domain } from "../../env";
import axios from "axios";
import Swal from 'sweetalert2';
import { axiosInstance } from "../../componentExporter";

const Navbar = () => {
  const [{ profile }] = useGlobalState();
  
  const [siteSettings, setSiteSettings] = useState({ name: "Nursing College", logo: null });
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const [settingsRes, categoriesRes, deptsRes] = await Promise.all([
                axios.get(`${domain}/api/institution/`),
                axios.get(`${domain}/api/notice-categories/`),
                axios.get(`${domain}/api/departments/`)
            ]);

            if (settingsRes.data) {
                const data = Array.isArray(settingsRes.data) ? settingsRes.data[0] : settingsRes.data;
                setSiteSettings({
                    name: data.name || "My Online Shop",
                    logo: data.logo ? (data.logo.startsWith('http') ? data.logo : `${domain}${data.logo}`) : null
                });
            }

            if (categoriesRes.data) {
                const catData = categoriesRes.data.results || categoriesRes.data;
                setCategories(Array.isArray(catData) ? catData : []);
            }
            if (deptsRes.data) {
                const deptData = deptsRes.data.results || deptsRes.data;
                setDepartments(Array.isArray(deptData) ? deptData : []);
            }
        } catch (err) {
            console.error("Settings Error:", err);
            setSiteSettings(prev => ({ ...prev, name: "My Online Shop" }));
        }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
      try {
          await axiosInstance.post('/api/logout/'); 
          localStorage.clear();
          sessionStorage.clear();
          
          Swal.fire({
              icon: 'success',
              title: 'লগআউট সফল',
              timer: 1000,
              showConfirmButton: false
          }).then(() => {
              window.location.href = "/";
          });
      } catch (err) {
          localStorage.clear();
          window.location.href = "/";
      }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" 
         style={{ position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid #f0f0f0' }}>
      <div className="container-fluid px-lg-4">
        
        {/* --- Title & Logo Section (Design Restored) --- */}
        <Link className="navbar-brand d-flex align-items-center" to="/" style={{ gap: '12px' }}>
          {siteSettings.logo && (
              <img 
                  src={siteSettings.logo} 
                  alt="Logo" 
                  style={{ 
                      height: '50px', 
                      width: 'auto',
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                  }} 
              />
          )}
          <span className="fw-extrabold text-uppercase d-none d-md-inline" style={{
              fontSize: '1.6rem',
              letterSpacing: '1.2px',
              background: 'linear-gradient(45deg, #198754, #000f9b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: '800'
          }}>
              {siteSettings.name}
          </span>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navContent">
          {/* Main Menus */}
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item"><Link className="nav-link fw-semibold" to="/">Home</Link></li>

            {/* Notice Dropdown */}
            <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle fw-semibold" to="#" data-bs-toggle="dropdown">Notice</Link>
                <ul className="dropdown-menu shadow border-0 mt-2 dropdown-menu-end">
                    <li><Link className="dropdown-item fw-bold text-success" to="/all-notices">All Notices</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link className="dropdown-item" to={`/all-notices?category=${cat.slug || cat.id}`}>{cat.name}</Link>
                        </li>
                    ))}
                </ul>
            </li>
            {/* Faculty Dropdown */}
<li className="nav-item dropdown">
    <Link className="nav-link dropdown-toggle fw-semibold" to="#" data-bs-toggle="dropdown">
        Faculty
    </Link>
    <ul className="dropdown-menu shadow border-0 mt-2 dropdown-menu-end">
        {/* All Faculty Link */}
        <li>
            <Link className="dropdown-item fw-bold text-success" to="/faculty-view">
                All Faculty
            </Link>
        </li>
        <li><hr className="dropdown-divider" /></li>
        
        {/* Dynamic Departments */}
        {departments.length > 0 ? (
            departments.map((dept) => (
                <li key={dept.id}>
                    <Link 
                        className="dropdown-item" 
                        to={`/faculty-view?department=${dept.id}`}
                    >
                        {dept.name}
                    </Link>
                </li>
            ))
        ) : (
            <li><span className="dropdown-item small text-muted">No Departments Found</span></li>
        )}
    </ul>
</li>
            

            <li className="nav-item"><Link className="nav-link fw-semibold" to="/contact_us">Contact</Link></li>

            {profile && profile.prouser ? (
              <>
                <li className="nav-item"><Link className="nav-link fw-semibold" to="/dashboard">Admin</Link></li>
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle d-flex align-items-center" to="#" data-bs-toggle="dropdown">
                    <img
                      src={profile.image ? (profile.image.startsWith('http') ? profile.image : `${domain}${profile.image}`) : "/default.png"}
                      className="rounded-circle border"
                      alt="Profile"
                      style={{ width: "35px", height: "35px", objectFit: "cover" }}
                    />
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li><Link className="dropdown-item fw-bold" to="/profile">My Profile</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item ms-lg-2">
                <Link className="btn btn-success btn-sm rounded-pill px-4 shadow-sm" to="/login">Login</Link>
              </li>
            )}
          </ul>

          {/* Search Section (At the very end) */}
          <form className="d-flex ms-lg-3 mt-3 mt-lg-0">
            <div className="input-group input-group-sm">
              <input 
                className="form-control rounded-start-pill border-success ps-3" 
                type="search" 
                placeholder="Search..." 
                style={{ width: '140px' }}
              />
              <button className="btn btn-success rounded-end-pill px-3" type="submit">
                <i className="fa fa-search small"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

 <style>{`
  .nav-link { font-size: 14.5px; color: #333 !important; transition: 0.3s; padding: 8px 12px !important; }
  .nav-link:hover { color: #198754 !important; }
  .dropdown-item { font-size: 14px; padding: 10px 20px; }
  
  /* ড্রপডাউন মেনু ডিজাইন */
  .dropdown-menu {
    border-radius: 8px;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
  }

  /* হোভার লজিক (Desktop) */
  @media (min-width: 992px) {
    .nav-item.dropdown:hover > .dropdown-menu {
      display: block;
      opacity: 1;
      visibility: visible;
      transform: translateY(0); /* একদম লিঙ্কের নিচে সেট হবে */
    }
    
    .dropdown-menu {
      display: block;
      opacity: 0;
      visibility: hidden;
      transform: translateY(5px); /* শুরুর পজিশন সামান্য নিচে */
      transition: all 0.3s ease-in-out;
      margin-top: 0 !important; /* বুটস্ট্র্যাপের ডিফল্ট গ্যাপ রিমুভ */
      top: 100%; /* প্যারেন্ট লিঙ্কের ঠিক নিচ থেকে শুরু হবে */
    }

    /* ইনভিজিবল ব্রিজ: যাতে মাউস সরালে মেনু হুট করে চলে না যায় */
    .nav-item.dropdown::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 10px; /* লিঙ্কের নিচ থেকে মেনু পর্যন্ত গ্যাপ পূরণ করবে */
      bottom: -10px;
      left: 0;
    }
  }
`}</style>
    </nav>
  );
};

export default Navbar;