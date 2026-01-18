import React from "react";
import "../../CSS/dashboard.css";
import { Link } from "react-router-dom";

const sideMenus = [
  { title: "Dashboard", icon: "/icons/dashboard.png", link:'/'},
  { title: "Student List", icon: "/icons/users.png", link:'/dashboard/student_list'},
  { title: "Users", icon: "/icons/users.png" },
  { title: "Products", icon: "/icons/product.png" },
  { title: "Orders", icon: "/icons/order.png" },
  { title: "Reports", icon: "/icons/reports.png" },
  { title: "Settings", icon: "/icons/settings.png" },
];

export default function AdminDashboard() {
  return (
    <div >
        {/* BODY CONTENT */}
        <main className="admin-content">
          <h4 className="text-white mb-4">Dashboard</h4>
          <div className="row g-4">
            {sideMenus.map((m, i) => (
              <div key={i} className="col-xl-3 col-lg-4 col-md-6">
                <div className="menu-card text-center fade-up">
                  <Link to={m.link}>
                  <div className="icon-wrapper">
                    <img src={m.icon} alt={m.title} />
                  </div>
                  <h6 className="mt-3">{m.title}</h6>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>

      </div>
  
  );
}
