import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { domain } from "../../../../env";
import * as CM from "../../../../componentExporter";

const StudentPaymentListPage = () => {
    const navigate = useNavigate();
    
    // --- States ---
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [allHeads, setAllHeads] = useState([]);
    const itemsPerPage = 20;

    const [searchInvoice, setSearchInvoice] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filterCategory, setFilterCategory] = useState(null);
    const [filterHead, setFilterHead] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterDueStatus, setFilterDueStatus] = useState(null); // 'due' অথবা 'cleared'

    const brandColor = "#0d6efd"; 
    
    // --- Your Original Blue Focus Styles ---
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

    const loadStudentOptions = (inputValue) => {
        if (inputValue.length < 2) return Promise.resolve([]);
        return CM.axiosInstance.get(`${domain}/api/student-payments/search_students/?q=${inputValue}`).then(res => res.data);
    };
const fetchData = useCallback(async (page) => {
    setLoading(true);
    
    // ১. আগের কোনো মেসেজ থাকলে তা সরিয়ে ফেলা (DOM Cleanup)
    const existingMsg = document.getElementById('no-data-msg');
    if (existingMsg) existingMsg.remove();

    try {
        let url = `${domain}/api/student-payments/?page=${page}&page_size=${itemsPerPage}`;
        
        if (searchInvoice) url += `&search=${searchInvoice}`;
        if (selectedStudent) url += `&student=${selectedStudent.id}`;
        if (filterCategory) url += `&category_name=${filterCategory.value}`;
        if (filterHead) url += `&fees_id=${filterHead.value}`;
        if (filterStatus) url += `&approved=${filterStatus.value}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (filterDueStatus && filterDueStatus.value) url += `&due_status=${filterDueStatus.value}`;

        const res = await CM.axiosInstance.get(url);
        const count = res.data.count || 0;
        const results = res.data.results || [];

        if (count === 0) {
            setInvoices([]); // টেবিল ক্লিয়ার
            setTotalCount(0);

            // ২. সরাসরি DOM ব্যবহার করে মেসেজ শো করা
            // আপনার টেবিলের আইডি বা কন্টেইনার ক্লাস চেক করে নিন (এখানে 'table-responsive' ধরা হয়েছে)
            const tableContainer = document.querySelector('.table-responsive'); 
            if (tableContainer) {
                const msgDiv = document.createElement('div');
                msgDiv.id = 'no-data-msg';
                msgDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #dc3545; background: #fff3f3; border: 1px solid #ffc107; margin-top: 10px; border-radius: 8px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <h5 style="margin: 0;">No Payment Records Found!</h5>
                        <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Try changing your filters or search keywords.</p>
                    </div>
                `;
                tableContainer.appendChild(msgDiv);
            }
        } else {
            setInvoices(results);
            setTotalCount(count);
        }

    } catch (err) { 
        console.error("Fetch Data Error:", err); 
        setInvoices([]);
    }
    setLoading(false);
}, [searchInvoice, selectedStudent, filterCategory, filterHead, filterStatus, filterDueStatus, startDate, endDate, itemsPerPage]);

useEffect(() => { fetchData(currentPage); }, [currentPage, fetchData]);

const handleBulkUpdate = (statusValue) => {
    if (selectedInvoices.length === 0) return;

    const isTargetApproved = statusValue === 'true'; 

    // ১. আপডেট করার জন্য আইডিগুলো নেওয়া
    // আপনার লিস্টে থাকা ইনভয়েসের আইডিগুলো ফিল্টার করুন
    const validIdsToUpdate = invoices
        .filter(i => selectedInvoices.includes(i.invoice_no) && i.payment_approved !== isTargetApproved)
        .map(i => i.id);

    if (validIdsToUpdate.length === 0) {
        CM.Swal.fire('Info', 'Selected invoices are already in target status.', 'info');
        return;
    }

    CM.Swal.fire({
        title: 'Confirm Approval',
        text: `Are you sure you want to approve ${selectedInvoices.length} invoice(s)?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Approve',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // ২. সঠিক URL এ রিকোয়েস্ট পাঠানো
                await CM.axiosInstance.post(`${domain}/api/student-payments/bulk-approve-payments/`, { 
                    ids: validIdsToUpdate 
                });

                CM.Swal.fire({
                    title: 'Approved!',
                    text: 'Invoices verified successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                setSelectedInvoices([]); 
                fetchData(currentPage);
            } catch (err) { 
                console.error("Bulk Update Error:", err);
                CM.Swal.fire('Error', 'Could not process approval.', 'error'); 
            }
        }
    });
};

    const handleReset = () => {
        setSearchInvoice(""); setSelectedStudent(null); setFilterCategory(null);
        setFilterHead(null); setFilterStatus(null); setStartDate(""); setEndDate("");
        setFilterDueStatus(null); 
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const renderPageNumbers = () => {
    let pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(
            <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                <button 
                    className={`page-link border-0 shadow-sm rounded-circle px-3 mx-1 ${currentPage === i ? 'bg-primary text-white shadow' : 'bg-white text-dark'}`} 
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            </li>
        );
    }
    return pages;
};


    return (
        <div className="container-fluid mt-2">
            
            {/* --- Original Compact Filter Design --- */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 bg-white p-3">
                <div className="row g-2">
                    <div className="col-lg-4">
                        <label className="small fw-bold text-muted mb-1">Student</label>
                        <AsyncSelect styles={compactSelectStyles} loadOptions={loadStudentOptions} onChange={v => setSelectedStudent(v)} value={selectedStudent} placeholder="Search Student..." isClearable />
                    </div>
                    <div className="col-lg-2">
                        <label className="small fw-bold text-muted mb-1">Invoice</label>
                        <input className="form-control shadow-none match-focus" style={{height:'38px', borderRadius:'8px', fontSize: '13px'}} value={searchInvoice} onChange={e => setSearchInvoice(e.target.value)} placeholder="INV-XXX" />
                    </div>
                    <div className="col-lg-3">
                        <label className="small fw-bold text-muted mb-1">Category</label>
                        <Select styles={compactSelectStyles} options={categories} isClearable value={filterCategory} onChange={v => {setFilterCategory(v); setFilterHead(null);}} placeholder="Select Category" />
                    </div>

                    <div className="col-lg-3">
                        <label className="small fw-bold text-muted mb-1">Fee Head</label>
                        <Select styles={compactSelectStyles} options={filterCategory ? allHeads.filter(h => h.category === filterCategory.value) : allHeads} isClearable value={filterHead} onChange={v => setFilterHead(v)} placeholder="Select Head" />
                    </div>

                    <div className="col-lg-4">
                        <label className="small fw-bold text-muted mb-1">Date Range</label>
                        <div className="input-group">
                            <input type="date" className="form-control shadow-none match-focus" style={{height:'38px', borderRadius: '8px 0 0 8px'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <input type="date" className="form-control shadow-none match-focus" style={{height:'38px', borderRadius: '0 8px 8px 0'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-lg-2">
                        <label className="small fw-bold text-muted mb-1">Status</label>
                        <Select styles={compactSelectStyles} options={[{value:'true', label:'Approved'}, {value:'false', label:'Pending'}]} isClearable value={filterStatus} onChange={v => setFilterStatus(v)} placeholder="All Status" />
                    </div>
                    <div className="col-lg-2">
    <label className="small fw-bold text-muted mb-1">Payment Type</label>
    <Select 
        styles={compactSelectStyles} 
        options={[
            {value: 'due', label: 'Due Only'}, 
            {value: 'cleared', label: 'Cleared Only'}
        ]} 
        isClearable 
        value={filterDueStatus} 
        onChange={v => setFilterDueStatus(v)} 
        placeholder="Due / Cleared" 
    />
</div>
                    
                    
                    <div className="col-lg-4 d-flex gap-2 align-items-end justify-content-end">
                        <button className="btn btn-primary px-4 fw-bold shadow-sm" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={() => fetchData(1)}>Search</button>
                        <button className="btn btn-outline-danger px-4 fw-bold shadow-sm" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={handleReset}>Reset</button>
                        <button className="btn btn-success px-4 fw-bold shadow-sm" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={() => navigate('/student_fee')}>
                            <i className="fa fa-plus-circle me-1"></i> New Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Bulk Selection Bar --- */}
            {selectedInvoices.length > 0 && (
                <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-3 mb-3 d-flex flex-row justify-content-between align-items-center animate__animated animate__fadeIn">
                    <div className="fw-bold"><i className="fa fa-check-square-o me-2"></i> {selectedInvoices.length} Selected</div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light btn-sm fw-bold text-primary rounded-pill px-3" onClick={() => handleBulkUpdate('true')}>Mark Approved</button>
                        <button className="btn btn-light btn-sm fw-bold text-warning rounded-pill px-3" onClick={() => handleBulkUpdate('false')}>Mark Pending</button>
                    </div>
                </div>
            )}

            {/* --- Restored Table Design with Blue Line & SVG --- */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-white border-bottom shadow-sm">
    <tr className="text-uppercase fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '0.6px', backgroundColor: '#fcfcfd' }}>
        {/* Checkbox Column */}
        <th className="ps-4 align-middle" width="50">
            <input 
                type="checkbox" 
                className="form-check-input border-secondary-subtle shadow-none cursor-pointer" 
                onChange={e => setSelectedInvoices(e.target.checked ? invoices.map(i => i.invoice_no) : [])} 
                checked={selectedInvoices.length === invoices.length && invoices.length > 0} 
            />
        </th>

        {/* Invoice & Date - Icon-based header is more modern */}
        <th className="align-middle py-3">
             <i className="fa fa-file-text-o me-2 opacity-50"></i>Invoice & Date
        </th>

        {/* Student Identity */}
        <th className="align-middle py-3">
             <i className="fa fa-user-circle-o me-2 opacity-50"></i>Student Info
        </th>

        {/* Heads (Fee Items) */}
        <th className="align-middle py-3">
             <i className="fa fa-list-ul me-2 opacity-50"></i>Breakdown
        </th>
        <th className="align-middle py-3">
             <i className="fa fa-list-ul me-2 opacity-50"></i>Pay Type
        </th>

        {/* Financial Columns - Using subtle grouping colors */}
        <th className="text-end align-middle py-3 text-dark">Original</th>
        
        <th className="text-end align-middle py-3 text-primary">
             <i className="fa fa-scissors me-1 opacity-50"></i>Discount
        </th>

        <th className="text-end align-middle py-3 text-dark fw-bolder">
            Payable
        </th>

        <th className="text-end align-middle py-3 text-success">
             <i className="fa fa-check-circle-o me-1 opacity-50"></i>Paid
        </th>

        <th className="text-end align-middle py-3 text-danger">
             <i className="fa fa-clock-o me-1 opacity-50"></i>Due
        </th>

        {/* Status & Actions */}
        <th className="text-center align-middle py-3" width="100">Status</th>
        <th className="text-center align-middle py-3 pe-4" width="120">Actions</th>
    </tr>
</thead>
                        <tbody>
                            {!loading && invoices.map((inv, idx) => {
                            
                            const originalFee = parseFloat(inv.original_fee_rate) || 0;
                            const totalDiscount = parseFloat(inv.total_discount_amount) || 0;
                            const netPayable = parseFloat(inv.net_payable_amount) || 0;
                            const totalPaid = parseFloat(inv.total_invoice_amount) || 0; // এটা এখন পেইড এমাউন্ট
                            const dueAmount = parseFloat(inv.total_due_amount) || 0;
                           
                            
                         return (
                                <tr 
    key={idx} 
    className={`${selectedInvoices.includes(inv.invoice_no) ? "table-primary border-start border-primary border-4" : "border-bottom"}`}
    style={{ transition: 'all 0.2s ease', verticalAlign: 'middle' }}
>
    {/* ১. সিলেকশন - বর্ডারলেস চেক বক্স */}
    <td className="ps-4" style={{ width: '50px' }}>
        <input 
            type="checkbox" 
            className="form-check-input border-secondary-subtle shadow-none" 
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            checked={selectedInvoices.includes(inv.invoice_no)} 
            onChange={() => setSelectedInvoices(prev => prev.includes(inv.invoice_no) ? prev.filter(i => i !== inv.invoice_no) : [...prev, inv.invoice_no])} 
        />
    </td>

    {/* ২. ইনভয়েস নম্বর ও ডেট - শার্প টাইপোগ্রাফি */}
    <td>
        <div className="fw-bold text-dark mb-0" style={{ fontSize: '10.5px', letterSpacing: '0', minWidth: '100px' }}>
            #{inv.invoice_no}
        </div>
        <div className="text-muted d-flex align-items-center mt-1" style={{ fontSize: '10.5px' }}>
            <svg width="11" height="11" className="me-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {inv.payment_date}
        </div>
    </td>

    {/* ৩. স্টুডেন্ট প্রোফাইল - ক্লিন লুক */}
    <td>
        <div className="d-flex align-items-center">
            <img 
                src={inv.student_photo ? `${domain}${inv.student_photo}` : `https://ui-avatars.com/api/?name=${inv.student_full_name}&background=f3f4f6&color=6366f1&bold=true`} 
                className="rounded-circle me-3 border-0 shadow-sm" 
                width="38" height="38" alt="" 
            />
            <div>
                <div className="fw-bold text-dark" style={{ fontSize: '11px', lineHeight: '1', minWidth: '100px' }}>{inv.student_full_name}</div>
                <div className="text-muted small mt-1" style={{ fontSize: '9px', lineHeight: '1' }}>ID: {inv.student_id_no}</div>
            </div>
        </div>
    </td>

    {/* ৪. ফি হেডস - স্টাইলিশ পিলস */}
    <td>
        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '180px' }}>
            {inv.all_heads && inv.all_heads.map((h, i) => (
                <span key={i} className="badge bg-light text-secondary border-0 fw-medium" style={{ fontSize: '9px', padding: '3px 7px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #edf2f7' }}>
                    {h}
                </span>
            ))}
        </div>
    </td>
    <td className="text-center fw-semibold text-info" style={{ fontSize: '10px',  maxWidth: '120px' }}>{inv.account_display}</td>
  
 

    {/* ৫. ফিন্যান্সিয়াল ডাটা - ট্যাব্যুলার এলাইনমেন্ট */}
    <td className="text-end fw-semibold text-secondary" style={{ fontSize: '13px' }}>{originalFee.toLocaleString()}</td>
    <td className="text-end fw-semibold text-info" style={{ fontSize: '13px' }}>-{totalDiscount.toLocaleString()}</td>
    
    {/* Net Payable - হালকা হাইলাইট */}
    <td className="text-end">
        <span className="fw-bold text-dark px-2 py-1 rounded" style={{ backgroundColor: '#f1f5f9', fontSize: '13px' }}>
            {netPayable.toLocaleString()}
        </span>
    </td>

    <td className="text-end fw-bold text-success" style={{ fontSize: '13px' }}>{totalPaid.toLocaleString()}</td>
    
    <td className="text-end">
        <span className={`fw-bold ${dueAmount > 0 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '13px' }}>
            {dueAmount > 0 ? dueAmount.toLocaleString() : 'CLEARED'}
        </span>
    </td>

    {/* ৬. স্ট্যাটাস - মডার্ন ব্যাজ */}
    <td className="text-center"> 
        <span className={`badge rounded-pill px-3 py-1 fw-bold ${inv.payment_approved ? 'bg-success text-white' : 'bg-warning-subtle text-warning border border-warning-subtle'}`} style={{ fontSize: '9.5px', letterSpacing: '0.4px' }}>
            {inv.payment_approved ? 'APPROVED' : 'PENDING'}
        </span>
    </td>

    {/* ৭. অ্যাকশন বাটন - আগের SVG দিয়ে প্রিমিয়াম বাটন */}
    <td className="text-center pe-4">
        <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-sm btn-white rounded-circle p-2 shadow-sm border-0 hover-bg-light" title="Verify" onClick={() => navigate(`/verify-invoice/${inv.student}/${inv.invoice_no}`)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#17a2b8" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button className="btn btn-sm btn-white rounded-circle p-2 shadow-sm border-0 hover-bg-light" title="Edit" onClick={() => navigate(`/student_payment/edit/${inv.id}`)}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
        </div>
    </td>
</tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* --- Restored Premium Pagination Design --- */}
          

<div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
    <div className="small fw-bold text-muted text-uppercase">
        Showing Page {currentPage} of {totalPages}
    </div>
    <ul className="pagination pagination-sm mb-0 gap-1 align-items-center">
        {/* First Button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link border-0 shadow-sm rounded-3 px-3 fw-bold bg-light text-dark" onClick={() => setCurrentPage(1)}>
                <i className="fa fa-angle-double-left"></i> First
            </button>
        </li>
        
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link border-0 shadow-sm rounded-3 px-3 fw-bold bg-light text-dark" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
                <i className="fa fa-angle-left"></i> Prev
            </button>
        </li>

        {/* Numbered Pages */}
        {renderPageNumbers()}

        {/* Next Button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link border-0 shadow-sm rounded-3 px-3 fw-bold bg-light text-dark" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
                Next <i className="fa fa-angle-right"></i>
            </button>
        </li>

        {/* Last Button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link border-0 shadow-sm rounded-3 px-3 fw-bold bg-light text-dark" onClick={() => setCurrentPage(totalPages)}>
                Last <i className="fa fa-angle-double-right"></i>
            </button>
        </li>
    </ul>
</div>
            </div>

            {/* --- Global Custom CSS for Blue Focus & Hover --- */}
            <style>{`
                .match-focus:focus { 
                    border-color: ${brandColor} !important; 
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
                }
                .table-hover tbody tr:hover { 
                    background-color: #f8faff !important;
                }
                .table-primary { 
                    background-color: #eef5ff !important; 
                }
                .page-link:hover {
                    background-color: ${brandColor} !important;
                    color: white !important;
                }
            `}</style>
        </div>
    );
};

export default StudentPaymentListPage;