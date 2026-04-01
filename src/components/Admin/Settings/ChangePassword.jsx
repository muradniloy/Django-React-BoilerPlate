import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../componentExporter";
import "../../../CSS/Registration.css"; 

const ChangePassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side Validation
        if (formData.newPassword !== formData.confirmPassword) {
            return Swal.fire("Error", "New passwords do not match!", "error");
        }

        if (formData.newPassword.length < 6) {
            return Swal.fire("Weak Password", "Password must be at least 6 characters long.", "warning");
        }

        setLoading(true);
        try {
            // axiosInstance automatically handles HttpOnly cookies/sessions
            const res = await axiosInstance.post("/api/change-password/", {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            Swal.fire({
                title: "Success!",
                text: res.data.success || "Your password has been updated.",
                icon: "success",
                confirmButtonColor: "#198754"
            });
            navigate("/dashboard");
        } catch (err) {
            // Handles 401, 400, and 500 errors from backend
            Swal.fire(
                "Failed", 
                err.response?.data?.error || "An unauthorized or server error occurred.", 
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reg-container d-flex align-items-center justify-content-center" style={{ minHeight: "85vh" }}>
            <div className="registration-card animate-fade shadow-lg p-4" style={{ maxWidth: "450px", width: "100%" }}>
                <div className="text-center mb-4">
                    <div className="icon-box mb-2 mx-auto shadow-sm d-flex align-items-center justify-content-center" 
                         style={{ width: "60px", height: "60px", background: "#f8f9fa", borderRadius: "50%" }}>
                        <i className="bi bi-shield-lock-fill fs-3 text-primary"></i>
                    </div>
                    <h3 className="fw-bold text-gradient">Update Password</h3>
                    <p className="text-muted small">Ensure your account stays secure</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Current Password */}
                    <div className="mb-3">
                        <label className="label-custom small fw-bold">Current Password</label>
                        <input 
                            type="password" 
                            name="oldPassword"
                            className="form-control custom-input" 
                            placeholder="Enter current password"
                            required
                            value={formData.oldPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <hr className="my-4 text-muted opacity-25" />

                    {/* New Password */}
                    <div className="mb-3">
                        <label className="label-custom small fw-bold">New Password</label>
                        <input 
                            type="password" 
                            name="newPassword"
                            className="form-control custom-input" 
                            placeholder="Enter new password"
                            required
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Confirm New Password */}
                    <div className="mb-4">
                        <label className="label-custom small fw-bold">Confirm New Password</label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            className="form-control custom-input" 
                            placeholder="Re-type new password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-gradient w-100 py-3 shadow-lg fw-bold rounded-pill"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="btn btn-link btn-sm text-decoration-none text-muted"
                    >
                        <i className="bi bi-arrow-left me-1"></i> Back to Safety
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;