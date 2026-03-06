import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../../state/axiosInstance'; 
import { domain } from "../../../../env";
import Swal from 'sweetalert2';
import Select from 'react-select';

const FeeRateFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [allHeads, setAllHeads] = useState([]); 
    const [filteredHeads, setFilteredHeads] = useState([]); 
    const [existingFeeRates, setExistingFeeRates] = useState([]); // বিদ্যমান ফি-রেটগুলো রাখার জন্য
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        payment_category: '', 
        payment_head: '',
        amount: '',
        opening_date: ''
    });

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            // ১. ক্যাটাগরি, পেমেন্ট হেড এবং অলরেডি সেভ করা ফি-রেটগুলো নিয়ে আসা
            const [catRes, headRes, existingRes] = await Promise.all([
                axiosInstance.get(`${domain}/api/main-heads/?page_size=1000`),
                axiosInstance.get(`${domain}/api/payment-heads/?page_size=1000`),
                axiosInstance.get(`${domain}/api/fee-rates/?page_size=1000`) // ডুপ্লিকেট চেক করতে সব ফি-রেট
            ]);

            const categoryList = catRes.data.results || catRes.data;
            const headList = headRes.data.results || headRes.data;
            const feeRateList = existingRes.data.results || existingRes.data;

            setCategories(categoryList.map(c => ({ value: String(c.id), label: c.main_head_name })));
            setAllHeads(headList);
            setExistingFeeRates(feeRateList);

            // ২. Edit Mode
            if (id) {
                const editRes = await axiosInstance.get(`${domain}/api/fee-rates/${id}/`);
                const feeRate = editRes.data;

                const associatedHead = headList.find(h => String(h.id) === String(feeRate.payment_head));
                let catId = associatedHead ? (associatedHead.payment_category?.id || associatedHead.payment_category) : '';

                setFormData({
                    payment_category: catId ? String(catId) : '', 
                    payment_head: String(feeRate.payment_head),
                    amount: feeRate.amount,
                    opening_date: feeRate.opening_date
                });

                if (catId) {
                    const filtered = headList.filter(h => {
                        const hCatId = h.payment_category?.id || h.payment_category;
                        return String(hCatId) === String(catId);
                    });
                    setFilteredHeads(filtered.map(h => ({ value: String(h.id), label: `${h.head_name} (${h.head_code})` })));
                }
            }
        } catch (err) {
            console.error("❌ Data Fetching Error:", err);
            Swal.fire({ title: 'Error!', text: 'Could not load data from server.', icon: 'error' });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleCategoryChange = (selectedOption) => {
        const catId = selectedOption ? selectedOption.value : '';
        setFormData(prev => ({ ...prev, payment_category: catId, payment_head: '' }));
        
        if (catId) {
            const filtered = allHeads.filter(h => {
                const headCatId = h.payment_category?.id || h.payment_category;
                return String(headCatId) === catId;
            });
            setFilteredHeads(filtered.map(h => ({ value: String(h.id), label: `${h.head_name} (${h.head_code})` })));
        } else {
            setFilteredHeads([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Duplication Check Logic ---
        // যদি নতুন ডাটা হয় (id নেই), তবে চেক করবো ওই পেমেন্ট হেড অলরেডি লিস্টে আছে কি না
        if (!id) {
            const isDuplicate = existingFeeRates.some(rate => 
                String(rate.payment_head) === String(formData.payment_head)
            );

            if (isDuplicate) {
                return Swal.fire({
                    title: 'Duplicate Entry!',
                    text: 'A fee rate already exists for this payment head.',
                    icon: 'warning',
                    confirmButtonColor: '#d33'
                });
            }
        }

        try {
            const { payment_category, ...payload } = formData; 
            if (id) {
                await axiosInstance.put(`${domain}/api/fee-rates/${id}/`, payload);
                Swal.fire({ title: 'Success!', text: 'Information updated successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
            } else {
                await axiosInstance.post(`${domain}/api/fee-rates/`, payload);
                Swal.fire({ title: 'Success!', text: 'Information saved successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
            navigate('/fee-rate/list');
        } catch (err) {
            Swal.fire('Error!', 'Check fields and try again.', 'error');
        }
    };

    if (loading) return <div className="text-center p-5"><h4>Loading...</h4></div>;

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 col-md-6 mx-auto rounded-3">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                    {id ? 'Update Fee Rate' : 'Setup New Fee Rate'}
                </div>
                <form className="card-body p-4" onSubmit={handleSubmit}>
                    
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Main Category</label>
                        <Select
                            options={categories}
                            placeholder="-- Search Category --"
                            value={categories.find(c => c.value === formData.payment_category)}
                            onChange={handleCategoryChange}
                            isClearable
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Payment Head</label>
                        <Select
                            options={filteredHeads}
                            placeholder="-- Search Payment Head --"
                            value={filteredHeads.find(h => h.value === formData.payment_head)}
                            onChange={(opt) => setFormData({...formData, payment_head: opt ? opt.value : ''})}
                            isDisabled={!formData.payment_category}
                            isClearable
                        />
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Amount</label>
                            <input type="number" step="0.01" className="form-control" value={formData.amount} required
                                   onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Date</label>
                            <input type="date" className="form-control" value={formData.opening_date || ''}
                                   onChange={(e) => setFormData({...formData, opening_date: e.target.value})} />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>Back</button>
                        <button type="submit" className="btn btn-primary px-5">Save Information</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeeRateFormPage;