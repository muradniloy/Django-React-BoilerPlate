import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const BoardListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${domain}/api/boards/`);
            setData(res.data || []);
        } catch (err) {
            Swal.fire('Error!', 'Failed to load boards.', 'error');
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
            text: "This board will be deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/boards/${id}/`);
                    Swal.fire({ title: 'Deleted!', text: 'Deleted successfully.', icon: 'success', timer: 1200, showConfirmButton: false });
                    fetchData();
                } catch (err) {
                    Swal.fire('Error!', 'Could not delete.', 'error');
                }
            }
        });
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Education Board List</h5>
                <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => navigate('/boards/add')}>
                    <i className="bi bi-plus-lg me-1"></i> Add Board
                </button>
            </div>
            <div className="card shadow-sm border-0 rounded-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th style={{width: '80px'}}>ID</th>
                                <th>Board Name</th>
                                <th className="text-center" style={{width: '150px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="3" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr> : 
                             data.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td className="fw-bold">{item.Board_Name}</td>
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => navigate(`/boards/edit/${item.id}`)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
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

export default BoardListPage;