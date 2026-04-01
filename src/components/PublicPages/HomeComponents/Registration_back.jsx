import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { domain } from "../../../env";
import { useNavigate, Link } from "react-router-dom";
import "../../../CSS/Registration.css";

const Registration = () => {
    const navigate = useNavigate();
    
    const [role, setRole] = useState(""); 
    const [uniqueId, setUniqueId] = useState("");
    const [mobileInput, setMobileInput] = useState("");
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    });

    // Utility: Masking Email/Phone for Privacy
    const maskString = (str, type) => {
        if (!str) return "N/A";
        if (type === "email") {
            const [name, domainPart] = str.split("@");
            return `${name.substring(0, 2)}***@${domainPart}`;
        }
        return `${str.substring(0, 3)}XXXXX${str.substring(str.length - 3)}`;
    };

    // Step 1: Verify Profile Identity
    const handleVerifyIdentity = async () => {
        if (!role || !uniqueId || !mobileInput) {
            return Swal.fire("Required", "Please fill all identification fields!", "warning");
        }
        try {
            const res = await axios.post(`${domain}/api/verify-id/`, {
                role: role,
                unique_id: uniqueId,
                mobile: mobileInput
            });

            if (res.data.is_registered) {
                Swal.fire({
                    title: "Already Registered!",
                    text: `Account already exists for ${res.data.name}. Please Login.`,
                    icon: "warning",
                    confirmButtonColor: "#dc3545"
                });
            } else {
                setIsIdVerified(true);
                const fetchedEmail = res.data.email || "";
                setFormData({ ...formData, fullName: res.data.name || "", email: fetchedEmail });
                
                // --- Premium OTP Choice Popup ---
                Swal.fire({
                    title: "Verification Required",
                    html: `
                        <div style="text-align: left; font-size: 14px;">
                            <p>Select where to send the code for <b>${res.data.name}</b>:</p>
                            <div style="margin-bottom: 8px;">
                                <b>Email:</b> ${maskString(fetchedEmail, "email")}
                            </div>
                            <div>
                                <b>Mobile:</b> ${maskString(mobileInput, "phone")}
                            </div>
                        </div>
                    `,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Send via Email",
                    cancelButtonText: "Send via SMS",
                    confirmButtonColor: "#0d6efd",
                    cancelButtonColor: "#198754",
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        handleSendOtp("email");
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        handleSendOtp("sms");
                    }
                });
            }
        } catch (err) {
            Swal.fire("Error", "No record found or server error!", "error");
        }
    };

    // Step 2: Send OTP
    const handleSendOtp = async (method) => {
        try {
            await axios.post(`${domain}/api/send-otp/`, {
                method: method,
                role: role,
                unique_id: uniqueId,
                mobile: mobileInput,
                email: formData.email
            });
            setIsOtpSent(true);
            Swal.fire({
                title: "OTP Sent!",
                text: `Verification code sent to your ${method}. Check terminal for testing!`,
                icon: "success",
                timer: 3000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire("Failed", "Could not send OTP. Try again.", "error");
        }
    };

    // Step 3: Final Registration with OTP Verification
    const handleFinalRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return Swal.fire("Mismatch", "Passwords do not match!", "error");
        }

        if (otpCode.length < 6) {
            return Swal.fire("Invalid OTP", "Please enter the 6-digit code.", "warning");
        }

        try {
            // সাবমিট করার সময় ব্যাকএন্ড একবারে OTP চেক করবে এবং ইউজার ক্রিয়েট করবে
            const response = await axios.post(`${domain}/api/register/`, {
                ...formData,
                role: role,
                unique_id: uniqueId,
                mobile: mobileInput,
                otp: otpCode
            });

            Swal.fire({
                title: "Welcome!",
                text: "Your account has been created successfully.",
                icon: "success",
                confirmButtonColor: "#198754"
            }).then(() => {
                navigate("/login");
            });

        } catch (err) {
            const errMsg = err.response?.data?.error || "Registration failed!";
            Swal.fire("Registration Error", errMsg, "error");
        }
    };

    return (
        <div className="reg-container">
            <div className="registration-card animate-fade shadow-premium">
                <div className="text-center mb-5">
                    <h2 className="text-gradient fw-bold">Member Portal Registration</h2>
                    <p className="text-muted small">Access your institutional dashboard securely</p>
                </div>
                
                <form onSubmit={handleFinalRegister}>
                    {/* Identification Row */}
                    <div className="row g-3 align-items-end mb-4">
                        <div className="col-lg-3 col-md-6">
                            <label className="label-custom">Account Type</label>
                            <select 
                                className="form-select custom-input" 
                                onChange={(e) => {setRole(e.target.value); setIsIdVerified(false);}} 
                                required
                                disabled={isIdVerified}
                            >
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <label className="label-custom">Identity ID</label>
                            <input 
                                type="text" 
                                className="form-control custom-input" 
                                placeholder="Enter ID Number"
                                onChange={(e) => {setUniqueId(e.target.value); setIsIdVerified(false);}} 
                                disabled={isIdVerified}
                            />
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <label className="label-custom">Registered Mobile</label>
                            <input 
                                type="text" 
                                className="form-control custom-input" 
                                placeholder="017XXXXXXXX" 
                                onChange={(e) => {setMobileInput(e.target.value); setIsIdVerified(false);}} 
                                disabled={isIdVerified}
                            />
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <button 
                                type="button" 
                                className={`btn w-100 py-3 rounded-pill fw-bold transition-all ${isIdVerified ? 'btn-success' : 'btn-dark'}`} 
                                onClick={handleVerifyIdentity} 
                                disabled={isIdVerified}
                            >
                                {isIdVerified ? "Identity Verified" : "Verify Profile"}
                            </button>
                        </div>
                    </div>

                    {/* Registration Details Form (Visible only after Identity Verification) */}
                    {isIdVerified && (
                        <div className="animate-slide-up">
                            <hr className="my-5 opacity-25" />
                            
                            <div className="user-info-badge mb-4">
                                <span className="badge rounded-pill bg-light text-dark p-2 px-3 border">
                                    <i className="bi bi-person-check-fill text-success me-2"></i>
                                    Setup Account for: <b>{formData.fullName}</b>
                                </span>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <label className="label-custom">Choose Username</label>
                                    <input type="text" className="form-control custom-input" required placeholder="e.g. shuvo99" onChange={(e)=>setFormData({...formData, username: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="label-custom">6-Digit OTP Code</label>
                                    <input 
                                        type="text" 
                                        className="form-control custom-input otp-highlight" 
                                        placeholder="Enter Code"
                                        maxLength="6"
                                        required 
                                        onChange={(e)=>setOtpCode(e.target.value)} 
                                    />
                                    <small className="text-muted mt-1 d-block">Check your {isOtpSent ? "device" : "terminal"} for code</small>
                                </div>
                                <div className="col-md-6">
                                    <label className="label-custom">Create Password</label>
                                    <input type="password" placeholder="••••••••" className="form-control custom-input" required onChange={(e)=>setFormData({...formData, password: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="label-custom">Retype Password</label>
                                    <input type="password" placeholder="••••••••" className="form-control custom-input" required onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-gradient w-100 py-3 shadow-premium-hover fw-bold mt-3">
                                <i className="bi bi-shield-lock-fill me-2"></i> Confirm & Finish Registration
                            </button>
                        </div>
                    )}
                </form>

                <div className="text-center mt-5">
                    <p className="small text-muted">Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Registration;