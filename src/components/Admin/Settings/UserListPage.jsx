import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as CM from "../../../componentExporter";

const UserListPage = () => {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filters State
    const [filterGroup, setFilterGroup] = useState("");
    const [filterDesignation, setFilterDesignation] = useState("");

    // Pagination states
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    const fetchProfiles = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            let url = `/api/user-profiles/?page=${pageNum}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (filterGroup) url += `&group=${filterGroup}`;
            if (filterDesignation) url += `&designation=${filterDesignation}`;

            const res = await CM.axiosInstance.get(url);
            
            if (res.data && res.data.results) {
                setProfiles(res.data.results);
                setCount(res.data.count);
                setNextPage(res.data.next);
                setPrevPage(res.data.previous);
                setCurrentPage(pageNum);
            }
        } catch (err) {
            console.error("API Error:", err);
            CM.Swal.fire({ title: "Fetch Failed", icon: "error" });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterGroup, filterDesignation]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProfiles(1), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filterGroup, filterDesignation, fetchProfiles]);

    const totalPages = Math.ceil(count / 10);

    return (
        <div className="container-fluid mt-2 px-4 pb-5 bg-light">
            {/* Header & Advanced Filters */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 bg-white p-3 border-start border-4 border-success">
                <div className="row g-3 align-items-center">
                    <div className="col-md-3">
                        <h4 className="mb-0 fw-bold text-dark">User List</h4>
                        <span className="text-muted small">Total Found: {count}</span>
                    </div>
                    <div className="col-md-3">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white border-end-0 rounded-start-pill"><i className="fa fa-search text-muted"></i></span>
                            <input 
                                className="form-control border-start-0 rounded-end-pill shadow-none" 
                                placeholder="Name, Username..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <select className="form-select form-select-sm rounded-pill shadow-none" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                            <option value="">All Groups</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <select className="form-select form-select-sm rounded-pill shadow-none" value={filterDesignation} onChange={(e) => setFilterDesignation(e.target.value)}>
                            <option value="">Designations</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Developer">Developer</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <Link to="/register" className="btn btn-success btn-sm rounded-pill px-3 shadow-sm w-100">
                            <i className="fa fa-plus-circle me-1"></i> Add User
                        </Link>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-uppercase small fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                <th className="ps-4 py-3">Member Details</th>
                                <th className="py-3">Role/Group</th>
                                <th className="py-3">Designation</th>
                                <th className="py-3">Contact</th>
                                <th className="text-center py-3 pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5">
                                    <div className="spinner-border spinner-border-sm text-success me-2"></div> Processing...
                                </td></tr>
                            ) : profiles.length > 0 ? (
                                profiles.map((profile) => (
                                    <tr key={profile.id} style={{ height: '55px' }}>
                                        <td className="ps-4 py-2">
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={profile.image ? (profile.image.startsWith('http') ? profile.image : `${CM.domain}${profile.image}`) : `https://ui-avatars.com/api/?name=${profile.prouser?.username}&background=e8f5e9&color=2e7d32&bold=true`} 
                                                    className="rounded-circle border border-2 border-white shadow-sm me-3" 
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                                    alt=""
                                                />
                                                <div style={{ lineHeight: '1.2' }}>
                                                    <div className="fw-bold text-dark small">{profile.prouser?.first_name || profile.prouser?.username} {profile.prouser?.last_name}</div>
                                                    <div className="text-muted" style={{ fontSize: '11px' }}>ID: #{profile.id} | <span className="text-success">@{profile.prouser?.username}</span></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            {profile.groups?.length > 0 ? profile.groups.map((g, i) => (
                                                <span key={i} className="badge rounded-pill bg-opacity-10 text-success border border-success border-opacity-25 me-1" style={{ fontSize: '10px', fontWeight: '500' }}>
                                                    {g}
                                                </span>
                                            )) : <span className="text-muted small">No Group</span>}
                                        </td>
                                        <td className="py-2 small fw-medium text-secondary">{profile.designation || "—"}</td>
                                        <td className="py-2 small text-muted">
                                            <div>{profile.prouser?.email}</div>
                                            <div style={{ fontSize: '10px' }}>{profile.phone || "No Phone"}</div>
                                        </td>
                                        <td className="text-center pe-4 py-2">
                                            <div className="d-flex justify-content-center gap-2">
                                              
                                             <button 
                                                className="btn btn-sm btn-outline-info rounded-circle border-0 p-0 shadow-none" 
                                                style={{ width: '32px', height: '32px' }} 
                                                title="View Details"
                                                // URL-এ কোনো আইডি নেই, শুধু ডাটা স্টেট হিসেবে পাঠানো হচ্ছে
                                                onClick={() => navigate(`/user-profile`, { state: { profileData: profile } })}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                                    
                                                
                                                {/* Edit Button */}
                                                <button className="btn btn-sm btn-outline-warning rounded-circle border-0 p-0 shadow-none" style={{ width: '32px', height: '32px' }} title="Edit User">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No users matching the criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="card-footer bg-white border-top py-3 px-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                            Showing page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
                        </span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-light border px-3 rounded-pill" disabled={!prevPage} onClick={() => fetchProfiles(currentPage - 1)}>
                                <i className="fa fa-angle-left me-1"></i> Prev
                            </button>
                            <div className="d-flex gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i + 1} 
                                        className={`btn btn-sm rounded-circle ${currentPage === i + 1 ? "btn-success shadow-sm" : "btn-light border text-muted"}`}
                                        style={{ width: '30px', height: '30px', padding: '0', fontSize: '11px', fontWeight: '600' }}
                                        onClick={() => fetchProfiles(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button className="btn btn-sm btn-light border px-3 rounded-pill" disabled={!nextPage} onClick={() => fetchProfiles(currentPage + 1)}>
                                Next <i className="fa fa-angle-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserListPage;