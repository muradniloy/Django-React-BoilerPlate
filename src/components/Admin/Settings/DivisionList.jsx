import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { domain } from "../../../env";

const DivisionList = () => {
  const [divisions, setDivisions] = useState([]);
  const [name, setName] = useState("");

  const fetchDivisions = () => {
    axios.get(`${domain}/api/divisions/`).then(res => {
      setDivisions(res.data.results);
    });
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  // CREATE
  const handleCreate = (e) => {
    e.preventDefault();
    axios.post(`${domain}/api/divisions/`, { name })
      .then(() => {
        setName("");
        fetchDivisions();
      });
  };

  // DELETE
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure?")) return;
    axios.delete(`${domain}/api/divisions/${id}/`)
      .then(() => fetchDivisions());
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between">
          <h5>Division List</h5>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
            + Add Division
          </button>
        </div>

        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th width="160">Action</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((d, i) => (
              <tr key={d.id}>
                <td>{i + 1}</td>
                <td>{d.name}</td>
                <td>
                  <Link to={`/dashboard/divisions/edit/${d.id}`} className="btn btn-sm btn-warning me-2">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      <div className="modal fade" id="addModal">
        <div className="modal-dialog">
          <form onSubmit={handleCreate} className="modal-content">
            <div className="modal-header">
              <h5>Add Division</h5>
            </div>
            <div className="modal-body">
              <input
                className="form-control"
                placeholder="Division name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DivisionList;
