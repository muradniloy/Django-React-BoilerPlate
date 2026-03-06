import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const BoardFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ Board_Name: '' });

    useEffect(() => {
        if (id) {
            axiosInstance.get(`${domain}/api/boards/${id}/`)
                .then(res => setFormData({ Board_Name: res.data.Board_Name }))
                .catch(() => Swal.fire('Error!', 'Failed to fetch board data.', 'error'));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axiosInstance.put(`${domain}/api/boards/${id}/`, formData);
            } else {
                await axiosInstance.post(`${domain}/api/boards/`, formData);
            }
            Swal.fire({ title: 'Success!', text: 'Board saved successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
            navigate('/boards');
        } catch (err) {
            Swal.fire('Error!', 'Failed to save. Ensure the name is correct.', 'error');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-0 col-md-5 mx-auto rounded-3">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                    {id ? 'Edit Education Board' : 'Add New Board'}
                </div>
                <form className="card-body p-4" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Board Name</label>
                        <input 
                            type="text" className="form-control" 
                            value={formData.Board_Name || ''} required
                            placeholder="Enter board name (e.g. Dhaka)"
                            onChange={(e) => setFormData({ Board_Name: e.target.value })} 
                        />
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-light border px-4" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn btn-dark px-5">Save Board</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoardFormPage;