import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; 
import "../../../CSS/StudentProfile.css";

const StudentUpdateForm = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ আপনার কাস্টম হুক ব্যবহার করে আইডি খুঁজে বের করা
  const studentId = useStudent(propId);
  
  // এডিট মোড কি না তা চেক করা
  const isEditMode = !!studentId && location.pathname.includes("update_student");

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", fathers_name: "", mothers_name: "",
    email: "", mobile: "", gender: "m", religion: "",
    date_of_birth: "", birth_id: "", guardian_name: "",
    guardian_mobile: "", active: true,
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    // ২. এডিট মোড হলে ডাটা ফেচ করা
    if (isEditMode && studentId) {
      CM.axiosInstance.get(`/api/student/${studentId}/`)
        .then(res => {
          const data = res.data;
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            fathers_name: data.fathers_name || "",
            mothers_name: data.mothers_name || "",
            email: data.email || "",
            mobile: data.mobile || "",
            gender: data.gender || "m",
            religion: data.religion || "",
            date_of_birth: data.date_of_birth || "",
            birth_id: data.birth_id || "",
            guardian_name: data.guardian_name || "",
            guardian_mobile: data.guardian_mobile || "",
            active: data.active,
          });
          if (data.photo) setPhotoPreview(`${CM.domain}${data.photo}`);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
          if (err.response?.status === 401) {
            // [Saved Instruction] Sweet Alert for session expired
            CM.Swal.fire({
              icon: 'error',
              title: 'সেশন শেষ!',
              text: 'অনুগ্রহ করে আবার লগইন করুন।',
              confirmButtonText: 'ঠিক আছে'
            }).then(() => navigate("/login"));
          }
        });
    }
  }, [studentId, isEditMode, navigate]);

  useEffect(() => {
    // রিলিজিয়ন লিস্ট ফেচ করা
    CM.axiosInstance.get(`/api/religion/`)
      .then(res => setReligions(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "photo" && files?.[0]) {
      setPhoto(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key] === null ? "" : formData[key]);
    });
    if (photo instanceof File) {
      data.append("photo", photo);
    }

    try {
      if (isEditMode) {
        await CM.axiosInstance.put(`/api/student/${studentId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // [Saved Instruction] Sweet Alert for Update
        CM.Swal.fire({
          icon: 'success',
          title: 'সফলভাবে আপডেট হয়েছে!',
          text: 'শিক্ষার্থীর তথ্য পরিবর্তন করা হয়েছে।',
          timer: 2000,
          showConfirmButton: false
        });
        navigate(`/StudentPage`, { state: { id: studentId } });
      } else {
        const res = await CM.axiosInstance.post(`/api/student/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newId = res.data.id || res.data.studentId;
        sessionStorage.setItem("activeStudentId", newId);
        
        // [Saved Instruction] Sweet Alert for New Registration
        CM.Swal.fire({
          icon: 'success',
          title: 'সফল!',
          text: 'নতুন শিক্ষার্থী যুক্ত করা হয়েছে।',
          timer: 2000,
          showConfirmButton: false
        });
        navigate(`/StudentPage`, { state: { id: newId } });
      }
    } catch (err) {
      console.log("Submit Error:", err.response?.data);
      CM.Swal.fire({
        icon: 'error',
        title: 'ওহ হো...',
        text: 'তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।',
      });
    }
  };

  if (loading && studentId) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: "80vh"}}>
      <div className="spinner-border text-primary" role="status"></div>
      <span className="ms-2">তথ্য লোড হচ্ছে...</span>
    </div>
  );

  return (
    <div className="container-fluid py-3 mb-5 pb-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0 fw-bold">
            {isEditMode ? "✏️ Update Student Profile" : "🚀 Register New Student"}
          </h5>
        </div>

        <div className="card-body bg-light p-4">
          <form onSubmit={submitHandler}>
            <div className="row g-4">
              
              {/* Left Side: Photo & Status */}
              <div className="col-md-3 text-center border-end">
                <div className="p-3 bg-white rounded-4 shadow-sm">
                  <div className="mb-3 position-relative d-inline-block">
                    <img
                      src={photoPreview || "/icons/default.png"}
                      alt="Student"
                      className="rounded-4 border shadow-sm"
                      style={{ width: "160px", height: "180px", objectFit: "cover" }}
                    />
                  </div>
                  <label htmlFor="photoInp" className="btn btn-outline-primary btn-sm w-100 fw-bold mb-3 rounded-pill shadow-sm">
                    📷 Change Photo
                  </label>
                  <input type="file" id="photoInp" name="photo" onChange={handleChange} hidden />

                  <div className="mt-3 pt-3 border-top text-start">
                    <label className="form-label small fw-bold text-muted">Account Status</label>
                    <select 
                      className="form-select form-select-sm fw-bold text-center rounded-pill" 
                      name="active" 
                      value={formData.active} 
                      onChange={handleChange}
                      style={{
                        backgroundColor: String(formData.active) === "true" ? "#eaffea" : "#ffeaea",
                        color: String(formData.active) === "true" ? "#2e7d32" : "#d32f2f",
                        borderColor: String(formData.active) === "true" ? "#a5d6a7" : "#ef9a9a"
                      }}
                    >
                      <option value={true}>🟢 Active</option>
                      <option value={false}>🔴 Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Side: Inputs */}
              <div className="col-md-9">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Student Name</label>
                    <input className="form-control border-2 shadow-sm" name="first_name" value={formData.first_name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Name in Bangla</label>
                    <input className="form-control border-2 shadow-sm" name="last_name" value={formData.last_name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Email Address</label>
                    <input type="email" className="form-control border-2 shadow-sm" name="email" value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Mobile Number</label>
                    <input className="form-control border-2 shadow-sm" name="mobile" value={formData.mobile} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Birth ID / NID</label>
                    <input className="form-control border-2 shadow-sm" name="birth_id" value={formData.birth_id} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Date of Birth</label>
                    <input type="date" className="form-control border-2 shadow-sm" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Gender</label>
                    <select className="form-select border-2 shadow-sm" name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                      <option value="o">Others</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Religion</label>
                    <select className="form-select border-2 shadow-sm" name="religion" value={formData.religion} onChange={handleChange}>
                      <option value="">Select Religion</option>
                      {religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Father's Name</label>
                    <input className="form-control border-2 shadow-sm" name="fathers_name" value={formData.fathers_name} onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Mother's Name</label>
                    <input className="form-control border-2 shadow-sm" name="mothers_name" value={formData.mothers_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Guardian Name</label>
                    <input className="form-control border-2 shadow-sm" name="guardian_name" value={formData.guardian_name} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Guardian Mobile</label>
                    <input type="number" className="form-control border-2 shadow-sm" name="guardian_mobile" value={formData.guardian_mobile} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed-bottom bg-white border-top py-3 px-5 d-flex justify-content-end gap-3 shadow-lg" style={{zIndex: 1050}}>
              <button type="button" className="btn btn-outline-secondary px-4 rounded-pill fw-bold shadow-sm" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm">
                {isEditMode ? "💾 Update Profile" : "🚀 Register Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentUpdateForm;