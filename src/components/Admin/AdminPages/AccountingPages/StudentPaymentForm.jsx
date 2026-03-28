import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { domain } from "../../../../env";
import * as CM from "../../../../componentExporter";
import "../../../../CSS/invoice.css";
import { QRCodeCanvas } from "qrcode.react"

const compactStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px', height: '40px', borderRadius: '10px',
    border: state.isFocused ? '1px solid #3b82f6' : '1px solid #dee2e6',
  }),
  valueContainer: (base) => ({ ...base, height: '40px', padding: '0 15px' }),
};

const StudentPaymentForm = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [feeRates, setFeeRates] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempFee, setTempFee] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
        try {
            const res = await CM.axiosInstance.get(`${domain}/api/accounts/?page_size=1000`);
            const results = res.data.results || res.data;
            // শুধু একটিভ অ্যাকাউন্টগুলো ফিল্টার করে দেখাচ্ছি
            const activeAccounts = results.filter(acc => acc.is_active).map(item => ({
                value: item.id,
                label: `${item.account_name} (${item.account_type.toUpperCase()})`
            }));
            setAccounts(activeAccounts);
        } catch (err) {
            console.error("Failed to load accounts", err);
        }
    };
    fetchAccounts();
}, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CM.axiosInstance.get(`${domain}/api/main-heads/?page_size=1000`);
        const data = res.data.results || res.data;
        setCategories(data.map(item => ({ value: item.main_head_name, label: item.main_head_name })));
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, []);

useEffect(() => {
  const fetchFilteredFees = async () => {
    try {
      setLoadingFees(true);
      // এখানে লজিক চেঞ্জ: ক্যাটাগরি থাকলে ফিল্টার হবে, না থাকলে সব আসবে
      let url = `${domain}/api/fee-rates/?page_size=1000`;
      if (selectedCategory) {
        url += `&category=${selectedCategory.value}`;
      }
      
      const res = await CM.axiosInstance.get(url);
      setFeeRates(res.data.results || res.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoadingFees(false); 
    }
  };
  fetchFilteredFees();
}, [selectedCategory]);

  const loadStudentOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const res = await CM.axiosInstance.get(`${domain}/api/student-payments/search_students/?q=${inputValue}`);
      return res.data; 
    } catch (err) { return []; }
  };

  const handleReset = () => {
    setSelectedStudent(null); setSelectedCategory(null);
    setTempFee(null); setSelectedFees([]);
  };


  // --- FIXED CONTRACT LOGIC BLOCK ---
 const handleAddButtonClick = async () => {
    if (!selectedStudent || !tempFee) return;
    try {
        const feeId = String(tempFee.value); 
        const currentStudentId = String(selectedStudent.value);

        // ১. লাস্ট পেমেন্ট চেক করা
        const paymentsRes = await CM.axiosInstance.get(`${domain}/api/student-payments/`, {
            params: { student: currentStudentId, page_size: 1000 }
        });
        const allPayments = paymentsRes.data.results || paymentsRes.data || [];
        const lastPayment = allPayments
            .filter(p => String(p.fees?.id || p.fees) === feeId)
            .sort((a, b) => b.id - a.id)[0];

        const lastTotalPaid = lastPayment ? (parseFloat(lastPayment.total_paid) || 0) : 0;
        
        // ২. পেমেন্ট কন্টাক্ট চেক করা
        const contractRes = await CM.axiosInstance.get(`${domain}/api/payment-contacts/by-student/${currentStudentId}/`);
        const contracts = contractRes.data || [];
        const specificContract = contracts.find(c => String(c.fees?.id || c.fees) === feeId);

        const hasContract = !!specificContract;
        const foundFee = feeRates.find(f => String(f.id) === feeId);
        const mainFeeAmount = foundFee ? parseFloat(foundFee.amount) : 0;
        
        // --- ক্যাটাগরি নেম লজিক ফিক্স ---
        // যদি ড্রপডাউন থেকে ক্যাটাগরি সিলেক্ট থাকে তবে সেটি নেবে, 
        // নাহলে ফি হেড এর ভেতর থেকে ক্যাটাগরি নেম খুঁজে বের করবে।
        const categoryName = selectedCategory?.label || foundFee?.category_name || "General";

        let currentDue = 0;
        let initialPayingAmount = 0;

        // ৩. আপনার অরিজিনাল প্রায়োরিটি লজিক
        if (hasContract) {
            const contractAmount = parseFloat(specificContract.amount) || 0;
            currentDue = Math.max(0, contractAmount - lastTotalPaid);
            initialPayingAmount = currentDue; 
        } 
        else if (lastPayment && parseFloat(lastPayment.new_due) > 0) {
            currentDue = parseFloat(lastPayment.new_due);
            initialPayingAmount = currentDue;
        }
        else {
            currentDue = 0;
            initialPayingAmount = mainFeeAmount;
        }

        setSelectedFees([...selectedFees, {
            feeId: feeId,
            head_name: tempFee.label.split(' (')[0],
            category_name: categoryName, // এখানে ফিক্সড ভ্যালু বসবে
            mainFeeAmount,
            contractAmount: hasContract ? parseFloat(specificContract.amount) : 0,
            totalPaidPrev: lastTotalPaid,
            oldDue: currentDue, 
            hasContract,
            paymentType: "2",
            discountType: "1",
            discountValue: 0,
            actualDiscount: 0,
            payingAmount: initialPayingAmount, 
            newDue: 0
        }]);
        setTempFee(null);
    } catch (err) { console.error("Add Error:", err); }
};

  const updateRow = (index, field, value) => {
    const updated = [...selectedFees];
    const row = updated[index];
    row[field] = value === '' ? 0 : (field === 'payingAmount' || field === 'discountValue' ? parseFloat(value) : value);

    let baseAmount = row.hasContract ? row.oldDue : (row.oldDue > 0 ? row.oldDue : row.mainFeeAmount);
    let discVal = parseFloat(row.discountValue) || 0;
    let actualDiscount = (!row.hasContract) ? (row.discountType === "2" ? (baseAmount * (discVal / 100)) : discVal) : 0;
    
    row.actualDiscount = actualDiscount; 
    const maxAllowed = Math.max(0, baseAmount - actualDiscount);

    if (row.paymentType === "2") row.payingAmount = maxAllowed;
    row.newDue = Math.max(0, baseAmount - row.payingAmount - actualDiscount);
    setSelectedFees(updated);
  };

const handleSubmit = async () => {
    // অ্যাকাউন্ট সিলেক্ট না করলে অ্যালার্ট দেবে
    if (!selectedAccount) {
        return CM.Swal.fire("Incomplete!", "Please select a receiving account.", "warning");
    }

    setIsSaving(true);
    try {
        let finalInvoiceNo = "";
        for (let i = 0; i < selectedFees.length; i++) {
            const fee = selectedFees[i];
            const res = await CM.axiosInstance.post(`${domain}/api/student-payments/`, {
                student: selectedStudent.value,
                payment_date: paymentDate,
                fees: fee.feeId,
                invoice_no: i === 0 ? "" : finalInvoiceNo,
                
                // --- New Fields ---
                account: selectedAccount.value, 
                // collected_by ব্যাকএন্ডে request.user থেকে অটো সেট হয়ে যাবে
                
                paymentType: fee.paymentType, 
                discount_type: fee.discountType,
                discount_value: fee.discountValue,
                old_due: fee.oldDue,
                amount: fee.payingAmount,
                total_paid: (parseFloat(fee.totalPaidPrev) || 0) + (parseFloat(fee.payingAmount) || 0),
                new_due: fee.newDue,
            });
            if (i === 0) finalInvoiceNo = res.data.invoice_no;
        }

        await CM.Swal.fire({
            title: "Success!",
            text: `Invoice ${finalInvoiceNo} created. Balance will update after approval.`,
            icon: "success",
            confirmButtonColor: "#3b82f6"
        });

        navigate('/student_fee_list');
    } catch (err) {
        console.error("Submit Error:", err);
        CM.Swal.fire("Error", "Could not save payment.", "error");
    } finally {
        setIsSaving(false);
    }
};

  return (
    <div className="container-fluid mt-2 pb-5">
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-3">
          
          {/* Student Profile Header */}
          <div className="row g-2 align-items-center mb-4">
            <div className="col-md-10">
              {!selectedStudent ? (
                <AsyncSelect cacheOptions loadOptions={loadStudentOptions} onChange={setSelectedStudent} placeholder="Search Student..." styles={compactStyles} />
              ) : (
                <div className="position-relative bg-white border rounded-4 p-2 shadow-sm d-flex align-items-center" style={{ minHeight: '80px', borderLeft: '5px solid #3b82f6' }}>
                  <img src={selectedStudent.photo ? (selectedStudent.photo.startsWith('http') ? selectedStudent.photo : `${domain}${selectedStudent.photo}`) : "https://via.placeholder.com/65"} className="rounded-circle border border-2 border-primary-subtle ms-2 me-3" style={{ width: "65px", height: "65px", objectFit: "cover" }} />
                  <div className="row flex-grow-1 g-2 small fw-bold">
                    <div className="col-md-3"><span className="text-muted d-block">NAME</span>{selectedStudent.first_name}</div>
                    <div className="col-md-2"><span className="text-muted d-block">ID</span><span className="text-primary">#{selectedStudent.student_id_no}</span></div>
                    <div className="col-md-4 border-start ps-3"><span className="text-muted d-block">PROGRAM</span>{selectedStudent.program || 'N/A'}</div>
                    <div className="col-md-3 border-start ps-3"><span className="text-muted d-block">MOBILE</span>{selectedStudent.mobile}</div>
                  </div>
                  <button 
  className="btn btn-sm btn-light text-danger position-absolute d-flex align-items-center justify-content-center shadow-sm" 
  onClick={handleReset} 
  style={{ 
    right: '-10px', 
    top: '-10px', 
    borderRadius: '50%', 
    width: '28px', 
    height: '28px', 
    padding: '0',
    border: '1px solid #ffc107', // হালকা বর্ডার দিলে বাটনটা ফুটে উঠবে
    zIndex: '10'
  }}
  title="Reset Student"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    fill="currentColor" 
    viewBox="0 0 16 16"
  >
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
</button>
                </div>
              )}
            </div>
            <div className="col-md-2">
              <label className="text-muted mb-1 d-block fw-bold small">DATE</label>
              <input type="date" className="form-control" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
          </div>
          <div className="row g-2 md-3 align-items-center mb-2">
            {/* Receiving Account Selection */}
            
                <div className="col-md-4">
                    <label className="text-muted mb-1 d-block fw-bold small">RECEIVING ACCOUNT *</label>
                    <Select 
                        options={accounts} 
                        value={selectedAccount} 
                        onChange={setSelectedAccount} 
                        placeholder="Search & Select Account (Cash/Bank)..." 
                        styles={compactStyles}
                        isClearable
                    />
                
            </div>
          </div>

          {/* Fee Selection */}
          <div className="row g-2 mb-3 align-items-center">
                    {/* First Select: Category */}
                    <div className="col-md-5">
                      <Select
                      options={categories}
                      styles={compactStyles}
                      onChange={(s) => {
                        setSelectedCategory(s); // ক্যাটাগরি সেট হবে
                        setTempFee(null);       // ক্যাটাগরি বদলালে আগের হেড ক্লিয়ার হবে
                      }}
                      value={selectedCategory} // value টা অবশ্যই দিয়ে দেবেন
                      placeholder="Category"
                      isClearable
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                    />
                    </div>

                    {/* Second Select: Fee Head */}
                    <div className="col-md-5">
                     <Select
                      isLoading={loadingFees}
                      options={feeRates.map(f => ({ value: f.id, label: `${f.head_name} (${f.amount} TK)` }))}
                      onChange={setTempFee}
                      value={tempFee}
                      // isDisabled={!selectedCategory}  <-- এই লাইনটি পুরোপুরি কেটে দিন
                      placeholder="Select Fee Head"
                      styles={compactStyles}
                      isClearable // এটি যোগ করলে ইউজার হেড ক্লিয়ার করতে পারবে
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                    />
                    </div>

                    {/* Add Button */}
                    <div className="col-md-2">
                      <button
                        className="btn btn-primary w-100 fw-bold shadow-sm"
                        style={{ height: '40px' }}
                        onClick={handleAddButtonClick}
                        disabled={!tempFee}
                      >
                        ADD FEE
                      </button>
                    </div>
                  </div>

          {/* Table with 11 Columns */}
          <div className="table-responsive shadow-sm rounded-4 border">
            <table className="table table-sm table-hover align-middle mb-0 bg-white text-center">
              <thead className="bg-dark text-white" style={{fontSize: '11px'}}>
                <tr>
                  <th className="py-2 ps-3 text-start">Category</th>
                  <th className="text-start">Head Name</th>
                  <th>Main Fee</th>
                  <th>Contract</th>
                  <th>Prev Paid</th>
                  <th>Due</th>
                  <th style={{ width: '130px' }}>Discount</th>
                  <th style={{ width: '100px' }}>Type</th>
                  <th>Paying</th>
                  <th className="text-danger">New Due</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody style={{fontSize: '12px'}}>
                {selectedFees.map((fee, index) => (
                  <tr key={index} className="border-bottom">
                    <td className="ps-3 text-start text-muted">{fee.category_name}</td>
                    <td className="text-start fw-bold">{fee.head_name}</td>
                    <td>{fee.mainFeeAmount}</td>
                    <td>{fee.contractAmount > 0 ? fee.contractAmount : 'None'}</td>
                    <td className="text-success">{fee.totalPaidPrev}</td>
                    <td className="text-primary fw-bold">{fee.oldDue}</td>
                    <td>
                        {!fee.hasContract && (
                            <div className="input-group input-group-sm shadow-sm rounded-2 overflow-hidden" style={{ width: '130px' }}>
    {/* Select box - ছোট সাইজ (flex: 1) */}
   <select 
    className="form-select border-0 bg-light fw-bold text-primary shadow-none" 
    style={{ 
        flex: '0 0 55px',          // উইডথ কিছুটা কমিয়ে ফিট করা হয়েছে
        paddingLeft: '4px',        // সামান্য প্যাডিং যাতে একদম বর্ডারে লেগে না যায়
        paddingRight: '2px',       // অ্যারোর জন্য ডানদিকের প্যাডিং
        backgroundImage: 'none',    // বুটস্ট্র্যাপের বড় অ্যারো রিমুভ
        fontSize: '11px',
        cursor: 'pointer',
        appearance: 'none',        // ডিফল্ট স্টাইল পুরোপুরি রিমুভ
        textAlign: 'center',       // লেখা এবং সিম্বল মাঝখানে রাখার জন্য
    }} 
    value={fee.discountType} 
    onChange={(e) => updateRow(index, 'discountType', e.target.value)}
>
    {/* এখানে সিম্বলটি টেক্সটের সাথে যুক্ত করে দেওয়া হয়েছে */}
    <option value="1">TK ▾</option>
    <option value="2">% ▾</option>
</select>

    {/* Input box - বড় সাইজ (flex: 3) */}
    <input 
        type="number" 
        className="form-control border-0 bg-white" 
        style={{ flex: '2' }}
        placeholder="0"
        value={fee.discountValue || ''} 
        onChange={(e) => updateRow(index, 'discountValue', e.target.value)} 
    />
</div>
                        )}
                    </td>
                    <td><select className="form-select form-select-sm border-0 bg-light" value={fee.paymentType} onChange={(e) => updateRow(index, 'paymentType', e.target.value)}><option value="1">Partial</option><option value="2">Full</option></select></td>
                    <td><input type="number" className="form-control form-control-sm text-center fw-bold" value={fee.payingAmount || ''} disabled={fee.paymentType === "2"} onChange={(e) => updateRow(index, 'payingAmount', e.target.value)} style={{ width: '80px', margin: 'auto' }} /></td>
                    <td className="fw-bold text-danger">{fee.newDue}</td>
                    <td className="text-center">
  <button 
    className="btn btn-link p-0 border-0" 
    style={{ color: '#dc3545', transition: 'transform 0.2s' }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onClick={() => setSelectedFees(selectedFees.filter((_, i) => i !== index))}
    title="Remove Fee"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      fill="currentColor" 
      viewBox="0 0 16 16"
    >
      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5a.5.5 0 0 1 .471-.532zm3.016.53a.5.5 0 0 1 .998.06l-.5 8.5a.5.5 0 1 1-.998-.06zm3.016-.53a.5.5 0 0 1 .471.532l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47z"/>
    </svg>
  </button>
</td>
                   </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "none" }}>
              <QRCodeCanvas 
                id="hidden-qr-canvas" 
                value={`http://192.168.100.150:3000/verify-invoice/${selectedStudent?.student_id_no}/${paymentDate}`} 
                size={128} 
                includeMargin={true}
              />
            </div>
          </div>

          {/* Summary Row */}
          {selectedFees.length > 0 && (
            <div className="mt-3 p-2 bg-dark text-white rounded-3 d-flex justify-content-around align-items-center fw-bold small shadow">
              <div>TOTAL DUE: <span className="text-warning">{selectedFees.reduce((a, b) => a + (parseFloat(b.oldDue) || 0), 0).toFixed(2)}</span></div>
              <div className="text-white-50">|</div>
              <div>DISCOUNT: <span className="text-danger">{selectedFees.reduce((a, b) => a + (parseFloat(b.actualDiscount) || 0), 0).toFixed(2)}</span></div>
              <div className="text-white-50">|</div>
              <div>NET PAYABLE: <span className="text-info">{(selectedFees.reduce((a, b) => a + (parseFloat(b.oldDue) || 0), 0) - selectedFees.reduce((a, b) => a + (parseFloat(b.actualDiscount) || 0), 0)).toFixed(2)}</span></div>
              <div className="text-white-50">|</div>
              <div>TOTAL PAYING: <span className="text-success">{selectedFees.reduce((a, b) => a + (parseFloat(b.payingAmount) || 0), 0).toFixed(2)}</span></div>
              <div className="text-white-50">|</div>
              <div>REMAINING: <span className="text-warning">{selectedFees.reduce((a, b) => a + (parseFloat(b.newDue) || 0), 0).toFixed(2)}</span></div>
            </div>
          )}

          <div className="text-end mt-4">
            <button className="btn btn-success px-5 py-2 fw-bold rounded-pill shadow-lg" onClick={handleSubmit} disabled={isSaving || selectedFees.length === 0}>
              {isSaving ? "SAVING..." : "POST & PRINT INVOICE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentForm;