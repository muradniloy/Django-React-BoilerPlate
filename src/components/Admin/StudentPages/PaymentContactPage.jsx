import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent";  
import StudentNavButtons from "./StudentNavButtons";

const PaymentContactPage = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const studentId = useStudent(propId || paramId);

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchPaymentContacts = async () => {
      setLoading(true);
      try {
        const res = await CM.axiosInstance.get(`/api/payment-contacts/by-student/${studentId}/`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setContacts(res.data);
          // [Saved Instruction] Sweet Alert on loading
          CM.Swal.fire({
            title: "Loading...",
            text: `Payment contract details are ready`,
            allowOutsideClick: false,
            showConfirmButton: false,
            timer: 800,
            didOpen: () => {
              CM.Swal.showLoading();
            }
          });
        } else {
          navigate(`/update_payment`, { state: { id: studentId }, replace: true });
        }
      } catch (err) {
        console.error("Payment Contact Fetch Error:", err);
        CM.Swal.fire({
          title: "Error!",
          text: "তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
          icon: "error",
          confirmButtonColor: "#198754"
        });
        navigate(`/update_payment`, { state: { id: studentId }, replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentContacts();
  }, [studentId, navigate]);

  // ✅ আপডেট করা ক্যালকুলেশন লজিক (Quantity সহ)
  const totals = useMemo(() => {
    return contacts.reduce((acc, item) => {
      const unitPrice = parseFloat(item.original_amount) || 0;
      const qty = parseInt(item.quantity) || 1;
      const totalBase = unitPrice * qty; // মোট বেস প্রাইস
      
      const discValue = parseFloat(item.discount_value) || 0;
      const cashDiscount = item.discount_type === "2" 
        ? (totalBase * discValue) / 100 
        : discValue;

      return {
        original: acc.original + totalBase,
        discount: acc.discount + cashDiscount,
        final: acc.final + (parseFloat(item.amount) || 0)
      };
    }, { original: 0, discount: 0, final: 0 });
  }, [contacts]);

  const handleEditNavigation = () => {
    navigate(`/update_payment`, { state: { id: studentId } });
  };

  if (loading && studentId) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status" style={{width: '3rem', height: '3rem'}}></div>
        <span className="mt-3 fw-bold text-secondary">Loading Payment Records...</span>
      </div>
    );
  }

  if (!studentId || contacts.length === 0) return null;

  return (
    <div className="container-fluid mt-4 px-4 pb-5 bg-light min-vh-100">
      
      {/* Profile Header Section */}
      <div className="address-header row align-items-center p-3 mb-4 bg-white shadow-sm rounded-4 mx-0 border-start border-4 border-success">
        <div className="col-auto">
          <img
            src={contacts[0].photo ? (contacts[0].photo.startsWith('http') ? contacts[0].photo : `${CM.domain}${contacts[0].photo}`) : "/default.png"}
            alt="Profile"
            className="rounded-3 shadow-sm border p-1"
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            onError={(e) => e.target.src = "/default.png"}
          />
        </div>
        <div className="col">
          <h4 className="mb-1 fw-bold text-dark">{contacts[0].student_name}</h4>
          <p className="text-muted mb-0 small">
            <i className="fa fa-calendar-check me-2 text-success"></i>
            Last Updated: {contacts[0].contact_date}
          </p>
        </div>
        <div className="col-auto">
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold">
            Student ID: {studentId}
          </span>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Side: Table Section */}
        <div className="col-md-10">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-dark">
                <i className="fa fa-file-invoice-dollar me-2 text-success"></i> Payment Contact Details
              </h6>
              <span className="badge bg-light text-dark border fw-normal">{contacts.length} Heads Active</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr style={{ fontSize: '11px' }}>
                      <th className="ps-4 py-3 text-muted fw-bold text-uppercase">Fee Head & Cycle</th>
                      <th className="py-3 text-muted fw-bold text-uppercase text-center">Qty</th>
                      <th className="py-3 text-muted fw-bold text-uppercase text-center">Unit Price</th>
                      <th className="py-3 text-muted fw-bold text-uppercase text-center">Total Base</th>
                      <th className="py-3 text-muted fw-bold text-uppercase text-center">Discount</th>
                      <th className="pe-4 py-3 text-muted fw-bold text-uppercase text-end">Net Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((item, index) => {
                      const unitPrice = parseFloat(item.original_amount) || 0;
                      const qty = parseInt(item.quantity) || 1;
                      const totalBase = unitPrice * qty;
                      const discValue = parseFloat(item.discount_value) || 0;
                      const cashDiscount = item.discount_type === "2" 
                        ? (totalBase * discValue) / 100 
                        : discValue;

                      return (
                        <tr key={index}>
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-dark">{item.fee_head_name || "N/A"}</div>
                            <span className="badge bg-light text-success border-0 p-0 small">
                               <i className="fa fa-sync-alt fa-xs me-1"></i> {item.paymentType_display || "One Time"}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className="fw-bold text-dark">x{qty}</span>
                          </td>
                          <td className="py-3 text-center text-muted small">
                            {unitPrice.toFixed(2)}
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-dark fw-semibold">{totalBase.toFixed(2)} TK</span>
                          </td>
                          <td className="py-3 text-center">
                            <div className="text-danger fw-bold">
                              -{cashDiscount.toFixed(2)} TK
                            </div>
                            {item.discount_type === "2" && (
                              <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                                ({discValue}% off)
                              </small>
                            )}
                          </td>
                          <td className="pe-4 text-end py-3">
                            <span className="fw-bold text-success fs-6">{parseFloat(item.amount).toFixed(2)} TK</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Footer with Totals */}
                  <tfoot className="table-light border-top border-2 fw-bold">
                    <tr>
                      <td colSpan="3" className="ps-4 py-4 text-dark text-uppercase">Grand Summary</td>
                      <td className="py-4 text-center text-secondary">{totals.original.toFixed(2)} TK</td>
                      <td className="py-4 text-center text-danger">
                        <span className="d-block">-{totals.discount.toFixed(2)} TK</span>
                        <small className="fw-normal text-muted" style={{fontSize: '10px'}}>Total Savings</small>
                      </td>
                      <td className="pe-4 text-end py-4">
                        <div className="text-success h5 mb-0 fw-bold">{totals.final.toFixed(2)} TK</div>
                        <small className="text-muted small">Total Contract Amount</small>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Nav Buttons */}
        <StudentNavButtons studentId={studentId} />
      </div>

      {/* Action Footer */}
      <div className="mt-4 d-flex justify-content-between align-items-center">
        <Link className="btn btn-outline-secondary px-4 shadow-sm rounded-pill fw-bold" to={`/dashboard/students`}>
          <i className="fa fa-arrow-left me-2"></i> Back to List
        </Link>
        <button 
          className="btn btn-success px-5 fw-bold shadow-sm rounded-pill hover-lift" 
          onClick={handleEditNavigation}
        >
          <i className="fa fa-edit me-2"></i> Manage Contracts
        </button>
      </div>

      <style>{`
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default PaymentContactPage;