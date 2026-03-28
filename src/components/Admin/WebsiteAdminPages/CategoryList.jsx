import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter";

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const res = await CM.axiosInstance.get("/api/notice-categories/");
            const data = res.data.results || res.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch Error:", err);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleDelete = async (id) => {
        const result = await CM.Swal.fire({
            title: 'Are you sure?',
            text: "All notices under this category will be affected!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            await CM.axiosInstance.delete(`/api/notice-categories/${id}/`);
            fetchCategories();
            CM.Swal.fire('Deleted!', 'Category has been removed.', 'success');
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm border-0 p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark">📁 Notice Categories</h5>
                    <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={() => navigate("/add-category")}>
                        + Add New Category
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Category Name</th>
                                <th>Slug</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? categories.map(c => (
                                <tr key={c.id}>
                                    <td className="fw-bold">{c.name}</td>
                                    <td className="text-muted">{c.slug}</td>
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3" onClick={() => navigate("/edit-category", { state: { id: c.id } })}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(c.id)}>Delete</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="3" className="text-center py-4 text-muted">No categories found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default CategoryList;