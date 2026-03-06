import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const ReligionListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // আপনার দেওয়া পাথ অনুযায়ী রিকোয়েস্ট
            const res = await axiosInstance.get(`${domain}/api/religion/`);
            // যেহেতু APIView সরাসরি লিস্ট রিটার্ন করে, তাই res.data ব্যবহার করা হয়েছে
            setData(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (err) {
            console.error(err);
            Swal.fire('Error!', 'Failed to load religion data.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This record will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // APIView-তে ডিলিট হ্যান্ডলার থাকলে এটি কাজ করবে
                    await axiosInstance.delete(`${domain}/api/religion/${id}/`);
                    Swal.fire({ title: 'Deleted!', text: 'Successfully deleted.', icon: 'success', timer: 1200, showConfirmButton: false });
                    fetchData();
                } catch (err) {
                    Swal.fire('Error!', 'Could not delete the record.', 'error');
                }
            }
        }); 
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Religion Setup</h5>
                <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => navigate('/religions/add')}>
                    <i className="bi bi-plus-lg me-1"></i> Add New Religion
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th style={{width: '100px'}}>SL</th>
                                <th>Religion Name</th>
                                <th className="text-center" style={{width: '150px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={item.id} style={{fontSize: '14px'}}>
                                        <td>{index + 1}</td>
                                        <td className="fw-bold">{item.name}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white me-2" onClick={() => navigate(`/religions/edit/${item.id}`)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="text-center py-4">No data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReligionListPage;