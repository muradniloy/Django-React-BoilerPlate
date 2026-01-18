import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { domain } from "../../../env";

const DistrictEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    axios.get(`${domain}/api/divisions/`)
      .then(res => setDivisions(res.data.results || []));

    axios.get(`${domain}/api/districts/${id}/`)
      .then(res => {
        setName(res.data.name);
        setDivision(res.data.division);
      });
  }, [id]);

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`${domain}/api/districts/${id}/`, {
      name,
      division
    }).then(() => navigate("/dashboard/districts"));
  };

  return (
    <div className="container mt-4">
      <div className="card shadow col-md-6 mx-auto">
        <div className="card-header">
          <h5>Edit District</h5>
        </div>

        <form onSubmit={handleUpdate} className="card-body">
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
            className="form-control mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button className="btn btn-success">Update</button>
        </form>
      </div>
    </div>
  );
};

export default DistrictEdit;
