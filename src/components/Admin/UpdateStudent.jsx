import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { domain } from "../../env";
import "../../CSS/StudentProfile.css";

const UpdateStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    fathers_name: "",
    mothers_name: "",
    email: "",
    mobile: "",
    gender: "m",
    religion: "",
    date_of_birth: "",
    active: true,
  });

  const [photo, setPhoto] = useState(null); // Only new File
  const [photoPreview, setPhotoPreview] = useState(null);
  const [religions, setReligions] = useState([]);

  // Load student data
  useEffect(() => {
    axios.get(`${domain}/api/student/${id}/`)
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
          active: data.active,
        });
        if (data.photo) setPhotoPreview(`${domain}${data.photo}`);
      })
      .catch(err => console.log(err));
  }, [id]);

  // Load religion list
  useEffect(() => {
    axios.get(`${domain}/api/religion/`)
      .then(res => setReligions(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files?.[0]) {
      setPhoto(files[0]);
      setPhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // Append all normal fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    // Append photo only if new File selected
    if (photo instanceof File) {
      data.append("photo", photo);
    }

    try {
      await axios.put(`${domain}/api/student/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Student updated successfully!");
      navigate(`/StudentPage/${id}`);
    } catch (err) {
      console.log("Update Error:", err.response?.data);
      alert("Update failed! Check console for details.");
    }
  };

  return (
    <div className="container mt-1">
      <div className="card shadow-lg p-4">
        <h4 className="text-center mb-4">Update Student</h4>

        {/* Photo preview */}
        <div className="d-flex justify-content-center mb-4 align-items-center">
          <div className="photo-preview-wrapper me-3">
            <img
              src={photoPreview || "/default.png"}
              alt="Student"
              className="photo-preview"
            />
          </div>
          <div className="text-center">
            <input
              type="file"
              name="photo"
              onChange={handleChange}
              className="form-control file-input"
              style={{ maxWidth: "250px" }}
            />
          </div>
        </div>

        <form onSubmit={submitHandler}>
          <div className="row g-3">
            <div className="col-md-4">
              <label>First Name</label>
              <input
                className="form-control"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Last Name</label>
              <input
                className="form-control"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Father's Name</label>
              <input
                className="form-control"
                name="fathers_name"
                value={formData.fathers_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Mother's Name</label>
              <input
                className="form-control"
                name="mothers_name"
                value={formData.mothers_name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Mobile</label>
              <input
                className="form-control"
                name="mobile"
                value={formData.mobile || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label>Gender</label>
              <select
                className="form-control"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="m">Male</option>
                <option value="f">Female</option>
                <option value="o">Others</option>
              </select>
            </div>

            <div className="col-md-4">
              <label>Religion</label>
              <select
                className="form-control"
                name="religion"
                value={formData.religion || ""}
                onChange={handleChange}
              >
                <option value="">Select Religion</option>
                {religions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="date_of_birth"
                value={formData.date_of_birth || ""}
                onChange={handleChange}
              />
            </div>
          </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                type="button"
                className="btn btn-danger border px-4"
                onClick={() => window.history.back()}
              >
                ← Cancel
              </button>

              <button
                type="submit"
                className="btn btn-success px-5 fw-semibold"
              >
                💾 Save Changes
              </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateStudent;
