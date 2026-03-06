import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalState } from "../../../state/provider";
import axiosInstance from "../../../state/axiosInstance";
import { domain } from "../../../env";
import Swal from "sweetalert2";

const EditProfileForm = () => {
  const navigate = useNavigate();
  const [{ profile }, dispatch] = useGlobalState();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone: "",
    location: "",
    designation: "",
    about: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile?.prouser?.first_name || "",
        last_name: profile?.prouser?.last_name || "",
        email: profile?.prouser?.email || "",
        username: profile?.prouser?.username || "",
        phone: profile?.phone || "",
        location: profile?.location || "",
        designation: profile?.designation || "",
        about: profile?.about || "",
        image: null, // ছবি নতুন করে আপলোড না করলে null থাকবে
      });
      // ইমেজের ফুল ইউআরএল চেক
      if (profile?.image) {
        const fullImageUrl = profile.image.startsWith('http') ? profile.image : `${domain}${profile.image}`;
        setPreview(fullImageUrl);
      }
      setLoading(false);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // ডাটা অ্যাপেন্ড করার লজিক (শুধুমাত্র ইমেজ থাকলে ইমেজ যাবে)
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    data.append("designation", formData.designation);
    data.append("about", formData.about);
    
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      // [Saved Instruction] Set up Sweet Alert Loading
      Swal.fire({
        title: 'Updating...',
        didOpen: () => { Swal.showLoading() }
      });

      const res = await axiosInstance.put("/api/profile/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch({ type: "SET_PROFILE", profile: res.data });

      // ✅ SweetAlert with Success message
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: `${formData.first_name}, your profile has been updated successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/profile"), 2000);

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.error || "Check your network and try again.",
      });
    }
  };

  if (loading) return (
    <div className="p-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-2 fw-bold">Loading Account Settings...</p>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-danger text-white py-3 border-bottom rounded-top-4">
          <h5 className="mb-0 fw-bold"><i className="bi bi-person-gear me-2"></i>Edit Account Settings</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              
              <div className="col-lg-3 text-center border-end mb-4 mb-lg-0">
                <div className="mb-3 mt-2">
                  <img
                    src={preview || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="rounded-circle shadow-sm border border-3 border-danger-subtle"
                    style={{ width: "160px", height: "160px", objectFit: "cover" }}
                  />
                </div>
                <label className="btn btn-outline-danger btn-sm px-4 rounded-pill fw-bold">
                  <i className="bi bi-camera me-1"></i> Change Photo
                  <input type="file" hidden name="image" accept="image/*" onChange={handleChange} />
                </label>
                <p className="small text-muted mt-2">JPG, PNG allowed.</p>
              </div>

              <div className="col-lg-9 ps-lg-4">
                <div className="row g-3">
                  {[
                    { label: "First Name", name: "first_name" },
                    { label: "Last Name", name: "last_name" },
                    { label: "Username", name: "username", disabled: true },
                    { label: "Email Address", name: "email", type: "email" },
                    { label: "Phone Number", name: "phone" },
                    { label: "Location", name: "location" },
                    { label: "Designation", name: "designation" },
                  ].map((field) => (
                    <div className="col-md-4" key={field.name}>
                      <label className="form-label small fw-bold text-secondary">{field.label.toUpperCase()}</label>
                      <input
                        type={field.type || "text"}
                        className="form-control border-danger-subtle shadow-sm"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        disabled={field.disabled}
                      />
                    </div>
                  ))}

                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold text-secondary">ABOUT BIOGRAPHY</label>
                    <textarea
                      className="form-control border-danger-subtle shadow-sm"
                      rows="4"
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      placeholder="Share a short bio..."
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-secondary px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger px-5 fw-bold shadow">
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;