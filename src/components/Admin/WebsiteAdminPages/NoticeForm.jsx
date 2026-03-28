import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";
import * as CM from "../../../componentExporter";

const SliderForm = ({ editData, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    
    // ১. স্টেট সব সময় একটি খালি অ্যারে দিয়ে শুরু হবে
    const [availablePositions, setAvailablePositions] = useState([]); 
    
    const [formData, setFormData] = useState({
        title: editData?.title || "",
        subtitle: editData?.subtitle || "",
        order: editData?.order || 0,
        active: editData?.active ?? true,
        button_text: editData?.button_text || "Learn More",
        button_url: editData?.button_url || "#",
        // নিশ্চিত করা হচ্ছে যে positions একটি অ্যারে
        positions: Array.isArray(editData?.positions) ? editData.positions : [], 
    });
    const [image, setImage] = useState(null);

    // ২. ডাটা ফেচ করার সবচেয়ে নিরাপদ উপায়
    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const res = await axios.get(`${domain}/api/slider-positions`);
                
                // ডিবাগ: আপনার কনসোলে দেখুন ডাটা কি ফরমেটে আসছে
                console.log("Raw API Response:", res.data);

                let finalData = [];

                if (Array.isArray(res.data)) {
                    // যদি সরাসরি লিস্ট আসে: [{}, {}]
                    finalData = res.data;
                } else if (res.data && res.data.results && Array.isArray(res.data.results)) {
                    // যদি পাজিনেশনসহ আসে: { results: [{}, {}] }
                    finalData = res.data.results;
                } else if (typeof res.data === 'object' && res.data !== null) {
                    // যদি অন্য কোনো অবজেক্ট আসে, সেটিকে অ্যারেতে রূপান্তরের চেষ্টা
                    finalData = Object.values(res.data).filter(item => typeof item === 'object');
                }

                setAvailablePositions(finalData);
            } catch (err) {
                console.error("Fetch Error:", err);
                setAvailablePositions([]); // এরর হলেও অ্যারে থাকবে
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
            if (key !== 'positions') data.append(key, formData[key]);
        });

        // ManyToMany IDs পাঠানো
        if (formData.positions.length > 0) {
            formData.positions.forEach(id => data.append("positions", id));
        } else {
            // যদি কোনো পজিশন সিলেক্ট না থাকে, তবে খালি পাঠানোর জন্য (ঐচ্ছিক)
            data.append("positions", "");
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
            CM.Swal.fire("Error", "Could not save slider. Check console.", "error");
        } finally { setLoading(false); }
    };

    return (
        <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white mx-auto" style={{ maxWidth: "800px" }}>
            <h5 className="fw-bold text-success mb-4">{editData ? "Edit Slider" : "Add New Slider"}</h5>
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-8">
                        <label className="small fw-bold text-muted mb-1">Slider Title *</label>
                        <input type="text" className="form-control border-0 bg-light py-2" value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                        <label className="small fw-bold text-muted mb-1">Order</label>
                        <input type="number" className="form-control border-0 bg-light py-2" value={formData.order} 
                            onChange={(e) => setFormData({...formData, order: e.target.value})} />
                    </div>

                    {/* ৩. চেক বক্স রেন্ডারিং এরিয়া */}
                    <div className="col-12 mt-3">
                        <label className="small fw-bold text-muted mb-2 d-block">Select Display Sections</label>
                        <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded-3 border">
                            {/* ম্যাপ করার আগে ডাবল চেক */}
                            {Array.isArray(availablePositions) && availablePositions.length > 0 ? (
                                availablePositions.map((pos) => (
                                    <div key={pos.id || Math.random()} className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id={`pos-${pos.id}`}
                                            checked={formData.positions?.includes(pos.id)}
                                            onChange={() => handleCheckboxChange(pos.id)}
                                        />
                                        <label className="form-check-label small cursor-pointer" htmlFor={`pos-${pos.id}`}>
                                            {pos.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted small italic p-2 w-100 text-center">
                                    {availablePositions.length === 0 ? "Loading or No sections found..." : ""}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* বাকি ইনপুটগুলো */}
                    <div className="col-12">
                        <label className="small fw-bold text-muted mb-1">Subtitle</label>
                        <textarea className="form-control border-0 bg-light py-2" rows="2" value={formData.subtitle} 
                            onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">Button Text</label>
                        <input type="text" className="form-control border-0 bg-light py-2" value={formData.button_text} 
                            onChange={(e) => setFormData({...formData, button_text: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">Button URL</label>
                        <input type="text" className="form-control border-0 bg-light py-2" value={formData.button_url} 
                            onChange={(e) => setFormData({...formData, button_url: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">Image</label>
                        <input type="file" className="form-control border-0 bg-light py-2" 
                            onChange={(e) => setImage(e.target.files[0])} required={!editData} />
                    </div>
                    <div className="col-md-6 d-flex align-items-center">
                        <div className="form-check form-switch mt-3">
                            <input className="form-check-input" type="checkbox" checked={formData.active} 
                                onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                            <label className="form-check-label small fw-bold text-muted ms-2">Active</label>
                        </div>
                    </div>
                </div>
                <div className="mt-5 d-flex gap-2 justify-content-end border-top pt-4">
                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold border" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow" disabled={loading}>
                        {loading ? "Saving..." : editData ? "Update Slider" : "Save Slider"}
                    </button>
                </div>
            </form>
            <style>{`.cursor-pointer { cursor: pointer; } .italic { font-style: italic; }`}</style>
        </div>
    );
};

export default SliderForm;