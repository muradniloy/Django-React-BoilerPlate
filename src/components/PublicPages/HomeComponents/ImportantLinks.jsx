import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";

export const ImportantLinks = () => {
    const [links, setLinks] = useState([]);

    const fetchLinks = async () => {
        try {
            const res = await axios.get(`${domain}/api/important-links/`);
            const data = res.data.results || res.data;
            const activeLinks = Array.isArray(data) ? data.filter(link => link.is_active) : [];
            setLinks(activeLinks);
        } catch (err) {
            console.error("Error fetching links:", err);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    // ইমেজ ইউআরএল ঠিক করার জন্য হেল্পার ফাংশন
    const getIconUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanDomain}${cleanPath}`;
    };

    // আইকন রেন্ডারিং লজিক
    const renderIcon = (link) => {
        // ১. যদি PNG/Image থাকে
        if (link.icon) {
            return (
                <img 
                    src={getIconUrl(link.icon)} 
                    alt={link.title} 
                    style={{ width: "40px", height: "40px", objectFit: "contain" }} 
                />
            );
        }
        // ২. ইমেজ না থাকলে যদি SVG কোড থাকে
        if (link.svg_icon) {
            return (
                <div 
                    className="icon-wrapper"
                    dangerouslySetInnerHTML={{ __html: link.svg_icon }}
                    style={{ width: "40px", height: "40px", margin: "0 auto" }}
                />
            );
        }
        // ৩. কোনোটিই না থাকলে ডিফল্ট আইকন
        return <div className="display-6 text-muted">🔗</div>;
    };

    if (links.length === 0) return null;

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="row mb-4">
                    <div className="col-12 text-center">
                        <h3 className="fw-bold">Important Links</h3>
                        <div className="mx-auto" style={{ width: '60px', height: '3px', background: '#198754' }}></div>
                    </div>
                </div>

                <div className="row g-3 justify-content-center">
                    {links.map((link) => (
                        <div key={link.id} className="col-6 col-md-4 col-lg-2">
                            <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-decoration-none"
                            >
                                <div className="link-card p-3 bg-white shadow-sm text-center h-100 border-0">
                                    <div className="mb-2 d-flex align-items-center justify-content-center" style={{ height: "45px" }}>
                                        {renderIcon(link)}
                                    </div>
                                    <h6 className="small fw-bold text-dark mb-0">{link.title}</h6>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .link-card {
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    border: 1px solid #eee !important;
                }
                .link-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
                    border-color: #198754 !important;
                }
                .icon-wrapper svg {
                    width: 100%;
                    height: 100%;
                    fill: currentColor;
                    color: #198754;
                }
            `}</style>
        </section>
    );
};