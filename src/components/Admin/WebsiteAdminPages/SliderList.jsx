import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";
import * as CM from "../../../componentExporter";
import SliderForm from "./SliderForm";

const SliderList = () => {
    const [sliders, setSliders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchSliders = async (page = 1) => {
        try {
            // API তে pagination থাকলে page প্যারামিটার পাস করছি
            const res = await axios.get(`${domain}/api/home-sliders/?page=${page}`);
            
            // Django Standard Pagination (results, count) হ্যান্ডেল করা হচ্ছে
            if (res.data.results) {
                setSliders(res.data.results);
                setTotalPages(Math.ceil(res.data.count / 10)); // প্রতি পেজে ১০টি করে ধরলে
            } else {
                setSliders(res.data);
                setTotalPages(1);
            }
            setCurrentPage(page);
        } catch (err) { 
            console.error(err); 
        }
    };

    useEffect(() => { fetchSliders(); }, []);

    const handleDelete = async (id) => {
        const confirm = await CM.Swal.fire({
            title: "Are you sure?",
            text: "This slider will be removed!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${domain}/api/home-sliders/${id}/`);
                CM.Swal.fire("Deleted!", "Slider has been removed.", "success");
                fetchSliders(currentPage);
            } catch (err) { 
                CM.Swal.fire("Error", "Could not delete.", "error"); 
            }
        }
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-success border-bottom border-3 pb-1">Home Sliders</h4>
                {!showForm && (
                    <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" 
                        onClick={() => { setEditData(null); setShowForm(true); }}>
                        + Add New Slider
                    </button>
                )}
            </div>

            {showForm ? (
                <SliderForm 
                    editData={editData} 
                    onSuccess={() => { setShowForm(false); fetchSliders(currentPage); }} 
                    onCancel={() => setShowForm(false)} 
                />
            ) : (
                <>
                    <div className="row g-4">
                        {sliders.map((item) => (
                            <div className="col-md-6 col-lg-4" key={item.id}>
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                    <div className="position-relative">
                                        <img src={item.image} className="card-img-top" style={{ height: "180px", objectFit: "cover" }} alt={item.title} />
                                        <span className={`badge position-absolute top-0 end-0 m-2 ${item.active ? 'bg-success' : 'bg-danger'}`}>
                                            {item.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold text-dark mb-1 text-truncate">{item.title}</h6>
                                        
                                        {/* Displaying Positions */}
                                        <div className="mb-2">
                                            {item.positions_details?.map((pos) => (
                                                <span key={pos.id} className="badge bg-light text-dark border me-1 small fw-normal">
                                                    #{pos.name}
                                                </span>
                                            ))}
                                            {(!item.positions_details || item.positions_details.length === 0) && 
                                                <span className="text-muted x-small">No position set</span>}
                                        </div>

                                        <p className="small text-muted text-truncate mb-3">{item.subtitle}</p>
                                        
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-light btn-sm flex-fill fw-bold rounded-pill border" 
                                                onClick={() => { setEditData(item); setShowForm(true); }}>Edit</button>
                                            <button className="btn btn-outline-danger btn-sm flex-fill fw-bold rounded-pill" 
                                                onClick={() => handleDelete(item.id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simple Pagination Control */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-5 gap-2">
                            <button 
                                className="btn btn-outline-success btn-sm px-3 rounded-pill"
                                disabled={currentPage === 1}
                                onClick={() => fetchSliders(currentPage - 1)}
                            > Previous </button>
                            
                            <span className="align-self-center fw-bold text-muted mx-2">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button 
                                className="btn btn-outline-success btn-sm px-3 rounded-pill"
                                disabled={currentPage === totalPages}
                                onClick={() => fetchSliders(currentPage + 1)}
                            > Next </button>
                        </div>
                    )}
                </>
            )}
            
            <style>{`
                .x-small { font-size: 11px; }
            `}</style>
        </div>
    );
};

export default SliderList;