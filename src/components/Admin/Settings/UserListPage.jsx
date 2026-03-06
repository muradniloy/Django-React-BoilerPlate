import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../state/axiosInstance'; 
import { domain } from "../../../env";
import Swal from 'sweetalert2';
import { hasAccess, isInGroup } from '../../../utils/permissions';

const UserListPage = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Pagination States
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // ১. ইউজার ডাটা ফেচ করার ফাংশন
    const fetchUsers = useCallback(async (pageNo) => {
        setLoading(true);
        try {
            const fetchUrl = `${domain}/api/users/?page=${pageNo}${searchTerm ? `&search=${searchTerm}` : ''}`;
            const res = await axiosInstance.get(fetchUrl);
            setUsers(res.data.results || []);
            setCount(res.data.count || 0);
        } catch (error) {
            console.error(error);
            Swal.fire('Error!', 'ইউজার লিস্ট লোড করা সম্ভব হয়নি।', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        // অ্যাডমিন চেক
        if (!isInGroup(currentUser?.groups, 'Admin')) {
            Swal.fire({
                title: 'অ্যাক্সেস ডিনাইড!',
                text: 'এই পেজটি দেখার অনুমতি শুধুমাত্র অ্যাডমিনদের আছে।',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'পিছনে ফিরে যান'
            }).then(() => {
                navigate('/dashboard');
            });
            return;
        }
        fetchUsers(currentPage);
    }, [currentUser, navigate, currentPage, fetchUsers]);

    // ২. ডিলিট ফাংশন (Sweet Alert সহ)
    const handleDelete = (userId) => {
        Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই ইউজারকে ডিলিট করলে আর ফিরে পাওয়া যাবে না!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/users/${userId}/`);
                    Swal.fire({
                        title: 'ডিলিট হয়েছে!',
                        text: 'ইউজারটি সফলভাবে রিমুভ করা হয়েছে।',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchUsers(currentPage);
                } catch (error) {
                    Swal.fire('ব্যর্থ!', 'ইউজারটি ডিলিট করা যায়নি।', 'error');
                }
            }
        });
    };

    const totalPages = Math.ceil(count / pageSize);

    return (
        <div className="d-flex flex-column bg-light vh-100">
            {/* Header Section */}
            <div className="bg-white border-bottom py-2 px-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <h6 className="fw-bold m-0 text-dark">সিস্টেম ইউজার লিস্ট</h6>
                        <span className="badge bg-dark-subtle text-dark rounded-pill px-3" style={{fontSize: '11px'}}>{count} জন ইউজার</span>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                        <div className="input-group input-group-sm" style={{ width: '280px' }}>
                            <span className="input-group-text bg-light border-0"><i className="bi bi-search"></i></span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-0 shadow-none" 
                                placeholder="ইউজার খুঁজুন..." 
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-grow-1 p-3 overflow-hidden">
                <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="table-responsive h-100">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-white sticky-top shadow-sm" style={{ zIndex: 5 }}>
                                <tr className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                    <th className="ps-4 py-3 border-0">ID</th>
                                    <th className="py-3 border-0">ইউজারনেম</th>
                                    <th className="py-3 border-0">ইমেইল</th>
                                    <th className="py-3 border-0">রোল/পার্মিশন</th>
                                    <th className="py-3 border-0 text-center">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user.id} style={{ fontSize: '13.5px' }}>
                                            <td className="ps-4 py-2 text-muted">#{user.id}</td>
                                            <td className="py-2 fw-bold text-dark">{user.username}</td>
                                            <td className="py-2">{user.email || 'N/A'}</td>
                                            <td className="py-2">
                                                {user.permissions?.length > 0 ? (
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        {user.permissions.slice(0, 2).map((perm, idx) => (
                                                            <span key={idx} className="badge bg-info-subtle text-info border border-info-subtle" style={{fontSize: '10px'}}>
                                                                {perm}
                                                            </span>
                                                        ))}
                                                        {user.permissions.length > 2 && <span className="text-muted small">+{user.permissions.length - 2} more</span>}
                                                    </div>
                                                ) : <span className="text-muted small">No Permissions</span>}
                                            </td>
                                            <td className="py-2 text-center">
                                                <div className="btn-group shadow-none">
                                                    {hasAccess(currentUser?.permissions, 'change_user') && (
                                                        <button className="btn btn-sm btn-outline-primary border-0" title="এডিট">
                                                            <i className="bi bi-pencil-square"></i>
                                                </button>
                                                
                                                    )}
                                                    {hasAccess(currentUser?.permissions, 'delete_user') && (
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger border-0"
                                                            onClick={() => handleDelete(user.id)}
                                                            title="ডিলিট"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center py-5">কোনো ইউজার পাওয়া যায়নি।</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="bg-white border-top py-2 px-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                        Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> - <strong>{Math.min(currentPage * pageSize, count)}</strong> of <strong>{count}</strong>
                    </span>
                    
                    {totalPages > 1 && (
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-2 px-3 text-dark shadow-none" onClick={() => setCurrentPage(currentPage - 1)}>
                                        Prev
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className={`page-link border rounded-2 mx-1 shadow-none ${currentPage === i + 1 ? 'bg-primary text-white border-primary' : 'bg-white text-dark'}`} 
                                                onClick={() => setCurrentPage(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 rounded-2 px-3 text-dark shadow-none" onClick={() => setCurrentPage(currentPage + 1)}>
                                        Next
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

export default UserListPage;