import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const ReligionFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: ''
    });

    useEffect(() => {
        if (id) {
            // Edit মোডে নির্দিষ্ট আইডি দিয়ে ডাটা আনা
            axiosInstance.get(`${domain}/api/religion/${id}/`)
                .then(res => {
                    // নিশ্চিত করা হচ্ছে যে state-এ সঠিক অবজেক্ট সেট হচ্ছে
                    setFormData({ name: res.data.name });
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire('Error!', 'Failed to fetch details.', 'error');
                });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                // Update: এখানে URL-এর শেষে আইডি এবং স্ল্যাশ নিশ্চিত করুন
                await axiosInstance.put(`${domain}/api/religion/${id}/`, formData);
            } else {
                // Create: নতুন ডাটা যোগ করা
                await axiosInstance.post(`${domain}/api/religion/`, formData);
            }
            
            // [Saved Instruction] English Sweet Alert used
            Swal.fire({ 
                title: 'Success!', 
                text: 'Religion information saved successfully.', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });
            navigate('/religions'); // আপনার লিস্ট পেজের সঠিক পাথ দিন
        } catch (err) {
            console.error("Submit Error:", err.response);
            
            // ৪০৫ এরর বা অন্য কোনো এরর মেসেজ হ্যান্ডলিং
            const errorMsg = err.response?.status === 405 
                ? "Method Not Allowed: Please check backend POST/PUT methods." 
                : "Failed to save data. Please try again.";

            Swal.fire('Error!', errorMsg, 'error');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-0 col-md-5 mx-auto rounded-3">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                    {id ? 'Edit Religion' : 'Add New Religion'}
                </div>
                <form className="card-body p-4" onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label small fw-bold">Religion Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={formData.name || ''} 
                                required
                                placeholder="Enter religion name"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-light border px-4" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-dark px-5">
                            {id ? 'Update Religion' : 'Save Religion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReligionFormPage;