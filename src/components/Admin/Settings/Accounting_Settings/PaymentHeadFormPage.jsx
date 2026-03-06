import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';

const PaymentHeadFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mainHeads, setMainHeads] = useState([]);
    const [existingHeads, setExistingHeads] = useState([]); // ডুপ্লিকেট চেকের জন্য
    const [formData, setFormData] = useState({
        head_code: '',
        head_name: '',
        opening_date: '',
        payment_category: '',
        headType: '1'
    });

    useEffect(() => {
        // Main Heads এবং বিদ্যমান Payment Heads লোড করা
        const fetchData = async () => {
            try {
                const [mainRes, headRes] = await Promise.all([
                    axiosInstance.get(`${domain}/api/main-heads/?page_size=1000`),
                    axiosInstance.get(`${domain}/api/payment-heads/?page_size=1000`)
                ]);
                setMainHeads(mainRes.data.results || mainRes.data);
                setExistingHeads(headRes.data.results || headRes.data);
            } catch (err) {
                console.error("Error loading initial data", err);
            }
        };

        fetchData();
        
        if (id) {
            axiosInstance.get(`${domain}/api/payment-heads/${id}/`).then(res => setFormData(res.data));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Duplicate Check Logic ---
        const isDuplicateCode = existingHeads.some(h => 
            String(h.head_code).toLowerCase() === String(formData.head_code).toLowerCase() && String(h.id) !== String(id)
        );
        const isDuplicateName = existingHeads.some(h => 
            String(h.head_name).toLowerCase() === String(formData.head_name).toLowerCase() && String(h.id) !== String(id)
        );

        if (isDuplicateCode) {
            return Swal.fire({ title: 'Duplicate!', text: 'This Head Code already exists.', icon: 'error' });
        }
        if (isDuplicateName) {
            return Swal.fire({ title: 'Duplicate!', text: 'This Head Name already exists.', icon: 'error' });
        }
        // ----------------------------

        try {
            if (id) {
                await axiosInstance.put(`${domain}/api/payment-heads/${id}/`, formData);
            } else {
                await axiosInstance.post(`${domain}/api/payment-heads/`, formData);
            }
            
            Swal.fire({ 
                title: 'Success!', 
                text: 'Payment Head saved successfully.', 
                icon: 'success', 
                timer: 1500, 
                showConfirmButton: false 
            });
            navigate('/payment-head/list');
        } catch (err) {
            Swal.fire('Error!', 'Failed to save. Please ensure data is unique.', 'error');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-0 col-md-7 mx-auto rounded-3">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                    {id ? 'Edit Payment Head' : 'Add New Payment Head'}
                </div>
                <form className="card-body p-4" onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Category (Main Head)</label>
                            <select className="form-select" value={formData.payment_category} required
                                    onChange={(e) => setFormData({...formData, payment_category: e.target.value})}>
                                <option value="">Select Category</option>
                                {mainHeads.map(mh => <option key={mh.id} value={mh.id}>{mh.main_head_name} ({mh.main_head_code})</option>)}
                            </select>
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Opening Date</label>
                            <input type="date" className="form-control" value={formData.opening_date || ''}
                                   onChange={(e) => setFormData({...formData, opening_date: e.target.value})} />
                        </div>
                        <div className="col-12">
                            <label className="form-label small fw-bold">Head Name</label>
                            <input type="text" className="form-control" value={formData.head_name} required
                                   onChange={(e) => setFormData({...formData, head_name: e.target.value})} />
                        </div>
                         <div className="col-md-6">
                            <label className="form-label small fw-bold">Head Code</label>
                            <input type="text" className="form-control" value={formData.head_code} required
                                   onChange={(e) => setFormData({...formData, head_code: e.target.value})} />
                        </div>
                        
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Head Type</label>
                            <select className="form-select" value={formData.headType}
                                    onChange={(e) => setFormData({...formData, headType: e.target.value})}>
                                <option value="1">Income</option>
                                <option value="2">Expense</option>
                            </select>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-light border px-4" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn btn-dark px-5">Save Head</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentHeadFormPage;