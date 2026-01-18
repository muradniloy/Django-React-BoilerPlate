import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { domain } from "../../../env";

const DistrictList = () => {
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterDivision, setFilterDivision] = useState("");
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Fetch divisions for dropdown
  useEffect(() => {
    axios.get(`${domain}/api/divisions/`)
      .then(res => setDivisions(res.data.results || res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch districts with pagination and division filter
  const fetchDistricts = (page = 1) => {
    let url = `${domain}/api/districts/?page=${page}`;
    if (filterDivision) url += `&division=${filterDivision}`;

    axios.get(url)
      .then(res => {
        setDistricts(res.data.results || res.data);
        setCurrentPage(page);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
        setTotalPages(Math.ceil(res.data.count / 10));
      })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchDistricts(1); }, [filterDivision]);

  // CREATE district
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${domain}/api/districts/`, { name, division });
      setName("");
      setDivision("");
      fetchDistricts(1);  // refresh page 1

      // Modal hide (CDN compatible)
      const modalEl = document.getElementById('addModal');
      if (modalEl) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
      }

      navigate("/dashboard/districts");

    } catch (err) {
      console.error(err);
    }
  };

  // DELETE district
  const handleDelete = (id) => {
    if (!window.confirm("Delete this district?")) return;
    axios.delete(`${domain}/api/districts/${id}/`)
      .then(() => fetchDistricts(currentPage));
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        {/* Header */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>District List</h5>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
            + Add District
          </button>
        </div>

        {/* Division Filter */}
        <div className="p-3">
          <select
            className="form-select w-25"
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
          >
            <option value="">All Divisions</option>
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* District Table */}
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>District</th>
              <th>Division</th>
              <th width="160">Action</th>
            </tr>
          </thead>
          <tbody>
            {districts.length > 0 ? districts.map((d, i) => (
              <tr key={d.id}>
                <td>{(currentPage - 1) * 10 + i + 1}</td>
                <td>{d.name}</td>
                <td>{d.division_name}</td>
                <td>
                  <Link to={`/dashboard/districts/edit/${d.id}`} className="btn btn-sm btn-warning me-2">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center py-3">No districts found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center p-3">
          <button
            className="btn btn-secondary"
            onClick={() => fetchDistricts(currentPage - 1)}
            disabled={!prevPage}
          >
            Previous
          </button>

          <span>Page {currentPage} of {totalPages}</span>

          <button
            className="btn btn-secondary"
            onClick={() => fetchDistricts(currentPage + 1)}
            disabled={!nextPage}
          >
            Next
          </button>
        </div>
      </div>

      {/* CREATE Modal */}
      <div className="modal fade" id="addModal">
        <div className="modal-dialog">
          <form onSubmit={handleCreate} className="modal-content">
            <div className="modal-header">
              <h5>Add District</h5>
            </div>
            <div className="modal-body">
              <select
                className="form-select mb-3"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                required
              >
                <option value="">Select Division</option>
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <input
                className="form-control"
                placeholder="District name"
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

export default DistrictList;
