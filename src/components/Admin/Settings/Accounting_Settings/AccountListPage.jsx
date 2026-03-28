import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; 
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const AccountListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState(""); // Cash or Bank filter
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordering, setOrdering] = useState("-id"); 
    const navigate = useNavigate();

    const PAGE_SIZE = 10;

    // অ্যাকাউন্ট টাইপ অপশন (Static যেহেতু এগুলো ফিক্সড)
    const typeOptions = [
        { value: 'cash', label: 'Cash In Hand' },
        { value: 'bank', label: 'Bank Account' }
    ];

    // ডাটা ফেচ করার মেইন ফাংশন
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // আপনার এপিআই এন্ডপয়েন্ট অনুযায়ী কুয়েরি প্যারামিটার
            const res = await axiosInstance.get(
                `${domain}/api/accounts/?page=${currentPage}&search=${searchTerm}&account_type=${filterType}&ordering=${ordering}`
            );
            
            setData(res.data.results || res.data); // পাজিনেশন থাকলে .results, না থাকলে সরাসরি res.data
            setCount(res.data.count || (res.data.length || 0));
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: 'Could not fetch accounts data.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterType, ordering]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // সর্টিং টগল
    const toggleSorting = (field) => {
        setOrdering(prev => (prev === field ? `-${field}` : field));
        setCurrentPage(1);
    };

    // ডিলিট ফাংশন
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This account will be deleted permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/accounts/${id}/`);
                    Swal.fire('Deleted!', 'Account has been deleted.', 'success');
                    fetchData();
                } catch (err) {
                    Swal.fire('Error!', 'Could not delete the record.', 'error');
                }
            }
        });
    };

    // পেজিনেশন রেন্ডারিং
    const totalPages = Math.ceil(count / PAGE_SIZE) || 1;
    const renderPageNumbers = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i)}>{i}</button>
                </li>
            );
        }
        return pages;
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-uppercase" style={{letterSpacing: '1px'}}>Accounts Management</h5>
                <div>
                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3 me-2" onClick={() => navigate(-1)}>
                        Back
                    </button>
                    <button className="btn btn-primary shadow-sm rounded-pill px-4" onClick={() => navigate('/Account/add')}>
                        <i className="bi bi-plus-lg me-2"></i>Add New Account
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="card shadow-sm border-0 rounded-3 mb-3">
                <div className="p-3 bg-white rounded-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-4">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0" 
                                    placeholder="Search by account or bank name..." 
                                    value={searchTerm}
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <Select
                                options={typeOptions}
                                placeholder="Filter Account Type..."
                                isClearable={true}
                                value={typeOptions.find(opt => opt.value === filterType) || null}
                                onChange={(selected) => {
                                    setFilterType(selected ? selected.value : "");
                                    setCurrentPage(1);
                                }}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '31px',
                                        height: '31px',
                                        fontSize: '14px',
                                        borderRadius: '0.375rem',
                                    }),
                                    valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                    indicatorsContainer: (base) => ({ ...base, height: '31px' }),
                                }}
                            />
                        </div>
                        <div className="col-md-4 text-end">
                            <button className="btn btn-sm btn-outline-secondary px-3" onClick={() => {setSearchTerm(""); setFilterType(""); setCurrentPage(1); setOrdering("-id");}}>
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="card shadow-sm border-0 rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr style={{fontSize: '13px', cursor: 'pointer', userSelect: 'none'}}>
                                <th onClick={() => toggleSorting('account_name')} className="py-3">Account Name {ordering.includes('account_name') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}</th>
                                <th className="py-3">Type</th>
                                <th className="py-3">Bank & Number</th>
                                <th onClick={() => toggleSorting('current_balance')} className="py-3">Current Balance {ordering.includes('current_balance') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}</th>
                                <th className="py-3 text-center">Status</th>
                                <th className="text-center py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="mt-2 text-muted">Loading Accounts...</div>
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map(item => (
                                    <tr key={item.id} style={{fontSize: '14px'}}>
                                        <td>
                                            <span className="fw-bold text-dark">{item.account_name}</span>
                                            <div className="text-muted small">ID: #{item.id}</div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${item.account_type === 'cash' ? 'bg-success' : 'bg-info'}`}>
                                                {item.account_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {item.account_type === 'bank' ? (
                                                <>
                                                    <span className="d-block fw-bold">{item.bank_name}</span>
                                                    <span className="text-muted small">{item.account_number}</span>
                                                </>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td className="fw-bold text-primary">
                                            {parseFloat(item.current_balance).toLocaleString()} BDT
                                        </td>
                                        <td className="text-center">
                                            {item.is_active ? 
                                                <span className="text-success"><i className="bi bi-check-circle-fill"></i> Active</span> : 
                                                <span className="text-danger"><i className="bi bi-x-circle-fill"></i> Inactive</span>
                                            }
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white me-2" onClick={() => navigate(`/Account/edit/${item.id}`)}>
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                    <small className="text-muted fw-bold">Showing {data.length} of {count} Accounts</small>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            {renderPageNumbers()}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default AccountListPage;