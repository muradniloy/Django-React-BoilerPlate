import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Select from 'react-select';
import { domain } from "../../../env";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent";  
import StudentNavButtons from "./StudentNavButtons";
const StudentSinglePaymentHistory = ({ studentId: propId }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const studentId = useStudent(propId || paramId);
    
    // --- States ---
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [allHeads, setAllHeads] = useState([]);
    const itemsPerPage = 20;

    // Filters
    const [searchInvoice, setSearchInvoice] = useState("");
    const [filterCategory, setFilterCategory] = useState(null);
    const [filterHead, setFilterHead] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterDueStatus, setFilterDueStatus] = useState(null);

    const brandColor = "#0d6efd"; 
    
    const compactSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px', height: '38px', borderRadius: '8px',
            borderColor: state.isFocused ? brandColor : "#dee2e6",
            boxShadow: state.isFocused ? `0 0 0 0.2rem rgba(13, 110, 253, 0.15)` : "none",
            fontSize: '13px', '&:hover': { borderColor: brandColor }
        }),
        valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 8px' }),
        input: (provided) => ({ ...provided, margin: '0px' }),
        indicatorSeparator: () => ({ display: 'none' }),
        indicatorsContainer: (provided) => ({ ...provided, height: '38px' }),
    };

    // --- API & Meta Data ---
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [catRes, headRes] = await Promise.all([
                    CM.axiosInstance.get(`${domain}/api/main-heads/`),
                    CM.axiosInstance.get(`${domain}/api/fee-rates/?page_size=1000`)
                ]);
                const catData = catRes.data.results || catRes.data;
                const headData = headRes.data.results || headRes.data;
                setCategories(catData.map(c => ({ value: c.main_head_name, label: c.main_head_name })));
                setAllHeads(headData.map(h => ({ value: h.id, label: h.head_name, category: h.payment_category_name })));
            } catch (err) { console.error(err); }
        };
        fetchMeta();
    }, []);

    const fetchData = useCallback(async (page) => {
        if (!studentId) return;
        setLoading(true);
        
        const existingMsg = document.getElementById('no-data-msg');
        if (existingMsg) existingMsg.remove();

        try {
            let url = `${domain}/api/student-payments/?student=${studentId}&page=${page}&page_size=${itemsPerPage}`;
            if (searchInvoice) url += `&search=${searchInvoice}`;
            if (filterCategory) url += `&category_name=${filterCategory.value}`;
            if (filterHead) url += `&fees_id=${filterHead.value}`;
            if (filterStatus) url += `&approved=${filterStatus.value}`;
            if (startDate) url += `&start_date=${startDate}`;
            if (endDate) url += `&end_date=${endDate}`;
            if (filterDueStatus && filterDueStatus.value) url += `&due_status=${filterDueStatus.value}`;

            const res = await CM.axiosInstance.get(url);
            setInvoices(res.data.results || []);
            setTotalCount(res.data.count || 0);
        } catch (err) { 
            console.error(err);
            setInvoices([]);
        }
        setLoading(false);
    }, [studentId, searchInvoice, filterCategory, filterHead, filterStatus, filterDueStatus, startDate, endDate, itemsPerPage]);

    useEffect(() => { fetchData(currentPage); }, [currentPage, fetchData]);

    const handleReset = () => {
        setSearchInvoice(""); setFilterCategory(null); setFilterHead(null);
        setFilterStatus(null); setStartDate(""); setEndDate(""); setFilterDueStatus(null);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // স্টুডেন্ট ইনফরমেশন (প্রথম ইনভয়েস থেকে অথবা আলাদা এপিআই থেকে নিতে পারেন)
    const studentInfo = invoices.length > 0 ? invoices[0] : null;

    return (
        <div className="container-fluid mt-4 px-4 pb-5 bg-light min-vh-100">
            
            {/* 1. Profile Header Section (Same as PaymentContactPage) */}
            <div className="address-header row align-items-center p-3 mb-4 bg-white shadow-sm rounded-4 mx-0 border-start border-4 border-primary">
                <div className="col-auto">
                    <img
                        src={studentInfo?.student_photo ? `${domain}${studentInfo.student_photo}` : `https://ui-avatars.com/api/?name=${studentInfo?.student_full_name || 'S'}&background=0d6efd&color=fff&bold=true`}
                        alt="Profile"
                        className="rounded-3 shadow-sm border p-1"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                </div>
                <div className="col">
                    <h4 className="mb-1 fw-bold text-dark">{studentInfo?.student_full_name || "Loading..."}</h4>
                    <p className="text-muted mb-0 small">
                        <i className="fa fa-university me-2 text-primary"></i>
                        Payment History Archive
                    </p>
                </div>
                <div className="col-auto">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-bold">
                        Student ID: {studentId}
                    </span>
                </div>
            </div>

            <div className="row g-3">
                {/* Left Side: Filter & Table Section */}
                <div className="col-md-10">
                    
                    {/* 2. Compact Filters Section (Under Profile) */}
                    <div className="card border-0 shadow-sm mb-3 rounded-4 bg-white p-3">
                        <div className="row g-2">
                            <div className="col-md-3">
                                <label className="small fw-bold text-muted mb-1">Invoice Search</label>
                                <input className="form-control shadow-none match-focus" style={{height:'38px', borderRadius:'8px', fontSize: '13px'}} value={searchInvoice} onChange={e => setSearchInvoice(e.target.value)} placeholder="INV-XXX" />
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold text-muted mb-1">Category</label>
                                <Select styles={compactSelectStyles} options={categories} isClearable value={filterCategory} onChange={v => {setFilterCategory(v); setFilterHead(null);}} placeholder="Select Category" />
                            </div>
                            <div className="col-md-4">
                                <label className="small fw-bold text-muted mb-1">Date Range</label>
                                <div className="input-group">
                                    <input type="date" className="form-control shadow-none match-focus" style={{height:'38px', borderRadius: '8px 0 0 8px'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    <input type="date" className="form-control shadow-none match-focus" style={{height:'38px', borderRadius: '0 8px 8px 0'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-2 d-flex gap-2 align-items-end justify-content-end">
                                <button className="btn btn-primary px-3 fw-bold w-100" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={() => fetchData(1)}>Search</button>
                                <button className="btn btn-outline-danger px-3 fw-bold" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={handleReset}><i className="fa fa-refresh"></i></button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Table Section */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr className="text-uppercase text-secondary" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                        <th className="ps-4 py-3">Invoice & Date</th>
                                        <th className="py-3">Breakdown</th>
                                        <th className="text-end py-3">Payable</th>
                                        <th className="text-end py-3 text-success">Paid</th>
                                        <th className="text-end py-3 text-danger">Due</th>
                                        <th className="text-center py-3">Status</th>
                                        <th className="text-center py-3 pe-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && invoices.map((inv, idx) => (
                                        <tr key={idx} className="border-bottom">
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark" style={{ fontSize: '11px' }}>#{inv.invoice_no}</div>
                                                <div className="text-muted" style={{ fontSize: '10px' }}>{inv.payment_date}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
                                                    {inv.all_heads?.map((h, i) => (
                                                        <span key={i} className="badge bg-light text-secondary border fw-medium" style={{ fontSize: '9px' }}>{h}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="text-end fw-bold text-dark">{(+inv.net_payable_amount).toLocaleString()}</td>
                                            <td className="text-end fw-bold text-success">{(+inv.total_invoice_amount).toLocaleString()}</td>
                                            <td className="text-end">
                                                <span className={`fw-bold ${+inv.total_due_amount > 0 ? 'text-danger' : 'text-success'}`}>
                                                    {+inv.total_due_amount > 0 ? (+inv.total_due_amount).toLocaleString() : 'CLEARED'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge rounded-pill px-3 py-1 ${inv.payment_approved ? 'bg-success text-white' : 'bg-warning-subtle text-warning'}`} style={{ fontSize: '9px' }}>
                                                    {inv.payment_approved ? 'APPROVED' : 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="text-center pe-4">
                                                <button className="btn btn-sm btn-white rounded-circle shadow-sm border-0" onClick={() => navigate(`/verify-invoice/${inv.student}/${inv.invoice_no}`)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
                            <div className="small fw-bold text-muted">PAGE {currentPage} OF {totalPages}</div>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 shadow-sm rounded-3 px-3 bg-light text-dark" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>Prev</button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0 shadow-sm rounded-3 px-3 bg-light text-dark" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Next</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Side: Nav Buttons (Same as PaymentContactPage) */}
                <StudentNavButtons studentId={studentId} />
            </div>

            {/* Action Footer */}
            <div className="mt-4 d-flex justify-content-between align-items-center">
                <Link className="btn btn-outline-secondary px-4 shadow-sm rounded-pill fw-bold" to={`/dashboard/students`}>
                    <i className="fa fa-arrow-left me-2"></i> Back to List
                </Link>
                <button className="btn btn-primary px-5 fw-bold shadow-sm rounded-pill" onClick={() => navigate('/student_fee')}>
                    <i className="fa fa-plus me-2"></i> New Payment
                </button>
            </div>

            <style>{`
                .match-focus:focus { border-color: ${brandColor} !important; box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important; }
                .table-hover tbody tr:hover { background-color: #f8faff !important; }
            `}</style>
        </div>
    );
};

export default StudentSinglePaymentHistory;