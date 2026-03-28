import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { domain } from "../../../../env";
import * as CM from "../../../../componentExporter";

const AccountTransactionListPage = () => {
    const navigate = useNavigate();
    const brandColor = "#0d6efd"; 

    // --- States ---
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 20;

    // --- Filter States ---
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [transactionType, setTransactionType] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchRef, setSearchRef] = useState("");

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

    // --- Fetch Accounts for Filter ---
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await CM.axiosInstance.get(`${domain}/api/accounts/`);
                const data = res.data.results || res.data;
                setAccounts(data.map(a => ({ value: a.id, label: `${a.account_name} (${a.account_type})` })));
            } catch (err) { console.error(err); }
        };
        fetchAccounts();
    }, []);

const fetchData = useCallback(async (page) => {
    setLoading(true);
    console.log("--- Fetching Transaction Data ---");
    console.log("Target Page:", page);
    
    try {
        let url = `${domain}/api/account-transactions/?page=${page}&page_size=${itemsPerPage}`;
        
        // ফিল্টার চেক
        if (selectedAccount) url += `&account=${selectedAccount.value}`;
        if (transactionType) url += `&transaction_type=${transactionType.value}`;
        if (paymentMethod) url += `&payment_method=${paymentMethod.value}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (searchRef) url += `&search=${searchRef}`;

        console.log("Requesting URL:", url);

        const res = await CM.axiosInstance.get(url);
        
        console.log("API Full Response:", res.data); // এটি ব্রাউজার কনসোলে চেক করুন

        // জ্যাঙ্গো যদি পেজিনেশন ছাড়া ডাটা দেয় তবে সরাসরি res.data আসবে, নতুবা res.data.results
        const responseData = res.data.results !== undefined ? res.data.results : res.data;
        const totalRecords = res.data.count !== undefined ? res.data.count : (Array.isArray(res.data) ? res.data.length : 0);

        console.log("Processed Transactions:", responseData);
        console.log("Total Count:", totalRecords);

        if (Array.isArray(responseData)) {
            setTransactions(responseData);
            setTotalCount(totalRecords);
        } else {
            console.error("Data received is not an array. Check Serializer.");
            setTransactions([]);
        }

    } catch (err) { 
        console.error("Axios Fetch Error:", err.response || err);
        // যদি ৪0৪ দেয় তবে ইউআরএল ভুল, যদি ৫00 দেয় তবে ব্যাকএন্ডে সমস্যা
    }
    setLoading(false);
}, [selectedAccount, transactionType, paymentMethod, startDate, endDate, searchRef]); // এখানে currentPage দেওয়ার দরকার নেই, কারণ এটি প্যারামিটার হিসেবে আসছে

// এই useEffect টি শুধু fetchData এবং currentPage এ নজর রাখবে
useEffect(() => { 
    fetchData(currentPage); 
}, [currentPage, fetchData]);

    const handleReset = () => {
        setSelectedAccount(null); setTransactionType(null); setPaymentMethod(null);
        setStartDate(""); setEndDate(""); setSearchRef(""); setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="container-fluid mt-2">
            {/* --- Filter Section --- */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 bg-white p-3">
                <div className="row g-2">
                    <div className="col-lg-3">
                        <label className="small fw-bold text-muted mb-1">Account</label>
                        <Select styles={compactSelectStyles} options={accounts} isClearable value={selectedAccount} onChange={v => setSelectedAccount(v)} placeholder="All Accounts" />
                    </div>
                    <div className="col-lg-2">
                        <label className="small fw-bold text-muted mb-1">Type</label>
                        <Select styles={compactSelectStyles} options={[{value:'income', label:'Income'}, {value:'expense', label:'Expense'}]} isClearable value={transactionType} onChange={v => setTransactionType(v)} placeholder="All Types" />
                    </div>
                    <div className="col-lg-2">
                        <label className="small fw-bold text-muted mb-1">Method</label>
                        <Select styles={compactSelectStyles} options={[{value:'cash', label:'Cash'}, {value:'bank', label:'Bank'}]} isClearable value={paymentMethod} onChange={v => setPaymentMethod(v)} placeholder="Method" />
                    </div>
                    <div className="col-lg-3">
                        <label className="small fw-bold text-muted mb-1">Date Range</label>
                        <div className="input-group">
                            <input type="date" className="form-control shadow-none match-focus" style={{height:'38px', borderRadius: '8px 0 0 8px', fontSize:'13px'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <input type="date" className="form-control shadow-none match-focus" style={{height:'38px', borderRadius: '0 8px 8px 0', fontSize:'13px'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-lg-2 d-flex gap-2 align-items-end">
                        <button className="btn btn-primary w-100 fw-bold shadow-sm" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={() => fetchData(1)}>Search</button>
                        <button className="btn btn-outline-danger w-100 fw-bold shadow-sm" style={{height:'38px', borderRadius:'8px', fontSize:'13px'}} onClick={handleReset}>Reset</button>
                    </div>
                </div>
            </div>

            {/* --- Transaction Table --- */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-white border-bottom shadow-sm">
                            <tr className="text-uppercase fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '0.6px', backgroundColor: '#fcfcfd' }}>
                                <th className="ps-4 py-3">Date</th>
                                <th>Account & Ref</th>
                                <th>Purpose</th>
                                <th className="text-end">Previous</th>
                                <th className="text-end">Amount</th>
                                <th className="text-end">Balance</th>
                                <th className="text-center">Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && transactions.map((tr, idx) => (
                                <tr key={idx} className="border-bottom" style={{ transition: 'all 0.2s ease' }}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark mb-0" style={{ fontSize: '11px' }}>
                                            {new Date(tr.transaction_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '10px' }}>
                                            {new Date(tr.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-primary" style={{ fontSize: '12px' }}>{tr.account_name}</div>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>Ref: {tr.reference_no}</div>
                                    </td>
                                    <td style={{ fontSize: '11px', maxWidth: '200px' }} className="text-truncate">
                                        {tr.purpose}
                                    </td>
                                    <td className="text-end text-muted fw-semibold" style={{ fontSize: '12px' }}>
                                        {parseFloat(tr.previous_balance).toLocaleString()}
                                    </td>
                                    <td className={`text-end fw-bold ${tr.transaction_type === 'income' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '13px' }}>
                                        {tr.transaction_type === 'income' ? '+' : '-'} {parseFloat(tr.amount).toLocaleString()}
                                    </td>
                                    <td className="text-end">
                                        <span className="fw-bold text-dark px-2 py-1 rounded" style={{ backgroundColor: '#f1f5f9', fontSize: '13px' }}>
                                            {parseFloat(tr.new_balance).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-light text-secondary border fw-medium text-uppercase" style={{ fontSize: '9px', borderRadius: '5px' }}>
                                            {tr.payment_method}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
                    <div className="small fw-bold text-muted text-uppercase">
                        Showing Page {currentPage} of {totalPages}
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-sm btn-light border fw-bold" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</button>
                         <button className="btn btn-sm btn-light border fw-bold" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                         <button className="btn btn-sm btn-primary fw-bold px-3">{currentPage}</button>
                         <button className="btn btn-sm btn-light border fw-bold" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                         <button className="btn btn-sm btn-light border fw-bold" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>Last</button>
                    </div>
                </div>
            </div>

            <style>{`
                .match-focus:focus { 
                    border-color: ${brandColor} !important; 
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
                }
                .table-hover tbody tr:hover { background-color: #f8faff !important; }
            `}</style>
        </div>
    );
};

export default AccountTransactionListPage;