import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { domain } from "../../env";

const StudentEducationPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${domain}/api/education/student/${studentId}/`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setEducations(res.data);
          // যেহেতু Serializer-এ depth=1 আছে, স্টুডেন্ট অবজেক্ট এখান থেকে নেওয়া যাবে
          setStudent(res.data[0].student);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container-fluid mt-4 px-4">
      {/* Profile Header */}
      <div className="address-header row align-items-center p-2 mb-4 bg-white shadow-sm rounded-3 mx-0">
        <div className="address-img-container col-auto">
          <img
            src={student?.photo ? (student.photo.startsWith('http') ? student.photo : `${domain}${student.photo}`) : "/default.png"}
            alt="Profile"
            className="address-img"
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
        <div className="col">
          <h5 className="mb-0 fw-bold">{student?.first_name} {student?.last_name}</h5>
          <p className="text-muted mb-0 small">{student?.email || "-"}</p>
        </div>
      </div>

      <div className="row g-3">
        {/* Left Side: Education Table (10 Columns) */}
        <div className="col-md-10">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="mb-0 fw-bold text-dark">
                <i className="bi bi-journal-text me-2 text-primary"></i> Educational Qualifications
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 py-3 text-muted small fw-bold text-uppercase">Level</th>
                      <th className="py-3 text-muted small fw-bold text-uppercase">Group</th>
                      <th className="py-3 text-muted small fw-bold text-uppercase">Course Name</th>
                      <th className="py-3 text-muted small fw-bold text-uppercase">Institution</th>
                      <th className="py-3 text-muted small fw-bold text-uppercase">Board</th>
                      <th className="py-3 text-muted small fw-bold text-uppercase">Roll & Reg</th>
                      <th className="pe-4 py-3 text-muted small fw-bold text-uppercase text-end">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {educations.map((edu, index) => (
                      <tr key={index}>
                        <td className="ps-4 fw-bold text-dark">{edu.education_type_display}</td>
                        <td className="text-secondary">{edu.education_group_display}</td>
                        <td className="text-secondary">{edu.course_name}</td>
                        <td className="text-secondary">{edu.institution_name}</td>
                        {/* আপনার কনসোল অনুযায়ী এখানে Board_Name ব্যবহার করা হয়েছে */}
                        <td className="text-secondary">{edu.board?.Board_Name || "-"}</td>
                        <td className="text-secondary small">
                          <span className="d-block fw-bold">R: {edu.roll}</span>
                          <span className="text-muted">Reg: {edu.registration_no}</span>
                        </td>
                        <td className="pe-4 text-end">
                          <span className="badge bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
                            {edu.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Card (2 Columns) */}
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

      {/* Footer Navigation */}
      <div className="long-panel mt-4 d-flex justify-content-between">
        <Link className="panel-link start-btn" to={`/dashboard/student_list`}>
          ← Back to List
        </Link>
        <Link className="panel-link end-btn" to={`/update_student_education/${studentId}`}>
          ✏️ Edit Details
        </Link>
      </div>
    </div>
  );
};

export default StudentEducationPage;