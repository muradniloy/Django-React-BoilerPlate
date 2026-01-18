import React from "react";
import { Outlet } from "react-router-dom";
import "../../CSS/dashboard.css"; // যেটাতে Navbar + Sidebar CSS আছে
import Sidebar from "./SideBar";
import AdminNavbar from "./AdminNavbar"; // উপরের navbar

const AdminLayout = () => {
  return (
    <div className="dashboard-wrapper">
      {/* Top Navbar */}
      <AdminNavbar />

      {/* Main Layout */}
      <div className="admin-layout">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="admin-content">
          <Outlet /> {/* এখানে প্রতিটি route এর component render হবে */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
