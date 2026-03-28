import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";

const ContactSection = () => {
    const [inst, setInst] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await axios.get(`${domain}/api/institution/`);
                // যেহেতু এটি সাধারণত একটিই অবজেক্ট থাকে, তাই প্রথমটি নেওয়া হচ্ছে
                const data = res.data.results ? res.data.results[0] : res.data;
                setInst(data);
            } catch (err) {
                console.error("Institution Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitution();
    }, []);

    if (loading || !inst) return null;

    return (
        <section className="container mb-2 py-2 bg-light" id="contact">
            <div className="container py-2">
                <div className="text-center mb-2">
                    <h2 className="fw-bold text-success">Contact Us</h2>
                    <p className="text-muted">{inst.slogan || "Get in touch with us for any inquiries"}</p>
                    <div className="mx-auto" style={{ width: '60px', height: '3px', background: '#198754' }}></div>
                </div>

                <div className="row g-4">
                    {/* প্রতিষ্ঠানের তথ্য */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                            <h4 className="fw-bold mb-4 text-dark">{inst.name}</h4>
                            
                            <div className="d-flex align-items-start mb-3">
                                <div className="text-success me-3 pt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">Our Address</h6>
                                    <p className="text-muted small mb-0">{inst.address}</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start mb-3">
                                <div className="text-success me-3 pt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z"/></svg>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">Phone & Mobile</h6>
                                    <p className="text-muted small mb-0">{inst.telephone} <br/> {inst.mobile}</p>
                                </div>
                            </div>

                            <div className="d-flex align-items-start mb-4">
                                <div className="text-success me-3 pt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/></svg>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">Email Support</h6>
                                    <p className="text-muted small mb-0">{inst.email}</p>
                                </div>
                            </div>

                            <hr className="text-muted opacity-25" />

                            <div className="mt-auto">
                                <h6 className="fw-bold mb-3">Follow Us</h6>
                                <div className="d-flex gap-3">
                                    {inst.fb_link && <a href={inst.fb_link} target="_blank" rel="noreferrer" className="btn btn-outline-success btn-sm rounded-circle p-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg></a>}
                                    {inst.yt_link && <a href={inst.yt_link} target="_blank" rel="noreferrer" className="btn btn-outline-success btn-sm rounded-circle p-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.122C.001 7.37.01 6.458.082 5.508l.008-.105.01-.105c.072-.945.074-1.777.074-1.946v-.073c0-.193.01-1.108.082-2.06l.008-.105.01-.105c.05-.572.124-1.14.235-1.558A2.007 2.007 0 0 1 2.483 2.33c1.16-.312 5.569-.334 6.18-.335h.142z"/></svg></a>}
                                    {inst.linkedin_link && <a href={inst.linkedin_link} target="_blank" rel="noreferrer" className="btn btn-outline-success btn-sm rounded-circle p-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg></a>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* গুগল ম্যাপ */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100" style={{ minHeight: '400px' }}>
                            {inst.google_map_embed_url ? (
                                <div className="h-100" dangerouslySetInnerHTML={{ 
                                    __html: inst.google_map_embed_url.replace('<iframe', '<iframe style="border:0; width:100%; height:100%; min-height:400px;"') 
                                }} />
                            ) : (
                                <div className="bg-secondary bg-opacity-10 h-100 d-flex align-items-center justify-content-center">
                                    <span className="text-muted">Google Map not available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;