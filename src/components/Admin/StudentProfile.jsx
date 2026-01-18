import React, { useState } from "react";
import "../../CSS/StudentProfile.css";
import { domain } from "../../env";
import { Link } from "react-router-dom";

const StudentProfile = ({ student }) => {
  const [fullImage, setFullImage] = useState(null);

  if (!student) {
    return <p className="text-center mt-1">No student data available</p>;
  }

  return (
    <div className="student-profile container mt-1">
   
      <div className="card shadow-lg p-4 profile-card">
        <div className="row g-4">
          {/* Left Column: Photo + Name + Email */}
          <div className="col-md-3 text-center left-col">
            <div 
              className="profile-img-container" 
              onClick={() => setFullImage(`${domain}${student.photo}`)}
            >
              <img
                src={student.photo ? `${domain}${student.photo}` : "/default.png"}
                alt={`${student.first_name} ${student.last_name}`}
                className="profile-img"
              />
            </div>
            <h4 className="mt-3">{student.first_name} {student.last_name}</h4>
             <h6 className="mt-3">
                Mobile no. {student.mobile || "-"}
                </h6>
            <p className="text-muted">{student.email}</p>
          </div>

          {/* Middle Column: Personal Details */}
            <div className="col-md-7 middle-col">
          <div className="info-card">
            <h5 className="info-title">Personal Information</h5>

            <table className="table details-table">
              <tbody>
                <tr>
                  <th>Father's Name </th>
                  <td>{student.fathers_name || "-"}</td>
                </tr>
                <tr>
                  <th>Mother's Name</th>
                  <td>{student.mothers_name || "-"}</td>
                </tr>
                <tr>
                  <th>Guardian Name</th>
                  <td>{student.guardian_name || "-"}</td>
                </tr>
                <tr>
                  <th>Guardian Mobile</th>
                  <td>{student.guardian_mobile || "-"}</td>
                </tr>
                <tr>
                  <th>Gender</th>
                  <td>
                    {student.gender === "m"
                      ? "Male"
                      : student.gender === "f"
                      ? "Female"
                      : "Others"}
                  </td>
                </tr>
                <tr>
                  <th>Religion</th>
                  <td>{student.religion_name || "-"}</td>
                </tr>
                <tr>
                  <th>Birth ID / NID</th>
                  <td>{student.birth_id || "-"}</td>
                </tr>
                <tr>
                  <th>Date of Birth</th>
                  <td>{student.date_of_birth || "-"}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={`status-badge ${student.active ? "active" : "inactive"}`}>
                      {student.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        


          {/* Right Column: Action Buttons */}
            <div className="col-md-2 p-3 bg-white d-flex flex-column justify-content-center gap-2">
                <Link
                  to={`/StudentPage/${student.id}`}
                  className="btn btn-primary btn-sm border-0 py-2 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2 action-btn-hover"
                >
                  <i className="bi bi-pencil-square"></i> 👤 Personal Info
                </Link>
                <Link
                  to={`/student_address/${student.id}`}
                  className="btn btn-primary btn-sm border-0 py-2 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2 action-btn-hover"
                >
                  <i className="bi bi-pencil-square"></i> 🏠 Address
                </Link>
                
                <Link to={`/education/${student.id}`} className="btn btn-outline-secondary btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 action-btn-hover">
                  <i className="bi bi-printer"></i> 🎓 Education
                </Link>
      
                <button className="btn btn-outline-secondary btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 action-btn-hover">
                  <i className="bi bi-share"></i> 📚 Admission
                </button>
      
                <button className="btn btn-outline-secondary btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 action-btn-hover">
                  <i className="bi bi-cloud-arrow-down"></i> 🔢Payment
                </button>
      
                <button className="btn btn-outline-secondary btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 action-btn-hover">
                  <i className="bi bi-history"></i>📜 Full Info
                </button>
      
                <button className="btn btn-light btn-sm py-2 rounded-3 text-danger fw-bold d-flex align-items-center justify-content-center gap-2 action-btn-hover">
                  <i className="bi bi-trash"></i> 🖨️ Print
                </button>
              </div>
      
        </div>
        
      </div>
         <div className="long-panel mt-2">
          <Link className="panel-link start-btn"
            to={`/dashboard/student_list`}> ← Back</Link>
        
          <Link className="panel-link end-btn" to={`/update_student/${student.id}`}>
          ✏️ Update
          </Link>
        </div>
    

      {/* Full Image Modal */}
      {fullImage && (
        <div className="full-image-overlay" onClick={() => setFullImage(null)}>
          <div className="full-image-wrapper" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="full-image-close" onClick={() => setFullImage(null)}>×</button>

            {/* Full Image */}
            <img src={fullImage} alt="Full" className="full-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
