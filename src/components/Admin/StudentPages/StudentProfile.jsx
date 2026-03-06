import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import * as CM from "../../../componentExporter"; 
import StudentNavButtons from "./StudentNavButtons";
import "../../../CSS/StudentProfile.css";

const StudentProfile = ({ student }) => {
  const [fullImage, setFullImage] = useState(null);
  const navigate = useNavigate();

  // ডাটা না থাকলে সেফটি রিটার্ন
  if (!student) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning rounded-4 shadow-sm">
          <i className="fa fa-exclamation-triangle me-2"></i> No student data available.
        </div>
      </div>
    );
  }

  // আপডেট পেজে যাওয়ার ফাংশন
  const handleUpdateClick = () => {
    sessionStorage.setItem("activeStudentId", student.id);
    navigate("/update_student", { state: { id: student.id } });
  };

  return (
    <div className="student-profile container mt-1">
      <div className="card shadow-lg p-4 profile-card border-0 rounded-4">
        <div className="row g-4">
          
          {/* Left Column: Photo & Basic Info */}
          <div className="col-md-3 text-center left-col border-end">
            <div 
              className="profile-img-container shadow-sm border rounded-4 overflow-hidden" 
              onClick={() => setFullImage(`${CM.domain}${student.photo}`)}
              style={{ cursor: "zoom-in" }}
            >
              <img
                src={student.photo ? `${CM.domain}${student.photo}` : "/default.png"}
                alt={`${student.first_name}`}
                className="profile-img img-fluid"
              />
            </div>
            <h4 className="mt-3 fw-bold text-dark">{student.first_name}</h4>
            <h5 className="text-muted fw-semibold">({student.last_name})</h5>
            <div className="mt-3 px-2 py-1 bg-light rounded-pill border shadow-sm">
               <h6 className="text-primary mb-0 py-1">
                 <i className="fa fa-phone-alt me-2"></i>{student.mobile || "N/A"}
               </h6>
            </div>
            <p className="text-muted small mt-2">{student.email}</p>
          </div>

          {/* Middle Column: Details Table */}
          <div className="col-md-7 middle-col">
            <div className="info-card px-3">
              <h5 className="info-title border-bottom pb-2 fw-bold text-secondary">
                <i className="fa fa-user-circle me-2"></i>Personal Information
              </h5>
              <table className="table details-table table-borderless mt-3">
                <tbody>
                  <tr><th className="text-muted">Father's Name</th><td className="fw-bold">{student.fathers_name || "-"}</td></tr>
                  <tr><th className="text-muted">Mother's Name</th><td className="fw-bold">{student.mothers_name || "-"}</td></tr>
                  <tr><th className="text-muted">Guardian Name</th><td className="fw-bold">{student.guardian_name || "-"}</td></tr>
                  <tr><th className="text-muted">Guardian Mobile</th><td className="fw-bold">{student.guardian_mobile || "-"}</td></tr>
                  <tr>
                    <th className="text-muted">Gender</th>
                    <td>
                      <span className="badge bg-info-subtle text-info px-3 rounded-pill border border-info">
                        {student.gender === "m" ? "Male" : 
                         student.gender === "f" ? "Female" : 
                         student.gender === "o" ? "Others" : "-"}
                      </span>
                    </td>
                  </tr>
                  <tr><th className="text-muted">Religion</th><td className="fw-bold">{student.religion_name || "-"}</td></tr>
                  <tr><th className="text-muted">Birth ID / NID</th><td className="fw-bold">{student.birth_id || "-"}</td></tr>
                  <tr><th className="text-muted">Date of Birth</th><td className="fw-bold">{student.date_of_birth || "-"}</td></tr>
                  <tr>
                    <th className="text-muted">Status</th>
                    <td>
                      <span className={`badge ${student.active ? "bg-success" : "bg-danger"} rounded-pill px-3`}>
                        {student.active ? "● Active" : "○ Inactive"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Navigation Buttons */}
          <StudentNavButtons studentId={student.id} />

        </div>
      </div>

      {/* Footer Actions */}
      <div className="long-panel mt-3 d-flex justify-content-between p-2">
        <Link className="btn btn-outline-secondary px-4 shadow-sm rounded-pill fw-bold" to={`/dashboard/students`}>
                  <i className="fa fa-arrow-left me-2"></i> Back to List
            </Link>
        
        <button 
          className="btn btn-warning px-4 shadow-sm fw-bold rounded-pill" 
          onClick={handleUpdateClick}
        >
          <i className="fa fa-edit me-2"></i> Update Profile
        </button>
      </div>

      {/* Full Image Modal (Zoom View) */}
      {fullImage && (
        <div className="full-image-overlay" onClick={() => setFullImage(null)}>
          <div className="full-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="full-image-close shadow" onClick={() => setFullImage(null)}>&times;</button>
            <img src={fullImage} alt="Full Preview" className="full-image shadow-lg rounded-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;