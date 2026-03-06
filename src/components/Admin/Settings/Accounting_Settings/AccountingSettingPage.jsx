import React from "react";
import "../../../../CSS/dashboard.css";
import { Link } from "react-router-dom";

const sideMenus = [
  { title: "Orders", icon: "/icons/order.png" },
  { title: "Payment Category", icon: "/icons/reports.png", link: '/main-head/list' },
  { title: "Payment Head", icon: "/icons/reports.png", link: '/payment-head/list' },
  { title: "Fee Rate", icon: "/icons/reports.png", link: '/fee-rate/list' },
];

export default function AccountingSettingPage() {
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
