import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; 
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const PaymentHeadListPage = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState(""); 
    const [filterType, setFilterType] = useState(""); 
    const [count, setCount] = useState(0); 
    const [currentPage, setCurrentPage] = useState(1);
    
    const [ordering, setOrdering] = useState("-id"); 
    const navigate = useNavigate();

    const PAGE_SIZE = 10; 

    useEffect(() => {
        axiosInstance.get(`${domain}/api/main-heads/?page_size=1000`)
            .then(res => {
                const results = res.data.results || res.data;
                const formattedCats = results.map(item => ({
                    value: item.main_head_name, 
                    label: item.main_head_name
                }));
                setCategories(formattedCats);
            }).catch(err => console.error("Category fetch error", err));
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // আপনার আগের URL ফরম্যাটই রাখা হয়েছে
            const res = await axiosInstance.get(
                `${domain}/api/payment-heads/?page=${currentPage}&search=${searchTerm}&payment_category__main_head_name=${filterCategory}&headType=${filterType}&ordering=${ordering}`
            );
            
            // লজিক আপডেট: ডাটা যদি অবজেক্টে (results) না থাকে তবে সরাসরি বডিতে খুঁজবে
            const responseData = res.data.results || res.data;
            const responseCount = res.data.count || (Array.isArray(res.data) ? res.data.length : 0);

            setData(Array.isArray(responseData) ? responseData : []);
            setCount(responseCount);
        } catch (err) {
            console.error("Fetch error", err);
            // ব্যাকএন্ডে পেজিনেশন অফ থাকলে ৪-এ ৪৪৪ (Page not found) আসতে পারে, সেটি হ্যান্ডেল করা
            if(err.response?.status === 404 && currentPage > 1) {
                setCurrentPage(1);
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterCategory, filterType, ordering]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleSorting = (field) => {
        let sortField = field;
        if (field === 'category') sortField = 'payment_category__main_head_name';
        if (field === 'type') sortField = 'headType';
        setOrdering(prev => (prev === sortField ? `-${sortField}` : sortField));
        setCurrentPage(1); 
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This item will be deleted permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/payment-heads/${id}/`);
                    Swal.fire({ 
                        title: 'Deleted!', 
                        text: 'Success! Item deleted.', 
                        icon: 'success', 
                        timer: 1200, 
                        showConfirmButton: false 
                    });
                    fetchData();
                } catch (err) {
                    Swal.fire('Error!', 'Failed to delete.', 'error');
                }
            }
        });
    };

    const totalPages = Math.ceil(count / PAGE_SIZE) || 1;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) { pageNumbers.push(i); }

    // যদি ব্যাকএন্ড থেকে সব ডাটা একসাথে আসে (Pagination None), তবে ফ্রন্টএন্ডে ভাগ করে দেখানো
    const finalDisplayData = (data.length > PAGE_SIZE) 
        ? data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) 
        : data;

    return (
        <div className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Payment Head List</h5>
                <div>
                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3 me-2" onClick={() => navigate('/Accouting/Settings')}>
                        <i className="bi bi-gear me-1"></i> Back
                    </button>
                    <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => navigate('/payment-head/add')}>
                        <i className="bi bi-plus-lg me-1"></i> Add New
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-3">
                <div className="p-3 border-bottom bg-white">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-3">
                            <input type="text" className="form-control form-control-sm" placeholder="Search..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                        </div>
                        <div className="col-md-3">
                            <Select
                                options={categories}
                                placeholder="Filter Category..."
                                isSearchable={true}
                                isClearable={true}
                                value={categories.find(opt => opt.value === filterCategory) || null}
                                onChange={(selected) => {
                                    setFilterCategory(selected ? selected.value : "");
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
                        <div className="col-md-3">
                            <select className="form-select form-select-sm" value={filterType} onChange={(e) => {setFilterType(e.target.value); setCurrentPage(1);}}>
                                <option value="">All Types</option>
                                <option value="1">Income</option>
                                <option value="2">Expense</option>
                            </select>
                        </div>
                        <div className="col-md-3 text-end">
                            <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => {setSearchTerm(""); setFilterCategory(""); setFilterType(""); setCurrentPage(1);}}>Reset</button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark text-nowrap">
                            <tr style={{ userSelect: 'none' }}>
                                <th onClick={() => toggleSorting('head_code')} style={{ cursor: 'pointer' }}>
                                    Code {ordering.includes('head_code') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th onClick={() => toggleSorting('head_name')} style={{ cursor: 'pointer' }}>
                                    Name {ordering.includes('head_name') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th onClick={() => toggleSorting('category')} style={{ cursor: 'pointer' }}>
                                    Category {ordering.includes('payment_category__main_head_name') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th onClick={() => toggleSorting('type')} style={{ cursor: 'pointer' }}>
                                    Type {ordering.includes('headType') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : finalDisplayData.length > 0 ? (
                                finalDisplayData.map(item => (
                                    <tr key={item.id} style={{fontSize: '14px'}}>
                                        <td className="fw-bold">{item.head_code}</td>
                                        <td>{item.head_name}</td>
                                        <td>{item.category_name}</td>
                                        <td>
                                            <span className={`badge ${String(item.headType) === "1" ? "bg-success" : "bg-danger"}`}>
                                                {String(item.headType) === "1" ? "Income" : "Expense"}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white me-2" onClick={() => navigate(`/payment-head/edit/${item.id}`)}><i className="bi bi-pencil"></i></button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><i className="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-4">No data found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                    <small className="text-muted">Showing {finalDisplayData.length} of {count} records</small>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(1)}>First</button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Prev</button>
                            </li>
                            {pageNumbers.map(number => (
                                <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(number)}>{number}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                            </li>
                            <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(totalPages)}>Last</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default PaymentHeadListPage;