import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { domain } from "../../../env";

const InstitutionSettings = () => {
    const [formData, setFormData] = useState({
        name: '', slogan: '', logo: null, address: '', email: '', 
        telephone: '', mobile: '', website: '', fb_link: '', 
        yt_link: '', linkedin_link: '', latitude: '', longitude: '',
        google_map_embed_url: '', eiin_number: '', established_year: '',
        is_active: true
    });
    
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchInstitutionData();
    }, []);

    const fetchInstitutionData = async () => {
        try {
            const res = await axios.get(`${domain}/api/institution/`);
            if (res.data) {
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                setFormData({ ...data });
                if (data.logo) {
                    const logoUrl = data.logo.startsWith('http') ? data.logo : `${domain}${data.logo}`;
                    setPreview(logoUrl);
                }
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setIsEditing(true); 
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            if (file) {
                setFormData({ ...formData, [name]: file });
                setPreview(URL.createObjectURL(file));
            }
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'logo') {
                if (formData[key] instanceof File) data.append(key, formData[key]);
            } else if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });

        try {
            await axios.post(`${domain}/api/institution/`, data);
            Swal.fire({ 
                icon: 'success', 
                title: 'Success!', 
                text: 'Institution settings updated successfully.', 
                timer: 1500, 
                showConfirmButton: false 
            });
            setIsEditing(false);
            fetchInstitutionData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update settings.' });
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-primary"><i className="fas fa-cog me-2"></i>Institution Settings</h5>
                    {!isEditing && (
                        <button className="btn btn-primary btn-sm px-4 rounded-pill" onClick={() => setIsEditing(true)}>
                            <i className="fas fa-edit me-2"></i>Edit Profile
                        </button>
                    )}
                </div>

                <div className="card-body p-4 p-lg-5">
                    {isEditing ? (
                        /* --- FULL EDIT FORM --- */
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-12 text-center mb-4">
                                    <div className="position-relative d-inline-block shadow-sm rounded-3 p-2 bg-white border">
                                        <img src={preview || 'https://via.placeholder.com/150'} className="rounded" style={{ width: '140px', height: '140px', objectFit: 'contain' }} alt="logo" />
                                        <label className="btn btn-dark btn-sm position-absolute bottom-0 end-0 rounded-circle shadow">
                                            <i className="fas fa-camera"></i>
                                            <input type="file" name="logo" hidden onChange={handleChange} accept="image/*" />
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-6"><label className="form-label fw-bold small text-muted text-uppercase">Institution Name *</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} required /></div>
                                <div className="col-md-6"><label className="form-label fw-bold small text-muted text-uppercase">Slogan</label><input type="text" name="slogan" className="form-control" value={formData.slogan || ''} onChange={handleChange} /></div>
                                
                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">EIIN Number</label><input type="text" name="eiin_number" className="form-control" value={formData.eiin_number || ''} onChange={handleChange} /></div>
                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Established Year</label><input type="number" name="established_year" className="form-control" value={formData.established_year || ''} onChange={handleChange} /></div>
                                <div className="col-md-4 d-flex align-items-end"><div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /><label className="form-check-label fw-bold small ms-2 text-uppercase">Active Status</label></div></div>

                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Email</label><input type="email" name="email" className="form-control" value={formData.email || ''} onChange={handleChange} /></div>
                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Mobile</label><input type="text" name="mobile" className="form-control" value={formData.mobile || ''} onChange={handleChange} /></div>
                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Telephone</label><input type="text" name="telephone" className="form-control" value={formData.telephone || ''} onChange={handleChange} /></div>
                                
                                <div className="col-md-12"><label className="form-label fw-bold small text-muted text-uppercase">Website URL</label><input type="text" name="website" className="form-control" value={formData.website || ''} onChange={handleChange} placeholder="https://www.example.com" /></div>
                                <div className="col-md-12"><label className="form-label fw-bold small text-muted text-uppercase">Office Address</label><textarea name="address" className="form-control" rows="2" value={formData.address || ''} onChange={handleChange}></textarea></div>

                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">Facebook URL</label><input type="url" name="fb_link" className="form-control" value={formData.fb_link || ''} onChange={handleChange} /></div>
                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">YouTube URL</label><input type="url" name="yt_link" className="form-control" value={formData.yt_link || ''} onChange={handleChange} /></div>
                                <div className="col-md-4"><label className="form-label fw-bold small text-muted text-uppercase">LinkedIn URL</label><input type="url" name="linkedin_link" className="form-control" value={formData.linkedin_link || ''} onChange={handleChange} /></div>

                                <div className="col-md-6"><label className="form-label fw-bold small text-muted text-uppercase">Latitude</label><input type="text" name="latitude" className="form-control" value={formData.latitude || ''} onChange={handleChange} /></div>
                                <div className="col-md-6"><label className="form-label fw-bold small text-muted text-uppercase">Longitude</label><input type="text" name="longitude" className="form-control" value={formData.longitude || ''} onChange={handleChange} /></div>
                                <div className="col-12"><label className="form-label fw-bold small text-muted text-uppercase">Google Map Embed (Iframe)</label><textarea name="google_map_embed_url" className="form-control" rows="2" value={formData.google_map_embed_url || ''} onChange={handleChange}></textarea></div>

                                <div className="col-12 mt-4 pt-3 border-top">
                                    <button type="submit" className="btn btn-success px-5 fw-bold me-2 shadow">Save Changes</button>
                                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        /* --- FULL VIEW MODE (Everything Included) --- */
                        <div className="row g-5">
                            <div className="col-lg-4 text-center border-end">
                                <div className="p-4 bg-white rounded-4 shadow-sm border mb-4">
                                    <img src={preview || 'https://via.placeholder.com/150'} className="img-fluid rounded shadow-sm mb-3 border p-2" style={{ maxHeight: '180px' }} alt="logo" />
                                    <h4 className="fw-bold text-primary mb-1">{formData.name}</h4>
                                    <p className="text-muted small fst-italic">"{formData.slogan || 'Global Standards of Excellence'}"</p>
                                    <hr />
                                    <div className="d-flex justify-content-center gap-3">
                                        {formData.fb_link && <a href={formData.fb_link} target="_blank" className="btn btn-sm btn-outline-primary"><i className="fab fa-facebook-f">Facebook</i></a>}
                                        {formData.yt_link && <a href={formData.yt_link} target="_blank" className="btn btn-sm btn-outline-danger"><i className="fab fa-youtube">Youtube</i></a>}
                                        {formData.linkedin_link && <a href={formData.linkedin_link} target="_blank" className="btn btn-sm btn-outline-info"><i className="fab fa-linkedin-in"></i></a>}
                                        {formData.website && <a href={formData.website} target="_blank" className="btn btn-sm btn-outline-success"><i className="fas fa-globe"></i></a>}
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-8">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-muted border-bottom pb-2">GENERAL INFO</h6>
                                        <p className="mb-1 text-dark"><strong>EIIN:</strong> {formData.eiin_number || 'N/A'}</p>
                                        <p className="mb-1 text-dark"><strong>Established:</strong> {formData.established_year || 'N/A'}</p>
                                        <p className="mb-1 text-dark"><strong>Status:</strong> <span className={`badge ${formData.is_active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>{formData.is_active ? 'Active' : 'Inactive'}</span></p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-muted border-bottom pb-2">CONTACT INFO</h6>
                                        <p className="mb-1 text-dark"><strong>Email:</strong> {formData.email || 'N/A'}</p>
                                        <p className="mb-1 text-dark"><strong>Mobile:</strong> {formData.mobile || 'N/A'}</p>
                                        <p className="mb-1 text-dark"><strong>Phone:</strong> {formData.telephone || 'N/A'}</p>
                                    </div>
                                    <div className="col-12">
                                        <h6 className="fw-bold text-muted border-bottom pb-2">OFFICE ADDRESS</h6>
                                        <p className="text-dark mb-0">{formData.address || 'Address detail not provided.'}</p>
                                    </div>
                                    <div className="col-12">
                                        <h6 className="fw-bold text-muted border-bottom pb-2">WEB & LOCATION</h6>
                                        <p className="mb-1"><strong>Website:</strong> <a href={formData.website} target="_blank" className="text-decoration-none">{formData.website || 'N/A'}</a></p>
                                        <p className="mb-3"><strong>GPS:</strong> {formData.latitude || '0.00'}, {formData.longitude || '0.00'}</p>
                                        
                                        {formData.google_map_embed_url && (
                                            <div className="map-container rounded shadow-sm overflow-hidden border">
                                                <div className="ratio ratio-21x9">
                                                    <div 
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: formData.google_map_embed_url
                                                                .replace(/width="\d+"/, 'width="100%"')
                                                                .replace(/height="\d+"/, 'height="100%"')
                                                        }} 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .ratio-21x9 { --bs-aspect-ratio: 40%; }
                @media (max-width: 991px) { .ratio-21x9 { --bs-aspect-ratio: 60%; } }
                iframe { border: 0 !important; width: 100% !important; height: 100% !important; }
                .form-control:focus { border-color: #0d6efd; box-shadow: none; }
            `}</style>
        </div>
    );
};

export default InstitutionSettings;