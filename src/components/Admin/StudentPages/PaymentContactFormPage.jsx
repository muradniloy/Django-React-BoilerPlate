import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AsyncSelect from "react-select/async"; 
import { domain } from "../../../env";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; 

const PaymentContactFormPage = ({ studentId: propId }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const studentId = useStudent(propId || paramId);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [contactList, setContactList] = useState([]);
    const [contactDate, setContactDate] = useState(new Date().toISOString().split('T')[0]);
    const [studentInfo, setStudentInfo] = useState(null);

    const getDefaultRow = () => ({
        fees: "", paymentType: "1", discount_type: "1", 
        discount_value: 0, amount: 0, baseAmount: 0, 
        quantity: 1, feeLabel: ""
    });

    useEffect(() => {
        if (!studentId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const studentRes = await CM.axiosInstance.get(`/api/student/${studentId}/`);
                setStudentInfo({
                    name: `${studentRes.data.first_name} ${studentRes.data.last_name}`,
                    photo: studentRes.data.photo,
                    reg_no: studentRes.data.student_reg_no || studentId,
                    program: studentRes.data.program_name || "N/A"
                });

                const res = await CM.axiosInstance.get(`${domain}/api/payment-contacts/by-student/${studentId}/`);
                
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setContactDate(res.data[0].contact_date || new Date().toISOString().split('T')[0]);
                    const formatted = res.data.map(item => ({
                        id: item.id,
                        fees: String(item.fees),
                        feeLabel: item.fee_head_name || "Selected Fee",
                        paymentType: item.paymentType || "1",
                        discount_type: item.discount_type || "1",
                        discount_value: item.discount_value || 0,
                        amount: item.amount || 0,
                        baseAmount: item.original_amount || 0,
                        quantity: item.quantity || 1
                    }));
                    setContactList(formatted);
                } else {
                    setContactList([getDefaultRow()]);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setContactList([getDefaultRow()]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    const handleRowChange = (index, field, value, opt = null) => {
        const list = [...contactList];
        const row = { ...list[index] };
        
        if (field === 'fees' && opt) {
            row.fees = opt.value; 
            row.feeLabel = opt.label; 
            row.baseAmount = parseFloat(opt.amount);
        } else { 
            row[field] = value; 
        }
        
        let up = parseFloat(row.baseAmount || 0), q = parseInt(row.quantity || 1), tb = up * q, dv = parseFloat(row.discount_value || 0);
        let final = row.discount_type === "1" ? tb - dv : tb - (tb * dv / 100);
        row.amount = final > 0 ? Math.round(final) : 0;
        
        list[index] = row;
        setContactList(list);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                student_id: studentId,
                contacts: contactList.map(item => ({ 
                    ...item, 
                    student: studentId, 
                    contact_date: contactDate, 
                    original_amount: item.baseAmount, 
                    quantity: item.quantity 
                }))
            };
            await CM.axiosInstance.post(`${domain}/api/payment-contacts/bulk_save/`, payload);
            CM.Swal.fire({ icon: 'success', title: 'Saved!', text: 'Payment settings updated.', timer: 1500, showConfirmButton: false });
            setTimeout(() => navigate(-1), 1500);
        } catch (err) { 
            CM.Swal.fire("Error", "Save failed", "error"); 
        } finally { 
            setIsSaving(false); 
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    const selectStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        control: (base) => ({ ...base, minHeight: '38px', borderRadius: '6px', fontSize: '13px' }),
        menu: (base) => ({ ...base, zIndex: 9999 })
    };

    return (
        <div className="container mt-3 mb-5 px-4">
            <div className="row align-items-center mb-3 p-3 bg-white shadow-sm rounded-4 border mx-0 border-start border-4 border-dark">
                <div className="col-auto">
                    <img 
                        src={studentInfo?.photo ? (studentInfo.photo.startsWith('http') ? studentInfo.photo : `${domain}${studentInfo.photo}`) : "/default.png"} 
                        alt="Profile" 
                        className="rounded-3 shadow-sm border p-1" 
                        style={{ width: "70px", height: "70px", objectFit: "cover" }} 
                        onError={(e) => e.target.src = "/default.png"}
                    />
                </div>
                <div className="col">
                    <h5 className="mb-0 fw-bold text-dark">{studentInfo?.name || "Student Profile"}</h5>
                    <div className="d-flex gap-3 mt-1">
                        <small className="text-muted"><i className="fa fa-id-card me-1"></i> ID: {studentInfo?.reg_no}</small>
                        <small className="text-muted"><i className="fa fa-graduation-cap me-1"></i> {studentInfo?.program}</small>
                    </div>
                </div>
                <div className="col-auto">
                    <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-4 fw-bold" onClick={() => navigate(-1)}>
                        <i className="fa fa-times me-1"></i> Cancel
                    </button>
                </div>
            </div>

            <div className="card shadow border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-dark py-2 d-flex justify-content-between align-items-center text-white">
                    <span className="fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Update Payment Contacts</span>
                    <div className="d-flex align-items-center bg-secondary bg-opacity-25 rounded px-2">
                        <label className="small me-2 mb-0 text-white-50" style={{fontSize: '10px'}}>CONTACT DATE:</label>
                        <input type="date" className="form-control form-control-sm border-0 bg-transparent text-white fw-bold p-0" style={{width: '120px', fontSize: '12px'}} value={contactDate} onChange={(e) => setContactDate(e.target.value)} />
                    </div>
                </div>

                <div className="card-body p-3 bg-light">
                    <form onSubmit={handleSubmit}>
                        {contactList.map((row, index) => (
                            <div key={index} className="mb-2 border rounded-3 bg-white shadow-sm overflow-hidden">
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-11 p-3">
                                        <div className="row g-2">
                                            {/* সরাসরি ফি হেড ড্রপডাউন */}
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{fontSize: '11px'}}>FEE HEAD</label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions
                                                    menuPortalTarget={document.body} 
                                                    menuPlacement="auto"
                                                    styles={selectStyles}
                                                    loadOptions={async (v) => {
                                                        try {
                                                            const res = await CM.axiosInstance.get(`${domain}/api/fee-rates/?search=${v}`);
                                                            return res.data.results.map(f => ({ 
                                                                value: String(f.id), 
                                                                label: f.payment_head_name || f.payment_head?.head_name || f.head_name, 
                                                                amount: f.amount 
                                                            }));
                                                        } catch (err) { return []; }
                                                    }}
                                                    value={row.fees ? { value: row.fees, label: row.feeLabel } : null}
                                                    onChange={(opt) => handleRowChange(index, 'fees', null, opt)}
                                                    placeholder="Search Fee Head..."
                                                />
                                            </div>

                                            <div className="col-md-1">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{fontSize: '11px'}}>QTY</label>
                                                <input type="number" className="form-control fw-bold" min="1" value={row.quantity} onChange={(e) => handleRowChange(index, 'quantity', e.target.value)} />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{fontSize: '11px'}}>CYCLE</label>
                                                <select className="form-select" style={{fontSize: '12px'}} value={row.paymentType} onChange={(e) => handleRowChange(index, 'paymentType', e.target.value)}>
                                                    <option value="1">Single</option><option value="2">Monthly</option><option value="4">Yearly</option><option value="7">Anytime</option>
                                                </select>
                                            </div>
                                            <div className="col-md-1">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{fontSize: '11px'}}>DISC. T</label>
                                                <select className="form-select" style={{fontSize: '12px'}} value={row.discount_type} onChange={(e) => handleRowChange(index, 'discount_type', e.target.value)}>
                                                    <option value="1">TK</option><option value="2">%</option>
                                                </select>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{fontSize: '11px'}}>VALUE</label>
                                                <input type="number" className="form-control" value={row.discount_value} onChange={(e) => handleRowChange(index, 'discount_value', e.target.value)} />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{fontSize: '11px'}}>FINAL TOTAL</label>
                                                <input type="text" className="form-control bg-light fw-bold text-primary" value={row.amount} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-1 border-start">
                                        <button type="button" className="btn btn-white text-danger w-100 h-100 border-0 rounded-0 py-4 fw-bold shadow-none" 
                                            style={{fontSize: '10px', backgroundColor: '#fff5f5'}}
                                            onClick={() => { if (contactList.length > 1) setContactList(contactList.filter((_, i) => i !== index)) }}>
                                            <i className="fa fa-trash-alt d-block mb-1"></i> REMOVE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between mt-3">
                            <button type="button" className="btn btn-outline-dark btn-sm fw-bold px-3 rounded-pill" onClick={() => setContactList([...contactList, getDefaultRow()])}>
                                <i className="fa fa-plus me-1"></i> Add Fee Head
                            </button>
                            <button type="submit" className="btn btn-success btn-sm px-5 fw-bold shadow-sm rounded-pill" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save All Contacts"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentContactFormPage;