import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { domain } from "../../../../env";
import { QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom"; // ১. ইমপোর্ট
import html2canvas from "html2canvas";

const InvoiceVerification = () => {
    const navigate = useNavigate();
    const { student_id, invoice_no } = useParams();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                const res = await axios({
                    method: 'get',
                    url: `${domain}/api/invoice-verify/verify/${student_id}/${invoice_no}/`,
                    withCredentials: false 
                });
                
                setInvoiceData(res.data);
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Verification Failed',
                    text: 'Could not fetch invoice data. Please check the URL or your connection.',
                });
                setError("Data not found");
            } finally {
                setLoading(false);
            }
        };
        if (student_id && invoice_no) fetchInvoice();
    }, [student_id, invoice_no]);

    const handleDownloadPDF = async () => {
        const element = document.getElementById("print-area");
        setDownloading(true);
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${invoice_no}.pdf`);
            
            Swal.fire({ icon: 'success', title: 'Downloaded!', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to generate PDF.' });
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div><p>Verifying...</p></div>;
    if (error) return <div className="text-center p-5 text-danger"><h4>{error}</h4></div>;
    if (!invoiceData) return null;

    const { student, payments, summary } = invoiceData;

    return (
        <div className="container-fluid py-5 bg-secondary-subtle min-vh-100">
            {/* Control Buttons */}
            <div className="text-center mb-4 no-print d-flex justify-content-center gap-3">
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-dark px-4 fw-bold shadow" 
                        onClick={() => window.print()}
                    >
                        PRINT
                    </button>
                    
                    <button 
                        className="btn btn-primary px-4 fw-bold shadow" 
                        onClick={handleDownloadPDF} 
                        disabled={downloading}
                    >
                        {downloading ? "Processing..." : "DOWNLOAD PDF"}
                    </button>
                     <button 
                        className="btn ml-4 btn-outline-secondary px-4 fw-bold shadow-sm" 
                        onClick={() => navigate('/student_fee_list')}
                        style={{ borderRadius: '20px' }}
                    >
                        <i className="bi bi-arrow-left me-2"></i> BACK
                    </button>
                </div>
            </div>
            </div>

            {/* Main Invoice Box */}
            <div id="print-area" className="invoice-box-custom">
                {/* Header */}
                <div className="header-custom">
                    <div className="company-info-custom">
                        <h2>{invoiceData.institution.name}</h2>
                        <p>{invoiceData.institution.address}</p>
                        <p>Web: {invoiceData.institution.website} | Email: {invoiceData.institution.email}</p>
                    </div>
                    <div className="logo-area-custom text-end">
                        <h1 style={{color: '#1e3a8a', fontWeight: '900', margin: 0}}>INVOICE</h1>
                    </div>
                </div>

                {/* Meta Section */}
                <div className="meta-section-custom">
                    <div className="meta-box-custom">
                        <p><b>STUDENT:</b> {student?.first_name}</p>
                        <p><b>ID:</b> #{student?.student_id_no}</p>
                        <p><b>PROGRAM:</b> {student?.program || 'N/A'}</p>
                    </div>
                    <div className="meta-box-custom text-end">
                        <p><b>INVOICE NO:</b> {invoice_no}</p>
                        <p><b>DATE:</b> {payments[0]?.payment_date || 'N/A'}</p>
                     
                        <p>
    <b>STATUS:</b> 
    {/* (val === true || val === 1) চেক করলে সব ফরম্যাটেই কাজ করবে */}
    <span className={(payments[0]?.payment_approved === true || payments[0]?.payment_approved === 1) 
        ? "text-success fw-bold" 
        : "text-danger fw-bold"}>
        {(payments[0]?.payment_approved === true || payments[0]?.payment_approved === 1) 
            ? " APPROVED" 
            : " PENDING"}
    </span>
</p>
                        
                 
                    </div>
                </div>

                {/* Detailed Table */}
                <table className="invoice-table-custom">
                    <thead>
                        <tr>
                            <th className="text-left">Category</th>
                            <th className="text-left">Head Name</th>
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
                    
<tbody style={{ fontSize: '12px' }}>
  {payments && payments.map((f, idx) => (
    <tr key={idx}>
      <td className="text-left">{f.category_name}</td>
      <td className="text-left"><b>{f.head_name}</b></td>
      
      {/* ১. Main Fee */}
      <td>{parseFloat(f.mainFeeAmount || 0).toFixed(2)}</td>
      
      {/* ২. Contract Amount (আগের ভিউতে যা ছিল) */}
      <td>{parseFloat(f.contractAmount || 0).toFixed(2)}</td>
      
      {/* ৩. Prev Paid (যা আগে আসছিল না) */}
      <td className="fw-bold">{parseFloat(f.totalPaidPrev || 0).toFixed(2)}</td>
      
      {/* ৪. Old Due */}
      <td>{parseFloat(f.oldDue || 0).toFixed(2)}</td>
      
      {/* ৫. Discount */}
      <td className="text-danger">
    {/* ডিসকাউন্ট যদি ০ এর বেশি হয় তবেই চিহ্ন দেখাবে */}
    {parseFloat(f.actualDiscount || 0) > 0 ? (
        <>
            -{parseFloat(f.actualDiscount).toFixed(2)} 
            {/* ডিসকাউন্ট টাইপ ২ হলে % আর ১ হলে TK */}
            {f.discount_type === "2" ? "%" : " TK"}
        </>
    ) : (
        "0.00"
    )}
</td>
      
      {/* ৬. Payment Type */}
      <td>
             <span className={`badge ${f.paymentType === "Full Payment" ? 'bg-success-subtle' : 'bg-warning-subtle'} text-dark`}>
                    {f.paymentType}
            </span>
        </td>
      
      {/* ৭. Current Paid (Paying Amount) */}
      <td style={{ fontWeight: 'bold' }} className="text-success">
        {parseFloat(f.payingAmount || 0).toFixed(2)}
      </td>
      
      {/* ৮. New Due */}
      <td style={{ color: '#dc2626', fontWeight: 'bold' }}>
        {parseFloat(f.newDue || 0).toFixed(2)}
      </td>
    </tr>
  ))}
</tbody>
                </table>

{/* Summary and Footer Integrated Section */}
{/* Summary and Footer Integrated Section */}
<div className="footer-wrapper-custom mt-5 pt-4 border-top">
    <div className="row align-items-center mb-4">
        
        {/* বাম পাশ: QR Code */}
        <div className="col-4">
            <div className="d-flex align-items-center">
                <div className="qr-container p-2 bg-white border rounded shadow-sm">
                    <QRCodeCanvas value={window.location.href} size={85} />
                    <small className="d-block text-center mt-1 text-muted" style={{ fontSize: '9px' }}>SCAN TO VERIFY</small>
                </div>
            </div>
        </div>

        {/* মাঝখানে: Security Seal (আপনার চাওয়া পজিশন) */}
        <div className="col-4 text-center">
    {(payments[0]?.payment_approved === true || payments[0]?.payment_approved === 1) && (
         <div className="security-seal-flex">
        {/* নার্সিং থিমড রাবার স্ট্যাম্প */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="nursing-stamp">
            <defs>
                <filter id="nursingGrunge">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -0.8 1"/>
                    <feComposite operator="in" in2="SourceGraphic"/>
                </filter>
            </defs>
            
            <g filter="url(#nursingGrunge)">
                {/* আউটার বর্ডার */}
                <circle cx="60" cy="60" r="56" fill="none" stroke="#22ba04" strokeWidth="2.5" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#08c848" strokeWidth="1" />
                
                {/* নার্সিং সিম্বল: প্লাস এবং হার্টবিট লাইন */}
                <g transform="translate(48, 15) scale(0.4)">
                   <path d="M5 30 h10 l5 -15 l10 35 l8 -20 h15" stroke="#b91c1c" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                   <rect x="-5" y="20" width="10" height="20" fill="#b91c1c" rx="2" />
                   <rect x="55" y="20" width="10" height="20" fill="#b91c1c" rx="2" />
                </g>

                {/* বড় করে PAID এবং দুই পাশে স্টার */}
                <text x="60" y="68" textAnchor="middle" fontSize="24" fontWeight="900" fill="#b91c1c" fontFamily="'Arial Black', sans-serif">
                    PAID
                </text>
                <text x="32" y="68" textAnchor="middle" fontSize="18" fill="#b91c1c">★</text>
                <text x="88" y="68" textAnchor="middle" fontSize="18" fill="#b91c1c">★</text>
                
                {/* তারিখ */}
                <text x="60" y="84" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#b91c1c" fontFamily="'Courier New', monospace">
                    {payments[0]?.payment_date || 'N/A'}
                </text>
                
                {/* ডিপার্টমেন্টের নাম */}
                <defs>
                    <path id="nursingPath" d="M 25, 65 a 35,35 0 0,0 70,0" />
                </defs>
                <text fontSize="6" fontWeight="bold" fill="#b91c1c" fontFamily="'Courier New', monospace">
                    <textPath href="#nursingPath" startOffset="50%" textAnchor="middle">
                        WORLD NURSING COLLEGE
                    </textPath>
                </text>
            </g>
        </svg>
    </div>)}
</div>

        {/* ডান পাশ: Summary Table */}
        {/* ডান পাশ: Summary Table */}
<div className="col-4">
    <div className="summary-table-box-custom ms-auto" style={{ maxWidth: '280px', background: '#f8f9fa', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        
        {/* ১. Total Fee: সবগুলোর মেইন ফি-এর যোগফল */}
        <div className="d-flex justify-content-between border-bottom py-1 small text-secondary">
            <span className="fw-bold">Total Fee:</span>
            <span>
                {payments.reduce((acc, curr) => acc + parseFloat(curr.mainFeeAmount || 0), 0).toFixed(2)} TK
            </span>
        </div>

        {/* ২. Total Discount: আপনার আগের সেই লজিক (Percentage vs Flat) */}
        <div className="d-flex justify-content-between border-bottom py-1 small text-danger">
            <span className="fw-bold">Total Discount:</span>
            <span className="fw-bold">
                - {payments.reduce((acc, curr) => {
                    const mainFee = parseFloat(curr.mainFeeAmount || 0);
                    const discVal = parseFloat(curr.actualDiscount || 0);
                    // যদি টাইপ ২ হয় তবে পার্সেন্টেজ ক্যালকুলেশন, না হলে ফ্ল্যাট অ্যামাউন্ট
                    const calculatedDisc = curr.discount_type === "2" 
                        ? (mainFee * discVal) / 100 
                        : discVal;
                    return acc + calculatedDisc;
                }, 0).toFixed(2)} TK
            </span>
        </div>

        {/* ৩. Net Payable: (Total Fee - Total Discount) */}
        <div className="d-flex justify-content-between border-bottom py-1 small fw-bold text-dark">
            <span>Net Payable:</span>
            <span>
                {(
                    payments.reduce((acc, curr) => acc + parseFloat(curr.mainFeeAmount || 0), 0) - 
                    payments.reduce((acc, curr) => {
                        const mainFee = parseFloat(curr.mainFeeAmount || 0);
                        const discVal = parseFloat(curr.actualDiscount || 0);
                        const calculatedDisc = curr.discount_type === "2" ? (mainFee * discVal) / 100 : discVal;
                        return acc + calculatedDisc;
                    }, 0)
                ).toFixed(2)} TK
            </span>
        </div>

        {/* ৪. Paid Amount: বর্তমান ইনভয়েসে কত টাকা দেওয়া হয়েছে */}
        <div className="d-flex justify-content-between border-bottom py-1 small text-success fw-bold">
            <span>Paid Amount:</span>
            <span>
                {payments.reduce((acc, curr) => acc + parseFloat(curr.payingAmount || 0), 0).toFixed(2)} TK
            </span>
        </div>

        {/* ৫. Total Due: আগের পেইজের মতো total_due_amount অথবা সব newDue এর যোগফল */}
        <div className="d-flex justify-content-between py-1 small text-danger fw-bold" style={{ fontSize: '15px' }}>
            <span>Total Due:</span>
            <span>
                {parseFloat(
                    payments[0]?.total_due_amount || 
                    payments.reduce((acc, curr) => acc + parseFloat(curr.newDue || 0), 0)
                ).toFixed(2)} TK
            </span>
        </div>
    </div>
</div>
    </div>
    
   <div className="row">
        <div className="col-12">
            <div className="note-box-full p-2 rounded-3 bg-light border text-center">
                <p className="mb-0 text-muted fw-medium" style={{ fontSize: '12px' }}>
                    <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                    This is a computer-generated money receipt. No physical seal or signature is required.
                </p>
            </div>
        </div>
    </div>

    {/* প্রিন্ট ডেট - একদম নিচে */}
    <div className="text-center mt-4 d-print-block d-none">
        <small className="text-muted" style={{ fontSize: '10px' }}>
            Printed on: {new Date().toLocaleString()} | {student?.first_name} | ID: {student?.student_id_no}
        </small>
    </div>
</div>

         

            </div>

            <style>{`
            /* এই স্টাইলটি আপনার <style> ট্যাগের ভেতর যোগ করুন */
            .invoice-box-custom {
                position: relative; /* ওয়াটারমার্ক পজিশন ঠিক রাখার জন্য */
                overflow: hidden;
            }

.security-seal-flex {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.nursing-stamp {
    opacity: 0.9;
    transform: rotate(-10deg); /* স্ট্যাম্পটি হালকা বাঁকা দেখাবে */
    filter: drop-shadow(1px 1px 1px rgba(8, 209, 28, 0.2));
}

.seal-text {
    font-weight: bold;
    fill: #b84807;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

            .invoice-box-custom::before {
                content: "WORLD NURSING COLLEGE";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 80px;
                font-weight: bold;
                color: rgba(0, 0, 0, 0.03); /* খুব হালকা রঙ */
                white-space: nowrap;
                pointer-events: none; /* যাতে টেক্সট সিলেক্ট করা না যায় */
                z-index: 0;
            }
                .invoice-box-custom {
                    max-width: 950px;
                    margin: auto;
                    border: 1px solid #eee;
                    padding: 40px;
                    border-radius: 8px;
                    background: #fff;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .header-custom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid #1e3a8a;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                .company-info-custom h2 { margin: 0; color: #1e3a8a; font-size: 26px; text-transform: uppercase; font-weight: 800; }
                .company-info-custom p { margin: 2px 0; font-size: 13px; color: #666; }
                
                .meta-section-custom {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 25px;
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 6px;
                }
                .meta-box-custom p { margin: 4px 0; font-size: 14px; }
                .status-paid { color: #059669; font-weight: bold; }

                .invoice-table-custom { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                .invoice-table-custom th { background: #1e3a8a; color: white; padding: 10px 5px; text-align: center; font-size: 11px; text-transform: uppercase; border: 1px solid #ddd; }
                .invoice-table-custom td { padding: 10px 5px; border: 1px solid #eee; text-align: center; font-size: 12px; }
                .text-left { text-align: left !important; padding-left: 10px !important; }

                .summary-wrapper-custom { display: flex; justify-content: flex-end; margin-top: 15px; }
                .summary-table-box-custom { width: 280px; background: #f1f5f9; padding: 15px; border-radius: 6px; }
                .summary-row-custom { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
                .summary-row-custom:last-child { border-bottom: none; color: #dc2626; font-weight: bold; }
                .paid-text-custom { color: #059669; font-weight: bold; }

                .footer-layout-custom { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; text-align: center; }
                .sig-column-custom { width: 200px; }
                .sig-line-custom { border-top: 1.5px solid #333; padding-top: 8px; font-weight: bold; font-size: 13px; color: #475569; }
                .qr-column-custom { width: 120px; display: flex; flex-direction: column; align-items: center; }
                .qr-text-custom { font-size: 10px; color: #64748b; margin-top: 6px; font-weight: bold; text-transform: uppercase; }

                .footer-note-custom { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 15px; font-style: italic; }

                @media print {
                    body { background: white !important; visibility: hidden; }
                    .no-print { display: none !important; }
                    #print-area {
                        visibility: visible !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceVerification;