import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as CM from "../../../../componentExporter"; // CM ইম্পোর্ট করা হলো
import Swal from "sweetalert2";

const UpazillaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);

  // ১. প্রাথমিক ডাটা (Divisions এবং Upazilla Details) ফেচ করা
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // বিভাগ এবং নির্দিষ্ট উপজেলার ডাটা একসাথে ফেচ করা
        const [divRes, upazillaRes] = await Promise.all([
          CM.axiosInstance.get(`/api/divisions/`),
          CM.axiosInstance.get(`/api/upazillas/${id}/`)
        ]);

        setDivisions(divRes.data.results || divRes.data);
        setName(upazillaRes.data.name);
        setDistrict(upazillaRes.data.district); // উপজেলার জেলা ID
        setDivision(upazillaRes.data.district_division_id || ""); // ব্যাকএন্ড থেকে আসা বিভাগ ID

      } catch (err) {
        console.error("Fetch Error:", err);
        if (err.response?.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, navigate]);

  // ২. যখনই Division পরিবর্তন হবে, সংশ্লিষ্ট জেলাগুলো লোড হবে
  useEffect(() => {
    if (division) {
      CM.axiosInstance.get(`/api/districts/?division=${division}`)
        .then(res => {
          setDistricts(res.data.results || res.data);
        })
        .catch(err => console.error("District Load Error:", err));
    } else {
      setDistricts([]);
    }
  }, [division]);

  // ৩. আপডেট হ্যান্ডলার
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await CM.axiosInstance.put(`/api/upazillas/${id}/`, { name, district });
      
      // [Saved Instruction] Sweet Alert for successful update
      Swal.fire({
        icon: 'success',
        title: 'আপডেট সফল!',
        text: 'উপজেলার তথ্য পরিবর্তন করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });
      
      navigate("/dashboard/upazillas");
    } catch (err) {
      Swal.fire("Error", "তথ্য আপডেট করা সম্ভব হয়নি।", "error");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '70vh'}}>
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="card shadow-lg border-0 rounded-4 col-md-6 mx-auto">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="bi bi-pencil-square me-2"></i>Edit Upazilla
          </h5>
        </div>

        <form onSubmit={handleUpdate} className="card-body p-4">
          {/* Division Select */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary text-uppercase">Division</label>
            <select
              className="form-select form-control-lg bg-light border-0 shadow-sm"
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                setDistrict(""); // বিভাগ পাল্টালে জেলা রিসেট হবে
              }}
              required
            >
              <option value="">Select Division</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary text-uppercase">District</label>
            <select
              className="form-select form-control-lg bg-light border-0 shadow-sm"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              disabled={!division}
            >
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Upazilla Name */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary text-uppercase">Upazilla Name</label>
            <input
              className="form-control form-control-lg bg-light border-0 shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mirsharai"
              required
            />
          </div>

          {/* Buttons */}
          <div className="d-flex gap-3">
            <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary rounded-pill px-4 flex-grow-1 shadow">
              Update Upazilla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpazillaEdit;