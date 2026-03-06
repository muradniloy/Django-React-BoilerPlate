import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const SessionFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Session_Name: '',
        Session_Code: '',
        active: true
    });

    useEffect(() => {
        if (id) {
            // Fetch session data for editing
            axiosInstance.get(`${domain}/api/sessions/${id}/`)
                .then(res => setFormData(res.data))
                .catch(err => {
                    console.error(err);
                    Swal.fire('Error!', 'Failed to fetch session details.', 'error');
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                // Update existing session
                await axiosInstance.put(`${domain}/api/sessions/${id}/`, formData);
            } else {
                // Create new session
                await axiosInstance.post(`${domain}/api/sessions/`, formData);
            }
            
            // Success alert as per instructions
            Swal.fire({ 
                title: 'Success!', 
                text: 'Session data has been saved successfully.', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });
            navigate('/sessions'); 
        } catch (err) {
            console.error("Submit Error:", err.response?.data);
            const errorDetail = err.response?.data?.Session_Code || 
                              err.response?.data?.Session_Name || 
                              "Please ensure session code and name are unique.";
            
            Swal.fire('Error!', errorDetail.toString(), 'error');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-0 col-md-6 mx-auto rounded-3">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                    {id ? 'Edit Academic Session' : 'Add New Academic Session'}
                </div>
                <form className="card-body p-4" onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label small fw-bold">Session Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.Session_Name || ''} 
                                required
                                onChange={(e) => setFormData({...formData, Session_Name: e.target.value})} 
                                placeholder="e.g. 2023-2024"
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label small fw-bold">Session Code</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.Session_Code || ''} 
                                required
                                onChange={(e) => setFormData({...formData, Session_Code: e.target.value})} 
                                placeholder="e.g. SESS-2324"
                            />
                        </div>

                        <div className="col-12">
                            <div className="form-check form-switch mt-2">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    role="switch"
                                    id="activeStatus"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                />
                                <label className="form-check-label small fw-bold" htmlFor="activeStatus">
                                    Is Session Active?
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-light border px-4" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-dark px-5">
                            {id ? 'Update Session' : 'Save Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionFormPage;