import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const ProgramListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const fetchData = useCallback(async (page) => {
        setLoading(true);
        try {
            // API calling for program list
            const res = await axiosInstance.get(`${domain}/api/programs/?page=${page}&search=${searchTerm}`);
            setData(res.data.results || []);
            setCount(res.data.count || 0);
        } catch (err) {
            console.error(err);
            Swal.fire('Error!', 'Failed to load program data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This program will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/programs/${id}/`);
                    Swal.fire({ 
                        title: 'Deleted!', 
                        text: 'Program deleted successfully.', 
                        icon: 'success', 
                        timer: 1200, 
                        showConfirmButton: false 
                    });
                    fetchData(currentPage);
                } catch (err) {
                    Swal.fire('Error!', 'Could not delete the program.', 'error');
                }
            }
        });
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Program List</h5>
                <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => navigate('/programs/add')}>
                    <i className="bi bi-plus-lg me-1"></i> Add Program
                </button>
            </div>

            <div className="card shadow-sm border-0 rounded-3">
                <div className="p-3 border-bottom bg-white">
                    <input 
                        type="text" 
                        className="form-control form-control-sm w-25" 
                        placeholder="Search Program..." 
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                    />
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Code</th>
                                <th>Program Name</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : data.length > 0 ? (
                                data.map(item => (
                                    <tr key={item.id} style={{fontSize: '14px'}}>
                                        <td className="fw-bold">{item.Program_Code}</td>
                                        <td>{item.Program_Name}</td>
                                        <td>
                                            <span className={`badge ${item.active ? "bg-success" : "bg-danger"}`}>
                                                {item.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white me-2" onClick={() => navigate(`/programs/edit/${item.id}`)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-4">No data found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                    <small className="text-muted">Total Records: {count}</small>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                            </li>
                            <li className="page-item active"><span className="page-link">{currentPage}</span></li>
                            <li className={`page-item ${data.length < 10 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default ProgramListPage;