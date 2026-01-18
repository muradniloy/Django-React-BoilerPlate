import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { domain } from "../../env";

const StudentAddressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${domain}/api/student_address/${id}/`)
      .then((res) => {
        // ✅ Address exists → view page
        setAddress(res.data);
        setStudent(res.data.student);
        console.log(res.data)
      })
      .catch((err) => {
        // ❌ Address NOT exists → redirect to create/update page
        if (err.response && err.response.status === 404) {
          navigate(`/update_student_address/${id}`, { replace: true });
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  if (!student) {
    return (
      <div className="text-center mt-5">
        <p className="text-muted">Student not found.</p>
        <button
          type="button"
          className="btn btn-danger border px-4 mt-3"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="student-address-page container-fluid mt-4 px-4">
      {/* Profile Header */}
      <div className="address-header row align-items-center p-2 mb-4">
        <div className="address-img-container col-auto">
          <img
            src={student.photo ? `${domain}${student.photo}` : "/default.png"}
            alt={`${student.first_name} ${student.last_name}`}
            className="address-img"
          />
        </div>
        <div className="col">
          <h5 className="mb-0">
            {student.first_name} {student.last_name}
          </h5>
          <p className="text-muted mb-0">{student.email || "-"}</p>
        </div>
      </div>

      {/* Address Table */}
{address && (
  <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <div className="card-body p-0">
      <div className="row g-0 align-items-stretch">
        
        {/* Permanent Address - 5 Columns */}
        <div className="col-md-5 p-4 bg-white">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-house-door fs-5"></i>
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">Permanent Address</h6>
              <small className="text-muted">স্থায়ী ঠিকানা</small>
            </div>
          </div>
          
          <div className="address-content ps-1">
            <div className="row mb-3">
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Division</label>
                <p className="mb-0 fw-semibold text-secondary">{address.division?.name || "-"}</p>
              </div>
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>District</label>
                <p className="mb-0 fw-semibold text-secondary">{address.district?.name || "-"}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Upazilla</label>
                <p className="mb-0 fw-semibold text-secondary">{address.upazilla?.name || "-"}</p>
              </div>
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Post Office</label>
                <p className="mb-0 fw-semibold text-secondary">{address.Post_Office || "-"} </p>
              </div>
            </div>
            <div className="col-12">
              <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Village / Area</label>
              <p className="mb-0 fw-semibold text-secondary">{address.Village || "-"}</p>
            </div>
          </div>
        </div>

        {/* Present Address - 5 Columns */}
        <div className="col-md-5 p-4 bg-light bg-opacity-50 border-start border-end">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-geo-alt fs-5"></i>
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">Present Address</h6>
              <small className="text-muted">বর্তমান ঠিকানা</small>
            </div>
          </div>
          
          <div className="address-content ps-1">
            <div className="row mb-3">
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Division</label>
                <p className="mb-0 fw-semibold text-secondary">{address.Present_Division?.name || "-"}</p>
              </div>
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>District</label>
                <p className="mb-0 fw-semibold text-secondary">{address.Present_District?.name || "-"}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Upazilla</label>
                <p className="mb-0 fw-semibold text-secondary">{address.Present_Upazilla?.name || "-"}</p>
              </div>
              <div className="col-6">
                <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Post Office</label>
                <p className="mb-0 fw-semibold text-secondary">{address.Present_Post_Office || "-"}</p>
              </div>
            </div>
            <div className="col-12">
              <label className="text-uppercase text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Village / Area</label>
              <p className="mb-0 fw-semibold text-secondary">{address.Present_Village || "-"}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons Group - 2 Columns */}
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
  </div>
)}



      <div className="long-panel mt-4 d-flex justify-content-between">
        <Link className="panel-link start-btn" to={`/dashboard/student_list`}>
          ← Back
        </Link>
        <Link
          className="panel-link end-btn"
          to={`/update_student_address/${id}`}
        >
          ✏️ Update
        </Link>
      </div>
    </div>
  );
};

export default StudentAddressPage;
