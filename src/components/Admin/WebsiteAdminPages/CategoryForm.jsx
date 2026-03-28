import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter";

const CategoryForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const editId = location.state?.id;
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editId) {
            CM.axiosInstance.get(`/api/notice-categories/${editId}/`)
                .then(res => setName(res.data.name))
                .catch(() => CM.Swal.fire('Error', 'Failed to load category', 'error'));
        }
    }, [editId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editId) {
                await CM.axiosInstance.put(`/api/notice-categories/${editId}/`, { name });
            } else {
                await CM.axiosInstance.post("/api/notice-categories/", { name });
            }
            CM.Swal.fire({ icon: 'success', title: 'Category Saved!', timer: 1500, showConfirmButton: false });
            navigate(-1);
        } catch (err) {
            CM.Swal.fire('Error', 'Something went wrong!', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg border-0 p-4 rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
                <h5 className="fw-bold mb-4 text-success">{editId ? "✏️ Edit Category" : "🚀 Add New Category"}</h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label small fw-bold">Category Name</label>
                        <input className="form-control form-control-lg border-2 shadow-sm" placeholder="Enter category name (e.g. Exam)" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-light w-100 rounded-pill fw-bold" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn btn-success w-100 rounded-pill fw-bold" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CategoryForm;