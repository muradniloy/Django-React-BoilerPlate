import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env"; 
import { HomeMarquee } from "./HomeMarquee";

const CollegeProfile = () => {
    const [inst, setInst] = useState(null);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await axios.get(`${domain}/api/institution/`);
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                setInst(data);
            } catch (err) {
                console.error("Profile Data Error:", err);
            }
        };
        fetchInstitution();
    }, []);

    return (
        <div className="profile-wrapper bg-white min-vh-100" style={{ width: '100%', overflowX: 'hidden', fontFamily: 'Arial, sans-serif' }}>
            <HomeMarquee />

            {/* --- 1. MODERN HERO SECTION (No Logo, Text Focus) --- */}
            <header className="py-5" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', color: 'white' }}>
                <div className="container py-4 text-center">
                    <span className="badge bg-warning text-dark mb-3 px-3 py-2 fw-bold shadow-sm">ESTABLISHED 1995</span>
                    <h1 className="display-3 fw-bold mb-3" style={{ letterSpacing: '-1px' }}>
                        {inst?.name || "Academic Excellence Center"}
                    </h1>
                    <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                        <div style={{ width: '50px', height: '3px', background: '#ffc107' }}></div>
                        <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%' }}></div>
                        <div style={{ width: '50px', height: '3px', background: '#ffc107' }}></div>
                    </div>
                    <p className="lead mx-auto opacity-90 mb-5" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
                        {inst?.description || "Providing a transformative educational experience that prepares students for global challenges through innovation, leadership, and discipline."}
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-light btn-lg px-4 fw-bold text-primary shadow">Admission Open</button>
                        <button className="btn btn-outline-light btn-lg px-4 fw-bold border-2">Download Brochure</button>
                    </div>
                </div>
            </header>

            {/* --- 2. PRINCIPAL'S MESSAGE (Floating Card Effect) --- */}
            <section className="py-5" style={{ marginTop: '-40px' }}>
                <div className="container">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="row g-0">
                            <div className="col-lg-4 text-center p-5" style={{ background: '#f8f9fa', borderRight: '1px solid #eee' }}>
                                <img src="https://via.placeholder.com/150" className="rounded-circle shadow-sm mb-3 border border-4 border-white" alt="Principal" style={{ width: '160px', height: '160px', objectFit: 'cover' }} />
                                <h5 className="fw-bold mb-1 text-dark">Prof. Dr. [Name]</h5>
                                <p className="text-primary small fw-bold mb-0 text-uppercase">Principal & Head of Faculty</p>
                            </div>
                            <div className="col-lg-8 p-5 bg-white d-flex align-items-center">
                                <div>
                                    <h3 className="fw-bold text-primary mb-3">Message from the Principal</h3>
                                    <p className="text-muted fst-italic" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
                                        "Welcome to our institution. Our primary focus is to nurture curiosity and foster a mindset of lifelong learning. We believe in providing an environment where every student can reach their full potential."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. ACADEMIC & FEE STRUCTURE --- */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="row g-4">
                        {/* Course List */}
                        <div className="col-lg-7">
                            <h4 className="fw-bold mb-4 d-flex align-items-center">
                                <span className="bg-primary me-2" style={{ width: '10px', height: '25px', borderRadius: '2px' }}></span>
                                Academic Courses & Fees
                            </h4>
                            <div className="table-responsive bg-white rounded-3 shadow-sm border overflow-hidden">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="bg-dark text-white">
                                        <tr>
                                            <th className="p-3 ps-4">Program</th>
                                            <th className="p-3 text-center">Admission</th>
                                            <th className="p-3 text-end pe-4">Monthly Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="ps-4 fw-bold">Science & Engineering</td>
                                            <td className="text-center">৳ 20,000</td>
                                            <td className="text-end pe-4 text-primary fw-bold">৳ 4,500</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 fw-bold">Business Studies</td>
                                            <td className="text-center">৳ 15,000</td>
                                            <td className="text-end pe-4 text-primary fw-bold">৳ 3,500</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4 fw-bold">Humanities / Arts</td>
                                            <td className="text-center">৳ 12,000</td>
                                            <td className="text-end pe-4 text-primary fw-bold">৳ 2,800</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Admission Criteria */}
                        <div className="col-lg-5">
                            <h4 className="fw-bold mb-4 d-flex align-items-center">
                                <span className="bg-warning me-2" style={{ width: '10px', height: '25px', borderRadius: '2px' }}></span>
                                Admission Criteria
                            </h4>
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderTop: '4px solid #ffc107' }}>
                                <div className="mb-3 d-flex gap-3">
                                    <div className="text-success fw-bold">✔</div>
                                    <p className="mb-0 text-muted">Minimum GPA 3.50 in SSC & HSC examinations.</p>
                                </div>
                                <div className="mb-3 d-flex gap-3">
                                    <div className="text-success fw-bold">✔</div>
                                    <p className="mb-0 text-muted">Attested copies of all academic transcripts.</p>
                                </div>
                                <div className="mb-3 d-flex gap-3">
                                    <div className="text-success fw-bold">✔</div>
                                    <p className="mb-0 text-muted">Birth Certificate or NID copy is mandatory.</p>
                                </div>
                                <div className="mt-4 p-3 bg-light rounded text-center border">
                                    <h6 className="fw-bold text-danger mb-1">Application Deadline</h6>
                                    <p className="small mb-0 fw-bold">June 30, 2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. FACILITIES & STATS --- */}
            <section className="py-5 bg-white">
                <div className="container">
                    <h3 className="fw-bold text-center mb-5">Campus Facilities</h3>
                    <div className="row g-4 mb-5">
                        {[
                            { icon: "📶", title: "Wi-Fi Campus" }, { icon: "🧪", title: "Modern Labs" },
                            { icon: "📚", title: "Huge Library" }, { icon: "🚌", title: "Bus Service" },
                            { icon: "⚽", title: "Play Ground" }, { icon: "🛡️", title: "CCTV Security" }
                        ].map((item, i) => (
                            <div className="col-md-4 col-lg-2 col-6" key={i}>
                                <div className="text-center p-3 rounded-4 border shadow-sm hover-up h-100">
                                    <div className="fs-2 mb-2">{item.icon}</div>
                                    <h6 className="fw-bold small mb-0">{item.title}</h6>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row text-center g-4 border-top pt-5">
                        <div className="col-md-3">
                            <h2 className="fw-bold text-primary mb-0">2500+</h2>
                            <small className="text-muted text-uppercase fw-bold">Students</small>
                        </div>
                        <div className="col-md-3">
                            <h2 className="fw-bold text-primary mb-0">120+</h2>
                            <small className="text-muted text-uppercase fw-bold">Faculty Members</small>
                        </div>
                        <div className="col-md-3">
                            <h2 className="fw-bold text-primary mb-0">15+</h2>
                            <small className="text-muted text-uppercase fw-bold">Departments</small>
                        </div>
                        <div className="col-md-3">
                            <h2 className="fw-bold text-primary mb-0">100%</h2>
                            <small className="text-muted text-uppercase fw-bold">Job Placement</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. ALUMNI & AFFILIATIONS --- */}
            <section className="py-5 bg-dark text-white">
                <div className="container text-center">
                    <h4 className="fw-bold mb-4 opacity-75">Affiliated & Recognized By</h4>
                    <div className="d-flex flex-wrap justify-content-center gap-5 align-items-center">
                        <div className="px-3 py-2 border border-secondary rounded fw-bold text-secondary">UGC APPROVED</div>
                        <div className="px-3 py-2 border border-secondary rounded fw-bold text-secondary">NATIONAL UNIVERSITY</div>
                        <div className="px-3 py-2 border border-secondary rounded fw-bold text-secondary">ISO 9001 CERTIFIED</div>
                    </div>
                </div>
            </section>

            <style>{`
                .hover-up:hover { transform: translateY(-5px); transition: 0.3s ease; border-color: #0d6efd !important; }
                .card { transition: all 0.3s ease; }
                body { overflow-x: hidden; }
            `}</style>
        </div>
    );
};

export default CollegeProfile;