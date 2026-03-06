import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const MainHeadListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const fetchData = useCallback(async (page) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${domain}/api/main-heads/?page=${page}&search=${searchTerm}`);
            setData(res.data.results || []);
            setCount(res.data.count || 0);
        } catch (err) {
            Swal.fire('Error!', 'Data fetch failed.', 'error');
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
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`${domain}/api/main-heads/${id}/`);
                    Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                    fetchData(currentPage);
                } catch (err) {
                    Swal.fire('Error!', 'Delete failed.', 'error');
                }
            }
        });
    };

    return (
        <div className="p-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Main Head List</h5>
                <div>
                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3 me-2" onClick={() => navigate('/Accouting/Settings')}>
                        <i className="bi bi-gear me-1"></i> Back
                    </button>
                    <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => navigate('/main-head/add')}>
                        <i className="bi bi-plus-lg me-1"></i> Add New
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="p-3">
                    <input type="text" className="form-control form-control-sm w-25" placeholder="Search..." 
                           onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Code</th>
                                <th>Main Head Name</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr> : 
                             data.map(item => (
                                <tr key={item.id}>
                                    <td>{item.main_head_code}</td>
                                    <td>{item.main_head_name}</td>
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-info text-white me-2" onClick={() => navigate(`/main-head/edit/${item.id}`)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="card-footer bg-white d-flex justify-content-between">
                    <small>Total: {count}</small>
                    <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                        <button className="btn btn-primary">{currentPage}</button>
                        <button className="btn btn-outline-secondary" disabled={data.length < 10} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainHeadListPage;