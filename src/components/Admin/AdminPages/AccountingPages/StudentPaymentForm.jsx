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
      if (!selectedCategory) { setFeeRates([]); return; }
      try {
        setLoadingFees(true);
        const res = await CM.axiosInstance.get(`${domain}/api/fee-rates/`, {
          params: { category: selectedCategory.value, page_size: 1000 }
        });
        setFeeRates(res.data.results || res.data);
      } catch (err) { console.error(err); } finally { setLoadingFees(false); }
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

  // --- Invoice Print ---
const handlePrint = (invoiceNo, student, fees) => {
  const printWindow = window.open('', '_blank');
  
  const qrCanvas = document.getElementById("hidden-qr-canvas");
  const qrImage = qrCanvas ? qrCanvas.toDataURL("image/png") : "";

  const companyLogo = "https://via.placeholder.com/150x50?text=YOUR+LOGO"; 
  const companyName = "ABC INTERNATIONAL SCHOOL";
  const companyAddress = "123 Education Ave, Dhaka, Bangladesh";

  // ক্যালকুলেশন
  const totalFee = fees.reduce((a, b) => a + (parseFloat(b.oldDue > 0 ? b.oldDue : b.mainFeeAmount) || 0), 0);
  const totalPaid = fees.reduce((a, b) => a + (parseFloat(b.payingAmount) || 0), 0);
  const totalDue = fees.reduce((a, b) => a + (parseFloat(b.newDue) || 0), 0);

  const content = `
    <html>
      <head>
        <title>Invoice - ${invoiceNo}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; color: #333; margin: 0; padding: 20px; line-height: 1.3; }
          .invoice-box { max-width: 950px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; background: #fff; }
          
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; }
          .company-info h2 { margin: 0; color: #1e3a8a; font-size: 24px; text-transform: uppercase; }
          .company-info p { margin: 2px 0; font-size: 12px; color: #666; }

          .meta-section { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 6px; }
          .meta-box p { margin: 3px 0; font-size: 13px; }

          /* ১০ কলামের টেবিল স্টাইল */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1e3a8a; color: white; padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #eee; text-align: center; font-size: 12px; }
          .text-left { text-align: left; }

          /* সামারি সেকশন */
          .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 10px; }
          .summary-table-box { width: 250px; background: #f1f5f9; padding: 12px; border-radius: 6px; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          .summary-row:last-child { border-bottom: none; color: #dc2626; font-weight: bold; }
          .paid-text { color: #059669; font-weight: bold; }

          /* সিগনেচার ও কিউআর লেআউট */
          .footer-layout { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; text-align: center; }
          .sig-column { width: 180px; }
          .sig-line { border-top: 1.5px solid #333; padding-top: 5px; font-weight: bold; font-size: 12px; }
          .qr-column { width: 110px; }
          .qr-column img { width: 90px; height: 90px; border: 1px solid #ddd; padding: 3px; background: #fff; }
          .qr-text { font-size: 9px; color: #64748b; margin-top: 4px; }

          @media print { .invoice-box { border: none; padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="logo-area"><img src="${companyLogo}" style="max-width: 140px;"></div>
            <div class="company-info">
              <h2>${companyName}</h2>
              <p>${companyAddress}</p>
              <p>Web: www.school.com | Email: info@school.com</p>
            </div>
          </div>

          <div class="meta-section">
            <div class="meta-box">
              <p><b>STUDENT:</b> ${student.first_name}</p>
              <p><b>ID:</b> #${student.student_id_no}</p>
              <p><b>PROGRAM:</b> ${student.program || 'N/A'}</p>
            </div>
            <div class="meta-box" style="text-align: right;">
              <p><b>INVOICE NO:</b> ${invoiceNo}</p>
              <p><b>DATE:</b> ${paymentDate}</p>
              <p><b>STATUS:</b> <span style="color: green; font-weight: bold;">PAID</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-left">Category</th>
                <th class="text-left">Head Name</th>
                <th>Main Amount</th>
                <th>Contract</th>
                <th>Prev Paid</th>
                <th>Due</th>
                <th>Discount</th>
                <th>Type</th>
                <th>Paying</th>
                <th>New Due</th>
              </tr>
            </thead>
            <tbody>
              ${fees.map(f => `
                <tr>
                  <td class="text-left">${f.category_name}</td>
                  <td class="text-left"><b>${f.head_name}</b></td>
                  <td>${parseFloat(f.mainFeeAmount).toFixed(2)}</td>
                  <td>${f.contractAmount > 0 ? parseFloat(f.contractAmount).toFixed(2) : 'None'}</td>
                  <td>${parseFloat(f.totalPaidPrev).toFixed(2)}</td>
                  <td>${parseFloat(f.oldDue).toFixed(2)}</td>
                  <td>${parseFloat(f.actualDiscount).toFixed(2)}</td>
                  <td>${f.paymentType === "2" ? "Full" : "Partial"}</td>
                  <td style="font-weight: bold;">${parseFloat(f.payingAmount).toFixed(2)}</td>
                  <td style="color: red; font-weight: bold;">${parseFloat(f.newDue).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-wrapper">
            <div class="summary-table-box">
              <div class="summary-row">
                <span>Total Fee:</span>
                <span>${totalFee.toFixed(2)} TK</span>
              </div>
              <div class="summary-row paid-text">
                <span>Paid Amount:</span>
                <span>${totalPaid.toFixed(2)} TK</span>
              </div>
              <div class="summary-row">
                <span>Total Due:</span>
                <span>${totalDue.toFixed(2)} TK</span>
              </div>
            </div>
          </div>

          <div class="footer-layout">
            <div class="sig-column">
              <div class="sig-line">Student Signature</div>
            </div>
            
            <div class="qr-column">
              <img src="${qrImage}" alt="QR Code">
              <div class="qr-text">Scan to Verify</div>
            </div>

            <div class="sig-column">
              <div class="sig-line">Authorized Signature</div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 10px;">
            This is a system-generated money receipt and does not require a physical seal.
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
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
      
      // ২. পেমেন্ট কন্টাক্ট চেক করা (Crucial Fix)
      const contractRes = await CM.axiosInstance.get(`${domain}/api/payment-contacts/by-student/${currentStudentId}/`);
      const contracts = contractRes.data || [];
      const specificContract = contracts.find(c => String(c.fees?.id || c.fees) === feeId);

      const hasContract = !!specificContract;
      const foundFee = feeRates.find(f => String(f.id) === feeId);
      const mainFeeAmount = foundFee ? parseFloat(foundFee.amount) : 0;
      
      let currentDue = 0;
      let initialPayingAmount = 0;

      // ৩. আপনার অরিজিনাল প্রায়োরিটি লজিক
      if (hasContract) {
        // যদি কন্টাক্ট থাকে: কন্টাক্ট অ্যামাউন্ট - আগের মোট জমা
        const contractAmount = parseFloat(specificContract.amount) || 0;
        currentDue = Math.max(0, contractAmount - lastTotalPaid);
        initialPayingAmount = currentDue; 
      } 
      else if (lastPayment && parseFloat(lastPayment.new_due) > 0) {
        // যদি কন্টাক্ট না থাকে কিন্তু আগের ডিউ থাকে
        currentDue = parseFloat(lastPayment.new_due);
        initialPayingAmount = currentDue;
      }
      else {
        // নতুন পেমেন্ট
        currentDue = 0;
        initialPayingAmount = mainFeeAmount;
      }

      setSelectedFees([...selectedFees, {
        feeId: feeId,
        head_name: tempFee.label.split(' (')[0],
        category_name: selectedCategory?.label,
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
    setIsSaving(true);
    try {
      let finalInvoiceNo = "";
      for (let i = 0; i < selectedFees.length; i++) {
        const fee = selectedFees[i];
        const res = await CM.axiosInstance.post(`${domain}/api/student-payments/`, {
          student: selectedStudent.value, payment_date: paymentDate, fees: fee.feeId,
          invoice_no: i === 0 ? "" : finalInvoiceNo, payment_type: fee.paymentType,
          discount_type: fee.discountType, discount_value: fee.discountValue,
          old_due: fee.oldDue, amount: fee.payingAmount,
          total_paid: (parseFloat(fee.totalPaidPrev) || 0) + (parseFloat(fee.payingAmount) || 0),
          new_due: fee.newDue, payment_approved: true
        });
        if (i === 0) finalInvoiceNo = res.data.invoice_no;
      }
      await CM.Swal.fire({ title: "Success", text: `Payment Recorded: ${finalInvoiceNo}`, icon: "success" });
      handlePrint(finalInvoiceNo, selectedStudent, selectedFees);
      navigate('/student_fee_list');
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
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
                  <button className="btn btn-sm btn-light text-danger position-absolute" onClick={handleReset} style={{ right: '-5px', top: '-5px', borderRadius: '50%' }}><i className="bi bi-x-lg"></i></button>
                </div>
              )}
            </div>
            <div className="col-md-2">
              <label className="text-muted mb-1 d-block fw-bold small">DATE</label>
              <input type="date" className="form-control" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
          </div>

          {/* Fee Selection */}
          <div className="row g-2 mb-3 p-3 bg-light border rounded-4 border-dashed">
            <div className="col-md-5"><Select options={categories} styles={compactStyles} onChange={(s) => setSelectedCategory(s)} placeholder="Category" isClearable /></div>
            <div className="col-md-5"><Select isLoading={loadingFees} options={feeRates.map(f => ({ value: f.id, label: `${f.head_name} (${f.amount} TK)` }))} onChange={setTempFee} value={tempFee} isDisabled={!selectedCategory} placeholder="Select Fee Head" styles={compactStyles} /></div>
            <div className="col-md-2"><button className="btn btn-primary w-100 fw-bold shadow-sm" style={{ height: '40px' }} onClick={handleAddButtonClick} disabled={!tempFee}>ADD FEE</button></div>
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
                            <div className="input-group input-group-sm">
                                <select className="form-select border-0 bg-light" value={fee.discountType} onChange={(e) => updateRow(index, 'discountType', e.target.value)}><option value="1">৳</option><option value="2">%</option></select>
                                <input type="number" className="form-control border-0 bg-light" value={fee.discountValue || ''} onChange={(e) => updateRow(index, 'discountValue', e.target.value)} />
                            </div>
                        )}
                    </td>
                    <td><select className="form-select form-select-sm border-0 bg-light" value={fee.paymentType} onChange={(e) => updateRow(index, 'paymentType', e.target.value)}><option value="1">Partial</option><option value="2">Full</option></select></td>
                    <td><input type="number" className="form-control form-control-sm text-center fw-bold" value={fee.payingAmount || ''} disabled={fee.paymentType === "2"} onChange={(e) => updateRow(index, 'payingAmount', e.target.value)} style={{ width: '80px', margin: 'auto' }} /></td>
                    <td className="fw-bold text-danger">{fee.newDue}</td>
                    <td><button className="btn btn-link text-danger p-0" onClick={() => setSelectedFees(selectedFees.filter((_, i) => i !== index))}><i className="bi bi-trash3-fill"></i></button></td>
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