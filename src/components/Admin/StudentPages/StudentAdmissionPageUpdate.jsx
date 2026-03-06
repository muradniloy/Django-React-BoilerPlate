import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; 
import { useGlobalState } from "../../../state/provider"; 

const StudentAdmissionPageUpdate = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const [{ profile }] = useGlobalState();
  const studentId = useStudent(propId);

  const [studentProfile, setStudentProfile] = useState(null);
  const [formData, setFormData] = useState({
    Program_Name: "",
    Session: "",
    Date_of_admission: "",
    Admission_roll: "",
    test_score: "",
    merit_score: "",
    merit_position: "",
  });

  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(null); 

  const userGroups = profile?.groups || profile?.prouser?.groups || [];
  const isAdmin = userGroups.some(group => 
      group.toString().toLowerCase() === 'admin'
  ) || profile?.is_superuser || profile?.prouser?.is_superuser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, sessRes, studentRes] = await Promise.all([
          CM.axiosInstance.get(`/api/programs/`),
          CM.axiosInstance.get(`/api/sessions/`),
          CM.axiosInstance.get(`/api/student/${studentId}/`)
        ]);
        
        setPrograms(Array.isArray(progRes.data) ? progRes.data : (progRes.data.results || []));
        setSessions(Array.isArray(sessRes.data) ? sessRes.data : (sessRes.data.results || []));
        setStudentProfile(studentRes.data);
      } catch (err) {
        console.error("Initialization Error", err);
      }
    };
    if (studentId) fetchData();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) {
      setIsEdit(false);
      setLoading(false);
      return;
    }

    const fetchAdmission = async () => {
      setLoading(true);
      try {
        const res = await CM.axiosInstance.get(`/api/student-admission/${studentId}/`);
        if (res.data && res.data.id) {
          setIsEdit(true);
          setFormData({
            Program_Name: res.data.Program_Name?.id || res.data.Program_Name || "",
            Session: res.data.Session?.id || res.data.Session || "",
            Date_of_admission: res.data.Date_of_admission || "",
            Admission_roll: res.data.Admission_roll || "",
            test_score: res.data.test_score || "",
            merit_score: res.data.merit_score || "",
            merit_position: res.data.merit_position || "",
          });
        } else {
          setIsEdit(false);
        }
      } catch (err) {
        setIsEdit(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmission();
  }, [studentId]);

  const filteredSessions = useMemo(() => {
    if (!sessions.length || isEdit === null) return [];
    if (isEdit) return sessions;
    return sessions.filter(s => s.active === true || s.active === 1 || s.active === undefined);
  }, [sessions, isEdit]);

  const filteredPrograms = useMemo(() => {
    if (!programs.length || isEdit === null) return [];
    if (isEdit) return programs;
    return programs.filter(p => p.active === true || p.active === 1 || p.active === undefined);
  }, [programs, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    CM.Swal.fire({
      title: 'Saving...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => { CM.Swal.showLoading(); }
    });

    try {
      if (isEdit) {
        await CM.axiosInstance.put(`/api/student-admission/${studentId}/`, formData);
      } else {
        await CM.axiosInstance.post(`/api/student-admission/${studentId}/`, { ...formData, student: studentId });
      }

      CM.Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: isEdit ? 'Admission info updated.' : 'New admission completed.',
        timer: 1500,
        showConfirmButton: false
      });
      
      setTimeout(() => navigate("/student_admission", { state: { id: studentId } }), 1500);

    } catch (err) {
      CM.Swal.fire("Error", "Failed to save information.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isEdit === null) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container mt-2 mb-5 pb-5 px-4">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-primary py-3 text-white d-flex justify-content-between align-items-center">
           <div className="d-flex align-items-center gap-3">
            <img
              src={studentProfile?.photo ? (studentProfile.photo.startsWith('http') ? studentProfile.photo : `${CM.domain}${studentProfile.photo}`) : "/default.png"}
              alt="Student"
              className="rounded-circle border shadow-sm bg-white"
              style={{ width: '55px', height: '55px', objectFit: 'cover' }}
            />
            <div>
              <h5 className="mb-0 fw-bold text-dark">{studentProfile?.first_name} {studentProfile?.last_name}</h5>
              <div className="badge bg-light text-primary border rounded-pill px-3 mt-1">
                Student ID: {studentId}
              </div>
            </div>
          </div>
          <h6 className="mb-0 fw-bold"><i className="fa fa-graduation-cap me-2"></i>{isEdit ? "Update Admission" : "New Admission"}</h6>
          <button type="button" className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={() => navigate(-1)}>Back</button>
        </div>
        
        <div className="card-body p-4 bg-light">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 border-0 rounded-4 bg-white shadow-sm p-4 border-start border-5 border-primary">
              <h6 className="fw-bold text-primary mb-3 text-uppercase small border-bottom pb-2">Step 1: Enrollment Information</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-secondary">Program / Department</label>
                  <select 
                    name="Program_Name" 
                    value={formData.Program_Name} 
                    onChange={handleChange} 
                    className="form-select form-select-sm border-2 shadow-none" 
                    required 
                    disabled={isEdit && !isAdmin}
                  >
                    <option value="">Select Program</option>
                    {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.Program_Name}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-secondary">Academic Session</label>
                  <select 
                    name="Session" 
                    value={formData.Session} 
                    onChange={handleChange} 
                    className="form-select form-select-sm border-2 shadow-none" 
                    required 
                    disabled={isEdit && !isAdmin}
                  >
                    <option value="">Select Session</option>
                    {filteredSessions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.Session_Name} {s.active === false ? "(Inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-secondary">Admission Date</label>
                  <input type="date" name="Date_of_admission" value={formData.Date_of_admission} onChange={handleChange} className="form-control form-control-sm border-2 shadow-none" required />
                </div>
              </div>
            </div>

            <div className="mb-4 border-0 rounded-4 bg-white shadow-sm p-4 border-start border-5 border-success">
              <h6 className="fw-bold text-success mb-3 text-uppercase small border-bottom pb-2">Step 2: Performance & Merit Info</h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Admission Roll</label>
                  <input type="number" name="Admission_roll" value={formData.Admission_roll} onChange={handleChange} className="form-control form-control-sm border-2 shadow-none" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Test Score</label>
                  <input type="number" name="test_score" value={formData.test_score} onChange={handleChange} className="form-control form-control-sm border-2 shadow-none" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Merit Score</label>
                  <input type="number" name="merit_score" value={formData.merit_score} onChange={handleChange} className="form-control form-control-sm border-2 shadow-none" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">Merit Position</label>
                  <input type="number" name="merit_position" value={formData.merit_position} onChange={handleChange} className="form-control shadow-none border-2 form-control-sm" />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow btn-sm" disabled={submitting}>
                {submitting ? "Processing..." : (isEdit ? "Update Now" : "Complete Admission")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentAdmissionPageUpdate;