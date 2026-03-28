import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";

const LabPhotos = () => {
    const [labPhotos, setLabPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // মোডাল এবং প্যাজিনেশন স্টেট
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const photosPerPage = 9; // প্রতি পেজে ৯টি ছবি

    useEffect(() => {
        const fetchLabPhotos = async () => {
            try {
                const res = await axios.get(`${domain}/api/home-sliders/`);
                const data = res.data.results || res.data;

                if (Array.isArray(data)) {
                    const filtered = data.filter(slider => 
                        (slider.positions_details || slider.positions)?.some(
                            pos => pos.slug === 'lab_photos' || pos === 4 // আপনার আইডি ৪ হলে
                        )
                    );
                    setLabPhotos(filtered);
                }
            } catch (err) {
                console.error("Failed to load lab photos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLabPhotos();
    }, []);

    // প্যাজিনেশন লজিক
    const indexOfLastPhoto = currentPage * photosPerPage;
    const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
    const currentPhotos = labPhotos.slice(indexOfFirstPhoto, indexOfLastPhoto);
    const totalPages = Math.ceil(labPhotos.length / photosPerPage);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: "300px"}}>
            <div className="spinner-grow text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-5">
            {/* হেডার সেকশন */}
            <div className="text-center mb-5">
                <h2 className="fw-bold text-uppercase tracking-wider" style={{color: "#2c3e50"}}>
                    Our Specialized <span className="text-primary">Laboratories</span>
                </h2>
                <div className="mx-auto bg-primary mb-3" style={{height: "3px", width: "60px"}}></div>
                <p className="text-muted">Explore our world-class facilities through the lens.</p>
            </div>

            {/* ফটো গ্রিড */}
            <div className="row g-4">
                {currentPhotos.map((photo) => (
                    <div className="col-md-6 col-lg-4" key={photo.id}>
                        <div 
                            className="card h-100 border-0 shadow-sm overflow-hidden lab-card"
                            onClick={() => setSelectedImage(photo)}
                            style={{ cursor: "zoom-in" }}
                        >
                            <div className="position-relative overflow-hidden" style={{ height: "240px" }}>
                                <img 
                                    src={photo.image} 
                                    alt={photo.title} 
                                    className="img-fluid w-100 h-100 object-fit-cover lab-img"
                                />
                                <div className="img-overlay d-flex align-items-center justify-content-center">
                                    <i className="bi bi-fullscreen text-white fs-2"></i>
                                </div>
                            </div>
                            <div className="card-body bg-white text-center">
                                <h6 className="fw-bold mb-1 text-dark text-truncate">{photo.title}</h6>
                                <p className="small text-muted mb-0 text-truncate-2">{photo.subtitle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* প্যাজিনেশন কন্ট্রোল */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                    <nav>
                        <ul className="pagination pagination-md">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link shadow-none" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link shadow-none" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link shadow-none" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* --- মডার্ন ইমেজ মোডাল (Bootstrap Modal logic) --- */}
            {selectedImage && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.9)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-transparent border-0">
                            <div className="modal-header border-0 p-0 justify-content-end">
                                <button type="button" className="btn-close btn-close-white p-3 shadow-none" onClick={() => setSelectedImage(null)}></button>
                            </div>
                            <div className="modal-body p-0 text-center">
                                <img src={selectedImage.image} className="img-fluid rounded shadow-lg" style={{ maxHeight: "80vh" }} alt="Full View" />
                                <div className="mt-3 text-white bg-dark p-3 rounded-bottom">
                                    <h5 className="fw-bold mb-1">{selectedImage.title}</h5>
                                    <p className="small opacity-75 mb-0">{selectedImage.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* কাস্টম সিএসএস */}
            <style>{`
                .lab-card {
                    transition: all 0.3s ease;
                }
                .lab-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
                .lab-img {
                    transition: transform 0.5s ease;
                }
                .lab-card:hover .lab-img {
                    transform: scale(1.1);
                }
                .img-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(13, 110, 253, 0.3);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .lab-card:hover .img-overlay {
                    opacity: 1;
                }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .page-link { border-radius: 50% !important; margin: 0 5px; color: #555; border: 1px solid #ddd; }
                .page-item.active .page-link { background-color: #0d6efd; border-color: #0d6efd; color: white; }
            `}</style>
        </div>
    );
};

export default LabPhotos;