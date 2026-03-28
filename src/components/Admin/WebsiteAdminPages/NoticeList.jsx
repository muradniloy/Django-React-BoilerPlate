import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter";
import { domain } from "../../../env";

const NoticeList = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanDomain}${cleanPath}`;
    };

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await CM.axiosInstance.get("/api/notices/");
            const data = res.data.results || res.data;
            setNotices(Array.isArray(data) ? data : []);
        } catch (err) {
            setNotices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    // ✅ ডিলিট ফাংশন
    const handleDelete = async (id) => {
        const result = await CM.Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this notice!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await CM.axiosInstance.delete(`/api/notices/${id}/`);
                CM.Swal.fire('Deleted!', 'Notice has been removed.', 'success');
                fetchNotices(); // লিস্ট রিফ্রেশ
            } catch (err) {
                CM.Swal.fire('Error', 'Failed to delete notice', 'error');
            }
        }
    };
    const truncateTitle = (str, n) => {
    return str?.split(" ").slice(0, n).join(" ") + (str?.split(" ").length > n ? "..." : "");
};

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm border-0 p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark m-0">📢 Official Notices</h5>
                    <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate("/add-notice")}>
                        + Add New Notice
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light text-muted small uppercase">
                            <tr>
                                <th>Publish Date</th>
                                <th>Notice Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>File</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    {notices.map((n) => (
        <tr key={n.id}>
            <td className="small text-muted fw-medium">
                {n.published_date?.split('T')[0]}
            </td>
            <td>
                <div className="d-flex align-items-center gap-2">
                    <div className="fw-bold text-dark text-capitalize">
                        {truncateTitle(n.title, 10)} 
                    </div>
                    {n.important && (
                        <span className="badge rounded-pill bg-warning text-dark small shadow-sm" style={{fontSize: '10px'}}>
                            ⭐ Important
                        </span>
                    )}
                </div>
                {n.expiry_date && (
                    <div className="text-danger opacity-75" style={{fontSize: '11px'}}>
                        <i className="bi bi-clock-history me-1"></i>Exp: {n.expiry_date}
                    </div>
                )}
            </td>
            <td>
                <span className="badge bg-success bg-opacity-10 text-white border border-info border-opacity-25 rounded-pill px-3 fw-semibold" style={{fontSize: '12px'}}>
                    {n.category_name}
                </span>
            </td>
            <td>
                <span className={`badge ${n.is_active ? 'bg-success' : 'bg-danger'} rounded-circle p-1 me-1`}></span>
                <span className={`${n.is_active ? 'text-success' : 'text-danger'} small fw-bold uppercase`}>
                    {n.is_active ? "Active" : "Inactive"}
                </span>
            </td>
            <td>
                {n.attachment ? (
                    <button className="btn btn-sm btn-light border shadow-sm rounded-pill px-3 fw-bold text-primary" 
                        onClick={() => {
                            setSelectedFile(getFullUrl(n.attachment));
                            setShowModal(true);
                        }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        View
                    </button>
                ) : <span className="text-muted small italic">None</span>}
            </td>
            <td className="text-center">
                <div className="btn-group shadow-sm rounded-3 overflow-hidden">
                    <button className="btn btn-sm btn-white border-end" title="Edit" onClick={() => navigate("/edit-notice", { state: { id: n.id } })}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button className="btn btn-sm btn-white text-danger" title="Delete" onClick={() => handleDelete(n.id)}>
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

            {/* --- Modal Window (Consistent Style) --- */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered shadow-lg">
                        <div className="modal-content border-0 rounded-4 overflow-hidden">
                            <div className="modal-header py-2 bg-light">
                                <h6 className="modal-title fw-bold text-primary m-0">Document Preview</h6>
                                <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-0 bg-secondary bg-opacity-10 d-flex justify-content-center align-items-center" style={{ minHeight: '550px' }}>
                                {selectedFile?.toLowerCase().endsWith('.pdf') ? (
                                    <object data={`${selectedFile}#toolbar=0`} type="application/pdf" width="100%" height="600px">
                                        <div className="text-center p-5"><a href={selectedFile} target="_blank" rel="noreferrer" className="btn btn-primary">Download PDF</a></div>
                                    </object>
                                ) : (
                                    <div className="p-3"><img src={selectedFile} alt="Preview" className="img-fluid rounded" style={{ maxHeight: '75vh' }} /></div>
                                )}
                            </div>
                            <div className="modal-footer py-2">
                                <a href={selectedFile} download className="btn btn-sm btn-success px-4 rounded-pill fw-bold">Download</a>
                                <button className="btn btn-sm btn-secondary px-4 rounded-pill fw-bold" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeList;