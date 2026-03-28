import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { domain } from "../../../env";
import { useNavigate } from "react-router-dom";

const Registration = () => {
    const navigate = useNavigate();
    
    // States
    const [role, setRole] = useState(""); 
    const [uniqueId, setUniqueId] = useState("");
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [otpMethod, setOtpMethod] = useState("email");
    const [showOtpSection, setShowOtpSection] = useState(false);
    const [otp, setOtp] = useState("");
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [timer, setTimer] = useState(0);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        mobile: ""
    });

    // ১. ওটিপি টাইমার লজিক
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // ২. আইডি ভেরিফিকেশন (onBlur)
    const verifyProfileId = async () => {
        if (!role || !uniqueId) return;
        try {
            const res = await axios.post(`${domain}/api/verify-id/`, {
                role: role,
                unique_id: uniqueId
            });
            setFormData({
                ...formData,
                fullName: res.data.name,
                email: res.data.email || "",
                mobile: res.data.mobile || ""
            });
            setIsIdVerified(true);
            Swal.fire("Verified!", `Welcome ${res.data.name}. Now verify your account.`, "success");
        } catch (err) {
            setIsIdVerified(false);
            Swal.fire("Error", err.response?.data?.error || "ID not found!", "error");
        }
    };

    // ৩. ওটিপি পাঠানোর লজিক
    const sendOTP = async () => {
        if (timer > 0) return;
        try {
            const res = await axios.post(`${domain}/api/send-otp/`, {
                mobile: formData.mobile,
                email: formData.email,
                method: otpMethod
            });
            if (res.data.success) {
                setShowOtpSection(true);
                setTimer(60); // ১ মিনিটের লক
                Swal.fire("Success", `OTP sent via ${otpMethod.toUpperCase()}`, "success");
            }
        } catch (err) {
            Swal.fire("Error", "Failed to send OTP. Check balance/settings.", "error");
        }
    };

    // ৪. ওটিপি ভেরিফাই করার লজিক
    const handleVerifyOtp = async () => {
        try {
            const res = await axios.post(`${domain}/api/verify-otp/`, {
                mobile: formData.mobile,
                otp: otp
            });
            if (res.data.success) {
                setIsMobileVerified(true);
                setShowOtpSection(false);
                Swal.fire("Verified!", "Communication verified successfully.", "success");
            }
        } catch (err) {
            Swal.fire("Error", "Invalid or Expired OTP!", "error");
        }
    };

    // ৫. ফাইনাল রেজিস্ট্রেশন সাবমিট
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isMobileVerified) return Swal.fire("Wait", "Please verify OTP first!", "warning");
        if (formData.password !== formData.confirmPassword) return Swal.fire("Error", "Passwords mismatch!", "error");

        try {
            await axios.post(`${domain}/api/register/`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: role,
                unique_id: uniqueId
            });
            Swal.fire("Done!", "Account Created Successfully", "success");
            navigate("/login");
        } catch (err) {
            Swal.fire("Error", "Registration failed!", "error");
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-5 shadow-lg p-4 rounded-4 bg-white border-top border-5 border-success">
                    <h2 className="text-center fw-bold mb-4 text-success">User Registration</h2>
                    
                    <form onSubmit={handleRegister}>
                        {/* Role & ID Selection */}
                        <div className="mb-3">
                            <label className="form-label small fw-bold">User registration as..</label>
                            <select className="form-select border-2" onChange={(e) => {setRole(e.target.value); setIsIdVerified(false);}} required>
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        {role && (
                            <div className="mb-4">
                                <label className="form-label small fw-bold">{role.toUpperCase()} ID</label>
                                <input 
                                    type="text" className={`form-control border-2 ${isIdVerified ? 'is-valid' : ''}`}
                                    placeholder={`Enter your ${role} ID`}
                                    onBlur={verifyProfileId}
                                    onChange={(e) => setUniqueId(e.target.value)}
                                    required 
                                />
                            </div>
                        )}

                        {isIdVerified && (
                            <div className="animate__animated animate__fadeIn">
                                <div className="p-3 mb-4 bg-light rounded-3 border">
                                    <p className="mb-1 small text-muted">Registering for:</p>
                                    <h5 className="fw-bold text-dark">{formData.fullName}</h5>
                                    <p className="mb-0 small">{formData.email} | {formData.mobile}</p>
                                </div>

                                {/* OTP Section */}
                                {!isMobileVerified && (
                                    <div className="card border-info mb-4">
                                        <div className="card-body">
                                            <label className="form-label small fw-bold">Verify Identity via:</label>
                                            <div className="d-flex gap-3 mb-3">
                                                <label><input type="radio" name="m" checked={otpMethod==='email'} onChange={()=>setOtpMethod('email')} /> Email</label>
                                                <label><input type="radio" name="m" checked={otpMethod==='sms'} onChange={()=>setOtpMethod('sms')} /> SMS</label>
                                            </div>

                                            {!showOtpSection ? (
                                                <button type="button" className="btn btn-outline-info w-100 btn-sm" disabled={timer > 0} onClick={sendOTP}>
                                                    {timer > 0 ? `Resend in ${timer}s` : `Send OTP to ${otpMethod.toUpperCase()}`}
                                                </button>
                                            ) : (
                                                <div className="input-group">
                                                    <input type="text" className="form-control" placeholder="6-digit OTP" onChange={(e)=>setOtp(e.target.value)} />
                                                    <button type="button" className="btn btn-success" onClick={handleVerifyOtp}>Verify</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* User Details */}
                                <div className="mb-3">
                                    <input type="text" className="form-control" placeholder="Choose Username" required onChange={(e)=>setFormData({...formData, username: e.target.value})} />
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <input type="password" name="password" className="form-control" placeholder="Password" required onChange={(e)=>setFormData({...formData, [e.target.name]: e.target.value})} />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <input type="password" name="confirmPassword" className="form-control" placeholder="Confirm" required onChange={(e)=>setFormData({...formData, [e.target.name]: e.target.value})} />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-success w-100 fw-bold rounded-pill py-2 shadow" disabled={!isMobileVerified}>
                                    Complete Registration
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Registration;