import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select'; 
import { domain } from "../../../../env";
import * as CM from "../../../../componentExporter";

const StudentPaymentListPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [categories, setCategories] = useState([]);
  const [allHeads, setAllHeads] = useState([]); 
  const [heads, setHeads] = useState([]);    
  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const itemsPerPage = 10; 
  
  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterCategory, setFilterCategory] = useState(null); 
  const [filterHead, setFilterHead] = useState(null);

  // ১. ড্রপডাউন ডাটা লোড
  useEffect(() => {
    CM.axiosInstance.get(`${domain}/api/main-heads/?page_size=1000`)
      .then(res => {
        const results = res.data.results || res.data;
        setCategories(results.map(item => ({ 
          value: item.main_head_name, 
          label: item.main_head_name 
        })));
      });

    // এখানে আপনার FeeRate বা PaymentHead এর API থেকে ডাটা লোড হচ্ছে
    CM.axiosInstance.get(`${domain}/api/fee-rates/?page_size=1000`)
      .then(res => {
        const results = res.data.results || res.data;
        const formattedHeads = results.map(item => ({ 
            value: item.id, // এটিই fees_id হিসেবে ব্যাকএন্ডে যাবে
            label: item.payment_head_name || item.head_name, 
            category: item.category_name 
        }));
        setAllHeads(formattedHeads);
        setHeads(formattedHeads);
      });
  }, []);

  // ২. ক্যাটাগরি চেঞ্জ লজিক
  const handleCategoryChange = (selectedCat) => {
    setFilterCategory(selectedCat);
    setFilterHead(null); 
    if (selectedCat) {
      const filtered = allHeads.filter(h => h.category === selectedCat.value);
      setHeads(filtered);
    } else {
      setHeads(allHeads);
    }
  };

  // ৩. রিসেট বাটন লজিক (নিশ্চিত করা হয়েছে)
  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setFilterCategory(null);
    setFilterHead(null);
    setHeads(allHeads);
    setCurrentPage(1);
  };

  // ৪. পেমেন্ট ডাটা ফেচ
  const fetchPayments = useCallback(async (page) => {
    try {
      setLoading(true);
      let url = `${domain}/api/student-payments/?page=${page}`;
      
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (filterCategory) url += `&category_name=${encodeURIComponent(filterCategory.value)}`;
      
      // Head Filter Fix: এখানে filterHead.value নিশ্চিত করা হয়েছে
      if (filterHead) url += `&fees_id=${filterHead.value}`;

      const res = await CM.axiosInstance.get(url);
      const rawData = res.data.results || [];
      const totalCount = res.data.count || 0;
      setServerTotalPages(Math.ceil(totalCount / itemsPerPage) || 1);

      // ব্যাকএন্ডের ডিসেন্ডিং অর্ডার বজায় রেখে গ্রুপিং
      const orderedGrouped = [];
      const map = new Map();
      
      rawData.forEach((item) => {
        const invNo = item.invoice_no || `INV-${item.id}`;
        if (!map.has(invNo)) {
          const newItem = {
            ...item,
            invoice_no: invNo,
            all_heads: [item.head_name || "Fees"],
            sum_amount: parseFloat(item.amount || 0),
            sum_due: parseFloat(item.new_due || 0)
          };
          map.set(invNo, newItem);
          orderedGrouped.push(newItem); 
        } else {
          const existing = map.get(invNo);
          existing.all_heads.push(item.head_name || "Fees");
          existing.sum_amount += parseFloat(item.amount || 0);
          existing.sum_due = parseFloat(item.new_due || 0); 
        }
      });
      
      setPayments(orderedGrouped);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, filterCategory, filterHead]);

  useEffect(() => {
    setCurrentPage(1);
    fetchPayments(1);
  }, [search, startDate, endDate, filterCategory, filterHead, fetchPayments]);

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage, fetchPayments]);

  // ৫. পেজিনেশন রেন্ডার (আপনার অরিজিনাল ডিজাইন)
  const renderPaginationItems = () => {
    const pages = [];
    const maxVisible = 1;
    pages.push(
      <li key={1} className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
        <button className="page-link border-0 mx-1 rounded-2 shadow-sm" onClick={() => setCurrentPage(1)}>1</button>
      </li>
    );
    if (currentPage > maxVisible + 2) {
      pages.push(<li key="ellipsis1" className="page-item disabled"><span className="page-link border-0">...</span></li>);
    }
    for (let i = Math.max(2, currentPage - maxVisible); i <= Math.min(serverTotalPages - 1, currentPage + maxVisible); i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link border-0 mx-1 rounded-2 shadow-sm" onClick={() => setCurrentPage(i)}>{i}</button>
        </li>
      );
    }
    if (currentPage < serverTotalPages - (maxVisible + 1)) {
      pages.push(<li key="ellipsis2" className="page-item disabled"><span className="page-link border-0">...</span></li>);
    }
    if (serverTotalPages > 1) {
      pages.push(
        <li key={serverTotalPages} className={`page-item ${currentPage === serverTotalPages ? 'active' : ''}`}>
          <button className="page-link border-0 mx-1 rounded-2 shadow-sm" onClick={() => setCurrentPage(serverTotalPages)}>{serverTotalPages}</button>
        </li>
      );
    }
    return pages;
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '38px',
      fontSize: '14px',
      borderRadius: '8px',
      border: 'none',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
    }),
  };

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      {/* Filter Section with RESET Button */}
      <div className="card border-0 shadow-sm mb-4 rounded-4 bg-light">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">Search Student</label>
              <input type="text" className="form-control border-0 shadow-sm py-2" placeholder="Name, ID, Invoice..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">Category</label>
              <Select options={categories} placeholder="All Category" isClearable value={filterCategory} onChange={handleCategoryChange} styles={selectStyles} />
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">Fee Head</label>
              <Select options={heads} placeholder="All Head" isClearable value={filterHead} onChange={(val) => setFilterHead(val)} styles={selectStyles} />
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">From Date</label>
              <input type="date" className="form-control border-0 shadow-sm py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">To Date</label>
              <input type="date" className="form-control border-0 shadow-sm py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {/* রিসেট বাটন এখানে */}
            <div className="col-md-1 d-flex align-items-end">
              <button 
                className="btn btn-white w-100 fw-bold border-0 shadow-sm py-2 text-danger" 
                onClick={handleReset}
                title="Reset Filters"
              >
                <i className="fa fa-refresh0">Reset</i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-dark py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-white"><i className="fa fa-receipt me-2"></i> Payment Records</h5>
          <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => navigate('/student_fee')}>+ New Payment</button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-secondary small text-uppercase fw-bold">
                <tr>
                  <th className="ps-4">Date</th>
                  <th>Invoice No</th>
                  <th>Student Info</th>
                  <th>Fee Heads</th>
                  <th className="text-end">Paid Amount</th>
                  <th className="text-end pe-4">Due</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                ) : payments.length > 0 ? (
                  payments.map((item, idx) => (
                    <tr key={idx}>
                      <td className="ps-4 small text-muted fw-bold">{item.payment_date}</td>
                      <td className="fw-bold text-primary">{item.invoice_no}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={item.student_photo ? (item.student_photo.startsWith('http') ? item.student_photo : `${domain}${item.student_photo}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="rounded-circle me-3 border shadow-sm" style={{ width: "40px", height: "40px", objectFit: "cover" }} alt="S" />
                          <div>
                            <div className="fw-bold text-dark" style={{fontSize: '14px'}}>{item.student_full_name}</div>
                            <small className="text-primary fw-bold" style={{fontSize: '11px'}}>ID: {item.student_id_no}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {item.all_heads.map((h, i) => (
                            <span key={i} className="badge bg-info-subtle text-info border border-info-subtle rounded-pill" style={{fontSize: '10px'}}>{h}</span>
                          ))}
                        </div>
                      </td>
                      <td className="fw-bold text-end">{item.sum_amount.toLocaleString()} TK</td>
                      <td className={`fw-bold text-end pe-4 ${item.sum_due > 0 ? "text-danger" : "text-success"}`}>{item.sum_due.toLocaleString()} TK</td>
                      <td className="text-center">
                        <div className="btn-group shadow-sm bg-white border rounded-pill overflow-hidden">
                    <button 
  className="btn btn-sm btn-white border-end px-3" 
  title="Invoice" 
  onClick={() => {
    // এখানে item.student?.id অথবা item.student (যদি সরাসরি আইডি হয়) চেক করা হচ্ছে
    const studentId = item.student?.id || item.student || item.student_id;
    if (studentId && item.invoice_no) {
      navigate(`/verify-invoice/${studentId}/${item.invoice_no}`);
    } else {
      console.error("Student ID or Invoice No missing", item);
    }
  }}
>
  <i className="fa fa-eye text-info">🧾</i>
</button>
                          <button className="btn btn-sm btn-white px-3" 
                          onClick={() => navigate(`/student_payment/edit/${item.id}`)}>
                            <i className="fa fa-edit text-primary">✏️</i></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-5">No payments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="card-footer bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center px-2">
            <div className="text-muted small">Showing Page <strong>{currentPage}</strong> of <strong>{serverTotalPages}</strong></div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link border-0 rounded-2 shadow-sm me-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Prev</button>
                </li>
                {renderPaginationItems()}
                <li className={`page-item ${currentPage === serverTotalPages || serverTotalPages === 0 ? 'disabled' : ''}`}>
                  <button className="page-link border-0 rounded-2 shadow-sm ms-2" onClick={() => setCurrentPage(p => Math.min(serverTotalPages, p + 1))}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      
      <style>{`
        .page-item.active .page-link { background-color: #0d6efd !important; color: white !important; font-weight: bold; }
        .page-link { color: #555; transition: 0.2s; }
        .page-link:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
};

export default StudentPaymentListPage;