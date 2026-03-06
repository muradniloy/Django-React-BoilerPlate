import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Searchable Select এর জন্য
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const FeeRateListPage = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState(""); 
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordering, setOrdering] = useState("-id"); 
    const navigate = useNavigate();

    const PAGE_SIZE = 10;

    // ১. MainHead API ব্যবহার করে ক্যাটাগরি ফেচ করা (Searchable এর জন্য)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axiosInstance.get(`${domain}/api/main-heads/?page_size=1000`);
                const results = res.data.results || res.data;
                const formattedCats = results.map(item => ({
                    value: item.main_head_name, 
                    label: item.main_head_name
                }));
                setCategories(formattedCats);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    // ২. ডাটা ফেচ করার মেইন ফাংশন
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `${domain}/api/fee-rates/?page=${currentPage}&search=${searchTerm}&category=${filterCategory}&ordering=${ordering}`
            );
            
            setData(res.data.results || []);
            setCount(res.data.count || 0);
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: 'Could not fetch fee rate data.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterCategory, ordering]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ৩. সর্টিং টগল ফাংশন
    const toggleSorting = (field) => {
        let sortField = field;
        if (field === 'category') sortField = 'payment_head__payment_category__main_head_name';
        if (field === 'head') sortField = 'payment_head__head_name';
        
        setOrdering(prev => (prev === sortField ? `-${sortField}` : sortField));
        setCurrentPage(1);
    };

    // ৪. ডিলিট ফাংশন
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This record will be deleted permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/fee-rates/${id}/`);
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Successfully deleted the fee rate.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchData();
                } catch (err) {
                    Swal.fire('Error!', 'Could not delete the record.', 'error');
                }
            }
        });
    };

    // ৫. পেজিনেশন বাটন রেন্ডারিং
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
                <h5 className="fw-bold text-uppercase" style={{letterSpacing: '1px'}}>Fee Rate Management</h5>
                <div>
                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3 me-2" onClick={() => navigate('/Accouting/Settings')}>
                        <i className="bi bi-gear me-1"></i> Back
                    </button>
                    <button className="btn btn-primary shadow-sm rounded-pill px-4" onClick={() => navigate('/fee-rate/add')}>
                        <i className="bi bi-plus-lg me-2"></i>Add Fee Rate
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
                                    placeholder="Search by name or code..." 
                                    value={searchTerm}
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
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
                        <div className="col-md-4 text-end">
                            <button className="btn btn-sm btn-outline-secondary px-3" onClick={() => {setSearchTerm(""); setFilterCategory(""); setCurrentPage(1); setOrdering("-id");}}>
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
                                <th onClick={() => toggleSorting('category')} className="py-3">
                                    Category & Code {ordering.includes('payment_category') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th onClick={() => toggleSorting('head')} className="py-3">
                                    Head Name & Code {ordering.includes('payment_head') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th onClick={() => toggleSorting('amount')} className="py-3">
                                    Amount {ordering.includes('amount') ? (ordering.startsWith('-') ? '▼' : '▲') : '↕'}
                                </th>
                                <th className="py-3">Opening Date</th>
                                <th className="text-center py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="mt-2 text-muted">Loading data...</div>
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map(item => (
                                    <tr key={item.id} style={{fontSize: '14px'}}>
                                        <td>
                                            <span className="text-muted small d-block"> {item.category_code || 'N/A'}</span>
                                            {item.category_name || 'N/A'}
                                        </td>
                                        <td>
    
                                             <span className="text-muted small d-block"> {item.head_code || 'N/A'}</span>
                                            {item.head_name || 'N/A'}
                                        </td>
                                        <td className="text-primary fw-bold">
                                            {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})} BDT
                                        </td>
                                        <td>{item.opening_date || 'No Date'}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white me-2 shadow-sm" onClick={() => navigate(`/fee-rate/edit/${item.id}`)}>
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger shadow-sm" onClick={() => handleDelete(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No fee rate records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                    <small className="text-muted fw-bold">Total {count} Records Found</small>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(1)}>First</button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Prev</button>
                            </li>
                            
                            {renderPageNumbers()}

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

export default FeeRateListPage;