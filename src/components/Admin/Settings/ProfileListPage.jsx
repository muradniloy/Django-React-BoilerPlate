import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../state/axiosInstance'; 
import { domain } from "../../../env";
import Swal from 'sweetalert2';
import { useGlobalState } from '../../../state/provider';

const ProfileListPage = () => {
    const [{ profile }] = useGlobalState();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pagination States
    const [count, setCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // fetchProfiles-কে useCallback দিয়ে র‍্যাপ করা হয়েছে যাতে অপ্রয়োজনীয় রেন্ডার না হয়
    const fetchProfiles = useCallback(async (pageNo) => {
        setLoading(true);
        try {
            const fetchUrl = `${domain}/api/profiles/?page=${pageNo}${searchTerm ? `&search=${searchTerm}` : ''}`;
            const res = await axiosInstance.get(fetchUrl);
            setProfiles(res.data.results || []);
            setCount(res.data.count || 0);
            setNextPage(res.data.next);
            setPrevPage(res.data.previous);
        } catch (err) {
            console.error(err);
            // [Saved Instruction] Set up Sweet Alert for error
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load profiles. Please check your connection.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchProfiles(currentPage);
    }, [currentPage, fetchProfiles]);

    const handleDelete = (id) => {
        // [Saved Instruction] Set up Sweet Alert for Confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: "This user's profile will be permanently removed!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/profiles/${id}/`);
                    
                    // [Saved Instruction] Sweet Alert for Success
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The user profile has been removed.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    // যদি পেজের শেষ ডাটা ডিলিট হয়, তবে আগের পেজে ব্যাক করবে
                    if (profiles.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        fetchProfiles(currentPage);
                    }
                } catch (err) {
                    Swal.fire('Error!', 'Could not delete the profile.', 'error');
                }
            }
        });
    };

    const totalPages = Math.ceil(count / pageSize);

    return (
        <div className="d-flex flex-column bg-light vh-100">
            
            {/* 1. Ultra Compact Header */}
            <div className="bg-white border-bottom py-2 px-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <h6 className="fw-bold m-0 text-dark">User Management</h6>
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3" style={{fontSize: '11px'}}>{count} Total</span>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{ width: '280px' }}>
                            <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-0 shadow-none" 
                                placeholder="Search by name, username or email..." 
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                            />
                        </div>
                        <button className="btn btn-primary btn-sm px-3 rounded-2 shadow-sm d-flex align-items-center gap-1">
                            <i className="bi bi-person-plus-fill"></i>
                            <span className="fw-semibold">Add User</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Table Section */}
            <div className="flex-grow-1 p-3 overflow-hidden">
                <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="table-responsive h-100">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-white sticky-top shadow-sm" style={{ zIndex: 5 }}>
                                <tr className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                    <th className="ps-4 py-3 border-0">User Identity</th>
                                    <th className="py-3 border-0">Username</th>
                                    <th className="py-3 border-0">Email Address</th>
                                    <th className="py-3 border-0 text-center">Manage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="spinner-grow text-primary" role="status"></div>
                                            <p className="mt-2 text-muted small">Fetching records...</p>
                                        </td>
                                    </tr>
                                ) : profiles.length > 0 ? (
                                    profiles.map((p) => (
                                        <tr key={p.id} className="border-bottom-0" style={{ fontSize: '13.5px' }}>
                                            <td className="ps-4 py-2">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center fw-bold border border-info-subtle shadow-sm" 
                                                         style={{ width: '35px', height: '35px', fontSize: '13px' }}>
                                                        {p.prouser?.first_name?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div className="ms-3">
                                                        <div className="fw-bold text-dark">{p.prouser?.first_name} {p.prouser?.last_name}</div>
                                                        <div className="text-muted" style={{fontSize: '11px'}}>ID: #USR-{p.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <code className="bg-light px-2 py-1 rounded text-primary">@{p.prouser?.username}</code>
                                            </td>
                                            <td className="py-2 text-muted">{p.prouser?.email || 'N/A'}</td>
                                            <td className="py-2 text-center">
                                                <div className="btn-group shadow-sm rounded">
                                                    <button className="btn btn-sm btn-white border border-end-0 px-3 py-1" title="Edit Profile">
                                                        <i className="bi bi-pencil-square text-primary"></i>
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-white border px-3 py-1" title="Delete User">
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted italic">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3. Pagination Footer */}
            <div className="bg-white border-top py-2 px-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                        Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, count)}</strong> of <strong>{count}</strong> entries
                    </span>
                    
                    {totalPages > 1 && (
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${!prevPage ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-2 px-3 text-dark shadow-none" onClick={() => setCurrentPage(currentPage - 1)}>
                                        <i className="bi bi-chevron-left me-1"></i> Prev
                                    </button>
                                </li>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pNum = index + 1;
                                    // শুধু প্রথম, শেষ এবং বর্তমান পেজের আশেপাশের পেজ দেখাবে
                                    if (pNum === 1 || pNum === totalPages || (pNum >= currentPage - 1 && pNum <= currentPage + 1)) {
                                        return (
                                            <li key={pNum} className={`page-item ${currentPage === pNum ? 'active' : ''}`}>
                                                <button className={`page-link border rounded-2 mx-1 px-3 shadow-none ${currentPage === pNum ? 'bg-primary text-white border-primary' : 'bg-white text-dark'}`} 
                                                        onClick={() => setCurrentPage(pNum)}>
                                                    {pNum}
                                                </button>
                                            </li>
                                        );
                                    }
                                    if (pNum === currentPage - 2 || pNum === currentPage + 2) {
                                        return <li key={pNum} className="px-2 text-muted">...</li>;
                                    }
                                    return null;
                                })}

                                <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-2 px-3 text-dark shadow-none" onClick={() => setCurrentPage(currentPage + 1)}>
                                        Next <i className="bi bi-chevron-right ms-1"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileListPage;