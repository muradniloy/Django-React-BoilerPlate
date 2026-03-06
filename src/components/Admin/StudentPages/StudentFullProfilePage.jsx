import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as CM from "../../../componentExporter";
import useStudent from "../../../utils/useStudent";

const StudentFullProfilePage = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const studentId = useStudent(propId || paramId);

  const [data, setData] = useState({
    profile: null,
    education: [],
    address: null,
    admission: null,
    payments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchAllData = async () => {
      setLoading(true);
      
      // [Saved Instruction] Sweet Alert Loading
      CM.Swal.fire({
        title: "Wait...",
        text: `Student profile is loading`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          CM.Swal.showLoading();
        }
      });

      try {
        const [profRes, eduRes, addrRes, admRes, payRes] = await Promise.allSettled([
          CM.axiosInstance.get(`/api/student/${studentId}/`),
          CM.axiosInstance.get(`/api/education/add/?student_id=${studentId}`),
          CM.axiosInstance.get(`/api/student_address/${studentId}/`),
          CM.axiosInstance.get(`/api/student-admission/${studentId}/`),
          CM.axiosInstance.get(`/api/payment-contacts/by-student/${studentId}/`)
        ]);

        const ensureArray = (res) => (res.status === "fulfilled" && Array.isArray(res.value.data) ? res.value.data : []);

        setData({
          profile: profRes.status === "fulfilled" ? profRes.value.data : null,
          education: ensureArray(eduRes),
          address: addrRes.status === "fulfilled" ? addrRes.value.data : null,
          admission: admRes.status === "fulfilled" ? admRes.value.data : null,
          payments: ensureArray(payRes)
        });

        CM.Swal.close(); // Success হলে লোডার বন্ধ হবে
      } catch (err) {
        console.error("Fetch Error:", err);
        CM.Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [studentId]);

  const paymentTotals = useMemo(() => {
    const payments = Array.isArray(data.payments) ? data.payments : [];
    return payments.reduce((acc, item) => {
      const original = parseFloat(item.original_amount) || 0;
      const discValue = parseFloat(item.discount_value) || 0;
      const cashDiscount = item.discount_type === "2" ? (original * discValue) / 100 : discValue;
      return {
        original: acc.original + original,
        discount: acc.discount + cashDiscount,
        final: acc.final + (parseFloat(item.amount) || 0)
      };
    }, { original: 0, discount: 0, final: 0 });
  }, [data.payments]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white d-print-none">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-bold">Generating Report...</p>
      </div>
    </div>
  );

  return (
    <div className="container py-4 px-3 bg-light min-vh-100 mb-5 main-report-area">
      
      {/* 1. Header & Photo */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-5 border-primary">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-auto">
              <img 
                src={data.profile?.photo ? `${CM.domain}${data.profile.photo}` : "/default.png"} 
                className="rounded-3 border"
                style={{width: '120px', height: '120px', objectFit: 'cover'}}
                alt="Student"
              />
            </div>
            <div className="col">
              <h2 className="mb-1 text-dark text-uppercase fw-bold">{data.profile?.first_name} ( {data.profile?.last_name} )</h2>
              <div className="d-flex gap-3 align-items-center mt-2 flex-wrap">
                <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm">ID: <strong>{studentId}</strong></span>
                <span className="text-muted small">Email: <strong>{data.profile?.email}</strong></span>
                <span className="text-muted small">Mobile: <strong>{data.profile?.mobile}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Information */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold">Personal Information</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-bordered mb-0 custom-report-table">
            <tbody>
              <tr>
                <td className="w-25">Father's Name</td><td className="w-25"><strong>{data.profile?.fathers_name || "N/A"}</strong></td>
                <td className="w-25">Mother's Name</td><td className="w-25"><strong>{data.profile?.mothers_name || "N/A"}</strong></td>
              </tr>
              <tr>
                <td>Guardian Name</td><td><strong>{data.profile?.guardian_name || "N/A"}</strong></td>
                <td>Guardian Mobile</td><td><strong>{data.profile?.guardian_mobile || "N/A"}</strong></td>
              </tr>
              <tr>
                <td>Date of Birth</td><td><strong>{data.profile?.date_of_birth || "N/A"}</strong></td>
                <td>Gender</td><td className="text-capitalize"><strong>{data.profile?.gender === 'm' ? 'Male' : 'Female'}</strong></td>
              </tr>
              <tr>
                <td>Religion</td><td><strong>{data.profile?.religion_name || "N/A"}</strong></td>
                <td>Blood Group</td><td><strong>{data.profile?.blood_group || "N/A"}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Address Section */}
      <div className="row g-3 mb-4 address-row">
        <div className="col-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-primary text-white py-2">
              <h6 className="mb-0">Permanent Address</h6>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0 custom-report-table">
                <tbody>
                  <tr><td width="45%">Division</td><td><strong>{data.address?.division_name || data.address?.division?.name || "N/A"}</strong></td></tr>
                  <tr><td>District</td><td><strong>{data.address?.district_name || data.address?.district?.name || "N/A"}</strong></td></tr>
                  <tr><td>Upazilla</td><td><strong>{data.address?.upazilla_name || data.address?.upazilla?.name || "N/A"}</strong></td></tr>
                  <tr><td>Post Office</td><td><strong>{data.address?.Post_Office || "N/A"}</strong></td></tr>
                  <tr><td>Village/Area</td><td><strong>{data.address?.Village || "N/A"}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-success text-white py-2">
              <h6 className="mb-0">Present Address</h6>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0 custom-report-table">
                <tbody>
                  <tr><td width="45%">Division</td><td><strong>{data.address?.Present_Division_name || data.address?.Present_Division?.name || "N/A"}</strong></td></tr>
                  <tr><td>District</td><td><strong>{data.address?.Present_District_name || data.address?.Present_District?.name || "N/A"}</strong></td></tr>
                  <tr><td>Upazilla</td><td><strong>{data.address?.Present_Upazilla_name || data.address?.Present_Upazilla?.name || "N/A"}</strong></td></tr>
                  <tr><td>Post Office</td><td><strong>{data.address?.Present_Post_Office || "N/A"}</strong></td></tr>
                  <tr><td>Village/Area</td><td><strong>{data.address?.Present_Village || "N/A"}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Admission Information */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold">Admission Details</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-bordered mb-0 custom-report-table">
            <tbody>
              <tr>
                <td className="w-25">Program Name</td><td className="w-25 text-primary"><strong>{data.admission?.Program_Name_display}</strong></td>
                <td className="w-25">Session</td><td className="w-25"><strong>{data.admission?.Session_display}</strong></td>
              </tr>
              <tr>
                <td>Admission Date</td><td><strong>{data.admission?.Date_of_admission}</strong></td>
                <td>Admission Roll</td><td><strong>{data.admission?.Admission_roll}</strong></td>
              </tr>
              <tr>
                <td>Merit Score</td><td><strong>{data.admission?.merit_score}</strong></td>
                <td>Merit Position</td><td className="text-success"><strong>#{data.admission?.merit_position}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Full Education History */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold">Education History</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0 custom-report-table">
            <thead className="bg-light">
              <tr>
                <th>Level & Group</th>
                <th>Degree/Course</th>
                <th>Board & Institution</th>
                <th className="text-center">Roll & Reg</th>
                <th className="text-center">Year</th>
                <th className="text-end">Result</th>
              </tr>
            </thead>
            <tbody>
              {data.education && data.education.length > 0 ? data.education.map((edu, i) => (
                <tr key={i}>
                  <td><strong>{edu.education_type_display}</strong><br/>{edu.education_group_display}</td>
                  <td><strong>{edu.course_name}</strong></td>
                  <td><strong>{edu.institution_name}</strong><br/>{edu.board_name}</td>
                  <td className="text-center">Roll: <strong>{edu.roll}</strong><br/>Reg: <strong>{edu.registration_no || "N/A"}</strong></td>
                  <td className="text-center"><strong>{edu.passing_year}</strong></td>
                  <td className="text-end fw-bold text-success fs-6"><strong>{edu.result}</strong></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-3">শিক্ষাগত যোগ্যতার কোনো তথ্য পাওয়া যায়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Fee & Payment Summary */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between">
          <h5 className="mb-0 fw-bold">Fee & Payment Summary</h5>
          <span className="fw-bold">Total: {paymentTotals.final.toFixed(2)} TK</span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered mb-0 custom-report-table">
            <thead className="table-light">
              <tr>
                <th>Fee Head</th>
                <th className="text-center">Cycle</th>
                <th className="text-center">Original</th>
                <th className="text-center">Discount</th>
                <th className="text-end">Net Payable</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p, i) => {
                const originalAmount = parseFloat(p.original_amount) || 0;
                const discountValue = parseFloat(p.discount_value) || 0;
                const isPercentage = p.discount_type === "2"; 
                const calculatedDiscountAmount = isPercentage ? (originalAmount * discountValue) / 100 : discountValue;

                return (
                  <tr key={i}>
                    <td><strong>{p.fee_head_name}</strong></td>
                    <td className="text-center"><strong>{p.paymentType_display}</strong></td>
                    <td className="text-center text-muted"><del>{originalAmount.toFixed(2)}</del></td>
                    <td className="text-center text-danger">
                      <strong>-{calculatedDiscountAmount.toFixed(2)} TK {isPercentage && ` (${discountValue}%)`}</strong>
                    </td>
                    <td className="text-end"><strong>{parseFloat(p.amount).toFixed(2)} TK</strong></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-warning fw-bold">
              <tr>
                <td colSpan="2">GRAND TOTAL SUMMARY</td>
                <td className="text-center"><strong>{paymentTotals.original.toFixed(2)}</strong></td>
                <td className="text-center text-danger"><strong>-{paymentTotals.discount.toFixed(2)} TK</strong></td>
                <td className="text-end fs-5 text-dark"><strong>{paymentTotals.final.toFixed(2)} TK</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- Footer Signature (Only for Print) --- */}
      <div className="d-none d-print-block mt-5 pt-5">
        <div className="row text-center">
          <div className="col-4">
            <div style={{ borderTop: "2px solid #333", paddingTop: "10px", fontWeight: "bold" }}>Student Signature</div>
          </div>
          <div className="col-4">
            <div style={{ borderTop: "2px solid #333", paddingTop: "10px", fontWeight: "bold" }}>Principal Signature</div>
          </div>
          <div className="col-4">
            <div style={{ borderTop: "2px solid #333", paddingTop: "10px", fontWeight: "bold" }}>Authority Signature</div>
          </div>
        </div>
        {/* Print-er somoy footer-e Page Number ebong Printed By nam dekhabe */}
      <div className="page-footer mt-5 d-none d-print-block">
        <div className="d-flex justify-content-between w-100">
          <span>Printed By: <strong>{data.profile?.first_name}</strong></span>
        </div>
      </div>
      </div>

      {/* Buttons Area */}
      <div className="mt-5 d-flex justify-content-between d-print-none">
        <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate(-1)}>
          <i className="fa fa-arrow-left me-2"></i> Back
        </button>
        <button className="btn btn-success rounded-pill px-5 shadow" onClick={() => window.print()}>
          <i className="fa fa-print me-2"></i> Print Student Report
        </button>
      </div>
              <style>{`
  /* ১. সাধারণ স্টাইল (স্ক্রিনের জন্য) */
  .custom-report-table td, .custom-report-table th {
      font-size: 14px;
      vertical-align: middle;
  }

  @media print {
    /* পেজ সেটিংস এবং মার্জিন */
    @page {
      size: A4;
      margin: 15mm 10mm 20mm 10mm; /* নিচের দিকে ২০মিমি জায়গা রাখা হয়েছে পেজ নাম্বারের জন্য */
    }

    /* পেজ কাউন্টার শুরু */
    html, body {
      counter-reset: page;
      background-color: white !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* বুটস্ট্র্যাপ কন্টেইনার ফুল উইডথ করা */
    .container, .main-report-area {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* পেজ নম্বর দেখানোর জন্য বিশেষ এলিমেন্ট (এটি প্রতি পেজের নিচে আসবে) */
    .main-report-area::after {
      content: "Page " counter(page);
      counter-increment: page;
      position: fixed;
      bottom: 5mm;
      right: 5mm;
      font-size: 12px;
      font-weight: bold;
      color: #000;
      border-top: 1px solid #ccc;
      padding-top: 5px;
    }

    /* ব্যাকগ্রাউন্ড রিমুভ ও টেক্সট ব্ল্যাক করা */
    .card, .card-header, .table-light, .table-warning, .bg-primary, .bg-success, .bg-dark {
      background-color: transparent !important;
      color: black !important;
      border: 1px solid #333 !important;
      box-shadow: none !important;
      page-break-inside: avoid; /* কন্টেন্ট যেন পেজের মাঝখানে না ভাঙে */
    }

    .table-bordered th, .table-bordered td { 
      border: 1px solid #333 !important; 
    }

    /* অ্যাড্রেস কলাম ঠিক করা */
    .address-row { display: flex !important; flex-wrap: nowrap !important; }
    .address-row .col-6 { width: 50% !important; flex: 0 0 50% !important; float: left !important; }

    /* অপ্রয়োজনীয় এলিমেন্ট হাইড */
    nav, .sidebar, .navbar, .d-print-none, .btn, footer, #sidebar-wrapper {
      display: none !important;
    }

    /* সিগনেচার সেকশন */
    .print-footer-signature {
      display: block !important;
      margin-top: 50px;
      page-break-inside: avoid;
    }
  }
`}</style>
     
    </div>
  );
};

export default StudentFullProfilePage;