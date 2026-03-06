import React, { useEffect, useState } from "react";
import "../../../CSS/dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { isInGroup } from "../../../utils/permissions";
import { useGlobalState } from "../../../state/provider";
import axiosInstance from "../../../state/axiosInstance"; // ✅ axios এর বদলে axiosInstance ব্যবহার করুন
import Swal from 'sweetalert2';

const sideMenus = [
  { title: "Dashboard", icon: "/icons/dashboard.png", link: '/' },
  { title: "Student List", icon: "/icons/users.png", link: '/dashboard/students' },
  { title: "Accounting", icon: "/icons/product.png", link: '/dashboard/accounting' },
  { title: "Reports", icon: "/icons/reports.png" },
  { title: "Settings", icon: "/icons/settings.png", link: '/dashboard/settings', adminOnly: true },
];

export default function AdminDashboard() {
  const [{ profile }, dispatch] = useGlobalState();
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ HttpOnly কুকি জাভাস্ক্রিপ্ট দিয়ে পড়া যায় না। 
    // তাই সরাসরি প্রোফাইল ফেচ করার চেষ্টা করতে হবে।
    const fetchProfileData = async () => {
      try {
        const res = await axiosInstance.get("/api/profile/");
        dispatch({ type: "ADD_PROFILE", profile: res.data }); // নিশ্চিত করুন টাইপ 'ADD_PROFILE' না 'SET_PROFILE'
        setLoading(false);
      } catch (err) {
        console.error("Dashboard profile fetch error:", err);
        
        // [Saved Instruction] Sweet Alert for unauthorized access
        Swal.fire({
          title: 'সেশন নেই!',
          text: 'আপনার সেশন শেষ হয়ে গেছে, দয়া করে আবার লগইন করুন।',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে'
        });
        
        setLoading(false);
        navigate("/"); // প্রোফাইল না পেলে লগইনে পাঠাবে
      }
    };

    if (!profile) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [profile, dispatch, navigate]);

  // ডাটা লোড হওয়ার সময় যা দেখাবে
  if (loading) {
    return (
      <div className="admin-content text-center mt-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h4 className="text-white">ইউজার ডাটা লোড করা হচ্ছে...</h4>
        <p className="text-muted">দয়া করে একটু অপেক্ষা করুন।</p>
      </div>
    );
  }

  const currentUser = profile;

  return (
    <div>
      <main className="admin-content">
        <h4 className="text-white mb-4">Dashboard</h4>
        <div className="row g-4">
          {sideMenus.map((m, i) => {
            // অ্যাডমিন চেক লজিক
            const isAdmin = 
              isInGroup(currentUser?.groups, 'Admin') || 
              isInGroup(currentUser?.groups, 'admin');
            
            // যদি মেনুটি শুধু অ্যাডমিনের জন্য হয় এবং ইউজার অ্যাডমিন না হয়, তবে হাইড করো
            if (m.adminOnly && !isAdmin) {
              return null;
            }

            return (
              <div key={i} className="col-xl-3 col-lg-4 col-md-6">
                <div className="menu-card text-center fade-up">
                  <Link to={m.link || "#"}>
                    <div className="icon-wrapper">
                      <img 
                        src={m.icon} 
                        alt={m.title} 
                        onError={(e) => (e.target.src = "/icons/default.png")}
                      />
                    </div>
                    <h6 className="mt-3">{m.title}</h6>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}