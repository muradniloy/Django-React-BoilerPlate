import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { domain } from "../../../env";
import Swal from "sweetalert2";
import "../../../CSS/LoginPage.css"; // আপনার আগের CSS ব্যবহার করা হয়েছে

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        confirmPassword: "",
        // Profile Fields
        phone: "",
        location: "",
        designation: "",
        about: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image" && files?.[0]) {
            setFormData((prev) => ({ ...prev, image: files[0] }));
            setPreview(URL.createObjectURL(files[0]));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const togglePassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Password দুইটি মিলছে না!' });
            return;
        }

        setLoading(true);

        // FormData ব্যবহার করা হচ্ছে কারণ এখানে ফাইল (Image) আছে
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'confirmPassword') {
                data.append(key, formData[key]);
            }
        });

        try {
            // Sweet Alert Loading
            Swal.fire({
                title: 'Creating Account...',
                text: 'Please wait while we set up your profile',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading() }
            });

            // আপনার ব্যাকএন্ডে এমন একটি এন্ডপয়েন্ট থাকতে হবে যা ইউজার এবং প্রোফাইল একসাথে ক্রিয়েট করে
            const res = await axios.post(`${domain}/api/signup/`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Swal.fire({
                icon: "success",
                title: "Welcome aboard!",
                text: "Account & Profile created successfully ✅",
                timer: 2000,
                showConfirmButton: false,
            });

            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Signup failed",
                text: err.response?.data?.detail || "আবার চেষ্টা করুন",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-bg py-5 d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '900px', width: '100%' }}>
                <div className="card-body p-0 overflow-hidden">
                    <div className="row g-0">
                        {/* Left Side: Avatar Upload */}
                        <div className="col-lg-4 bg-dark text-white d-flex flex-column align-items-center justify-content-center p-4">
                            <h3 className="fw-bold mb-4">Profile Photo</h3>
                            <div className="mb-3 position-relative">
                                <img
                                    src={preview || "https://via.placeholder.com/150"}
                                    alt="Preview"
                                    className="rounded-circle border border-4 border-success shadow"
                                    style={{ width: "180px", height: "180px", objectFit: "cover" }}
                                />
                                <label className="btn btn-success btn-sm position-absolute bottom-0 end-0 rounded-circle shadow">
                                    <i className="fa fa-camera"></i>
                                    <input type="file" hidden name="image" accept="image/*" onChange={handleChange} />
                                </label>
                            </div>
                            <p className="small text-center opacity-75">Upload a professional photo to stand out.</p>
                        </div>

                        {/* Right Side: Form Fields */}
                        <div className="col-lg-8 p-4 p-md-5 bg-white">
                            <h2 className="fw-bold text-dark mb-1">Create Account 🚀</h2>
                            <p className="text-muted mb-4">Enter your details to register.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    {/* Account Section */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">USERNAME</label>
                                        <input type="text" name="username" className="form-control rounded-pill shadow-none" placeholder="johndoe" onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">EMAIL ADDRESS</label>
                                        <input type="email" name="email" className="form-control rounded-pill shadow-none" placeholder="name@example.com" onChange={handleChange} required />
                                    </div>

                                    {/* Name Section */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">FIRST NAME</label>
                                        <input type="text" name="first_name" className="form-control rounded-pill shadow-none" placeholder="John" onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">LAST NAME</label>
                                        <input type="text" name="last_name" className="form-control rounded-pill shadow-none" placeholder="Doe" onChange={handleChange} required />
                                    </div>

                                    {/* Profile Details */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">PHONE NUMBER</label>
                                        <input type="text" name="phone" className="form-control rounded-pill shadow-none" placeholder="+8801..." onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">DESIGNATION</label>
                                        <input type="text" name="designation" className="form-control rounded-pill shadow-none" placeholder="Software Engineer" onChange={handleChange} />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label small fw-bold">LOCATION</label>
                                        <input type="text" name="location" className="form-control rounded-pill shadow-none" placeholder="Dhaka, Bangladesh" onChange={handleChange} />
                                    </div>

                                    {/* Password Section */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">PASSWORD</label>
                                        <div className="position-relative">
                                            <input type={showPassword ? "text" : "password"} name="password" className="form-control rounded-pill shadow-none" onChange={handleChange} required />
                                            <span 
                                                className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer text-muted"
                                                onClick={togglePassword}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">CONFIRM PASSWORD</label>
                                        <input type={showPassword ? "text" : "password"} name="confirmPassword" className="form-control rounded-pill shadow-none" onChange={handleChange} required />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label small fw-bold">ABOUT BIOGRAPHY</label>
                                        <textarea name="about" rows="2" className="form-control rounded-3 shadow-none" placeholder="A short bio about yourself..." onChange={handleChange}></textarea>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="btn btn-success w-100 rounded-pill py-2 mt-4 fw-bold shadow">
                                    {loading ? "Creating account..." : "Complete Registration"}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted small">Already have an account? </span>
                                <Link to="/login" className="text-success fw-bold text-decoration-none small">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;