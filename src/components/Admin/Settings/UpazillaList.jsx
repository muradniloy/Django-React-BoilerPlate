import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { domain } from "../../../env";

const UpazillaList = () => {
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);

  const [filterDivision, setFilterDivision] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Fetch divisions
  useEffect(() => {
    axios.get(`${domain}/api/divisions/`)
      .then(res => setDivisions(res.data.results || res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch districts for filter or modal
  const fetchDistricts = (divisionId = "") => {
    if (!divisionId) {
      setDistricts([]);
      return;
    }
    axios.get(`${domain}/api/districts/?division=${divisionId}`)
      .then(res => setDistricts(res.data.results || res.data))
      .catch(err => console.error(err));
  };

  // Fetch upazillas with filter and pagination
  const fetchUpazillas = (page = 1) => {
    let url = `${domain}/api/upazillas/?page=${page}`;
    if (filterDivision) url += `&division=${filterDivision}`;
    if (filterDistrict) url += `&district=${filterDistrict}`;

    axios.get(url)
      .then(res => {
        setUpazillas(res.data.results || res.data);
        setCurrentPage(page);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
        setTotalPages(Math.ceil(res.data.count / 10));
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUpazillas(1);
  }, [filterDivision, filterDistrict]);

  // CREATE Upazilla
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${domain}/api/upazillas/`, { name, district });
      setName("");
      setDivision("");
      setDistrict("");
      fetchUpazillas(1);

      const modalEl = document.getElementById('addModal');
      if (modalEl) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
      }

      navigate("/dashboard/upazillas");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete
  const handleDelete = (id) => {
    if (!window.confirm("Delete this upazilla?")) return;
    axios.delete(`${domain}/api/upazillas/${id}/`)
      .then(() => fetchUpazillas(currentPage));
  };

  // When filterDivision changes, reset filterDistrict and fetch districts
  useEffect(() => {
    setFilterDistrict("");
    fetchDistricts(filterDivision);
  }, [filterDivision]);

  // For modal chain dropdown (division → districts)
  useEffect(() => {
    if (division) {
      axios.get(`${domain}/api/districts/?division=${division}`)
        .then(res => setDistricts(res.data.results || res.data))
        .catch(err => console.error(err));
    } else {
      setDistricts([]);
    }
  }, [division]);

  return (
    <div className="container mt-4">
      <div className="card shadow">
        {/* Header */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>Upazilla List</h5>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
            + Add Upazilla
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 d-flex gap-3">
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

          <select
            className="form-select w-25"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Upazilla Table */}
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Upazilla</th>
              <th>District</th>
              <th>Division</th>
              <th width="160">Action</th>
            </tr>
          </thead>
          <tbody>
            {upazillas.length > 0 ? upazillas.map((u, i) => (
              <tr key={u.id}>
                <td>{(currentPage - 1) * 10 + i + 1}</td>
                <td>{u.name}</td>
                <td>{u.district_name}</td>
                <td>{u.division_name}</td>
                <td>
                  <Link to={`/dashboard/upazillas/edit/${u.id}`} className="btn btn-sm btn-warning me-2">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-3">No upazillas found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center p-3">
          <button
            className="btn btn-secondary"
            onClick={() => fetchUpazillas(currentPage - 1)}
            disabled={!prevPage}
          >
            Previous
          </button>

          <span>Page {currentPage} of {totalPages}</span>

          <button
            className="btn btn-secondary"
            onClick={() => fetchUpazillas(currentPage + 1)}
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
              <h5>Add Upazilla</h5>
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

              <select
                className="form-select mb-3"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              >
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <input
                className="form-control"
                placeholder="Upazilla name"
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

export default UpazillaList;
