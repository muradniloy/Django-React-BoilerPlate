import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { domain } from "../../../env";

const UpdateDivisionPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [divisionId, setDivisionId] = useState(""); // selected division
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const axiosInstance = axios.create({ baseURL: domain, withCredentials: true });

  // ========================
  // Load all divisions
  // ========================
  useEffect(() => {
    axiosInstance.get("/api/divisions/")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setDivisions(data);
       
      })
      .catch(err => console.error("Error loading divisions:", err));
  }, []);

  // ========================
  // Load student address if exists
  // ========================
  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/api/student_address/${studentId}/`)
      .then(res => {
        // যদি address থাকে, division id set হবে
        const divId = res.data.division || "";
         console.log(res.data.division)
        setDivisionId(divId.toString());
        setIsEdit(true);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          // Address নেই → create mode
          setIsEdit(false);
          setDivisionId("");
        } else {
          console.error("Error loading student address:", err);
          alert("Something went wrong while loading student address.");
          navigate(-1);
        }
      })
      .finally(() => setLoading(false));
  }, [studentId, navigate]);

  // ========================
  // Handle form submit
  // ========================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!divisionId) {
      alert("Please select a division");
      return;
    }

    const payload = { division: Number(divisionId) };

    if (isEdit) {
      // Update existing address
      axiosInstance.put(`/api/student_address/${studentId}/`, payload)
        .then(() => {
          alert("Division updated successfully!");
          navigate(`/student_address/${studentId}`);
        })
        .catch(err => console.error("Update failed:", err.response?.data || err));
    } else {
      // Create new address with only division (other fields can be blank or defaults)
      axiosInstance.post(`/api/student_address/${studentId}/`, payload)
        .then(() => {
          alert("Division created successfully!");
          navigate(`/student_address/${studentId}`);
        })
        .catch(err => console.error("Create failed:", err.response?.data || err));
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h4>{isEdit ? "Update Division" : "Add Division"}</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="divisionSelect" className="form-label">Division</label>
          <select
            id="divisionSelect"
            className="form-control"
            value={divisionId}
            onChange={e => setDivisionId(e.target.value)}
          >
            <option value="">Select Division</option>
            {divisions.map(d => (
              <option key={d.id} value={d.id.toString()}>{d.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          {isEdit ? "Update Division" : "Add Division"}
        </button>
      </form>
    </div>
  );
};

export default UpdateDivisionPage;
