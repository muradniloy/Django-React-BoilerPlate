import React from "react";
import "../../../CSS/dashboard.css";
import { Link } from "react-router-dom";

const sideMenus = [
  { title: "Users", icon: "/icons/users.png",  },
  { title: "Products", icon: "/icons/product.png" },
  { title: "Orders", icon: "/icons/order.png" },
  { title: "Accounting Setting", icon: "/icons/reports.png", link:'/Accouting/Settings'},
  { title: "Address Setting", icon: "/icons/address_setting.png", link:'/Address/Settings'},
  { title: "Program Setting", icon: "/icons/product.png", link:'/Program/Settings'},
  { title: "Logs", icon: "/icons/audit.png", link: '/dashboard/logs' },
];

export default function SettingPage() {
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
