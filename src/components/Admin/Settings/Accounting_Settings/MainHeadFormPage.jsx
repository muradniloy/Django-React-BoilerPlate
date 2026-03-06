import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance';
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const MainHeadFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ main_head_code: '', main_head_name: '' });

    useEffect(() => {
        if (id) {
            axiosInstance.get(`${domain}/api/main-heads/${id}/`)
                .then(res => setFormData(res.data))
                .catch(err => {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to fetch data.',
                        icon: 'error'
                    });
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await axiosInstance.put(`${domain}/api/main-heads/${id}/`, formData);
            } else {
                await axiosInstance.post(`${domain}/api/main-heads/`, formData);
            }

            // SweetAlert for success (English only)
            Swal.fire({ 
                title: 'Success!', 
                text: id ? 'Data updated successfully.' : 'Data saved successfully.', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });

            navigate('/main-head/list');
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: 'Check if the Code or Name already exists.',
                icon: 'error'
            });
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 col-md-6 mx-auto">
                <div className="card-header bg-primary text-white">
                    {id ? 'Edit' : 'Add'} Main Head
                </div>
                <form className="card-body" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Main Head Code</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={formData.main_head_code} 
                            required
                            onChange={(e) => setFormData({...formData, main_head_code: e.target.value})} 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Main Head Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            /* Fixed the function call error here */
                            value={formData.main_head_name} 
                            required
                            onChange={(e) => setFormData({...formData, main_head_name: e.target.value})} 
                        />
                    </div>
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Back
                        </button>
                        <button type="submit" className="btn btn-success px-4">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MainHeadFormPage;