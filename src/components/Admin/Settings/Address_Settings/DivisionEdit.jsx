import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as CM from "../../../../componentExporter"; // CM ইম্পোর্ট করা হলো যা axiosInstance হ্যান্ডেল করে
import Swal from "sweetalert2";

const DivisionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ১. পুরাতন ডাটা ফেচ করা
  useEffect(() => {
    setLoading(true);
    // সরাসরি axiosInstance ব্যবহার করলে টোকেন নিয়ে আলাদা চিন্তা করতে হয় না
    CM.axiosInstance.get(`/api/divisions/${id}/`)
      .then((res) => {
        setName(res.data.name);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          Swal.fire({
            icon: "error",
            title: "সেশন শেষ!",
            text: "দয়া করে আবার লগইন করুন।",
          });
          navigate("/"); // লগইন পেজে রিডাইরেক্ট
        } else {
          Swal.fire("Error", "তথ্য খুঁজে পাওয়া যায়নি", "error");
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // ২. ডাটা আপডেট করা
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!name) return;

    CM.axiosInstance.put(`/api/divisions/${id}/`, { name })
      .then(() => {
        // [Saved Instruction] Sweet Alert for successful update
        Swal.fire({
          icon: "success",
          title: "আপডেট সফল!",
          text: "ডিভিশনের তথ্য আপডেট করা হয়েছে।",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard/divisions"); // লিস্ট পেজে ফিরে যাওয়া
      })
      .catch((err) => {
        Swal.fire("ভুল হয়েছে", "তথ্য আপডেট করা সম্ভব হয়নি", "error");
      });
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4 col-md-6 mx-auto">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="bi bi-pencil-square me-2"></i>Edit Division
          </h5>
        </div>
        
        {loading ? (
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2 text-muted">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="card-body py-4">
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary text-uppercase">
                Division Name
              </label>
              <input
                className="form-control form-control-lg bg-light border-0"
                placeholder="Enter division name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="d-flex gap-3">
              <button 
                type="button" 
                className="btn btn-light rounded-pill px-4 flex-grow-1" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-pill px-4 flex-grow-1 shadow"
              >
                Update Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DivisionEdit;