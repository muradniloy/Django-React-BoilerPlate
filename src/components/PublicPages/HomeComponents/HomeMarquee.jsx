import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { domain } from "../../../env";

export const HomeMarquee = () => {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const fetchImportantNotices = async () => {
            try {
                const res = await axios.get(`${domain}/api/notices/?important=true`);
                const data = res.data.results || res.data;
                if (Array.isArray(data)) setNotices(data);
            } catch (err) {
                console.error("Notice Fetch Error:", err);
            }
        };
        fetchImportantNotices();
    }, []);

    if (!notices || notices.length === 0) return null;

    const getFileUrl = (path) => {
        if (!path) return "#";
        return path.startsWith('http') ? path : `${domain}${path}`;
    };

    // আইকন কম্পোনেন্ট (একবার ডিফাইন করে দুই জায়গায় ব্যবহার করছি)
    const ChevronIcon = () => (
        <span className="mx-4 d-inline-flex align-items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="#ffc107" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 2px rgba(255,193,7,0.8))' }} />
            </svg>
        </span>
    );

    return (
        <div className="bg-primary text-white py-2 shadow-sm border-bottom border-warning border-3 overflow-hidden">
            <div className="container-fluid">
                <div className="marquee-wrapper">
                    <div className="marquee-content fw-bold">
                        {/* প্রথম সেট নোটিশ */}
                        {notices.map((notice, index) => (
                            <a key={`orig-${notice.id || index}`} href={getFileUrl(notice.attachment)} target="_blank" rel="noopener noreferrer" className="marquee-link d-inline-flex align-items-center text-decoration-none">
                                <span>📢 {notice.title}</span>
                                <ChevronIcon />
                            </a>
                        ))}
                        {/* দ্বিতীয় সেট নোটিশ (লুপের জন্য) */}
                        {notices.map((notice, index) => (
                            <a key={`rep-${notice.id || index}`} href={getFileUrl(notice.attachment)} target="_blank" rel="noopener noreferrer" className="marquee-link d-inline-flex align-items-center text-decoration-none">
                                <span>📢 {notice.title}</span>
                                <ChevronIcon />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .marquee-wrapper { overflow: hidden; white-space: nowrap; width: 100%; position: relative; }
                .marquee-content { display: inline-block; animation: marquee-scroll 50s linear infinite; }
                .marquee-link { color: white !important; display: inline-flex; align-items: center; margin-right: 0px; cursor: pointer !important; position: relative; z-index: 10; padding: 5px 0; }
                .marquee-link:hover { color: #ffc107 !important; }
                .marquee-wrapper:hover .marquee-content { animation-play-state: paused; }
                @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            `}</style>
        </div>
    );
};