import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { domain } from "../../../env";
import { useNavigate, Link } from "react-router-dom";
import "../../../CSS/Registration.css";

const Registration = () => {
    const navigate = useNavigate();
    
    // States
    const [role, setRole] = useState(""); 
    const [uniqueId, setUniqueId] = useState("");
    const [mobileInput, setMobileInput] = useState("");
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [timer, setTimer] = useState(-1); 

    const [profileDetails, setProfileDetails] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
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

    // মাস্কিং ফাংশন
    const maskInfo = (str, type) => {
        if (!str) return "N/A";
        if (type === "email") {
            const [name, domainPart] = str.split("@");
            return `${name.substring(0, 2)}***@${domainPart}`;
        }
        return `${str.substring(0, 3)}XXXXX${str.substring(str.length - 3)}`;
    };

    // ধাপ ১: প্রোফাইল ভেরিফিকেশন
    const handleVerifyIdentity = async () => {
        if (!role || !uniqueId || !mobileInput) {
            return Swal.fire("Required", "Please fill all identification fields!", "warning");
        }
        try {
            const res = await axios.post(`${domain}/api/verify-id/`, {
                role, unique_id: uniqueId, mobile: mobileInput
            });

            if (res.data.is_registered) {
                Swal.fire("Already Registered!", `Account exists for ${res.data.name}.`, "warning");
            } else {
                setIsIdVerified(true);
                setProfileDetails(res.data);
                
                const fetchedEmail = res.data.email || "";
                setFormData(prev => ({ ...prev, email: fetchedEmail }));
                
                Swal.fire({
                    title: "Verify Your Identity",
                    html: `
                        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
                            <p>Select where to send the OTP for <b>${res.data.name}</b>:</p>
                            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin-top: 10px;">
                                <b>Email:</b> ${maskInfo(fetchedEmail, "email")}<br/>
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
                        handleSendOtp("email", fetchedEmail);
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        handleSendOtp("sms", mobileInput);
                    }
                });
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.error || "No record found!", "error");
        }
    };

    // ধাপ ২: ওটিপি পাঠানো
    const handleSendOtp = async (method, contactInfo) => {
        setTimer(120); 
        try {
            await axios.post(`${domain}/api/send-otp/`, {
                method, role, unique_id: uniqueId, mobile: mobileInput, email: contactInfo 
            });
            Swal.fire({
                title: "Sent!",
                text: `OTP sent via ${method}. Check terminal/inbox!`,
                icon: "success",
                timer: 3000,
                showConfirmButton: false
            });
        } catch (err) {
            setTimer(0);
            Swal.fire("Failed", "OTP sending failed.", "error");
        }
    };

    // ধাপ ৩: ওটিপি ভেরিফাই করা
    const handleVerifyOtpCode = async () => {
        if (!otpCode) return Swal.fire("Required", "Please enter OTP code", "warning");
        try {
            const res = await axios.post(`${domain}/api/verify-otp/`, { 
                otp: otpCode, mobile: mobileInput, email: formData.email
            });
            if (res.status === 200) {
                setIsOtpVerified(true);
                setTimer(-1); 
                Swal.fire("Verified!", "OTP matched successfully.", "success");
            }
        } catch (err) {
            Swal.fire("Error", "Invalid OTP code!", "error");
        }
    };

    // ধাপ ৪: ফাইনাল রেজিস্ট্রেশন
    const handleFinalRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return Swal.fire("Error", "Passwords mismatch!", "error");
        }
        try {
            await axios.post(`${domain}/api/register/`, {
                ...formData, role, unique_id: uniqueId, mobile: mobileInput, otp: otpCode
            });
            Swal.fire("Success!", "Registration complete.", "success");
            navigate("/login");
        } catch (err) {
            Swal.fire("Error", err.response?.data?.error || "Registration failed!", "error");
        }
    };

    return (
        <div className="reg-container">
            <div className="registration-card animate-fade shadow-lg">
                <div className="text-center mb-4">
                    <h2 className="text-gradient fw-bold">Portal Registration</h2>
                    <p className="text-muted small">Verify identity to create your account</p>
                </div>
                
                <form onSubmit={handleFinalRegister}>
                    <div className="row g-3 align-items-end mb-4 p-3 bg-white rounded border">
                        <div className="col-lg-3 col-md-6">
                            <label className="label-custom">Register As</label>
                            <select className="form-select custom-input" 
                                onChange={(e) => {setRole(e.target.value); setIsIdVerified(false);}} 
                                required disabled={isIdVerified} value={role}>
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <label className="label-custom">{role === "employee" ? "Employee ID" : "Student ID"}</label>
                            <input type="text" className="form-control custom-input" 
                                placeholder={role === "employee" ? "Enter Employee ID" : role === "student" ? "Enter Student ID" : "Enter ID"} 
                                onChange={(e) => {setUniqueId(e.target.value); setIsIdVerified(false);}} 
                                disabled={isIdVerified} />
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <label className="label-custom">Mobile Number</label>
                            <input type="text" className="form-control custom-input" 
                                placeholder="017XXXXXXXX" 
                                onChange={(e) => {setMobileInput(e.target.value); setIsIdVerified(false);}} 
                                disabled={isIdVerified} />
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <button type="button" className={`btn w-100 py-3 rounded-pill fw-bold ${isIdVerified ? 'btn-success' : 'btn-dark'}`} onClick={handleVerifyIdentity} disabled={isIdVerified}>
                                {isIdVerified ? "Verified ✓" : "Verify Profile"}
                            </button>
                        </div>
                    </div>

                    {isIdVerified && profileDetails && (
                        <div className="animate-slide-up">
                            {/* Profile Details Card - Fixed Photo and Program Logic */}
                            <div className="profile-display-card mb-4 p-3 d-flex align-items-center border rounded bg-light shadow-sm">
                                <div className="profile-img-wrapper me-3">
                                    <img 
                                        src={profileDetails.photo ? `${domain}${profileDetails.photo}` : "https://via.placeholder.com/100"} 
                                        alt="User" 
                                        className="rounded-circle border border-3 border-success shadow-sm"
                                        style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                                    />
                                </div>
                                <div className="profile-info flex-grow-1">
                                    <h5 className="fw-bold text-dark mb-1">{profileDetails.name}</h5>
                                    <div className="row small text-muted">
                                        <div className="col-md-6">
                                            <b>ID:</b> {uniqueId} <br/>
                                            {role === "employee" ? (
                                                <><b>Designation:</b> {profileDetails.designation || "N/A"}</>
                                            ) : (
                                                <><b>Program:</b> {profileDetails.program || "N/A"}</>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            {role === "student" ? (
                                                <>
                                                    <b>Session:</b> {profileDetails.session || "N/A"} <br/>
                                                    <b>Reg No:</b> {profileDetails.reg_no || uniqueId}
                                                </>
                                            ) : (
                                                <><b>Joining:</b> {profileDetails.joining_date || "N/A"}</>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="label-custom">
                                        Verification OTP {timer > 0 && <span className="text-danger ms-2 fw-bold">({Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')})</span>}
                                    </label>
                                    <div className="input-group">
                                        <input type="text" className="form-control custom-input" placeholder="Enter Code" onChange={(e)=>setOtpCode(e.target.value)} disabled={isOtpVerified} />
                                        {timer === 0 && !isOtpVerified ? (
                                            <button type="button" className="btn btn-warning fw-bold" onClick={handleVerifyIdentity}>Resend</button>
                                        ) : (
                                            <button type="button" className={`btn fw-bold ${isOtpVerified ? 'btn-success' : 'btn-primary'}`} onClick={handleVerifyOtpCode} disabled={isOtpVerified}>
                                                {isOtpVerified ? "Matched ✓" : "Verify OTP"}
                                            </button>
                                        )}
                                    </div>
                                    {timer === 0 && !isOtpVerified && <small className="text-danger mt-1 d-block fw-bold">OTP expired. Please click Resend.</small>}
                                </div>

                                <div className="col-md-6">
                                    <label className="label-custom">Set Username</label>
                                    <input type="text" className="form-control custom-input" required disabled={!isOtpVerified} onChange={(e)=>setFormData({...formData, username: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="label-custom">Set Password</label>
                                    <input type="password" className="form-control custom-input" required disabled={!isOtpVerified} onChange={(e)=>setFormData({...formData, password: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                    <label className="label-custom">Confirm Password</label>
                                    <input type="password" className="form-control custom-input" required disabled={!isOtpVerified} onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-gradient w-100 py-3 shadow-lg fw-bold" disabled={!isOtpVerified}>
                                Complete Registration
                            </button>
                        </div>
                    )}
                </form>

                <div className="text-center mt-4">
                    <p className="small text-muted mb-0">Already have an account? <Link to="/login" className="text-success fw-bold text-decoration-none">Login Here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Registration;