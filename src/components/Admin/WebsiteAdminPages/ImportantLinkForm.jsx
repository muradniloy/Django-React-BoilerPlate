import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as CM from "../../../componentExporter";
import { domain } from "../../../env";

const ImportantLinkForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.linkData;

    const [formData, setFormData] = useState({
        title: "",
        url: "",
        svg_icon: "",
        priority: 0,
        is_active: true
    });
    const [iconFile, setIconFile] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);

    // ডোমেইন ক্লিন করার জন্য ফাংশন
    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanDomain}${cleanPath}`;
    };

    useEffect(() => {
        if (editData) {
            setFormData({
                title: editData.title || "",
                url: editData.url || "",
                svg_icon: editData.svg_icon || "",
                priority: editData.priority || 0,
                is_active: editData.is_active
            });
            // এডিট মুডে ইমেজ প্রিভিউ দেখানোর জন্য ফুল ইউআরএল ব্যবহার
            if (editData.icon) setImgPreview(getFullUrl(editData.icon));
        }
    }, [editData]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconFile(file); // ফাইলে অবজেক্ট সেভ হচ্ছে
            setImgPreview(URL.createObjectURL(file)); // ব্রাউজার প্রিভিউ
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ডিবগ করার জন্য কনসোল লগ
        console.log("Submitting file:", iconFile);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("url", formData.url);
        data.append("svg_icon", formData.svg_icon || "");
        data.append("priority", formData.priority);
        data.append("is_active", formData.is_active);
        
        // ফাইল থাকলে তবেই অ্যাপেন্ড হবে
        if (iconFile) {
            data.append("icon", iconFile);
        }

        try {
            // Header চেক: কিছু ক্ষেত্রে ম্যানুয়ালি multipart বলে দিতে হয়
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editData) {
                await CM.axiosInstance.put(`/api/important-links/${editData.id}/`, data, config);
                CM.Swal.fire("Updated!", "Link details updated successfully.", "success");
            } else {
                await CM.axiosInstance.post("/api/important-links/", data, config);
                CM.Swal.fire("Success!", "New link added successfully.", "success");
            }
            navigate("/important-links");
        } catch (err) {
            console.error("Upload Error:", err.response?.data);
            CM.Swal.fire("Error", "Failed to save data. Check console for details.", "error");
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0 p-4 rounded-4 mx-auto" style={{ maxWidth: '750px' }}>
                <div className="d-flex align-items-center mb-4 gap-2">
                    <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                    <h5 className="fw-bold text-dark m-0">{editData ? "Edit Link" : "Add Link"}</h5>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Title</label>
                            <input type="text" className="form-control rounded-3" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">URL</label>
                            <input type="url" className="form-control rounded-3" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} required />
                        </div>

                        <div className="col-12 mt-4">
                            <div className="p-3 rounded-4 bg-light border border-dashed">
                                <h6 className="fw-bold small text-primary mb-3 text-uppercase text-center">Icon Selection</h6>
                                <div className="row align-items-center">
                                    <div className="col-md-5 border-end border-2 text-center">
                                        <label className="form-label small fw-bold d-block">PNG/JPG Icon</label>
                                        <div className="d-flex justify-content-center mb-2">
                                            {imgPreview ? (
                                                <img src={imgPreview} alt="Icon" className="rounded shadow-sm border" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="rounded bg-white border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                    <i className="fa fa-image text-muted"></i>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" className="form-control form-control-sm" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                    </div>

                                    <div className="col-md-2 fw-bold text-muted text-center">OR</div>

                                    <div className="col-md-5">
                                        <label className="form-label small fw-bold">SVG Code</label>
                                        <textarea className="form-control form-control-sm" rows="3" value={formData.svg_icon} onChange={(e) => setFormData({...formData, svg_icon: e.target.value})} placeholder="<svg>...</svg>" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 mt-4">
                            <label className="form-label small fw-bold">Priority</label>
                            <input type="number" className="form-control rounded-3" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} />
                        </div>
                        <div className="col-md-6 mt-4 d-flex align-items-end pb-2">
                            <div className="form-check form-switch custom-switch">
                                <input className="form-check-input" type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} id="activeSwitch" />
                                <label className="form-check-label fw-bold small ms-2" htmlFor="activeSwitch">Active Status</label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-5">
                        <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm">Save Link</button>
                        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportantLinkForm;