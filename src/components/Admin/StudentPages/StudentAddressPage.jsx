import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter";
import useStudent from "../../../utils/useStudent";
import StudentNavButtons from "./StudentNavButtons";
import "../../../CSS/StudentProfile.css"; // Profile-এর CSS ব্যবহার করা হয়েছে

const StudentAddressPage = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const studentId = useStudent(propId);

  const [student, setStudent] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      if (!loading) setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      try {
        const res = await CM.axiosInstance.get(`/api/student_address/${studentId}/`);
        setAddress(res.data);
        setStudent(res.data.student);
             CM.Swal.fire({
                         title: "Wait...",
                         text: `Address page is loading`,
                         allowOutsideClick: false,
                         showConfirmButton: false,
                         timer: 500,
                         didOpen: () => {
                             CM.Swal.showLoading(); // এটি স্পিনিং অ্যানিমেশন দেখাবে
                         }
                     });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          CM.Swal.fire({
            title: "তথ্য নেই!",
            text: "এই শিক্ষার্থীর ঠিকানার তথ্য পাওয়া যায়নি। অনুগ্রহ করে যোগ করুন।",
            icon: "info",
            timer: 2000,
          });
          navigate(`/update_student_address`, { state: { id: studentId }, replace: true });
        } else if (err.response && err.response.status === 401) {
          CM.Swal.fire({
            title: "সেশন শেষ",
            text: "অনুগ্রহ করে পুনরায় লগইন করুন।",
            icon: "warning",
          }).then(() => navigate("/login"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [studentId, navigate]);

  const handleUpdateNavigation = () => {
    navigate(`/update_student_address`, { state: { id: studentId } });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning rounded-4 shadow-sm">
          কোন শিক্ষার্থী নির্বাচন করা হয়নি।
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile container mt-1">
      <div className="card shadow-lg p-4 profile-card border-0 rounded-4">
        <div className="row g-4">
          
          {/* Left Column: Photo & Basic Info (Profile থিমের সাথে মিল রেখে) */}
          <div className="col-md-3 text-center left-col border-end">
            <div className="profile-img-container shadow-sm border rounded-4 overflow-hidden">
              <img
                src={student?.photo ? (student.photo.startsWith('http') ? student.photo : `${CM.domain}${student.photo}`) : "/default.png"}
                alt="Student"
                className="profile-img img-fluid"
              />
            </div>
            <h4 className="mt-3 fw-bold text-dark">{student?.first_name} {student?.last_name}</h4>
            <div className="mt-3 px-2 py-1 bg-light rounded-pill border shadow-sm">
               <h6 className="text-primary mb-0 py-1 small">
                 <i className="fa fa-id-card me-2"></i>ID: {studentId}
               </h6>
            </div>
            <p className="text-muted small mt-2 text-truncate">{student?.email}</p>
          </div>

          {/* Middle Column: Address Details (Table Format for Consistency) */}
          <div className="col-md-7 middle-col">
            <div className="info-card px-3">
              <h5 className="info-title border-bottom pb-2 fw-bold text-secondary">
                <i className="fa fa-map-marked-alt me-2"></i>Address Information
              </h5>
              
              <div className="row mt-3">
                {/* Permanent Address */}
                <div className="col-12 mb-4">
                  <h6 className="fw-bold text-primary mb-3"><i className="fa fa-home me-2"></i>Permanent Address</h6>
                  <table className="table details-table table-borderless small">
                    <tbody>
                      <tr>
                        <th className="text-muted" style={{width: '35%'}}>Division & District</th>
                        <td className="fw-bold">{address?.division_name || address?.division?.name} - {address?.district_name || address?.district?.name}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Upazilla & P.O.</th>
                        <td className="fw-bold">{address?.upazilla_name || address?.upazilla?.name}, {address?.Post_Office}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Village/Area</th>
                        <td className="fw-bold">{address?.Village || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <hr className="opacity-10" />

                {/* Present Address */}
                <div className="col-12 mt-2">
                  <h6 className="fw-bold text-success mb-3"><i className="fa fa-map-marker-alt me-2"></i>Present Address</h6>
                  <table className="table details-table table-borderless small">
                    <tbody>
                      <tr>
                        <th className="text-muted" style={{width: '35%'}}>Division & District</th>
                        <td className="fw-bold">{address?.Present_Division_name || address?.Present_Division?.name} - {address?.Present_District_name || address?.Present_District?.name}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Upazilla & P.O.</th>
                        <td className="fw-bold">{address?.Present_Upazilla_name || address?.Present_Upazilla?.name}, {address?.Present_Post_Office}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Village/Area</th>
                        <td className="fw-bold">{address?.Present_Village || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Navigation Buttons */}
          <StudentNavButtons studentId={studentId} />

        </div>
      </div>

      {/* Footer Actions */}
      <div className="long-panel mt-3 d-flex justify-content-between p-2">
        <button className="btn btn-outline-secondary px-4 shadow-sm rounded-pill fw-bold" onClick={() => navigate(-1)}>
          <i className="fa fa-arrow-left me-2"></i> Back
        </button>
        
        <button 
          className="btn btn-warning px-4 shadow-sm fw-bold rounded-pill" 
          onClick={handleUpdateNavigation}
        >
          <i className="fa fa-edit me-2"></i> Update Address
        </button>
      </div>
    </div>
  );
};

export default StudentAddressPage;