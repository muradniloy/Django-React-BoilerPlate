import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import "../../../CSS/Studentlist.css"; // একই CSS ব্যবহার করা হয়েছে ডিজাইনের জন্য

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [designations, setDesignations] = useState([]); 
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [isViewAll, setIsViewAll] = useState(false); 
  const [previewImage, setPreviewImage] = useState(null);
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ 
    department: "", 
    designation: "", 
    division: "", 
    district: "", 
    active: "" 
  });

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    const cleanDomain = CM.domain?.endsWith("/") ? CM.domain.slice(0, -1) : CM.domain;
    const cleanPath = photoPath.startsWith("/") ? photoPath : `/${photoPath}`;
    return photoPath.startsWith("http") ? photoPath : `${cleanDomain}${cleanPath}`;
  };

  // ১. এমপ্লয়ি ডাটা ফেচিং
  const fetchEmployees = useCallback(async (pageNum = 1, viewAllMode = false) => {
    setLoading(true);
    setIsViewAll(viewAllMode);
    try {
      const pageSize = viewAllMode ? 200 : 10;
      let url = `/api/employees/all/?page=${pageNum}&page_size=${pageSize}`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filters.department) url += `&department=${filters.department}`;
      if (filters.designation) url += `&designation=${filters.designation}`;
      if (filters.division) url += `&present_division=${filters.division}`;
      if (filters.district) url += `&present_district=${filters.district}`;
      if (filters.active) url += `&active=${filters.active}`;

      const res = await CM.axiosInstance.get(url);
      
      // API response structure (results) check
      const data = res.data.results || res.data;
      setEmployees(Array.isArray(data) ? data : []);
      setCount(res.data.count || data.length);
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
      setCurrentPage(pageNum);
      setSelectedIds([]);
    } catch (error) {
        CM.Swal.fire({ icon: 'error', title: 'Error', text: 'Employee data fetch failed!' });
    } finally { setLoading(false); }
  }, [searchTerm, filters]);

  // ২. ড্রপডাউন অপশন লোড করা
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [dept, desig, div] = await Promise.all([
          CM.axiosInstance.get("/api/departments/"),
          CM.axiosInstance.get("/api/designations/"),
          CM.axiosInstance.get("/api/divisions/")
        ]);
        setDepartments(dept.data.results || dept.data);
        setDesignations(desig.data.results || desig.data);
        setDivisions(div.data.results || div.data);
      } catch (e) { console.error("Filter options load failed"); }
    };
    loadOptions();
  }, []);

  // ৩. ডিভিশন চেঞ্জ হলে ডিস্ট্রিক্ট লোড করা
  useEffect(() => {
    if (filters.division) {
        CM.axiosInstance.get(`/api/districts/?division=${filters.division}`)
            .then(res => setDistricts(res.data.results || res.data));
    } else {
        setDistricts([]);
    }
  }, [filters.division]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(1, false), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, fetchEmployees]);

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    CM.Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${selectedIds.length} employees?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(selectedIds.map(id => CM.axiosInstance.delete(`/api/employees/delete/${id}/`)));
          CM.Swal.fire('Deleted!', 'Records have been deleted.', 'success');
          fetchEmployees(currentPage, isViewAll);
        } catch (err) { CM.Swal.fire('Error', 'Action failed', 'error'); }
      }
    });
  };

  const totalPages = Math.ceil(count / 10);

  return (
    <div className="student-list-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold m-0 text-dark">Employee Management</h4>
          <small className="text-muted fw-bold">Total Employees: {count}</small>
        </div>
        <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm rounded-pill px-3 shadow-sm">Delete Selected</button>
            )}
            {!isViewAll && count > 10 && (
                <button onClick={() => fetchEmployees(1, true)} className="btn btn-dark btn-sm rounded-pill px-3 shadow-sm">View All</button>
            )}
            <Link to="/employee_add" className="btn btn-success btn-sm rounded-pill px-3 shadow-sm">Add Employee</Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filter-card border-0 mb-3 p-3 bg-white shadow-sm rounded-4">
        <div className="row g-2">
            <div className="col-md-2">
                <input type="text" className="form-control filter-input" placeholder="Name/ID/Mobile..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})}>
                    <option value="">Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.designation} onChange={(e) => setFilters({...filters, designation: e.target.value})}>
                    <option value="">Designations</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.division} onChange={(e) => setFilters({...filters, division: e.target.value})}>
                    <option value="">Division</option>
                    {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.district} onChange={(e) => setFilters({...filters, district: e.target.value})} disabled={!filters.division}>
                    <option value="">District</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
            <div className="col-md-2">
                <select className="form-select filter-input" value={filters.active} onChange={(e) => setFilters({...filters, active: e.target.value})}>
                    <option value="">Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
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
                    checked={selectedIds.length === employees.length && employees.length > 0} 
                    onChange={(e) => e.target.checked ? setSelectedIds(employees.map(s => s.id)) : setSelectedIds([])} 
                  />
                </th>
                <th>Profile</th>
                <th>Name & ID</th>
                <th>Contact Info</th>
                <th>Official Info</th>
                <th className="text-center">Status</th>
                <th className="text-center pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5">Processing...</td></tr>
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="ps-4">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        checked={selectedIds.includes(emp.id)} 
                        onChange={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])} 
                      />
                    </td>
                    <td>
                      <div onClick={() => setPreviewImage({ url: getPhotoUrl(emp.photo), name: emp.first_name })} style={{cursor: 'pointer'}}>
                        {getPhotoUrl(emp.photo) ? (
                          <img src={getPhotoUrl(emp.photo)} className="student-avatar" alt="" />
                        ) : (
                          <div className="avatar-placeholder">{emp.first_name?.[0]}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{emp.first_name} {emp.last_name}</div>
                      <div className="extra-small-text text-primary fw-bold">{emp.employee_id || "ID Pending"}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark" style={{fontSize: '13px'}}>{emp.mobile || "N/A"}</div>
                      <div className="extra-small-text text-muted">{emp.email || emp.user_email}</div>
                    </td>
                    <td>
                      <div className="fw-bold extra-small-text text-dark">{emp.department_name || "N/A"}</div>
                      <div className="text-info extra-small-text fw-bold">{emp.designation_name || "N/A"}</div>
                    </td>
                    <td className="text-center">
                      <span className={`status-badge ${emp.active ? "active" : "inactive"}`}>
                        {emp.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                    
                        <button 
                        onClick={() => navigate("/update_employee", { state: { id: emp.id } })} 
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                        >
                        Edit
                        </button>  
                        </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-5 text-muted fw-bold">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer bg-white border-top py-2 px-4">
            {!isViewAll ? (
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted extra-small-text">Page {currentPage} of {totalPages || 1}</span>
                    <div className="d-flex gap-2">
                        <button className="pagi-link" disabled={!prevPage} onClick={() => fetchEmployees(currentPage - 1)}>Prev</button>
                        <div className="d-flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <div key={i + 1} className={`page-number ${currentPage === i + 1 ? "active" : ""}`} onClick={() => fetchEmployees(i + 1)}>{i + 1}</div>
                            ))}
                        </div>
                        <button className="pagi-link" disabled={!nextPage} onClick={() => fetchEmployees(currentPage + 1)}>Next</button>
                    </div>
                </div>
            ) : (
                <div className="text-center"><button onClick={() => fetchEmployees(1, false)} className="btn btn-link btn-sm fw-bold text-success">Exit View All</button></div>
            )}
        </div>
      </div>

      {/* Image Preview Modal */}
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

export default EmployeeList;