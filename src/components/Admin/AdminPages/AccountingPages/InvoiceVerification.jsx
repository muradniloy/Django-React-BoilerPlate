import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { domain } from "../../../../env";
import { QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoiceVerification = () => {
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

    // PDF ডাউনলোড ফাংশন
    const handleDownloadPDF = async () => {
        const element = document.getElementById("print-area");
        setDownloading(true);
        
        try {
            const canvas = await html2canvas(element, {
                scale: 2, // হাই কোয়ালিটির জন্য
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${invoice_no}.pdf`);
            
            Swal.fire({
                icon: 'success',
                title: 'Downloaded!',
                text: 'Your PDF receipt is ready.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate PDF.',
            });
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div><p className="mt-2">Verifying Data...</p></div>;
    if (error) return <div className="text-center p-5 text-danger"><h4>{error}</h4></div>;
    if (!invoiceData) return null;

    const { student, payments, summary } = invoiceData;

    return (
        <div className="container-fluid py-md-5 bg-light min-vh-100">
            {/* Action Buttons */}
            <div className="text-center mb-4 no-print d-flex justify-content-center gap-3">
                <button className="btn btn-dark px-4 rounded-pill shadow-sm fw-bold" onClick={handlePrint}>
                    <i className="fa fa-print me-2"></i> PRINT
                </button>
                <button 
                    className="btn btn-primary px-4 rounded-pill shadow-sm fw-bold" 
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                >
                    {downloading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                        <i className="fa fa-download me-2"></i>
                    )}
                    DOWNLOAD PDF
                </button>
            </div>

            {/* Receipt Area */}
            <div id="print-area" className="invoice-box mx-auto shadow-lg bg-white p-4 p-md-5 rounded-3" style={{ maxWidth: "850px", border: "1px solid #ddd" }}>
                
                {/* Header */}
                <div className="row align-items-center mb-4 border-bottom border-primary border-3 pb-3">
                    <div className="col-7">
                        <h2 className="fw-bold text-primary mb-0" style={{ letterSpacing: '1px' }}>MONEY RECEIPT</h2>
                        <span className="text-muted small fw-bold text-uppercase">Verified Digital Receipt</span>
                    </div>
                    <div className="col-5 text-end">
                        <h4 className="fw-bold mb-0 text-dark">ABC SCHOOL & COLLEGE</h4>
                        <p className="small text-muted mb-0">System Generated Copy</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="row mb-4 g-3">
                    <div className="col-sm-6">
                        <div className="p-3 border rounded-3 bg-light h-100 shadow-sm">
                            <small className="text-primary fw-bold d-block mb-1 text-uppercase" style={{ fontSize: '11px' }}>Student Details</small>
                            <h5 className="fw-bold mb-1 text-dark">{student?.first_name} {student?.last_name}</h5>
                            <div className="small text-secondary"><strong>Student ID:</strong> {student?.student_id_no}</div>
                            <div className="small text-secondary"><strong>Program:</strong> {student?.program || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="col-sm-6 text-sm-end">
                        <div className="p-3 border rounded-3 bg-light h-100 shadow-sm">
                            <small className="text-primary fw-bold d-block mb-1 text-uppercase" style={{ fontSize: '11px' }}>Invoice Details</small>
                            <div className="small text-secondary"><strong>Invoice No:</strong> <span className="text-dark fw-bold">{invoice_no}</span></div>
                            <div className="small text-secondary"><strong>Date:</strong> {payments[0]?.payment_date || 'N/A'}</div>
                            <div className="mt-2"><span className="badge bg-success shadow-sm">PAID & VERIFIED</span></div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-bordered align-middle text-center mb-0">
                        <thead className="bg-dark text-white">
                            <tr style={{ fontSize: '12px' }}>
                                <th>Category</th>
                                <th className="text-start">Fee Description</th>
                                <th>Amount</th>
                                <th>Arrears</th>
                                <th>Less</th>
                                <th>Total Paid</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {payments && payments.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="text-muted">{p.category_name || 'General'}</td>
                                    <td className="text-start fw-bold">{p.head_name || 'Fees'}</td>
                                    <td>{(p.mainFeeAmount || 0).toLocaleString()}</td>
                                    <td>{(p.old_due || 0).toLocaleString()}</td>
                                    <td className="text-danger">-{ (p.discount_value || 0).toLocaleString() }</td>
                                    <td className="fw-bold text-success">{(p.amount || 0).toLocaleString()}</td>
                                    <td className={`fw-bold ${p.new_due > 0 ? 'text-danger' : 'text-dark'}`}>
                                        {(p.new_due || 0).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="row justify-content-end mt-4">
                    <div className="col-md-5">
                        <div className="card border-0 bg-light p-3 shadow-sm">
                            <div className="d-flex justify-content-between mb-2 small border-bottom pb-1">
                                <span>Total Payable:</span>
                                <span className="fw-bold">{(summary?.total_fee || 0).toLocaleString()} TK</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-success small border-bottom pb-1">
                                <span>Net Received:</span>
                                <span className="fw-bold">{(summary?.total_paid || 0).toLocaleString()} TK</span>
                            </div>
                            <div className="d-flex justify-content-between text-danger fw-bold h6 mb-0 pt-1">
                                <span>Outstanding Due:</span>
                                <span>{(summary?.total_due || 0).toLocaleString()} TK</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="row mt-5 pt-4 text-center align-items-end">
                    <div className="col-4">
                        <div className="border-top border-secondary pt-2 fw-bold small text-muted">Customer Signature</div>
                    </div>
                    <div className="col-4 d-flex flex-column align-items-center">
                        <QRCodeCanvas value={window.location.href} size={85} includeMargin={true} />
                        <span className="text-primary mt-2 fw-bold" style={{ fontSize: '9px' }}>OFFICIAL VERIFICATION</span>
                    </div>
                    <div className="col-4">
                        <div className="border-top border-secondary pt-2 fw-bold small text-muted">Authority Signature</div>
                    </div>
                </div>

                <div className="mt-5 text-center text-muted border-top pt-3" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                    * This is a computer generated document. For any query, please visit our office.
                </div>
            </div>

            <style>{`
                @media print {
                    body { visibility: hidden; background: white !important; }
                    .no-print { display: none !important; }
                    #print-area { 
                        visibility: visible !important; 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
                .invoice-box {
                    transition: all 0.3s ease;
                }
                @media (max-width: 576px) {
                    .invoice-box { padding: 20px !important; }
                    h2 { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceVerification;