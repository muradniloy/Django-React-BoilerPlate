import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as CM from "../../../componentExporter";

const UserProfileView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const userProfile = location.state?.profileData;

    if (!userProfile) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="text-center p-4 shadow bg-white rounded-4">
                    <h6 className="fw-bold mb-3">No User Data Found</h6>
                    <button className="btn btn-sm btn-success rounded-pill px-4" onClick={() => navigate(-1)}>
                        <i className="fa fa-arrow-left me-2"></i>Go Back
                    </button>
                </div>
            </div>
        );
    }

    const profileImg = userProfile?.image 
        ? (userProfile.image.startsWith('http') ? userProfile.image : `${CM.domain}${userProfile.image}`) 
        : `https://ui-avatars.com/api/?name=${userProfile?.prouser?.username}&background=00b894&color=fff&size=150&bold=true`;

    return (
        <div className="container-fluid py-4 px-4" style={{ 
            backgroundColor: "#f8f9fa",
            backgroundImage: "radial-gradient(#d1d1d1 0.5px, transparent 0.5px)",
            backgroundSize: "20px 20px" 
        }}>
            
            {/* --- Navigation & Header --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-white shadow-sm rounded-pill px-3 py-2 fw-bold text-secondary border-0 d-flex align-items-center"
                    style={{ backgroundColor: "#fff" }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Registry
                </button>
                
                <div className="d-flex gap-2">
                    <button className="btn btn-success shadow-sm rounded-pill px-4 fw-bold btn-sm">
                        <i className="fa fa-edit me-2"></i>Edit Profile
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* --- Left Profile Card --- */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100">
                        <div className="p-4 text-center border-bottom bg-light bg-opacity-50">
                            <div className="position-relative d-inline-block mb-3">
                                <img src={profileImg} className="rounded-circle border border-4 border-white shadow-sm" style={{ width: '130px', height: '130px', objectFit: 'cover' }} alt="Avatar"/>
                                <div className="position-absolute bottom-0 end-0 p-2 bg-success rounded-circle border border-3 border-white shadow-sm"></div>
                            </div>
                            <h5 className="fw-bold mb-1 text-dark">{userProfile?.prouser?.first_name} {userProfile?.prouser?.last_name}</h5>
                            <p className="text-muted small fw-medium mb-3">@{userProfile?.prouser?.username}</p>
                            
                            {/* --- Fixed Badges Design --- */}
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                {userProfile?.groups?.length > 0 ? userProfile.groups.map((g, i) => (
                                    <span key={i} className="px-3 py-1 rounded-pill fw-bold border" 
                                        style={{ 
                                            fontSize: '10px', 
                                            color: '#0d6efd', 
                                            backgroundColor: '#f0f7ff', 
                                            borderColor: '#cfe2ff' 
                                        }}>
                                        {g.toUpperCase()}
                                    </span>
                                )) : <span className="text-muted extra-small-text">No Roles</span>}
                            </div>
                        </div>

                        <div className="p-4">
                            <h6 className="fw-bold text-dark mb-4 small text-uppercase" style={{ letterSpacing: '1px' }}>Contact Details</h6>
                            
                            <div className="d-flex align-items-center mb-4">
                                <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3 text-primary">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <div className="overflow-hidden">
                                    <small className="text-muted d-block fw-bold" style={{fontSize: '9px'}}>EMAIL</small>
                                    <span className="small fw-bold text-dark">{userProfile?.prouser?.email}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center mb-4">
                                <div className="p-2 bg-success bg-opacity-10 rounded-3 me-3 text-success">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </div>
                                <div>
                                    <small className="text-muted d-block fw-bold" style={{fontSize: '9px'}}>PHONE</small>
                                    <span className="small fw-bold text-dark">{userProfile?.phone || "N/A"}</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center">
                                <div className="p-2 bg-danger bg-opacity-10 rounded-3 me-3 text-danger">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div>
                                    <small className="text-muted d-block fw-bold" style={{fontSize: '9px'}}>LOCATION</small>
                                    <span className="small fw-bold text-dark">{userProfile?.location || "Bangladesh"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column --- */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="p-3 rounded-4 bg-light border d-flex align-items-center h-100">
                                    <div className="p-2 bg-white rounded-circle shadow-sm me-3 text-success">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <small className="text-muted fw-bold d-block" style={{fontSize: '10px'}}>DESIGNATION</small>
                                        <h6 className="fw-bold mb-0 text-dark small">{userProfile?.designation || "Web Developer"}</h6>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 rounded-4 bg-light border d-flex align-items-center h-100">
                                    <div className="p-2 bg-white rounded-circle shadow-sm me-3 text-primary">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    </div>
                                    <div>
                                        <small className="text-muted fw-bold d-block" style={{fontSize: '10px'}}>ACCOUNT STATUS</small>
                                        <h6 className="fw-bold mb-0 text-success small">Verified Member</h6>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-4 p-4 bg-white shadow-sm flex-grow-1">
                            <h6 className="fw-bold text-dark d-flex align-items-center mb-3">
                                <svg className="me-2 text-success" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                Biography
                            </h6>
                            <p className="text-secondary mb-0" style={{ lineHeight: '1.8', textAlign: 'justify', fontSize: '13.5px' }}>
                                {userProfile?.about || "This user has not provided a detailed biography yet. Information will appear here once updated by the user or administrator."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;