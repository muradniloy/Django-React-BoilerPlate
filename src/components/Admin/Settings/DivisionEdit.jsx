import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { domain } from "../../../env";

const DivisionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    axios.get(`${domain}/api/divisions/${id}/`)
      .then(res => setName(res.data.name));
  }, [id]);

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`${domain}/api/divisions/${id}/`, { name })
      .then(() => navigate("/dashboard/divisions"));
  };

  return (
    <div className="container mt-4">
      <div className="card shadow col-md-6 mx-auto">
        <div className="card-header">
          <h5>Edit Division</h5>
        </div>
        <form onSubmit={handleUpdate} className="card-body">
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

export default DivisionEdit;
