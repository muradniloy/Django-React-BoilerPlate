import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import "../../../CSS/Studentlist.css";
import { useAdmin } from './../../../utils/useAdmin';


const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]); 
  const [sessions, setSessions] = useState([]); 
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [isViewAll, setIsViewAll] = useState(false); 
  const [previewImage, setPreviewImage] = useState(null);
  const { isAdmin, checkGroup } = useAdmin();
  const canApprove = isAdmin || checkGroup('StudentAdmin');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ program: "", session: "", approval: "", payment_status: "" });

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    const cleanDomain = CM.domain?.endsWith("/") ? CM.domain.slice(0, -1) : CM.domain;
    const cleanPath = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
    return photoPath.startsWith("http") ? photoPath : `${cleanDomain}${cleanPath}`;
  };

  const fetchStudents = useCallback(async (pageNum = 1, viewAllMode = false) => {
    setLoading(true);
    setIsViewAll(viewAllMode);
    try {
      const pageSize = viewAllMode ? 200 : 10;
      // Backend filter parameters added to URL
      let url = `/api/allstudent/?page=${pageNum}&page_size=${pageSize}`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filters.program) url += `&program=${filters.program}`;
      if (filters.session) url += `&session=${filters.session}`;
      if (filters.approval) url += `&approved=${filters.approval}`;
      if (filters.payment_status) url += `&payment_status=${filters.payment_status}`; // New Backend Filter

      const res = await CM.axiosInstance.get(url);
      
      if (res.data.results) {
        const studentData = await Promise.all(
          res.data.results.map(async (student) => {
            try {
              const admRes = await CM.axiosInstance.get(`/api/student-admission/${student.id}/`);
              
              // We still check paymentStatus for the "Position" column display and validation
              let isPaymentComplete = false;
              try {
                const payRes = await CM.axiosInstance.get(`/api/payment-contacts/?student=${student.id}`);
                if (payRes.data.length > 0 || (payRes.data.results && payRes.data.results.length > 0)) {
                  isPaymentComplete = true;
                }
              } catch (e) { isPaymentComplete = false; }

              return { ...student, admission: admRes.data, paymentStatus: isPaymentComplete };
            } catch { return { ...student, admission: null, paymentStatus: false }; }
          })
        );

        setStudents(studentData);
        setCount(res.data.count);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
        setCurrentPage(pageNum);
        setSelectedIds([]);
      }
    } catch (error) {
        CM.Swal.fire({ icon: 'error', title: 'Error', text: 'Data fetch failed!' });
    } finally { setLoading(false); }
  }, [searchTerm, filters]);

  useEffect(() => {
    const loadOptions = async () => {
      const [p, s] = await Promise.all([
        CM.axiosInstance.get("/api/programs/"),
        CM.axiosInstance.get("/api/sessions/")
      ]);
      setPrograms(Array.isArray(p.data) ? p.data : p.data.results || []);
      setSessions(Array.isArray(s.data) ? s.data : s.data.results || []);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(1, false), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, fetchStudents]);

  const handleBulkAction = async (actionType) => {
    if (selectedIds.length === 0) return;
    const isApproveAction = actionType === 'approve';
    const selectedStudents = students.filter(s => selectedIds.includes(s.id));
    
    for (const s of selectedStudents) {
      if (isApproveAction && s.admission?.approved) {
        return CM.Swal.fire({ icon: 'info', title: 'Notice', text: `${s.first_name} is already approved.` });
      }
      if (!isApproveAction && !s.admission?.approved) {
        return CM.Swal.fire({ icon: 'info', title: 'Notice', text: `${s.first_name} is already pending.` });
      }
      if (isApproveAction && !s.paymentStatus) {
        return CM.Swal.fire({ icon: 'warning', title: 'Action Denied', text: `Cannot approve ${s.first_name}. Admission is incomplete.` });
      }
    }

    CM.Swal.fire({
      title: 'Bulk Action',
      text: `Update status for ${selectedIds.length} students?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await Promise.all(selectedIds.map(id => CM.axiosInstance.put(`/api/student-admission/${id}/`, { approved: isApproveAction })));
          CM.Swal.fire({ icon: "success", title: "Success", text: "Status updated successfully!" });
          fetchStudents(currentPage, isViewAll);
        } catch (err) { 
            CM.Swal.fire({ icon: "error", title: "Error", text: "Action failed." });
        } finally { setLoading(false); }
      }
    });
  };

  const handleViewDetails = (s) => {
    if (!s.paymentStatus) {
      navigate("/StudentPage", { state: { id: s.id } });
    } else {
      navigate("/StudentPage", { state: { id: s.id } });
    }
  };

  const totalPages = Math.ceil(count / 10);

  return (
    <div className="student-list-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold m-0 text-dark">Student Management</h4>
          <small className="text-muted fw-bold">Total: {count}</small>
        </div>
        <div className="d-flex gap-2">
           {/* ৪. এখানে লজিকটি অ্যাপ্লাই করা হয়েছে */}
            {selectedIds.length > 0 && canApprove && (
                <>
                  <button onClick={() => handleBulkAction('approve')} className="btn btn-success btn-sm rounded-pill px-3 shadow-sm">Approve</button>
                  <button onClick={() => handleBulkAction('unapprove')} className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm">Unapprove</button>
                </>
            )}
            {!isViewAll && count > 10 && (
                <button onClick={() => fetchStudents(1, true)} className="btn btn-dark btn-sm rounded-pill px-3 shadow-sm">View All</button>
            )}
          
            <Link to="/create_student" className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm">Add New</Link>
        </div>
      </div>

      <div className="filter-card border-0 mb-3">
        <div className="row g-2">
            <div className="col-md-2">
                <input type="text" className="form-control filter-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-md-3">
                <select className="form-select filter-input" value={filters.program} onChange={(e) => setFilters({...filters, program: e.target.value})}>
                    <option value="">All Programs</option>
                    {programs.map(p => <option key={p.id} value={p.Program_Name}>{p.Program_Name}</option>)}
                </select>
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.session} onChange={(e) => setFilters({...filters, session: e.target.value})}>
                    <option value="">All Sessions</option>
                    {sessions.map(s => <option key={s.id} value={s.Session_Name}>{s.Session_Name}</option>)}
                </select>
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.approval} onChange={(e) => setFilters({...filters, approval: e.target.value})}>
                    <option value="">Status</option>
                    <option value="true">Approved</option>
                    <option value="false">Pending</option>
                </select>
            </div>
            <div className="col-md-3">
                <select className="form-select filter-input" value={filters.payment_status} onChange={(e) => setFilters({...filters, payment_status: e.target.value})}>
                    <option value="">All Position</option>
                    <option value="complete">Complete</option>
                    <option value="incomplete">Incomplete</option>
                </select>
            </div>
        </div>
      </div>

      <div className="student-table-container">
        <div className="table-responsive">
          <table className="table modern-table table-hover align-middle">
            <thead>
              <tr>
                <th className="ps-4">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    checked={selectedIds.length === students.length && students.length > 0} 
                    onChange={(e) => e.target.checked ? setSelectedIds(students.map(s => s.id)) : setSelectedIds([])} 
                  />
                </th>
                <th>Profile</th>
                <th>Name & ID</th>
                <th>Father & Mother Name</th>
                <th>Academic Info</th>
                <th className="text-center">Status</th>
                <th className="text-center">Position</th>
                <th className="text-center pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
  {loading ? (
    <tr>
      <td colSpan="8" className="text-center py-5">Processing...</td>
    </tr>
  ) : students.length > 0 ? (
    students.map((s) => {
      const isApproved = s.admission?.approved;
      return (
        <tr key={s.id} style={{ backgroundColor: isApproved ? "#f0fff4" : "transparent" }}>
          <td className="ps-4">
            <input 
              type="checkbox" 
              className="form-check-input" 
              checked={selectedIds.includes(s.id)} 
              onChange={() => setSelectedIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])} 
            />
          </td>
          <td>
            <div onClick={() => setPreviewImage({ url: getPhotoUrl(s.photo), name: s.first_name })} style={{cursor: 'pointer'}}>
              {getPhotoUrl(s.photo) ? (
                <img src={getPhotoUrl(s.photo)} className="student-avatar" alt="" />
              ) : (
                <div className="avatar-placeholder">{s.first_name?.[0]}</div>
              )}
            </div>
          </td>
          <td>
            <div className="fw-bold text-dark">{s.first_name || "N/A"}</div>
            <div className="extra-small-text text-primary fw-bold">{s.admission?.student_id_no || "N/A"}</div>
          </td>
          <td>
            <div className="fw-bold text-dark">{s.fathers_name || "N/A"}</div>
            <div className="extra-small-text text-info fw-bold">{s.mothers_name || "N/A"}</div>
          </td>
          <td>
            <div className="fw-bold extra-small-text text-dark">{s.admission?.Program_Name_display || "N/A"}</div>
            <div className="text-muted extra-small-text">{s.admission?.Session_display || "N/A"}</div>
          </td>
          <td className="text-center">
            <span className={`status-badge ${isApproved ? "active" : "inactive"}`}>
              {isApproved ? "Approved" : "Pending"}
            </span>
          </td>
          <td className="text-center">
            <span className={`status-badge ${s.paymentStatus ? "active" : "inactive"}`} style={{ 
              backgroundColor: s.paymentStatus ? "#0d6efd" : "#ffc107",
              color: s.paymentStatus ? "#fff" : "#000"
            }}>
              {s.paymentStatus ? "Complete" : "Incomplete"}
            </span>
          </td>
          <td className="text-center pe-4">
              <button onClick={() => handleViewDetails(s)} className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">View</button>
          </td>
        </tr>
      )
    })
  ) : (
    <tr>
      <td colSpan="8" className="text-center py-5 text-muted fw-bold">
        No students found.
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top py-2 px-4">
            {!isViewAll ? (
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted extra-small-text">Page {currentPage} of {totalPages || 1}</span>
                    <div className="d-flex gap-2">
                        <button className="pagi-link" disabled={!prevPage} onClick={() => fetchStudents(currentPage - 1)}>Prev</button>
                        <div className="d-flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <div key={i + 1} className={`page-number ${currentPage === i + 1 ? "active" : ""}`} onClick={() => fetchStudents(i + 1)}>{i + 1}</div>
                            ))}
                        </div>
                        <button className="pagi-link" disabled={!nextPage} onClick={() => fetchStudents(currentPage + 1)}>Next</button>
                    </div>
                </div>
            ) : (
                <div className="text-center"><button onClick={() => fetchStudents(1, false)} className="btn btn-link btn-sm fw-bold">Exit View All</button></div>
            )}
        </div>
      </div>

      {previewImage && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1100 }} onClick={() => setPreviewImage(null)}>
          <div className="modal-dialog modal-dialog-centered text-center">
            <div className="modal-content border-0 bg-transparent">
                <img src={previewImage.url} className="img-fluid rounded shadow-lg mb-2" alt="Preview" style={{ maxHeight: '75vh', border: '2px solid white' }} />
                <h5 className="text-white fw-bold">{previewImage.name}</h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;