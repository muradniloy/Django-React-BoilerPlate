import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; // আপনার হুক
import StudentNavButtons from "./StudentNavButtons"; 

const StudentAdmissionView = ({ studentId: propId }) => {
  const navigate = useNavigate();

  // ✅ আপনার কাস্টম হুক ব্যবহার করে আইডি পাওয়া
  const studentId = useStudent(propId);

  const [student, setStudent] = useState(null);
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // যদি আইডি না থাকে, তবে লোডিং শেষে ফিরে যাবে (লজিক হুক হ্যান্ডেল করছে)
    if (!studentId) {
        if (!loading) setLoading(false);
        return;
    }

    const fetchAdmissionData = async () => {
      setLoading(true);
      try {
        // ✅ CM.axiosInstance ব্যবহার (টোকেন অটো হ্যান্ডেল করবে)
        const res = await CM.axiosInstance.get(`/api/student-admission/${studentId}/`);
        
        if (res.data) {
          setAdmission(res.data);
          
          // সিরিয়ালাইজার থেকে স্টুডেন্ট অবজেক্ট বা ডিটেইলস পাওয়া গেলে সেট করা
          if (res.data.student && typeof res.data.student === 'object') {
            setStudent(res.data.student);
                CM.Swal.fire({
                            title: "Wait...",
                            text: `Admission page is loading`,
                            allowOutsideClick: false,
                            showConfirmButton: false,
                            timer: 500,
                            didOpen: () => {
                                CM.Swal.showLoading(); // এটি স্পিনিং অ্যানিমেশন দেখাবে
                            }
                        });
          } else if (res.data.student_details) {
            setStudent(res.data.student_details);
                CM.Swal.fire({
                            title: "Wait...",
                            text: `Admission page is loading`,
                            allowOutsideClick: false,
                            showConfirmButton: false,
                            timer: 1000,
                            didOpen: () => {
                                CM.Swal.showLoading(); // এটি স্পিনিং অ্যানিমেশন দেখাবে
                            }
                        });
          } else {
             // ব্যাকআপ হিসেবে নাম সেট করা
             setStudent({
               first_name: res.data.student_name || "N/A",
               last_name: "",
               photo: null,
               email: "N/A"
             });
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // [Saved Instruction] ডাটা না থাকলে Sweet Alert দিয়ে রিডাইরেক্ট
          CM.Swal.fire({
            title: "অ্যাডমিশন তথ্য নেই!",
            text: "এই শিক্ষার্থীর ভর্তির তথ্য এখনো যোগ করা হয়নি।",
            icon: "info",
            timer: 2000
          });
          navigate(`/update_student_admission`, { state: { id: studentId }, replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissionData();
  }, [studentId, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // যদি আইডি না থাকে (হুক যদি রিডাইরেক্ট করে তার আগে সেফটি চেক)
  if (!studentId) return null;

  return (
    <div className="student-admission-page container-fluid mt-4 px-4 pb-5">
      
      {/* Profile Header */}
      <div className="admission-header row align-items-center p-3 mb-4 bg-white shadow-sm rounded-3 border-start border-4 border-info">
        <div className="col-auto">
          <img
            src={student?.photo ? (student.photo.startsWith('http') ? student.photo : `${CM.domain}${student.photo}`) : "/default.png"}
            alt="Student"
            className="rounded-circle border p-1"
            style={{ width: '70px', height: '70px', objectFit: 'cover' }}
          />
        </div>
        <div className="col">
          <h5 className="mb-0 fw-bold text-dark">
            {student?.first_name} {student?.last_name}
          </h5>
          <p className="text-muted mb-0 small"><i className="fa fa-envelope me-1"></i>{student?.email || "No Email Provided"}</p>
        </div>
        <div className="col-auto text-end">
             <div className="badge bg-primary fs-6 p-2 px-3 rounded-pill mb-1">Student ID: {admission?.student_id_no || "N/A"}</div>
             <p className="small text-muted mb-0">System ID: {studentId}</p>
        </div>
      </div>

      {/* Admission Details Card */}
      <div className="card border-0 shadow-sm rounded-4 mt-3 overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-0">
            
            {/* Main Content Area */}
            <div className="col-md-10 pe-md-4">
              
              <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3">
                    <i className="fa fa-university fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">Admission Information</h6>
                  <small className="text-muted small">ভর্তির বিস্তারিত তথ্য</small>
                </div>
              </div>
              
              <div className="row g-4">
                {/* Program Name */}
                <div className="col-md-4">
                  <div className="ps-2">
                    <label className="text-uppercase text-muted fw-bold d-block mb-1" style={{fontSize: '10px', letterSpacing: '0.5px'}}>
                      Program Name
                    </label>
                    <p className="mb-0 fw-bold text-primary fs-6">
                      {admission?.Program_Name_display || "—"}
                    </p>
                  </div>
                </div>

                {/* Session */}
                <div className="col-md-4">
                  <div className="ps-2">
                    <label className="text-uppercase text-muted fw-bold d-block mb-1" style={{fontSize: '10px', letterSpacing: '0.5px'}}>
                      Session
                    </label>
                    <p className="mb-0 fw-bold text-info fs-6">
                      {admission?.Session_display || "—"}
                    </p>
                  </div>
                </div>

                {/* Admission Date */}
                <div className="col-md-4">
                  <div className="ps-2">
                    <label className="text-uppercase text-muted fw-bold d-block mb-1" style={{fontSize: '10px', letterSpacing: '0.5px'}}>
                      Admission Date
                    </label>
                    <p className="mb-0 fw-bold text-warning fs-6">
                      {admission?.Date_of_admission || "—"}
                    </p>
                  </div>
                </div>

                {/* Scores Row */}
                <div className="col-md-3 mt-5">
                  <div className="text-center border-end">
                    <small className="text-secondary text-uppercase fw-bold d-block mb-1" style={{fontSize: '10px'}}>Roll No</small>
                    <span className="fw-bold fs-5 text-dark">{admission?.Admission_roll || "—"}</span>
                  </div>
                </div>

                <div className="col-md-3 mt-5">
                  <div className="text-center border-end">
                    <small className="text-primary text-uppercase fw-bold d-block mb-1" style={{fontSize: '10px'}}>Test Score</small>
                    <span className="fw-bold fs-5 text-primary">{admission?.test_score || "0"}</span>
                  </div>
                </div>

                <div className="col-md-3 mt-5">
                  <div className="text-center border-end">
                    <small className="text-info text-uppercase fw-bold d-block mb-1" style={{fontSize: '10px'}}>Merit Score</small>
                    <span className="fw-bold fs-5 text-info">{admission?.merit_score || "0"}</span>
                  </div>
                </div>

                <div className="col-md-3 mt-5">
                  <div className="text-center">
                    <small className="text-success text-uppercase fw-bold d-block mb-1" style={{fontSize: '10px'}}>Merit Position</small>
                    <span className="fw-bold fs-5 text-success">#{admission?.merit_position || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav Buttons Section */}
            <StudentNavButtons studentId={studentId} />

          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 d-flex justify-content-between align-items-center">
        <Link className="btn btn-outline-secondary px-4 shadow-sm fw-bold rounded-pill" to={`/dashboard/students`}>
          <i className="fa fa-arrow-left me-2"></i> Back to List
        </Link>
        <button
          className="btn btn-warning px-4 fw-bold shadow-sm rounded-pill"
          onClick={() => navigate(`/update_student_admission`, { state: { id: studentId } })}
        >
          <i className="fa fa-edit me-2"></i> Update Admission
        </button>
      </div>
    </div>
  );
};

export default StudentAdmissionView;