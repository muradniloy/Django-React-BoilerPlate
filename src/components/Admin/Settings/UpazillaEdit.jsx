import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { domain } from "../../../env";

const UpazillaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");

  // Fetch divisions
  useEffect(() => {
    axios.get(`${domain}/api/divisions/`)
      .then(res => setDivisions(res.data.results || res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch Upazilla data
  useEffect(() => {
    axios.get(`${domain}/api/upazillas/${id}/`)
      .then(res => {
        setName(res.data.name);
        setDistrict(res.data.district);
        setDivision(res.data.district_division_id || ""); // assume backend sends district -> division id
      })
      .catch(err => console.error(err));
  }, [id]);

  // Fetch districts when division changes
  useEffect(() => {
    if (division) {
      axios.get(`${domain}/api/districts/?division=${division}`)
        .then(res => setDistricts(res.data.results || res.data))
        .catch(err => console.error(err));
    } else {
      setDistricts([]);
    }
  }, [division]);

  // Update Upazilla
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${domain}/api/upazillas/${id}/`, { name, district });
      navigate("/dashboard/upazillas");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header">
          <h5>Edit Upazilla</h5>
        </div>
        <form onSubmit={handleUpdate} className="card-body">
          <div className="mb-3">
            <label className="form-label">Division</label>
            <select
              className="form-select"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              required
            >
              <option value="">Select Division</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">District</label>
            <select
              className="form-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            >
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Upazilla Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpazillaEdit;
