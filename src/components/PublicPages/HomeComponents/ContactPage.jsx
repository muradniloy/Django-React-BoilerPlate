import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";
import { HomeMarquee } from "./HomeMarquee";

const ContactPage = () => {
    const [inst, setInst] = useState(null);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await axios.get(`${domain}/api/institution/`);
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                setInst(data);
            } catch (err) {
                console.error("Contact Data Error:", err);
            }
        };
        fetchInstitution();
    }, []);

    return (
        <div className="contact-wrapper bg-white min-vh-100">
            <HomeMarquee />
            
            <section className="py-5">
                <div className="container">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>
                            Contact <span className="text-primary">Us</span>
                        </h2>
                        <div className="title-underline mx-auto">
                            <span className="line-long"></span>
                            <span className="line-dot"></span>
                            <span className="line-long"></span>
                        </div>
                    </div>

                    <div className="row g-5">
                        {/* Left Side: Contact Info */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm p-4 bg-light h-100">
                                <h4 className="fw-bold mb-4">Get in Touch</h4>
                                
                                <div className="d-flex align-items-start mb-4">
                                    <div className="icon-box me-3">📍</div>
                                    <div>
                                        <h6 className="fw-bold mb-1 text-primary">Location</h6>
                                        <p className="text-muted small">{inst?.address || "Address not set"}</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-4">
                                    <div className="icon-box me-3">📞</div>
                                    <div>
                                        <h6 className="fw-bold mb-1 text-primary">Phone</h6>
                                        <p className="text-muted small">{inst?.mobile || "Phone not set"}</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-4">
                                    <div className="icon-box me-3">✉️</div>
                                    <div>
                                        <h6 className="fw-bold mb-1 text-primary">Email</h6>
                                        <p className="text-muted small">{inst?.email || "Email not set"}</p>
                                    </div>
                                </div>

                                {/* Social Links if available */}
                                <div className="mt-auto">
                                    <h6 className="fw-bold mb-3 small text-uppercase">Follow Us</h6>
                                    <div className="d-flex gap-2">
                                        {inst?.fb_link && <a href={inst.fb_link} target="_blank" className="btn btn-sm btn-outline-primary rounded-pill px-3">Facebook</a>}
                                        {inst?.yt_link && <a href={inst.yt_link} target="_blank" className="btn btn-sm btn-outline-danger rounded-pill px-3">YouTube</a>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Iframes (Map, FB, YT) */}
                        {/* Right Side: Iframes (Map, FB, YT) */}
<div className="col-lg-8">
    <div className="row g-4">
        
        {/* 1. Google Map Section */}
        <div className="col-12">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ minHeight: '400px' }}>
                {inst?.google_map_embed_url ? (
                    <div className="h-100" dangerouslySetInnerHTML={{ 
                        __html: inst.google_map_embed_url.replace('<iframe', '<iframe style="border:0; width:100%; height:100%; min-height:400px;"') 
                    }} />
                ) : (
                    <div className="bg-secondary bg-opacity-10 h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                        <span className="text-muted">Google Map not available</span>
                    </div>
                )}
            </div>
        </div>

        {/* 2. Facebook Page Embed */}
       {/* 2. Facebook Page Embed */}
<div className="col-md-6">
    <div className="card border-0 shadow-sm overflow-hidden" style={{ minHeight: '450px' }}>
        {inst?.fb_link ? (
            <div className="h-100 p-2 d-flex justify-content-center bg-white">
                <iframe 
                    src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(inst.fb_link)}&tabs=timeline&width=340&height=450&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                    width="100%" 
                    height="450" 
                    style={{ border: 'none', overflow: 'hidden' }} 
                    scrolling="no" 
                    frameBorder="0" 
                    allowFullScreen={true} 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Facebook Page"
                ></iframe>
            </div>
        ) : (
            <div className="bg-secondary bg-opacity-10 h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '450px' }}>
                <span className="text-muted">Facebook Page not available</span>
            </div>
        )}
    </div>
</div>

        {/* 3. YouTube Video Embed */}
        <div className="col-md-6">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ minHeight: '450px' }}>
                {inst?.yt_link ? (
                    <div className="h-100" dangerouslySetInnerHTML={{ 
                        __html: inst.yt_link.replace('<iframe', '<iframe style="border:0; width:100%; height:100%; min-height:450px;"') 
                    }} />
                ) : (
                    <div className="bg-secondary bg-opacity-10 h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '450px' }}>
                        <span className="text-muted">YouTube Video not available</span>
                    </div>
                )}
            </div>
        </div>

    </div>
</div>
                    </div>
                </div>

                <style>{`
                    .title-underline { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px; }
                    .line-long { width: 40px; height: 3px; background: #0d6efd; border-radius: 10px; }
                    .line-dot { width: 10px; height: 10px; background: #ffc107; border-radius: 50%; }
                    .icon-box { 
                        width: 40px; 
                        height: 40px; 
                        background: #e7f1ff; 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 1.2rem;
                    }
                `}</style>
            </section>
        </div>
    );
};

export default ContactPage;