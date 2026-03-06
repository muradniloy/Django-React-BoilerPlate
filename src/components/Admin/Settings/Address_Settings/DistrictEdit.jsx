import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as CM from "../../../../componentExporter"; // গ্লোবাল এক্সপোর্টার ব্যবহার করা হলো
import Swal from "sweetalert2";

const DistrictEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ১. CM.axiosInstance ব্যবহার করা হয়েছে, যা অটোমেটিক sessionStorage থেকে টোকেন নেবে
        const [divRes, distRes] = await Promise.all([
          CM.axiosInstance.get(`/api/divisions/`),
          CM.axiosInstance.get(`/api/districts/${id}/`)
        ]);

        setDivisions(divRes.data.results || divRes.data);
        setName(distRes.data.name);
        setDivision(distRes.data.division);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
        if (err.response?.status === 401) {
          Swal.fire({
            icon: "error",
            title: "সেশন শেষ!",
            text: "দয়া করে আবার লগইন করুন।",
          });
          navigate("/"); // লগইন পেজে রিডাইরেক্ট
        }
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleUpdate = (e) => {
    e.preventDefault();
    
    // ২. আপডেট করার সময় axiosInstance ব্যবহার
    CM.axiosInstance.put(`/api/districts/${id}/`, {
      name,
      division
    })
    .then(() => {
      // [Saved Instruction] Sweet Alert for success
      Swal.fire({
        icon: 'success',
        title: 'আপডেট সফল!',
        text: 'জেলার তথ্য পরিবর্তন করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/dashboard/districts");
    })
    .catch(err => {
      Swal.fire("ভুল হয়েছে", "তথ্য আপডেট করা যায়নি। ডুপ্লিকেট নাম কিনা চেক করুন।", "error");
    });
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '70vh'}}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-bold text-secondary">Loading District Data...</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4 col-md-6 mx-auto">
        <div className="card-header bg-white py-3 border-bottom text-center">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="bi bi-pencil-square me-2"></i>Edit District Information
          </h5>
        </div>

        <form onSubmit={handleUpdate} className="card-body p-4">
          {/* Division Selection */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary text-uppercase">Under Division</label>
            <select
              className="form-select form-control-lg bg-light border-0 shadow-sm"
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

          {/* District Name Input */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary text-uppercase">District Name</label>
            <input
              className="form-control form-control-lg bg-light border-0 shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Noakhali"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <button 
              type="button" 
              className="btn btn-light rounded-pill px-4 flex-grow-1 fw-bold" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary rounded-pill px-4 flex-grow-1 fw-bold shadow"
            >
              Update District
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistrictEdit;