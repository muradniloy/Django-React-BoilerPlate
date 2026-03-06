import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "../../../utils/useAdmin"; 
import Swal from "sweetalert2";
import { domain } from "../../../env";
import { useGlobalState } from "../../../state/provider"; // dispatch এর জন্য প্রয়োজন
import { axiosInstance } from "../../../componentExporter";


const sideMenus = [
  { title: "Dashboard", icon: "/icons/dashboard.png", link: "/dashboard" },
  { title: "Student List", icon: "/icons/users.png", link: "/dashboard/students" },
  { title: "Accounting", icon: "/icons/accounting.png", link: "/dashboard/accounting" },
  { title: "Reports", icon: "/icons/reports.png", link: "/dashboard/reports" },
  { title: "Settings", icon: "/icons/settings.png", link: "/dashboard/settings", adminOnly: true },
];

const Sidebar = () => {
  // ১. আপনার ডিজাইনে এরর ফিক্স করার জন্য এটি যোগ করা হলো
  const [{ profile }, dispatch] = useGlobalState(); 
  const { isAdmin, currentUser, isLoading } = useAdmin();
  const location = useLocation();

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

  return (
    <aside className="sidebar d-flex flex-column">
      
      {/* ১. মেনু অংশ (আপনার অরিজিনাল ডিজাইন) */}
      <div className="sidebar-menu flex-grow-1 overflow-y-auto">
        {sideMenus.map((m, i) => {
          if (m.adminOnly && !isAdmin) return null;

          const isActive = location.pathname === m.link;

          return (
            <Link 
              key={i} 
              to={m.link} 
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <img src={m.icon} alt={m.title} />
              <span>{m.title}</span>
            </Link>
          );
        })}
      </div>

      {/* ২. প্রোফাইল ফুটার অংশ (আপনার অরিজিনাল ডিজাইন) */}
      <div className="sidebar-footer mt-auto border-top border-secondary bg-dark">
        <Link 
          to={'/profile'} 
          className="text-decoration-none" 
          style={{ display: "block" }}
        >
          <div 
            className="d-flex align-items-center rounded-3 profile-card-hover" 
            style={{ 
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
          >
            <div className="flex-shrink-0 position-relative">
              <img
                src={currentUser?.image ? `${domain}${currentUser.image}` : "/default.png"}
                className="rounded-circle border border-2 border-primary p-1"
                alt="Profile"
                style={{ 
                  width: "45px", 
                  height: "45px", 
                  objectFit: "cover",
                  backgroundColor: "rgba(255,255,255,0.1)" 
                }}
              />
              <span 
                className="position-absolute bottom-0 end-0 badge border border-light rounded-circle bg-success p-1"
                style={{ width: "12px", height: "12px" }}
              ></span>
            </div>

            <div className="flex-grow-1 ms-3 overflow-hidden text-start">
              <h6 
                className="text-white mb-0 text-truncate" 
                style={{ 
                  fontSize: "0.95rem", 
                  fontWeight: "600",
                  letterSpacing: "0.3px"
                }}
              >
                {isLoading ? "Loading..." : (currentUser?.prouser?.username || "No Name")}
              </h6>
              
              <div className="d-flex align-items-center mt-1">
                {!isLoading && (
                  <>
                    <div 
                      className={`rounded-circle me-2 ${isAdmin ? 'bg-danger' : 'bg-success'}`} 
                      style={{ 
                        width: "10px", 
                        height: "10px",
                        boxShadow: isAdmin ? "0 0 5px #ff4d4d" : "0 0 5px #2ecc71"
                      }}
                    ></div>
                    <small 
                      className="text-light opacity-75" 
                      style={{ 
                        fontSize: "0.75rem",
                        fontWeight: "400" 
                      }}
                    >
                      {isAdmin ? "Admin Member" : "Staff Member"}
                    </small>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>

        <button 
          onClick={handleLogout} 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center py-2"
          style={{ borderRadius: "8px" }}
        >
          <img src="/icons/logout.png" alt="logout" style={{ width: "18px", marginRight: "10px" }} />
          <span className="fw-bold" style={{ fontSize: "0.9rem" }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;