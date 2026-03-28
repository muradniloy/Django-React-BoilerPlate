import React, { useState, useEffect } from "react";
import * as CM from "../../../componentExporter";
import { HomeMarquee } from "./HomeMarquee";
import { domain } from "../../../componentExporter";

const EmployeePublicView = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState("All");

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchPublicData = async () => {
            setLoading(true);
            try {
                // এখানে শুধুমাত্র active=true ফিল্টার ব্যবহার করা হয়েছে
                const [empRes, deptRes] = await Promise.all([
                    CM.axiosInstance.get("/api/employees/all/?active=true&page_size=500"),
                    CM.axiosInstance.get("/api/departments/")
                ]);

                const empData = empRes.data.results || empRes.data;
                const activeEmps = Array.isArray(empData) ? empData : [];

                setEmployees(activeEmps);
                setFilteredEmployees(activeEmps);
                setDepartments(deptRes.data.results || deptRes.data);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicData();
    }, []);

    // ফিল্টারিং লজিক
    const handleFilterClick = (deptId) => {
        setSelectedDept(deptId);
        setCurrentPage(1);
        if (deptId === "All") {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(emp => emp.department === parseInt(deptId));
            setFilteredEmployees(filtered);
        }
    };

    // ফটো ইউআরএল হ্যান্ডলার
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        const cleanDomain = domain?.endsWith("/") ? domain.slice(0, -1) : domain;
        const cleanPath = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
        return photoPath.startsWith("http") ? photoPath : `${cleanDomain}${cleanPath}`;
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 150, behavior: 'smooth' });
    };

    return (
        <div className="homepage-wrapper bg-white">
            <HomeMarquee />
            <section className="py-4">
                <div className="container">
                    {/* Header */}
                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-8 text-center">
                            <div className="notice-title-wrapper position-relative d-inline-block">
                                <h2 className="fw-bold text-dark text-uppercase mb-1" style={{ letterSpacing: '2px', fontSize: '2.2rem' }}>
                                    Our <span className="text-primary">Employees</span>
                                </h2>
                                <div className="title-underline mx-auto">
                                    <span className="line-long"></span>
                                    <span className="line-dot"></span>
                                    <span className="line-long"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mt-2">
                        {/* Sidebar Filter */}
                        <div className="col-lg-3">
                            <div className="filter-sidebar p-3 border rounded-0 bg-light">
                                <h6 className="fw-bold text-dark mb-3 px-1 small text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>
                                    Filter by Department
                                </h6>
                                <div className="d-flex flex-column gap-2">
                                    <button 
                                        onClick={() => handleFilterClick("All")} 
                                        className={`btn btn-sm text-start rounded-0 px-3 py-2 fw-medium ${selectedDept === "All" ? "btn-primary shadow" : "btn-white border bg-white"}`}
                                    >
                                        All Departments
                                    </button>
                                    {departments.map(dept => (
                                        <button 
                                            key={dept.id} 
                                            onClick={() => handleFilterClick(dept.id)} 
                                            className={`btn btn-sm text-start rounded-0 px-3 py-2 fw-medium ${selectedDept === dept.id ? "btn-primary shadow" : "btn-white border bg-white"}`}
                                        >
                                            {dept.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Employee Table Section */}
                        <div className="col-lg-9">
                            <div className="card shadow-sm border-0 rounded-0 overflow-hidden">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light text-muted small">
                                            <tr>
                                                <th className="ps-4 py-3">PROFILE</th>
                                                <th>NAME & DESIGNATION</th>
                                                <th>DEPARTMENT</th>
                                                <th className="text-center">CONTACT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="4" className="text-center py-5">Loading Employees...</td></tr>
                                            ) : currentItems.length > 0 ? (
                                                currentItems.map((emp) => (
                                                    <tr key={emp.id}>
                                                        <td className="ps-4">
                                                            {getPhotoUrl(emp.photo) ? (
                                                                <img src={getPhotoUrl(emp.photo)} alt="" className="rounded-circle shadow-sm" style={{ width: '45px', height: '45px', objectFit: 'cover', border: '2px solid #eee' }} />
                                                            ) : (
                                                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '45px', height: '45px' }}>
                                                                    {emp.first_name?.[0]}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                                                                {emp.first_name} {emp.last_name}
                                                            </div>
                                                            <div className="text-primary small fw-semibold">
                                                                {emp.designation_name || "Staff"}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge py-1 px-3 rounded-pill bg-info-subtle text-info small fw-bold">
                                                                {emp.department_name || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="small fw-bold text-dark">{emp.mobile || "N/A"}</div>
                                                            <div className="extra-small-text text-muted" style={{ fontSize: '11px' }}>{emp.email || emp.user_email}</div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center py-5 text-muted">No active employees found in this department.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {!loading && totalPages > 1 && (
                                <nav className="mt-4">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-0 shadow-sm" onClick={() => paginate(currentPage - 1)}>Previous</button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link rounded-0 shadow-sm" onClick={() => paginate(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-0 shadow-sm" onClick={() => paginate(currentPage + 1)}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .title-underline { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px; }
                    .line-long { width: 40px; height: 3px; background: #0d6efd; border-radius: 10px; }
                    .line-dot { width: 10px; height: 10px; background: #ffc107; border-radius: 50%; }
                    .pagination .page-link { color: #0d6efd; font-size: 13px; font-weight: 600; padding: 8px 16px; border: 1px solid #dee2e6; }
                    .pagination .page-item.active .page-link { background-color: #0d6efd; border-color: #0d6efd; color: white; }
                    .filter-sidebar { position: sticky; top: 20px; }
                    .extra-small-text { font-size: 11px; color: #6c757d; }
                    .table-hover tbody tr:hover { background-color: #f8f9fa; }
                `}</style>
            </section>
        </div>
    );
};

export default EmployeePublicView;