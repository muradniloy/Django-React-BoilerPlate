import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { domain } from "../../env";

const UpdateStudentAddressPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    division: "", district: "", upazilla: "", Post_Office: "", Village: "",
    Present_Division: "", Present_District: "", Present_Upazilla: "",
    Present_Post_Office: "", Present_Village: "",
  });

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);
  const [presentDistricts, setPresentDistricts] = useState([]);
  const [presentUpazillas, setPresentUpazillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const axiosInstance = axios.create({ baseURL: domain, withCredentials: true });

  // Load divisions on mount
  useEffect(() => {
    axiosInstance.get("/api/divisions/").then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setDivisions(data);
    });
  }, []);

  // Load existing student address
  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/api/student_address/${studentId}/`)
      .then(res => {
        const data = res.data;
        setIsEdit(true);

        const fixedData = {
          ...data,
          division: data.division?.id || "",
          district: data.district?.id || "",
          upazilla: data.upazilla?.id || "",
          Present_Division: data.Present_Division?.id || "",
          Present_District: data.Present_District?.id || "",
          Present_Upazilla: data.Present_Upazilla?.id || "",
          Post_Office: data.Post_Office || "",
          Village: data.Village || "",
          Present_Post_Office: data.Present_Post_Office || "",
          Present_Village: data.Present_Village || "",
        };

        setFormData(fixedData);

        // Load chain dropdowns
        if (fixedData.division) loadDistricts(fixedData.division, true, fixedData.district);
        if (fixedData.district) loadUpazillas(fixedData.district, true, fixedData.upazilla);
        if (fixedData.Present_Division) loadDistricts(fixedData.Present_Division, false, fixedData.Present_District);
        if (fixedData.Present_District) loadUpazillas(fixedData.Present_District, false, fixedData.Present_Upazilla);
      })
      .catch(err => setIsEdit(false))
      .finally(() => setLoading(false));
  }, [studentId]);

  // Chain helpers
  const loadDistricts = (divisionId, permanent = true, selectedDistrict = "") => {
    if (!divisionId) {
      permanent ? setDistricts([]) : setPresentDistricts([]);
      permanent ? setUpazillas([]) : setPresentUpazillas([]);
      return;
    }
    axiosInstance.get(`/api/districts/?division=${divisionId}`).then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      permanent ? setDistricts(data) : setPresentDistricts(data);
      if (selectedDistrict) handleChange({ target: { name: permanent ? "district" : "Present_District", value: selectedDistrict } });
    });
  };

  const loadUpazillas = (districtId, permanent = true, selectedUpazilla = "") => {
    if (!districtId) {
      permanent ? setUpazillas([]) : setPresentUpazillas([]);
      return;
    }
    axiosInstance.get(`/api/upazillas/?district=${districtId}`).then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      permanent ? setUpazillas(data) : setPresentUpazillas(data);
      if (selectedUpazilla) handleChange({ target: { name: permanent ? "upazilla" : "Present_Upazilla", value: selectedUpazilla } });
    });
  };

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Chain updates
    if (name === "division") { setFormData(prev => ({ ...prev, district: "", upazilla: "" })); loadDistricts(value, true); setUpazillas([]); }
    if (name === "district") { setFormData(prev => ({ ...prev, upazilla: "" })); loadUpazillas(value, true); }
    if (name === "Present_Division") { setFormData(prev => ({ ...prev, Present_District: "", Present_Upazilla: "" })); loadDistricts(value, false); setPresentUpazillas([]); }
    if (name === "Present_District") { setFormData(prev => ({ ...prev, Present_Upazilla: "" })); loadUpazillas(value, false); }

    // sameAsPermanent
    if (sameAsPermanent) {
      switch (name) {
        case "division": setFormData(prev => ({ ...prev, Present_Division: value })); break;
        case "district": setFormData(prev => ({ ...prev, Present_District: value })); break;
        case "upazilla": setFormData(prev => ({ ...prev, Present_Upazilla: value })); break;
        case "Post_Office": setFormData(prev => ({ ...prev, Present_Post_Office: value })); break;
        case "Village": setFormData(prev => ({ ...prev, Present_Village: value })); break;
      }
    }
  };

  // Submit form
  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      division: formData.division || null,
      district: formData.district || null,
      upazilla: formData.upazilla || null,
      Post_Office: formData.Post_Office,
      Village: formData.Village,
      Present_Division: sameAsPermanent ? formData.division : (formData.Present_Division || null),
      Present_District: sameAsPermanent ? formData.district : (formData.Present_District || null),
      Present_Upazilla: sameAsPermanent ? formData.upazilla : (formData.Present_Upazilla || null),
      Present_Post_Office: sameAsPermanent ? formData.Post_Office : formData.Present_Post_Office,
      Present_Village: sameAsPermanent ? formData.Village : formData.Present_Village,
    };

    const request = isEdit
      ? axiosInstance.put(`/api/student_address/${studentId}/`, payload)
      : axiosInstance.post(`/api/student_address/${studentId}/`, payload);

    request
      .then(() => navigate(`/student_address/${studentId}`))
      .catch(err => console.log(err.response?.data || err));
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{isEdit ? "Update Address" : "Add Address"}</h5>
          <button type="submit" form="addressForm" className="btn btn-primary">
            {isEdit ? "Update" : "Save"}
          </button>
        </div>

        <div className="card-body">
          <form id="addressForm" onSubmit={handleSubmit}>
            <div className="row">
              {/* Permanent */}
              <div className="col-md-6 border-end">
                <h6 className="fw-bold mb-3">Permanent Address</h6>
                <select name="division" value={formData.division} onChange={handleChange} className="form-control mb-2">
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select name="district" value={formData.district} onChange={handleChange} className="form-control mb-2">
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select name="upazilla" value={formData.upazilla} onChange={handleChange} className="form-control mb-2">
                  <option value="">Select Upazilla</option>
                  {upazillas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="text" name="Post_Office" value={formData.Post_Office} onChange={handleChange} placeholder="Post Office" className="form-control mb-2"/>
                <input type="text" name="Village" value={formData.Village} onChange={handleChange} placeholder="Village" className="form-control mb-2"/>
              </div>

              {/* Present */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3">Present Address</h6>
                <div className="form-check mb-2">
                  <input type="checkbox" checked={sameAsPermanent} onChange={e => setSameAsPermanent(e.target.checked)} className="form-check-input" id="sameAsPermanent"/>
                  <label htmlFor="sameAsPermanent" className="form-check-label">Same as Permanent</label>
                </div>

                <select name="Present_Division" value={formData.Present_Division} onChange={handleChange} disabled={sameAsPermanent} className="form-control mb-2">
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select name="Present_District" value={formData.Present_District} onChange={handleChange} disabled={sameAsPermanent} className="form-control mb-2">
                  <option value="">Select District</option>
                  {presentDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select name="Present_Upazilla" value={formData.Present_Upazilla} onChange={handleChange} disabled={sameAsPermanent} className="form-control mb-2">
                  <option value="">Select Upazilla</option>
                  {presentUpazillas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="text" name="Present_Post_Office" value={formData.Present_Post_Office} onChange={handleChange} disabled={sameAsPermanent} placeholder="Post Office" className="form-control mb-2"/>
                <input type="text" name="Present_Village" value={formData.Present_Village} onChange={handleChange} disabled={sameAsPermanent} placeholder="Village" className="form-control mb-2"/>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStudentAddressPage;
