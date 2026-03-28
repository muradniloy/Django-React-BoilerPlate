import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';
import Select from 'react-select';

const AccountForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [loading, setLoading] = useState(false);

    // Initial state with all model fields
    const [formData, setFormData] = useState({
        account_name: '',
        account_type: 'cash', 
        bank_name: '',
        account_number: '',
        branch: '',
        opening_balance: 0,
        current_balance: 0,
        is_active: true
    });

    const accountTypeOptions = [
        { value: 'cash', label: 'Cash In Hand' },
        { value: 'bank', label: 'Bank Account' }
    ];

    useEffect(() => {
        if (id) {
            axiosInstance.get(`${domain}/api/accounts/${id}/`)
                .then(res => setFormData(res.data))
                .catch(() => Swal.fire("Error", "Failed to load account details", "error"));
        }
    }, [id]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ১. ডাটাগুলোকে নাম্বারে কনভার্ট করে নেওয়া (যাতে ০ না যায়)
    const openingBal = parseFloat(formData.opening_balance) || 0;
    
    // ২. নতুন অ্যাকাউন্ট হলে current_balance হবে opening_balance এর সমান
    // আর এডিট হলে যেটা আছে সেটাই থাকবে
    const payload = { 
        ...formData, 
        opening_balance: openingBal,
        current_balance: id ? parseFloat(formData.current_balance) : openingBal 
    };

    try {
        if (id) {
            await axiosInstance.put(`${domain}/api/accounts/${id}/`, payload);
            Swal.fire("Success", "Account updated successfully", "success");
        } else {
            await axiosInstance.post(`${domain}/api/accounts/`, payload);
            Swal.fire("Success", "Account created with balance: " + openingBal, "success");
        }
        navigate('/Account/list'); 
    } catch (err) {
        console.error(err.response?.data); // এরর ডিবাগ করার জন্য
        Swal.fire("Error", "Failed to save data. Check all fields.", "error");
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="container mt-4">
            <div className="card shadow border-0">
                <div className="card-header bg-primary text-white py-3">
                    <h5 className="mb-0 text-uppercase">{id ? 'Edit Account' : 'Add New Account'}</h5>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            {/* Account Name */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">ACCOUNT NAME *</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    value={formData.account_name} 
                                    onChange={(e) => setFormData({...formData, account_name: e.target.value})} 
                                    placeholder="Enter account name" 
                                />
                            </div>

                            {/* Account Type */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">ACCOUNT TYPE</label>
                                <Select 
                                    options={accountTypeOptions} 
                                    value={accountTypeOptions.find(o => o.value === formData.account_type)} 
                                    onChange={(val) => setFormData({...formData, account_type: val.value})} 
                                />
                            </div>

                            {/* Bank Name */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">BANK NAME</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.bank_name} 
                                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})} 
                                    placeholder="e.g. Dutch Bangla Bank" 
                                />
                            </div>

                            {/* Account Number */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">ACCOUNT NUMBER</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.account_number} 
                                    onChange={(e) => setFormData({...formData, account_number: e.target.value})} 
                                    placeholder="e.g. 123.456.789" 
                                />
                            </div>

                            {/* Branch */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">BRANCH</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={formData.branch} 
                                    onChange={(e) => setFormData({...formData, branch: e.target.value})} 
                                    placeholder="e.g. Dhaka Main Branch" 
                                />
                            </div>

                            {/* Opening Balance */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">OPENING BALANCE</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={formData.opening_balance} 
                                    onChange={(e) => setFormData({...formData, opening_balance: e.target.value})} 
                                    disabled={id} 
                                />
                            </div>

                            {/* Current Balance */}
                            <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted text-primary">CURRENT BALANCE</label>
                                <input 
                                    type="number" 
                                    className="form-control bg-light fw-bold" 
                                    value={id ? formData.current_balance : formData.opening_balance} 
                                    readOnly 
                                />
                            </div>

                            {/* Active Status */}
                            <div className="col-md-4 d-flex align-items-center mt-5">
                                <div className="form-check form-switch">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        checked={formData.is_active} 
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                                    />
                                    <label className="form-check-label fw-bold ms-2 small text-muted">ACCOUNT ACTIVE STATUS</label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-top d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-outline-secondary px-4 shadow-sm" onClick={() => navigate(-1)}>CANCEL</button>
                            <button type="submit" className="btn btn-primary px-5 shadow-sm fw-bold" disabled={loading}>
                                {loading ? 'SAVING...' : 'SAVE ACCOUNT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountForm;