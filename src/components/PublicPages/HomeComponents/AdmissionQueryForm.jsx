import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";
import * as CM from "../../../componentExporter";

const AdmissionQueryForm = () => {
    const [programs, setPrograms] = useState([]);
    const [inst, setInst] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_name: "",
        contact_no: "",
        interest_program: "",
        address: "",
        city: "",
        query_message: "",
        source: "website"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ১. ইনস্টিটিউশন ডাটা ফেচ (মোবাইল ও ইমেইলের জন্য)
                const instRes = await axios.get(`${domain}/api/institution/`);
                const instData = instRes.data.results ? instRes.data.results[0] : instRes.data;
                setInst(instData);

                // ২. প্রোগ্রাম ডাটা ফেচ
                const progRes = await axios.get(`${domain}/api/programs/`);
                const progData = progRes.data.results || progRes.data;
                setPrograms(progData.filter(p => p.active !== false));
            } catch (err) {
                console.error("Data Fetch Error:", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${domain}/api/admission-queries/`, formData);
            
            // সাবমিট করার পর নামসহ সুন্দর মেসেজ
            CM.Swal.fire({
                title: `Thank You, ${formData.student_name}!`,
                text: "Your admission inquiry has been received. Our team will contact you shortly.",
                icon: "success",
                background: "#fff",
                confirmButtonColor: "#198754",
                showClass: { popup: 'animate__animated animate__fadeInDown' }
            });

            setFormData({ student_name: "", contact_no: "", interest_program: "", address: "", city: "", query_message: "", source: "website" });
        } catch (err) {
            CM.Swal.fire("Oops!", "Something went wrong. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="container py-2" id="enroll-section">
            <div className="row justify-content-center">
                <div className="col-lg-11 col-xl-10">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative" style={{ minHeight: "450px" }}>
                        <div className="row g-0">
                            
                            {/* Side Panel: Gorgeous Success Gradient */}
                            <div className="col-md-4 bg-success p-4 p-lg-5 text-white d-flex flex-column justify-content-between position-relative overflow-hidden" 
                                 style={{ background: "linear-gradient(135deg, #198754 0%, #0b4d2f 100%)" }}>
                                
                                {/* Background Decorative Circle */}
                                <div className="position-absolute rounded-circle bg-info opacity-10" style={{ width: "200px", height: "200px", top: "-50px", left: "-50px" }}></div>

                                <div className="position-relative">
                                    <h3 className="fw-bold mb-3">Begin Your Journey</h3>
                                    <p className="small opacity-75 mb-4">Fill out the form to get a free consultation from our academic experts.</p>
                                    
                                    <div className="mt-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-white bg-opacity-25 rounded-3 p-2 me-3">📞</div>
                                            <div>
                                                <div className="x-small opacity-50">Call Us</div>
                                                <div className="fw-bold small">{inst?.mobile || "Loading..."}</div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-white bg-opacity-25 rounded-3 p-2 me-3">📧</div>
                                            <div>
                                                <div className="x-small opacity-50">Email Support</div>
                                                <div className="fw-bold small">{inst?.email || "Loading..."}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="position-relative pt-4 border-top border-white border-opacity-25">
                                    <div className="d-flex gap-2">
                                        <span className="badge bg-warning text-dark rounded-pill px-3">Admissions Open 2026</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Panel: Clean & Modern */}
                            <div className="col-md-8 p-4 p-lg-5 bg-white">
                                <div className="mb-4">
                                    <h4 className="fw-bold text-dark mb-1">Admission Inquiry</h4>
                                    <div style={{ width: '40px', height: '3px', background: '#198754' }}></div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="x-small fw-bold text-muted mb-1 text-uppercase">Student Full Name *</label>
                                            <input type="text" name="student_name" className="form-control border-0 bg-light py-2 px-3 shadow-none custom-input" value={formData.student_name} onChange={handleChange} required placeholder="e.g. Abir Hossain" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="x-small fw-bold text-muted mb-1 text-uppercase">Contact Number *</label>
                                            <input type="text" name="contact_no" className="form-control border-0 bg-light py-2 px-3 shadow-none custom-input" value={formData.contact_no} onChange={handleChange} required placeholder="01XXXXXXXXX" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="x-small fw-bold text-muted mb-1 text-uppercase">Select Program *</label>
                                            <select name="interest_program" className="form-select border-0 bg-light py-2 px-3 shadow-none custom-input" value={formData.interest_program} onChange={handleChange} required>
                                                <option value="">-- Click to Select --</option>
                                                {programs.map(p => (
                                                    <option key={p.id} value={p.id}>{p.Program_Name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="x-small fw-bold text-muted mb-1 text-uppercase">City/District</label>
                                            <input type="text" name="city" className="form-control border-0 bg-light py-2 px-3 shadow-none custom-input" value={formData.city} onChange={handleChange} placeholder="e.g. Dhaka" />
                                        </div>
                                        <div className="col-12">
                                            <label className="x-small fw-bold text-muted mb-1 text-uppercase">Present Address</label>
                                            <input type="text" name="address" className="form-control border-0 bg-light py-2 px-3 shadow-none custom-input" value={formData.address} onChange={handleChange} placeholder="Full address details..." />
                                        </div>
                                        <div className="col-12">
                                            <label className="x-small fw-bold text-muted mb-1 text-uppercase">How can we help?</label>
                                            <textarea name="query_message" rows="3" className="form-control border-0 bg-light py-2 px-3 shadow-none custom-input" value={formData.query_message} onChange={handleChange} placeholder="Write your questions here..."></textarea>
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button type="submit" disabled={loading} className="btn btn-success btn-lg w-100 rounded-3 fw-bold shadow hover-up py-3" style={{ transition: "all 0.3s" }}>
                                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "SUBMIT YOUR ENQUIRY"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styling */}
            <style>{`
                .x-small { font-size: 0.75rem; letter-spacing: 0.5px; }
                .custom-input:focus { background-color: #e9ecef !important; border-left: 3px solid #198754 !important; }
                .hover-up:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
                .form-control, .form-select { border-radius: 8px; }
            `}</style>
        </section>
    );
};

export default AdmissionQueryForm;