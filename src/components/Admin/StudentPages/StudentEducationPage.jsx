import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; 
import StudentNavButtons from "./StudentNavButtons";
import "../../../CSS/StudentProfile.css"; 

const StudentEducationPage = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const studentId = useStudent(propId);

  const [educations, setEducations] = useState([]);
  const [student, setStudent] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleEditNavigation = () => {
    navigate(`/update_student_education`, { state: { id: studentId } });
  };

  // ✅ ইমেজ পাথ লজিক (ফুল ইউআরএল থাকলে সরাসরি দেখাবে)
  const getFullImageUrl = (path) => {
    if (!path) return "/default.png";
    if (typeof path !== 'string') return "/default.png";
    if (path.startsWith('http')) return path;
    const domain = CM.domain.endsWith('/') ? CM.domain.slice(0, -1) : CM.domain;
    const filePath = path.startsWith('/') ? path : `/${path}`;
    return `${domain}${filePath}`;
  };

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // ১. এডুকেশন ডাটা ফেচ
        const res = await CM.axiosInstance.get(`/api/education/add/?student_id=${studentId}`);
        console.log("Education Response:", res.data);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
          setEducations(res.data);
          console.log(res.data[0].student)
          const studentData = res.data[0].student;
          // ২. চেক করা হচ্ছে student কি অবজেক্ট নাকি শুধু ID
          if (studentData && typeof studentData === 'object') {
            console.log("Full Student Object found.");
            setStudent(studentData);
              CM.Swal.fire({
                                          title: "Student Education!",
                                          text: "Page is Ready।",
                                          icon: "success",
                                          timer: 1500,
                                          showConfirmButton: false,
                                        });
          } else {
            // যদি শুধু ID (যেমন: 10) আসে, তবে প্রোফাইল ফেচ করবে
            console.log("Only Student ID found. Fetching full profile for ID:", studentId);
            const studentRes = await CM.axiosInstance.get(`/api/student/${studentId}/`);
            console.log("Profile Fetched:", studentRes.data);
            setStudent(studentRes.data);
                CM.Swal.fire({
                                         title: "Wait...",
                                         text: `Education page is loading`,
                                         allowOutsideClick: false,
                                         showConfirmButton: false,
                                         timer: 500,
                                         didOpen: () => {
                                             CM.Swal.showLoading(); // এটি স্পিনিং অ্যানিমেশন দেখাবে
                                         }
                                     });
          }
        } else {
          CM.Swal.fire({
            title: "তথ্য নেই!",
            text: "শিক্ষাগত যোগ্যতার তথ্য পাওয়া যায়নি।",
            icon: "info",
            timer: 2000
          });
          navigate(`/update_student_education`, { state: { id: studentId }, replace: true });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, navigate]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="student-profile container mt-1">
      <div className="card shadow-lg p-3 profile-card border-0 rounded-4">
        
        {/* --- Top Row: Slim Profile Header --- */}
        <div className="d-flex align-items-center mb-3 pb-2 border-bottom bg-light bg-opacity-50 rounded-3 px-3 py-1" style={{minHeight: "70px"}}>
          <div className="profile-img-container shadow-sm border border-2 border-white rounded-circle overflow-hidden" style={{ width: "60px", height: "60px", flexShrink: 0 }}>
            <img
              src={getFullImageUrl(student?.photo)}
              alt="Profile"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
              onError={(e) => { e.target.src = "/default.png"; }} 
            />
          </div>
          <div className="ms-3 flex-grow-1">
            <h5 className="fw-bold text-dark mb-0">{student?.first_name || "Student"} ({student?.last_name || ""})</h5>
            <div className="d-flex gap-4 small text-muted">
              <span><i className="fa fa-envelope text-primary me-1"></i>{student?.email || "N/A"}</span>
              <span><i className="fa fa-id-card text-primary me-1"></i>ID: {studentId}</span>
            </div>
          </div>
        </div>

        {/* --- Body Row --- */}
        <div className="row g-3">
          <div className="col-md-10">
            <div className="info-card p-3 border rounded-3 bg-white">
              <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
                <i className="fa fa-graduation-cap me-2 text-primary"></i>Educational Qualifications
              </h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-muted" style={{ fontSize: '11px' }}>
                      <th className="ps-3 py-2">LEVEL & GROUP</th>
                      <th className="py-2">BOARD NAME & COURSE</th>
                      <th className="py-2">INSTITUTION & RESULT</th>
                      <th className="py-2">ROLL & Reg No</th>
                      <th className="text-center py-2">FILE</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px' }}>
                    {educations.map((edu, index) => (
                      <tr key={index}>
                        <td className="ps-3 py-3">
                          <div className="fw-bold text-dark">{edu.education_type_display}</div>
                          <div className="text-primary small fw-medium">{edu.education_group_display}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{edu.board_name} </div>
                          <div className="text-muted extra-small">{edu.course_name}</div>
                        </td>
                        <td>
                          <div className="fw-semibold"><strong>{edu.institution_name || "N/A"}</strong></div>
                          <div className="badge bg-opacity-10 text-success border border-success border-opacity-10 mt-1">GPA: {edu.result} | Year: {edu.passing_year} </div>
                        </td>
                        <td>
                          <div>Roll: <b>{edu.roll}</b></div>
                          <div>Reg no. {edu.registration_no}</div>
                        </td>
                        <td className="text-center">
                          {edu.educational_file ? (
                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => {
                                setSelectedFile(getFullImageUrl(edu.educational_file));
                                setShowModal(true);
                            }}>
                              <i className="fa fa-eye"></i> View
                            </button>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Nav Buttons (Fixed Padding) */}
              <StudentNavButtons studentId={studentId} />
        </div>
      </div>

      {/* Footer Nav */}
      <div className="long-panel mt-3 d-flex justify-content-between p-2 align-items-center">
        <button className="btn btn-outline-secondary px-4 rounded-pill fw-bold" onClick={() => navigate(-1)}>
          <i className="fa fa-arrow-left me-2"></i> Back
        </button>
        <button className="btn btn-warning px-4 rounded-pill fw-bold" onClick={handleEditNavigation}>
          <i className="fa fa-edit me-2"></i> Update Education
        </button>
      </div>

      {/* Modal - Same as before */}
      {showModal && (
  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
    <div className="modal-dialog modal-lg modal-dialog-centered shadow-lg">
      <div className="modal-content border-0 rounded-4 overflow-hidden">
        
        <div className="modal-header py-2 bg-light d-flex justify-content-between align-items-center">
          <h6 className="modal-title fw-bold text-primary">
            <i className="fa fa-file-pdf me-2"></i>Document Preview
          </h6>
          <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
        </div>

        <div className="modal-body p-0 bg-secondary bg-opacity-10 d-flex justify-content-center align-items-center" style={{ minHeight: '550px' }}>
          {selectedFile?.toLowerCase().endsWith('.pdf') ? (
            /* --- PDF এর জন্য উন্নত Object ট্যাগ --- */
            <object
              data={`${selectedFile}#toolbar=0&navpanes=0`}
              type="application/pdf"
              width="100%"
              height="600px"
              className="border-0"
            >
              <div className="text-center p-5">
                <p className="mb-3 text-muted font-monospace">আপনার ব্রাউজার সরাসরি PDF প্রিভিউ সমর্থন করছে না।</p>
                <a href={selectedFile} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-pill px-4">
                   <i className="fa fa-download me-2"></i> PDF ডাউনলোড করুন
                </a>
              </div>
            </object>
          ) : (
            /* --- ইমেজের জন্য --- */
            <div className="p-3">
               <img 
                 src={selectedFile} 
                 alt="Certificate" 
                 className="img-fluid rounded shadow-sm border" 
                 style={{ maxHeight: '75vh', objectFit: 'contain' }} 
               />
            </div>
          )}
        </div>

        <div className="modal-footer py-2 bg-light border-top">
           <a href={selectedFile} target="_blank" rel="noopener noreferrer" download className="btn btn-sm btn-primary px-3 rounded-pill fw-bold">
             <i className="fa fa-download me-2"></i> Download File
           </a>
           <button className="btn btn-sm btn-outline-secondary px-3 rounded-pill fw-bold" onClick={() => setShowModal(false)}>
             Close
           </button>
        </div>

      </div>
    </div>
  </div>
)}

      <style>{`
        .extra-small { font-size: 11px; }
        .nav-wrapper-fixed {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .nav-wrapper-fixed button, .nav-wrapper-fixed a {
            width: 100% !important;
            padding: 7px 2px !important;
            font-size: 11px !important;
            white-space: nowrap !important;
            display: block !important;
            text-align: center;
        }
      `}</style>
    </div>
  );
};

export default StudentEducationPage;