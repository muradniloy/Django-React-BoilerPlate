import React from "react";
import "../../../../CSS/dashboard.css";
import { Link } from "react-router-dom";

const sideMenus = [
  { title: "Fee Collection", icon: "/icons/order.png", link: '/student_fee' },
  { title: "View Fee Collections List", icon: "/icons/reports.png", link: '/student_fee_list' },
  { title: "View Account Transaction", icon: "/icons/reports.png", link: '/account_transaction' },
  { title: "Payment Head", icon: "/icons/reports.png", link: '/payment-head/list' },
  { title: "Fee Rate", icon: "/icons/reports.png", link: '/fee-rate/list' },
];

export default function AccountingPages() {
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
