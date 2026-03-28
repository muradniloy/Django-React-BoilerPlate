import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter";
import { domain } from "../../../env"; // ডোমেইন ইমপোর্ট নিশ্চিত করুন

const ImportantLinkList = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const res = await CM.axiosInstance.get("/api/important-links/");
            const data = res.data.results || res.data;
            setLinks(Array.isArray(data) ? data : []);
        } catch (err) {
            setLinks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLinks(); }, []);

    // ইমেজ পাথ হ্যান্ডেল করার জন্য ফাংশন
    const getIconUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanDomain}${cleanPath}`;
    };

    const handleDelete = async (id) => {
        const result = await CM.Swal.fire({
            title: 'Are you sure?',
            text: "This link will be removed from the public section!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await CM.axiosInstance.delete(`/api/important-links/${id}/`);
                CM.Swal.fire('Deleted!', 'Link has been removed.', 'success');
                fetchLinks();
            } catch (err) {
                CM.Swal.fire('Error', 'Failed to delete link', 'error');
            }
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm border-0 p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark m-0">🔗 Important Links</h5>
                    <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate("/add-important-link")}>
                        + Add New Link
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light text-muted small">
                            <tr>
                                <th>Priority</th>
                                <th>Icon</th>
                                <th>Title</th>
                                <th>URL</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map((link) => (
                                <tr key={link.id}>
                                    <td className="fw-bold text-primary">#{link.priority}</td>
                                    <td>
                                        <div style={{ width: "35px", height: "35px" }} className="d-flex align-items-center justify-content-center">
                                            {/* PNG থাকলে PNG দেখাবে, না থাকলে SVG, আর কিছুই না থাকলে ডিফল্ট আইকন */}
                                            {link.icon ? (
                                                <img 
                                                    src={getIconUrl(link.icon)} 
                                                    alt={link.title} 
                                                    className="rounded shadow-sm"
                                                    style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                                                />
                                            ) : link.svg_icon ? (
                                                <div 
                                                    style={{ width: "25px", height: "25px", color: "#198754" }}
                                                    dangerouslySetInnerHTML={{ __html: link.svg_icon }} 
                                                />
                                            ) : (
                                                <span className="text-muted" style={{ fontSize: "20px" }}>🔗</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="fw-bold text-dark">{link.title}</td>
                                    <td className="small text-muted">
                                        <a href={link.url} target="_blank" rel="noreferrer" className="text-decoration-none text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                                            {link.url}
                                        </a>
                                    </td>
                                    <td>
                                        <span className={`badge ${link.is_active ? 'bg-success' : 'bg-danger'} rounded-pill px-3`}>
                                            {link.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group shadow-sm rounded-3 overflow-hidden">
                                            <button className="btn btn-sm btn-white border-end" onClick={() => navigate("/edit-important-link", { state: { linkData: link } })}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button className="btn btn-sm btn-white text-danger" onClick={() => handleDelete(link.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ImportantLinkList;