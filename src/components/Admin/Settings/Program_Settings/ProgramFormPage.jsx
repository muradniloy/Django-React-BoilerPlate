import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const ProgramFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Program_Name: '',
        Program_Code: '',
        active: true
    });

    useEffect(() => {
        if (id) {
            // Fetching existing data for edit mode
            axiosInstance.get(`${domain}/api/programs/${id}/`)
                .then(res => setFormData(res.data))
                .catch(err => {
                    console.error(err);
                    Swal.fire('Error!', 'Failed to fetch program data.', 'error');
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                // Update existing record
                await axiosInstance.put(`${domain}/api/programs/${id}/`, formData);
            } else {
                // Create new record
                await axiosInstance.post(`${domain}/api/programs/`, formData);
            }
            
            // [Saved Instruction] Triggering English Sweet Alert
            Swal.fire({ 
                title: 'Success!', 
                text: 'Program details have been saved successfully.', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });
            navigate('/programs'); // Ensure this matches your route path
        } catch (err) {
            console.error("Submit Error:", err.response?.data);
            // Better error reporting for Unique constraints
            const errorMsg = err.response?.data?.Program_Code || 
                           err.response?.data?.Program_Name || 
                           "Failed to save. Ensure Code and Name are unique.";
            
            Swal.fire('Error!', errorMsg.toString(), 'error');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-0 col-md-6 mx-auto rounded-3">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                    {id ? 'Edit Program' : 'Add New Program'}
                </div>
                <form className="card-body p-4" onSubmit={handleSubmit}>
                    <div className="row g-3">
                        {/* Program Name Input */}
                        <div className="col-12">
                            <label className="form-label small fw-bold">Program Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.Program_Name || ''} 
                                required
                                onChange={(e) => setFormData({...formData, Program_Name: e.target.value})} 
                                placeholder="e.g. B.Sc. in CSE"
                            />
                        </div>

                        {/* Program Code Input */}
                        <div className="col-md-12">
                            <label className="form-label small fw-bold">Program Code</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.Program_Code || ''} 
                                required
                                onChange={(e) => setFormData({...formData, Program_Code: e.target.value})} 
                                placeholder="e.g. CSE-101"
                            />
                        </div>

                        {/* Active Status Switch */}
                        <div className="col-12">
                            <div className="form-check form-switch mt-2">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    role="switch"
                                    id="activeSwitch"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                />
                                <label className="form-check-label small fw-bold" htmlFor="activeSwitch">
                                    Is Active?
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-light border px-4" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-dark px-5">
                            {id ? 'Update Program' : 'Save Program'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProgramFormPage;