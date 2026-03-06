import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; 

const UpdateStudentAddressPage = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const studentId = useStudent(propId);

  const [formData, setFormData] = useState({
    division: "", district: "", upazilla: "", Post_Office: "", Village: "",
    Present_Division: "", Present_District: "", Present_Upazilla: "",
    Present_Post_Office: "", Present_Village: "",
  });

  const [student, setStudent] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazillas, setUpazillas] = useState([]);
  const [presentDistricts, setPresentDistricts] = useState([]);
  const [presentUpazillas, setPresentUpazillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  // ১. বিভাগ লোড করা
  useEffect(() => {
    CM.axiosInstance.get(`/api/divisions/`)
      .then(res => setDivisions(res.data.results || res.data))
      .catch(err => console.error("Division Load Error", err));
  }, []);

  // ✅ [NEW] Same as Permanent লজিক: সুইচ অন করলে ডাটা কপি হবে
  useEffect(() => {
    if (sameAsPermanent) {
      setFormData(prev => ({
        ...prev,
        Present_Division: prev.division,
        Present_District: prev.district,
        Present_Upazilla: prev.upazilla,
        Present_Post_Office: prev.Post_Office,
        Present_Village: prev.Village,
      }));
      // ড্রপডাউনগুলোর লিস্টও কপি করা হচ্ছে
      setPresentDistricts(districts);
      setPresentUpazillas(upazillas);
    }
  }, [sameAsPermanent, formData.division, formData.district, formData.upazilla, formData.Post_Office, formData.Village]);

  // ২. এক্সিস্টিং ডাটা ফেচ করা
  useEffect(() => {
    if (!studentId) return;
    const fetchData = async () => {
        setLoading(true);
        try {
            const studentRes = await CM.axiosInstance.get(`/api/student/${studentId}/`);
            setStudent(studentRes.data);
            const res = await CM.axiosInstance.get(`/api/student_address/${studentId}/`);
            const data = res.data;
            setIsEdit(true);
            const fixedData = {
                ...data,
                division: data.division?.id || data.division || "",
                district: data.district?.id || data.district || "",
                upazilla: data.upazilla?.id || data.upazilla || "",
                Present_Division: data.Present_Division?.id || data.Present_Division || "",
                Present_District: data.Present_District?.id || data.Present_District || "",
                Present_Upazilla: data.Present_Upazilla?.id || data.Present_Upazilla || "",
            };
            setFormData(fixedData);
            if (fixedData.division) loadDistricts(fixedData.division, true);
            if (fixedData.district) loadUpazillas(fixedData.district, true);
            if (fixedData.Present_Division) loadDistricts(fixedData.Present_Division, false);
            if (fixedData.Present_District) loadUpazillas(fixedData.Present_District, false);
        } catch (err) { setIsEdit(false); } finally { setLoading(false); }
    };
    fetchData();
  }, [studentId]);

  const loadDistricts = (divisionId, permanent = true) => {
    if (!divisionId) return;
    CM.axiosInstance.get(`/api/districts/?division=${divisionId}`).then(res => {
      const data = res.data.results || res.data;
      permanent ? setDistricts(data) : setPresentDistricts(data);
    });
  };

  const loadUpazillas = (districtId, permanent = true) => {
    if (!districtId) return;
    CM.axiosInstance.get(`/api/upazillas/?district=${districtId}`).then(res => {
      const data = res.data.results || res.data;
      permanent ? setUpazillas(data) : setPresentUpazillas(data);
    });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "division") loadDistricts(value, true);
    if (name === "district") loadUpazillas(value, true);
    if (name === "Present_Division") loadDistricts(value, false);
    if (name === "Present_District") loadUpazillas(value, false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    CM.Swal.fire({ 
        title: "Saving Address...", 
        allowOutsideClick: false, 
        didOpen: () => CM.Swal.showLoading() 
    });

    const payload = { ...formData, student: studentId };

    try {
      if (isEdit) { await CM.axiosInstance.put(`/api/student_address/${studentId}/`, payload); } 
      else { await CM.axiosInstance.post(`/api/student_address/${studentId}/`, payload); }
      
      CM.Swal.fire({ icon: 'success', title: 'Updated Successfully!', timer: 1500, showConfirmButton: false });
      setTimeout(() => navigate(-1), 1500);
    } catch (err) { 
        CM.Swal.fire("Error", "Check all required fields.", "error"); 
    } finally { setSubmitting(false); }
  };

  if (loading && studentId) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid mt-2 pb-4 px-4">
      {/* Profile Header */}
      <div className="card shadow-sm border-0 mb-3 bg-white">
        <div className="card-body py-2 d-flex align-items-center gap-3">
          <img src={student?.photo ? (student.photo.startsWith('http') ? student.photo : `${CM.domain}${student.photo}`) : "/default.png"}
            alt="Student" className="rounded-circle border shadow-sm" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
          <div>
            <h6 className="mb-0 fw-bold">{student?.first_name} {student?.last_name}</h6>
            <small className="text-primary fw-bold">ID: {studentId}</small>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header bg-dark text-white py-2">
          <h6 className="mb-0 text-center">{isEdit ? "Update Address Information" : "Add Address Information"}</h6>
        </div>

        <form id="addressForm" onSubmit={handleSubmit}>
          <div className="card-body py-3">
            {/* Permanent Address */}
            <h6 className="text-primary border-bottom border-2 pb-1 mb-4 fw-bold small">PERMANENT ADDRESS</h6>
            
            <div className="row g-3 align-items-center mb-4">
              <label className="col-md-1 text-end small fw-bold">Division:</label>
              <div className="col-md-3">
                <select name="division" value={formData.division} onChange={handleChange} className="form-select form-select-sm shadow-sm" required>
                  <option value="">Select</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <label className="col-md-1 text-end small fw-bold">District:</label>
              <div className="col-md-3">
                <select name="district" value={formData.district} onChange={handleChange} className="form-select form-select-sm shadow-sm" required>
                  <option value="">Select</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <label className="col-md-1 text-end small fw-bold">Upazilla:</label>
              <div className="col-md-3">
                <select name="upazilla" value={formData.upazilla} onChange={handleChange} className="form-select form-select-sm shadow-sm" required>
                  <option value="">Select</option>
                  {upazillas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <label className="col-md-1 text-end small fw-bold">P.O:</label>
              <div className="col-md-3">
                <input type="text" name="Post_Office" value={formData.Post_Office} onChange={handleChange} className="form-control form-control-sm shadow-sm" required />
              </div>
              <label className="col-md-1 text-end small fw-bold">Village:</label>
              <div className="col-md-3">
                <input type="text" name="Village" value={formData.Village} onChange={handleChange} className="form-control form-control-sm shadow-sm" required />
              </div>
            </div>

            {/* Present Address Header with Switch */}
            <div className="d-flex justify-content-between align-items-center border-bottom border-2 pb-1 mb-4 mt-4">
              <h6 className="text-success fw-bold mb-0 small">PRESENT ADDRESS</h6>
              <div className="form-check form-switch bg-light border border-success rounded-pill px-3 py-1 shadow-sm">
                <input type="checkbox" checked={sameAsPermanent} onChange={e => setSameAsPermanent(e.target.checked)} className="form-check-input" id="sameAs" style={{ cursor: 'pointer' }} />
                <label className="form-check-label small fw-bold ms-1" htmlFor="sameAs" style={{ cursor: 'pointer' }}>Same as Permanent</label>
              </div>
            </div>

            <div className={`row g-3 align-items-center mb-2 ${sameAsPermanent ? 'opacity-75' : ''}`}>
              <label className="col-md-1 text-end small fw-bold">Division:</label>
              <div className="col-md-3">
                <select name="Present_Division" value={formData.Present_Division} onChange={handleChange} disabled={sameAsPermanent} className="form-select form-select-sm shadow-sm" required>
                  <option value="">Select</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <label className="col-md-1 text-end small fw-bold">District:</label>
              <div className="col-md-3">
                <select name="Present_District" value={formData.Present_District} onChange={handleChange} disabled={sameAsPermanent} className="form-select form-select-sm shadow-sm" required>
                  <option value="">Select</option>
                  {presentDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <label className="col-md-1 text-end small fw-bold">Upazilla:</label>
              <div className="col-md-3">
                <select name="Present_Upazilla" value={formData.Present_Upazilla} onChange={handleChange} disabled={sameAsPermanent} className="form-select form-select-sm shadow-sm" required>
                  <option value="">Select</option>
                  {presentUpazillas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <label className="col-md-1 text-end small fw-bold">P.O:</label>
              <div className="col-md-3">
                <input type="text" name="Present_Post_Office" value={formData.Present_Post_Office} onChange={handleChange} disabled={sameAsPermanent} className="form-control form-control-sm shadow-sm" required />
              </div>
              <label className="col-md-1 text-end small fw-bold">Village:</label>
              <div className="col-md-3">
                <input type="text" name="Present_Village" value={formData.Present_Village} onChange={handleChange} disabled={sameAsPermanent} className="form-control form-control-sm shadow-sm" required />
              </div>
            </div>
          </div>

          <div className="card-footer bg-white d-flex justify-content-end gap-3 py-3">
            <button type="button" className="btn btn-outline-secondary px-4 rounded-pill shadow-sm fw-bold" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm" disabled={submitting}>
              {submitting ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStudentAddressPage;