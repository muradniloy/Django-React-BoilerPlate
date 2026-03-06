import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as CM from "../../../../componentExporter"; // CM ইম্পোর্ট করা হলো
import Swal from "sweetalert2";

const DistrictList = () => {
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filterDivision, setFilterDivision] = useState("");
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // ১. ড্রপডাউনের জন্য ডিভিশন লিস্ট নিয়ে আসা
  useEffect(() => {
    CM.axiosInstance.get(`/api/divisions/`)
      .then(res => setDivisions(res.data.results || res.data))
      .catch(err => {
        if (err.response?.status === 401) navigate("/");
      });
  }, [navigate]);

  // ২. ডিস্ট্রিক্ট লিস্ট নিয়ে আসা (প্যাজিনেশন ও ফিল্টার সহ)
  const fetchDistricts = (page = 1) => {
    setLoading(true);
    let url = `/api/districts/?page=${page}`;
    if (filterDivision) url += `&division=${filterDivision}`;

    CM.axiosInstance.get(url)
      .then(res => {
        setDistricts(res.data.results || res.data);
        setCurrentPage(page);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
        setTotalCount(res.data.count || 0);
        setTotalPages(Math.ceil(res.data.count / 10));
      })
      .catch(err => {
        console.error("Data fetch error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    fetchDistricts(1); 
  }, [filterDivision]);

  // ৩. নতুন জেলা তৈরি করা
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await CM.axiosInstance.post(`/api/districts/`, { name, division });
      
      // [Saved Instruction] Set up Sweet Alert for success
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'নতুন জেলা যুক্ত করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });

      setName("");
      setDivision("");
      fetchDistricts(1);

      // Modal hide logic
      const modalEl = document.getElementById('addModal');
      const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
      modalInstance?.hide();

    } catch (err) {
      Swal.fire("Error", "তথ্য সংরক্ষণ করা যায়নি। নাম হয়তো ডুপ্লিকেট।", "error");
    }
  };

  // ৪. জেলা ডিলিট করা
  const handleDelete = (id) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "এটি ডিলিট করলে আর ফিরে পাওয়া যাবে না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
      cancelButtonText: 'না'
    }).then((result) => {
      if (result.isConfirmed) {
        CM.axiosInstance.delete(`/api/districts/${id}/`)
          .then(() => {
            Swal.fire('ডিলিট হয়েছে!', 'জেলাটি মুছে ফেলা হয়েছে।', 'success');
            fetchDistricts(currentPage);
          })
          .catch(() => {
            Swal.fire("ভুল হয়েছে", "ডিলিট করা সম্ভব হয়নি।", "error");
          });
      }
    });
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card shadow-lg border-0 rounded-4">
        {/* Header */}
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="bi bi-map-fill me-2"></i>District Directory
          </h5>
          <button className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm" data-bs-toggle="modal" data-bs-target="#addModal">
            <i className="bi bi-plus-lg me-1"></i> Add District
          </button>
        </div>

        {/* Filter Section */}
        <div className="p-3 bg-white border-bottom">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-funnel text-muted"></i></span>
                <select
                  className="form-select border-start-0 ps-0"
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                >
                  <option value="">All Divisions (Show All)</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col text-end">
               <span className="badge bg-primary-subtle text-primary rounded-pill px-3">Total Districts: {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted text-uppercase">
                <th className="px-4 py-3"># SL</th>
                <th>District Name</th>
                <th>Division Name</th>
                <th width="200" className="text-center">Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm me-2"></div> Loading...</td></tr>
              ) : districts.length > 0 ? (
                districts.map((d, i) => (
                  <tr key={d.id}>
                    <td className="px-4 text-muted">{(currentPage - 1) * 10 + i + 1}</td>
                    <td><span className="fw-semibold text-dark">{d.name}</span></td>
                    <td><span className="badge bg-info-subtle text-info border border-info-subtle px-3 rounded-pill text-uppercase" style={{fontSize: '10px'}}>{d.division_name}</span></td>
                    <td className="text-center">
                      <div className="btn-group">
                        <Link to={`/dashboard/districts/edit/${d.id}`} className="btn btn-sm btn-outline-warning px-3 rounded-start">
                          <i className="bi bi-pencil-square"></i> Edit
                        </Link>
                        <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-outline-danger px-3 rounded-end">
                          <i className="bi bi-trash3"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No districts found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3 border-top">
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-4"
            onClick={() => fetchDistricts(currentPage - 1)}
            disabled={!prevPage || loading}
          >
            <i className="bi bi-chevron-left me-1"></i> Previous
          </button>
          <span className="small fw-bold text-muted text-uppercase">Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-4"
            onClick={() => fetchDistricts(currentPage + 1)}
            disabled={!nextPage || loading}
          >
            Next <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>

      {/* CREATE Modal */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <form onSubmit={handleCreate} className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0">
              <h5 className="fw-bold m-0 text-primary">Add New District</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body py-4">
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase">Under Division</label>
                <select
                  className="form-select form-control-lg bg-light border-0"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-secondary text-uppercase">District Name</label>
                <input
                  className="form-control form-control-lg bg-light border-0"
                  placeholder="e.g. Feni"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 shadow">Save District</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DistrictList;