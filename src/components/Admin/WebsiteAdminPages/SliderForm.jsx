import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";
import * as CM from "../../../componentExporter";

const SliderForm = ({ editData, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    
    // ১. স্টেট সব সময় একটি খালি অ্যারে দিয়ে শুরু হবে (যাতে .map কাজ করে)
    const [availablePositions, setAvailablePositions] = useState([]); 
    
    const [formData, setFormData] = useState({
        title: editData?.title || "",
        subtitle: editData?.subtitle || "",
        order: editData?.order || 0,
        active: editData?.active ?? true,
        button_text: editData?.button_text || "Learn More",
        button_url: editData?.button_url || "#",
        // এডিট মোডে থাকলে ID গুলোর একটি অ্যারে নিশ্চিত করা
        positions: Array.isArray(editData?.positions) ? editData.positions : [], 
    });
    const [image, setImage] = useState(null);

    // ২. এপিআই কল করার সবচেয়ে নিরাপদ মেথড
    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const res = await axios.get(`${domain}/api/slider-positions/`);
                
                // কনসোলে চেক করার জন্য (Debug)
                console.log("Slider Positions Data:", res.data);

                let dataArray = [];
                // যদি ডাটা সরাসরি অ্যারে হয়
                if (Array.isArray(res.data)) {
                    dataArray = res.data;
                } 
                // যদি ডাটা Pagination এর ভেতর 'results' এ থাকে
                else if (res.data && res.data.results && Array.isArray(res.data.results)) {
                    dataArray = res.data.results;
                }

                setAvailablePositions(dataArray);
            } catch (err) {
                console.error("API Error:", err);
                setAvailablePositions([]); // এরর হলে সেফটি হিসেবে খালি অ্যারে
            }
        };
        fetchPositions();
    }, []);

    const handleCheckboxChange = (id) => {
        setFormData((prev) => {
            const current = [...(prev.positions || [])];
            if (current.includes(id)) {
                return { ...prev, positions: current.filter((p) => p !== id) };
            } else {
                return { ...prev, positions: [...current, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'positions') {
                data.append(key, formData[key]);
            }
        });

        // ManyToMany IDs পাঠানোর স্ট্যান্ডার্ড নিয়ম (লুপ করে পাঠানো)
        if (formData.positions && formData.positions.length > 0) {
            formData.positions.forEach(id => {
                data.append("positions", id);
            });
        }

        if (image) data.append("image", image);

        try {
            if (editData) {
                await axios.patch(`${domain}/api/home-sliders/${editData.id}/`, data);
            } else {
                await axios.post(`${domain}/api/home-sliders/`, data);
            }
            CM.Swal.fire("Success", "Slider saved successfully!", "success");
            onSuccess();
        } catch (err) {
            console.error("Submit Error:", err.response?.data);
            CM.Swal.fire("Error", "Could not save. Check all fields.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white mx-auto" style={{ maxWidth: "850px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 className="fw-bold text-success m-0">{editData ? "✏️ Edit Slider" : "🚀 Add New Slider"}</h5>
                <button type="button" className="btn-close shadow-none" onClick={onCancel}></button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    <div className="col-md-8">
                        <label className="small fw-bold text-muted mb-1">Slider Title *</label>
                        <input type="text" className="form-control border-2 bg-light shadow-none" value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                        <label className="small fw-bold text-muted mb-1">Order</label>
                        <input type="number" className="form-control border-2 bg-light shadow-none" value={formData.order} 
                            onChange={(e) => setFormData({...formData, order: e.target.value})} />
                    </div>

                    {/* --- Display Locations (Checkboxes) --- */}
                    <div className="col-12">
                        <label className="small fw-bold text-muted mb-2 d-block">Display Sections (Where to show?)</label>
                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded-3 border-2 border-dashed">
                            {/* এরর এড়াতে (availablePositions || []) ব্যবহার করা হয়েছে */}
                            {Array.isArray(availablePositions) && availablePositions.length > 0 ? (
                                availablePositions.map((pos) => (
                                    <div key={pos.id} className="form-check">
                                        <input 
                                            className="form-check-input cursor-pointer" 
                                            type="checkbox" 
                                            id={`pos-${pos.id}`}
                                            checked={formData.positions?.includes(pos.id)}
                                            onChange={() => handleCheckboxChange(pos.id)}
                                        />
                                        <label className="form-check-label small cursor-pointer fw-semibold text-dark" htmlFor={`pos-${pos.id}`}>
                                            {pos.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center w-100 py-2">
                                    <span className="text-muted small italic">No sections found. Please add Slider Positions in Backend.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="small fw-bold text-muted mb-1">Subtitle / Description</label>
                        <textarea className="form-control border-2 bg-light shadow-none" rows="2" value={formData.subtitle} 
                            onChange={(e) => setFormData({...formData, subtitle: e.target.value})} placeholder="Short description..." />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">Button Text</label>
                        <input type="text" className="form-control border-2 bg-light shadow-none" value={formData.button_text} 
                            onChange={(e) => setFormData({...formData, button_text: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">Button Link (URL)</label>
                        <input type="text" className="form-control border-2 bg-light shadow-none" value={formData.button_url} 
                            onChange={(e) => setFormData({...formData, button_url: e.target.value})} />
                    </div>
                    <div className="col-md-7">
                        <label className="small fw-bold text-muted mb-1">Slider Image {editData && "(Leave blank to keep current)"}</label>
                        <input type="file" className="form-control border-2 bg-light shadow-none" 
                            onChange={(e) => setImage(e.target.files[0])} required={!editData} />
                    </div>
                    <div className="col-md-5 d-flex align-items-end">
                        <div className="form-check form-switch mb-2 ms-md-4">
                            <input className="form-check-input cursor-pointer" type="checkbox" style={{width: '40px', height: '20px'}} 
                                checked={formData.active} 
                                onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                            <label className="form-check-label small fw-bold text-muted ms-2">Active Status</label>
                        </div>
                    </div>
                </div>

                <div className="mt-5 d-flex gap-2 justify-content-end border-top pt-4">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-sm" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" disabled={loading}>
                        {loading ? "Saving..." : editData ? "Update Slider" : "Save Slider"}
                    </button>
                </div>
            </form>
            <style>{`.cursor-pointer { cursor: pointer; } .italic { font-style: italic; }`}</style>
        </div>
    );
};

export default SliderForm;