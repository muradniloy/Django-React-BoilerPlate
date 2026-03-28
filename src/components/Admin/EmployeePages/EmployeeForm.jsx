import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as CM from "../../../componentExporter"; 

const EmployeeForm = ({ employeeId: propId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const employeeId = propId || location.state?.id;
  const isEditMode = !!employeeId && location.pathname.includes("update_employee");

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", mobile: "", 
    gender: "m", religion: "", date_of_birth: "", nid_number: "",
    fathers_name: "", mothers_name: "",
    department: "", designation: "", joining_date: "",
    present_division: "", present_district: "", present_upazilla: "", present_address_details: "",
    permanent_division: "", permanent_district: "", permanent_upazilla: "", permanent_address_details: "",
    about: "", active: true,
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [options, setOptions] = useState({ 
    departments: [], designations: [], religions: [], 
    divisions: [], districts: [], upazillas: [],
    perm_districts: [], perm_upazillas: [] // পার্মানেন্ট অ্যাড্রেসের জন্য আলাদা অপশন
  });
  const [loading, setLoading] = useState(isEditMode);

  // ১. ডাটা ফেচিং (Edit Mode)
useEffect(() => {
    if (isEditMode && employeeId) {
        CM.axiosInstance.get(`/api/employees/profile/${employeeId}/`)
            .then(res => {
                const data = res.data;
                setFormData({
                    ...data, // এর মধ্যে এখন first_name, last_name, email সরাসরি থাকবে
                });
                if (data.photo) setPhotoPreview(`${CM.domain}${data.photo}`);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                CM.Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load employee data.' });
            });
    }
}, [employeeId, isEditMode]);

  // ২. ড্রপডাউন অপশন লোড করা
  useEffect(() => {
    const fetchBaseOptions = async () => {
      try {
        const [dept, desig, rel, div] = await Promise.all([
          CM.axiosInstance.get("/api/departments/"),
          CM.axiosInstance.get("/api/designations/"),
          CM.axiosInstance.get("/api/religion/"),
          CM.axiosInstance.get("/api/divisions/")
        ]);
        setOptions(prev => ({
          ...prev,
          departments: dept.data.results || dept.data,
          designations: desig.data.results || desig.data,
          religions: rel.data,
          divisions: div.data.results || div.data
        }));
      } catch (err) { console.error("Options error", err); }
    };
    fetchBaseOptions();
  }, []);

  // ৩. প্রেজেন্ট অ্যাড্রেস ডিপেন্ডেন্ট ড্রপডাউন (Division -> District -> Upazilla)
  useEffect(() => {
    if (formData.present_division) {
      CM.axiosInstance.get(`/api/districts/?division=${formData.present_division}`)
        .then(res => setOptions(prev => ({ ...prev, districts: res.data.results || res.data })));
    } else {
        setOptions(prev => ({ ...prev, districts: [], upazillas: [] }));
    }
  }, [formData.present_division]);

  useEffect(() => {
    if (formData.present_district) {
      CM.axiosInstance.get(`/api/upazillas/?district=${formData.present_district}`)
        .then(res => setOptions(prev => ({ ...prev, upazillas: res.data.results || res.data })));
    } else {
        setOptions(prev => ({ ...prev, upazillas: [] }));
    }
  }, [formData.present_district]);

  // ৪. পার্মানেন্ট অ্যাড্রেস ডিপেন্ডেন্ট ড্রপডাউন (ফিক্স করা হয়েছে)
  useEffect(() => {
    if (formData.permanent_division) {
      CM.axiosInstance.get(`/api/districts/?division=${formData.permanent_division}`)
        .then(res => setOptions(prev => ({ ...prev, perm_districts: res.data.results || res.data })));
    } else {
        setOptions(prev => ({ ...prev, perm_districts: [], perm_upazillas: [] }));
    }
  }, [formData.permanent_division]);

  useEffect(() => {
    if (formData.permanent_district) {
      CM.axiosInstance.get(`/api/upazillas/?district=${formData.permanent_district}`)
        .then(res => setOptions(prev => ({ ...prev, perm_upazillas: res.data.results || res.data })));
    } else {
        setOptions(prev => ({ ...prev, perm_upazillas: [] }));
    }
  }, [formData.permanent_district]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "photo" && files?.[0]) {
      setPhoto(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  // ৫. "Same as Present Address" লজিক
 const handleSameAddress = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
        // প্রেজেন্ট অ্যাড্রেসের অপশনগুলো পার্মানেন্ট অপশনে সেট করা
        setOptions(prev => ({
            ...prev,
            perm_districts: prev.districts,
            perm_upazillas: prev.upazillas
        }));

        // ডাটা কপি করা
        setFormData(prev => ({
            ...prev,
            permanent_division: prev.present_division,
            permanent_district: prev.present_district,
            permanent_upazilla: prev.present_upazilla,
            permanent_address_details: prev.present_address_details,
        }));
    } else {
        // সুইচ অফ করলে ফিল্ডগুলো খালি করে দেওয়া (ঐচ্ছিক)
        setFormData(prev => ({
            ...prev,
            permanent_division: "",
            permanent_district: "",
            permanent_upazilla: "",
            permanent_address_details: "",
        }));
    }
};
const submitHandler = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach(key => {
        // 'photo' ফিল্ডটি আমরা আলাদাভাবে হ্যান্ডেল করবো নিচে
        if (key === "photo") return; 

        if (formData[key] !== null && formData[key] !== undefined) {
            data.append(key, formData[key]);
        }
    });

    // ফটো হ্যান্ডেলিং: শুধুমাত্র তখনই পাঠাবে যখন এটি একটি নতুন ফাইল (File object)
    if (photo instanceof File) {
        data.append("photo", photo);
    } 
    // যদি এডিট মোড হয় এবং নতুন ফটো না থাকে, তবে 'photo' কী-টি পাঠানোর দরকার নেই।
    // জ্যাঙ্গো আগের ফটোটিই রেখে দিবে।

    try {
        const url = isEditMode ? `/api/employees/profile/${employeeId}/` : `/api/employees/create/`;
        // এডিট মোডে 'patch' ব্যবহার করা নিরাপদ যাতে শুধু পরিবর্তন হওয়া ডাটা যায়
        const method = isEditMode ? 'put' : 'post';
        
        await CM.axiosInstance[method](url, data);
        
        CM.Swal.fire({ 
            icon: 'success', 
            title: 'Success!', 
            text: isEditMode ? 'Updated successfully.' : 'Registered successfully.', 
            timer: 2000, 
            showConfirmButton: false 
        });
        navigate(-1);
    } catch (err) {
        console.log("Error response:", err.response?.data);
        const serverError = err.response?.data;
        let errorMessage = "Operation failed!";
        
        if (serverError) {
            errorMessage = Object.entries(serverError)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join("\n");
        }

        CM.Swal.fire({ icon: 'error', title: 'Error', text: errorMessage });
    }
};

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;

  return (
    <div className="container-fluid py-3 mb-5 pb-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-success text-white py-3">
          <h5 className="mb-0 fw-bold">{isEditMode ? "✏️ Edit Employee Profile" : "🚀 New Employee Registration"}</h5>
        </div>

        <div className="card-body bg-light p-4">
          <form onSubmit={submitHandler}>
            <div className="row g-4">
              
              {/* Left Side: Photo, Status, and Address Section (ফাঁকা জায়গা কমানোর জন্য অ্যাড্রেস এখানে যোগ করা হয়েছে) */}
              <div className="col-md-4 text-center border-end pe-4">
                <div className="p-3 bg-white rounded-4 shadow-sm mb-4">
                  <img src={photoPreview || "/icons/default-emp.png"} alt="Employee" className="rounded-4 border mb-3 shadow-sm" style={{ width: "160px", height: "180px", objectFit: "cover" }} />
                  <label htmlFor="photoInp" className="btn btn-outline-success btn-sm w-100 fw-bold rounded-pill mb-3">📷 Upload Photo</label>
                  <input type="file" id="photoInp" name="photo" onChange={handleChange} hidden />
                  
                  <div className="text-start border-top pt-3">
                    <label className="form-label small fw-bold text-muted">Account Status</label>
                    <select className="form-select form-select-sm rounded-pill fw-bold" name="active" value={formData.active} onChange={handleChange}>
                      <option value={true}>🟢 Active</option>
                      <option value={false}>🔴 Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Address Section on Left Side */}
                <div className="bg-white rounded-4 p-3 shadow-sm text-start">
                    {/* Present Address */}
                    <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">📍 Present Address</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <label className="form-label small fw-bold">Division</label>
                            <select className="form-select form-select-sm border-2 shadow-sm" name="present_division" value={formData.present_division} onChange={handleChange}>
                                <option value="">Division</option>
                                {options.divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold">District</label>
                            <select className="form-select form-select-sm border-2 shadow-sm" name="present_district" value={formData.present_district} onChange={handleChange} disabled={!formData.present_division}>
                                <option value="">District</option>
                                {options.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Upazilla</label>
                            <select className="form-select form-select-sm border-2 shadow-sm" name="present_upazilla" value={formData.present_upazilla} onChange={handleChange} disabled={!formData.present_district}>
                                <option value="">Upazilla</option>
                                {options.upazillas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Address Details</label>
                            <input className="form-control form-control-sm border-2 shadow-sm" placeholder="Village/House/Road" name="present_address_details" value={formData.present_address_details} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Permanent Address with 'Same As' Button */}
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
    <h6 className="fw-bold text-primary m-0">🏠 Permanent Address</h6>
    
    {/* আধুনিক সুইচ বাটন */}
    <div className="form-check form-switch">
        <input 
            className="form-check-input cursor-pointer" 
            type="checkbox" 
            id="sameAsPresent" 
            style={{ width: '40px', height: '20px', cursor: 'pointer' }}
            onChange={handleSameAddress}
        />
        <label className="form-check-label small fw-bold text-muted ms-2" htmlFor="sameAsPresent">
            Same as Present
        </label>
    </div>
</div>
                    
                    <div className="row g-3">
                        <div className="col-6">
                            <label className="form-label small fw-bold">Division</label>
                            <select className="form-select form-select-sm border-2 shadow-sm" name="permanent_division" value={formData.permanent_division} onChange={handleChange}>
                                <option value="">Division</option>
                                {options.divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold">District</label>
                            <select className="form-select form-select-sm border-2 shadow-sm" name="permanent_district" value={formData.permanent_district} onChange={handleChange} disabled={!formData.permanent_division}>
                                <option value="">District</option>
                                {options.perm_districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Upazilla</label>
                            <select className="form-select form-select-sm border-2 shadow-sm" name="permanent_upazilla" value={formData.permanent_upazilla} onChange={handleChange} disabled={!formData.permanent_district}>
                                <option value="">Upazilla</option>
                                {options.perm_upazillas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Address Details</label>
                            <input className="form-control form-control-sm border-2 shadow-sm" placeholder="Village/House/Road" name="permanent_address_details" value={formData.permanent_address_details} onChange={handleChange} />
                        </div>
                    </div>
                </div>
              </div>

              {/* Right Side: Official & Personal Information */}
              <div className="col-md-8 ps-4">
                {/* 1. Official Information */}
                <h6 className="fw-bold text-success mb-3 border-bottom pb-2">📋 Official Information</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Department *</label>
                    <select className="form-select border-2 shadow-sm" name="department" value={formData.department} onChange={handleChange} required>
                      <option value="">Select Department</option>
                      {options.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Designation</label>
                    <select className="form-select border-2 shadow-sm" name="designation" value={formData.designation} onChange={handleChange}>
                      <option value="">Select Designation</option>
                      {options.designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Joining Date</label>
                    <input type="date" className="form-control border-2 shadow-sm" name="joining_date" value={formData.joining_date} onChange={handleChange} />
                  </div>
                </div>

                {/* 2. Personal Information */}
                <h6 className="fw-bold text-success mb-3 border-bottom pb-2">👤 Personal Information</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4"><label className="form-label small fw-bold">First Name</label><input className="form-control border-2 shadow-sm" name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">Last Name</label><input className="form-control border-2 shadow-sm" name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">Email</label><input type="email" className="form-control border-2 shadow-sm" name="email" value={formData.email} onChange={handleChange} required /></div>
                  
                  <div className="col-md-4"><label className="form-label small fw-bold">Mobile</label><input className="form-control border-2 shadow-sm" name="mobile" value={formData.mobile} onChange={handleChange} /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">NID Number</label><input className="form-control border-2 shadow-sm" name="nid_number" value={formData.nid_number} onChange={handleChange} /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">Date of Birth</label><input type="date" className="form-control border-2 shadow-sm" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} /></div>
                  
                  <div className="col-md-4"><label className="form-label small fw-bold">Gender</label><select className="form-select border-2 shadow-sm" name="gender" value={formData.gender} onChange={handleChange}><option value="m">Male</option><option value="f">Female</option><option value="o">Others</option></select></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">Religion</label><select className="form-select border-2 shadow-sm" name="religion" value={formData.religion} onChange={handleChange}><option value="">Select Religion</option>{options.religions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">Father's Name</label><input className="form-control border-2 shadow-sm" name="fathers_name" value={formData.fathers_name} onChange={handleChange} /></div>
                  <div className="col-md-4"><label className="form-label small fw-bold">Mother's Name</label><input className="form-control border-2 shadow-sm" name="mothers_name" value={formData.mothers_name} onChange={handleChange} /></div>
                </div>

                {/* 3. Others */}
                <h6 className="fw-bold text-success mb-3 border-bottom pb-2">📝 Biography / About</h6>
                <div className="col-12">
                  <textarea className="form-control border-2 shadow-sm" rows="6" name="about" placeholder="Describe the employee's background, roles, or any other relevant information..." value={formData.about} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed-bottom bg-white border-top py-3 px-5 d-flex justify-content-end gap-3 shadow-lg" style={{zIndex: 1050}}>
              <button type="button" className="btn btn-outline-secondary px-4 rounded-pill fw-bold shadow-sm" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-success px-5 rounded-pill fw-bold shadow-sm">{isEditMode ? "💾 Update Profile" : "🚀 Register Employee"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;