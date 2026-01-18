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
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">🎓 Student List</h5>
        </div>

        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Gender</th>
                <th>Religion</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students.length > 0 ? (
                students.map((s, index) => (
                  <tr key={s.id}>
                    <td>{index + 1}</td>

                    <td>
                      <img
                        src={s.photo ? `${domain}${s.photo}` : "/default.png"}
                        alt="student"
                        className="rounded-circle"
                        style={{
                          width: "45px",
                          height: "45px",
                          objectFit: "cover",
                        }}
                      />
                    </td>

                    <td>{s.first_name} {s.last_name}</td>
                    <td>{s.email}</td>
                    <td>{s.mobile || "-"}</td>
                    <td>
                      {s.gender === "m"
                        ? "Male"
                        : s.gender === "f"
                        ? "Female"
                        : "Others"}
                    </td>
                    <td>{s.religion_name || "-"}</td>

                    <td>
                      <span
                        className={`badge ${
                          s.active ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/StudentPage/${s.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
