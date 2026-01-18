import React from "react";
import { Link } from "react-router-dom";

const sideMenus = [
  { title: "Dashboard", icon: "/icons/dashboard.png", link: "/dashboard" },
  { title: "Student List", icon: "/icons/users.png", link: "/dashboard/student_list" },
  { title: "Users", icon: "/icons/users.png", link: "/dashboard/users" },
  { title: "Products", icon: "/icons/product.png", link: "/dashboard/products" },
  { title: "Orders", icon: "/icons/order.png", link: "/dashboard/orders" },
  { title: "Reports", icon: "/icons/reports.png", link: "/dashboard/reports" },
  { title: "Settings", icon: "/icons/settings.png", link: "/dashboard/settings" },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {sideMenus.map((m, i) => (
        <Link key={i} to={m.link} className="sidebar-item">
          <img src={m.icon} alt={m.title} />
          <span>{m.title}</span>
        </Link>
      ))}
    </aside>
  );
};

export default Sidebar;
