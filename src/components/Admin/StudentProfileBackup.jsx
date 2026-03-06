import React, { useState } from "react";
import "../../CSS/StudentProfile.css";
import { domain } from "../../env";
import { Link } from "react-router-dom";
import StudentNavButtons from "./StudentNavButtons"; // ইমপোর্ট করতে ভুলবেন না

const StudentProfile = ({ student }) => {
  const [fullImage, setFullImage] = useState(null);

  if (!student) {
    return <p className="text-center mt-1">No student data available</p>;
  }

  return (
    <div className="student-profile container mt-1">
      <div className="card shadow-lg p-4 profile-card">
        <div className="row g-4">
          
          {/* Left Column */}
          <div className="col-md-3 text-center left-col border-end">
            <div className="profile-img-container shadow-sm" onClick={() => setFullImage(`${domain}${student.photo}`)}>
              <img
                src={student.photo ? `${domain}${student.photo}` : "/default.png"}
                alt={`${student.first_name}`}
                className="profile-img"
              />
            </div>
            <h4 className="mt-3 fw-bold">{student.first_name} {student.last_name}</h4>
            <h6 className="text-primary">Mobile no. {student.mobile || "-"}</h6>
            <p className="text-muted small">{student.email}</p>
          </div>

          {/* Middle Column */}
          <div className="col-md-7 middle-col">
            <div className="info-card">
              <h5 className="info-title border-bottom pb-2">Personal Information</h5>
              <table className="table details-table table-borderless">
                <tbody>
                  <tr><th>Father's Name</th><td>{student.fathers_name || "-"}</td></tr>
                  <tr><th>Mother's Name</th><td>{student.mothers_name || "-"}</td></tr>
                  <tr><th>Guardian Name</th><td>{student.guardian_name || "-"}</td></tr>
                  <tr><th>Guardian Mobile</th><td>{student.guardian_mobile || "-"}</td></tr>
                  <tr><th>Gender</th><td>{student.gender === "m" ? "Male" : student.gender === "f" ? "Female" : "Others"}</td></tr>
                  <tr><th>Religion</th><td>{student.religion_name || "-"}</td></tr>
                  <tr><th>Birth ID / NID</th><td>{student.birth_id || "-"}</td></tr>
                  <tr><th>Date of Birth</th><td>{student.date_of_birth || "-"}</td></tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span className={`badge ${student.active ? "bg-success" : "bg-danger"}`}>
                        {student.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column (Using the Shared Component) */}
          <StudentNavButtons studentId={student.id} />

        </div>
      </div>

      <div className="long-panel mt-3 d-flex justify-content-between">
        <Link className="btn btn-secondary px-4 shadow-sm" to={`/dashboard/student_list`}> ← Back</Link>
        <Link className="btn btn-warning px-4 shadow-sm fw-bold" to={`/update_student/${student.id}`}>✏️ Update</Link>
      </div>

      {/* Full Image Modal */}
      {fullImage && (
        <div className="full-image-overlay" onClick={() => setFullImage(null)}>
          <div className="full-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="full-image-close" onClick={() => setFullImage(null)}>×</button>
            <img src={fullImage} alt="Full" className="full-image shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;