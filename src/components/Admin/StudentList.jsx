import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { domain } from "../../env";

const StudentList = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios
      .get(`${domain}/api/allstudent/`)
      .then((res) => {
        setStudents(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
   <div className="container mt-4">
  {/* Header Section with Title and Add Button */}
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h4 className="fw-bold text-light mb-0">🎓 Student Management</h4>
    <Link to="/create_student" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
      <i className="bi bi-plus-circle"></i> Add New Student
    </Link>
  </div>

  {/* Table Card */}
  <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
    <div className="card-header bg-primary text-white py-3">
      <h5 className="mb-0 small fw-bold text-uppercase">Student List</h5>
    </div>

    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="border-0 ps-3">#</th>
              <th className="border-0">Photo</th>
              <th className="border-0">Name</th>
              <th className="border-0">Email</th>
              <th className="border-0">Mobile</th>
              <th className="border-0">Gender</th>
              <th className="border-0">Religion</th>
              <th className="border-0">Status</th>
              <th className="border-0 pe-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="border-top-0">
            {students.length > 0 ? (
              students.map((s, index) => (
                <tr key={s.id}>
                  <td className="ps-3">{index + 1}</td>
                  <td>
                    <img
                      src={s.photo ? `${domain}${s.photo}` : "/default.png"}
                      alt="student"
                      className="rounded-circle border"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td className="fw-bold text-dark">{s.first_name} {s.last_name}</td>
                  <td className="text-muted small">{s.email}</td>
                  <td>{s.mobile || "-"}</td>
                  <td>
                    {s.gender === "m" ? "Male" : s.gender === "f" ? "Female" : "Others"}
                  </td>
                  <td>{s.religion_name || "-"}</td>
                  <td>
                    <span className={`badge rounded-pill ${s.active ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`} style={{fontSize: '0.75rem'}}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="pe-3 text-center">
                    <Link
                      to={`/StudentPage/${s.id}`}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-5 text-muted">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
  );
};

export default StudentList;
