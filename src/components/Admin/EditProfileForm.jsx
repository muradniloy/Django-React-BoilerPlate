import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalState } from "../../state/provider";
import axiosInstance from "../../state/axiosInstance";
import { domain } from "../../env";


const EditProfileForm = () => {
  const navigate = useNavigate();  // useNavigate hook
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

  // Populate form with profile data
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
        image: null,
      });
      if (profile?.image) setPreview(`${domain}${profile.image}`);
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
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });

    try {
      const res = await axiosInstance.put("/api/profile/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({ type: "SET_PROFILE", profile: res.data });
      alert("✅ Profile updated successfully");
      
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile");
    }
  };

  if (loading)
    return (
      <div className="card p-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 mb-0">Loading profile...</p>
      </div>
    );

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-bold">
        Edit Profile ({profile?.prouser?.first_name} {profile?.prouser?.last_name})
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Profile Image */}
          {/* Profile Image */}
<div className="text-center mb-4">
  <img
    src={preview || "/default-user.png"}
    alt="Profile"
    style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      display: "block",
      margin: "0 auto",
    }}
  />
  <label
    className="btn btn-outline-primary btn-sm mt-2 d-block mx-auto"
    style={{ width: "130px" }}
  >
    Change Image
    <input
      type="file"
      hidden
      name="image"
      accept="image/*"
      onChange={handleChange}
    />
  </label>
</div>


          {/* Text Inputs */}
          <div className="row">
            {["first_name", "last_name", "username", "email"].map((field) => (
              <div className="col-md-6 mb-3" key={field}>
                <label className="form-label">{field.replace("_", " ").toUpperCase()}</label>
                <input
                  className="form-control"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={field === "username"}
                  type={field === "email" ? "email" : "text"}
                />
              </div>
            ))}

            {["phone", "location", "designation"].map((field) => (
              <div className="col-md-6 mb-3" key={field}>
                <label className="form-label">{field.replace("_", " ").toUpperCase()}</label>
                <input
                  className="form-control"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  type="text"
                />
              </div>
            ))}

            <div className="col-12 mb-3">
              <label className="form-label">About</label>
              <textarea
                className="form-control"
                rows="4"
                name="about"
                value={formData.about}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="row">
            <div className="col text-start">
              <Link className="btn btn-danger" to="/profile">
                ← Back
              </Link>
            </div>
            <div className="col text-end">
              <button className="btn btn-primary">Update Profile</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
