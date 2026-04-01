import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { domain } from "../../../env";
import { useNavigate, Link } from "react-router-dom";
import "../../../CSS/Registration.css"; 

const PasswordReset = () => {
    const navigate = useNavigate();

    // States
    const [role, setRole] = useState("");
    const [uniqueId, setUniqueId] = useState("");
    const [mobileInput, setMobileInput] = useState("");
    const [isUserVerified, setIsUserVerified] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [timer, setTimer] = useState(-1);

    const [userDetails, setUserDetails] = useState(null);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    // Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Masking Function
    const maskInfo = (str, type) => {
        if (!str) return "N/A";
        if (type === "email") {
            const [name, domainPart] = str.split("@");
            return `${name.substring(0, 2)}***@${domainPart}`;
        }
        return `${str.substring(0, 3)}XXXXX${str.substring(str.length - 3)}`;
    };

    // ধাপ ১: ইউজার চেক
    const handleCheckUser = async () => {
        if (!role || !uniqueId || !mobileInput) {
            return Swal.fire("Required", "সবগুলো ঘর পূরণ করুন!", "warning");
        }
        try {
            const res = await axios.post(`${domain}/api/password-reset-check/`, {
                role, unique_id: uniqueId, mobile: mobileInput
            });

            setIsUserVerified(true);
            setUserDetails(res.data);

            Swal.fire({
                title: "Account Found!",
                html: `
                    <div style="text-align: left; font-size: 14px; line-height: 1.6;">
                        <p>Hello <b>${res.data.name}</b>, Choose OTP sending option?</p>
                        <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin-top: 10px;">
                            <b>Email:</b> ${maskInfo(res.data.email, "email")}<br/>
                            <b>Mobile:</b> ${maskInfo(mobileInput, "phone")}
                        </div>
                    </div>
                `,
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Send to Email",
                cancelButtonText: "Send to SMS",
                confirmButtonColor: "#0d6efd",
                cancelButtonColor: "#198754",
                reverseButtons: true,
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    handleSendOtp("email", res.data.email);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    handleSendOtp("sms", mobileInput);
                }
            });
        } catch (err) {
            Swal.fire("Error", err.response?.data?.error || "User not found!", "error");
        }
    };

    // ধাপ ২: ওটিপি পাঠানো
    const handleSendOtp = async (method, contactInfo) => {
        setTimer(120);
        try {
            await axios.post(`${domain}/api/send-reset-otp/`, {
                method, mobile: mobileInput, email: contactInfo
            });
            Swal.fire({
                title: "Sent!",
                text: "OTP has been sent।",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            setTimer(0);
            Swal.fire("Failed", "OTP not send", "error");
        }
    };

    // ধাপ ৩: ওটিপি ভেরিফাই
    const handleVerifyOtp = async () => {
        if (!otpCode) return Swal.fire("Required", "Provide OTP", "warning");
        try {
            await axios.post(`${domain}/api/verify-reset-otp/`, {
                otp: otpCode, mobile: mobileInput, email: userDetails?.email
            });
            setIsOtpVerified(true);
            setTimer(-1);
            Swal.fire("Verified!", "Set new password।", "success");
        } catch (err) {
            Swal.fire("Error", "Wrong OTP given!", "error");
        }
    };

    // ধাপ ৪: ফাইনাল পাসওয়ার্ড রিসেট
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return Swal.fire("Error", "Passwrod not matched!", "error");
        }
        try {
            await axios.post(`${domain}/api/complete-password-reset/`, {
                unique_id: uniqueId, role, password: formData.password
            });
            Swal.fire("Success!", "Password reset successfully", "success");
            navigate("/login");
        } catch (err) {
            Swal.fire("Error", "Password not reset", "error");
        }
    };

    return (
        <div className="reg-container">
            <div className="registration-card animate-fade shadow-lg p-4">
                <div className="text-center mb-4">
                    <h2 className="text-gradient fw-bold">Reset Password</h2>
                    <p className="text-muted small">Verify identity to recover your account</p>
                </div>

                <form onSubmit={handleUpdatePassword}>
                    {/* Identity Fields */}
                    <div className="row g-2 mb-3 bg-light p-3 rounded border">
                        <div className="col-md-4">
                            <label className="label-custom small fw-bold">User Role</label>
                            <select className="form-select custom-input"
                                onChange={(e) => { setRole(e.target.value); setIsUserVerified(false); }}
                                required disabled={isUserVerified} value={role}>
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="label-custom small fw-bold">
                                {role === 'student' ? 'Student ID' : role === 'employee' ? 'Employee ID' : 'ID Number'}
                            </label>
                            <input type="text" className="form-control custom-input"
                                placeholder={role === 'student' ? "Enter student id" : role === 'employee' ? "Enter employee id" : "Enter ID"}
                                onChange={(e) => { setUniqueId(e.target.value); setIsUserVerified(false); }}
                                disabled={isUserVerified} />
                        </div>
                        <div className="col-md-4">
                            <label className="label-custom small fw-bold">Mobile</label>
                            <input type="text" className="form-control custom-input"
                                placeholder="01XXXXXXXXX"
                                onChange={(e) => { setMobileInput(e.target.value); setIsUserVerified(false); }}
                                disabled={isUserVerified} />
                        </div>
                        <div className="col-12 mt-2">
                            <button type="button" className={`btn w-100 py-2 rounded-pill fw-bold ${isUserVerified ? 'btn-success disabled' : 'btn-dark'}`} 
                                onClick={handleCheckUser} disabled={isUserVerified}>
                                {isUserVerified ? "✓ Account Identified" : "Find My Account"}
                            </button>
                        </div>
                    </div>

                    {isUserVerified && (
                        <div className="animate-slide-up border-top pt-3">
                            {/* Smaller & Centered OTP Box */}
                            <div className="row justify-content-center mb-4">
                                <div className="col-md-8 text-center">
                                    <label className="label-custom d-block mb-2">
                                        Enter 6-Digit OTP 
                                        {timer > 0 && <span className="text-danger ms-2 fw-bold">({Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')})</span>}
                                    </label>
                                    <div className="d-flex gap-2">
                                        <input type="text" className="form-control text-center fw-bold fs-4 custom-input" 
                                            placeholder="******" maxLength="6"
                                            onChange={(e) => setOtpCode(e.target.value)} disabled={isOtpVerified} 
                                            style={{ letterSpacing: '8px' }} />
                                        <button type="button" className={`btn px-4 fw-bold ${isOtpVerified ? 'btn-success' : 'btn-primary'}`} 
                                            onClick={handleVerifyOtp} disabled={isOtpVerified}>
                                            {isOtpVerified ? "✓" : "Verify"}
                                        </button>
                                    </div>
                                    {timer === 0 && !isOtpVerified && 
                                        <button type="button" className="btn btn-link btn-sm text-danger mt-1 text-decoration-none" onClick={handleCheckUser}>Resend OTP</button>
                                    }
                                </div>
                            </div>

                            {isOtpVerified && (
                                <div className="row g-3 mb-4 animate-fade">
                                    <div className="col-md-6">
                                        <label className="label-custom small fw-bold">New Password</label>
                                        <input type="password" name="password" className="form-control custom-input" required 
                                            placeholder="••••••••"
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="label-custom small fw-bold">Confirm Password</label>
                                        <input type="password" name="confirmPassword" className="form-control custom-input" required 
                                            placeholder="••••••••"
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <button type="submit" className="btn btn-gradient w-100 py-3 shadow-lg fw-bold">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>

                <div className="text-center mt-4">
                    <p className="small text-muted mb-0">Remembered password? <Link to="/login" className="text-success fw-bold text-decoration-none">Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;