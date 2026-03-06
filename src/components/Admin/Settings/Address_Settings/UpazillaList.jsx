import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as CM from "../../../../componentExporter";
import Swal from "sweetalert2";

const UpazillaList = () => {
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]); // ফিল্টার ড্রপডাউনের জন্য
  const [modalDistricts, setModalDistricts] = useState([]); // মোডাল ড্রপডাউনের জন্য
  const [upazillas, setUpazillas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterDivision, setFilterDivision] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  const [name, setName] = useState("");
  const [division, setDivision] = useState(""); // মোডাল বিভাগ
  const [district, setDistrict] = useState(""); // মোডাল জেলা

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // ১. প্রাথমিক বিভাগ লোড করা
  useEffect(() => {
    CM.axiosInstance.get(`/api/divisions/`)
      .then(res => setDivisions(res.data.results || res.data))
      .catch(err => {
        if (err.response?.status === 401) navigate("/");
      });
  }, [navigate]);

  // ২. ফিল্টার এরিয়ায় বিভাগ বদলালে জেলা লোড করা
  useEffect(() => {
    setFilterDistrict("");
    if (filterDivision) {
      CM.axiosInstance.get(`/api/districts/?division=${filterDivision}`)
        .then(res => setDistricts(res.data.results || res.data));
    } else {
      setDistricts([]);
    }
  }, [filterDivision]);

  // ৩. মোডালে বিভাগ বদলালে জেলা লোড করা
  useEffect(() => {
    setDistrict("");
    if (division) {
      CM.axiosInstance.get(`/api/districts/?division=${division}`)
        .then(res => setModalDistricts(res.data.results || res.data));
    } else {
      setModalDistricts([]);
    }
  }, [division]);

  // ৪. উপজেলা লিস্ট ফেচ করা
  const fetchUpazillas = (page = 1) => {
    setLoading(true);
    let url = `/api/upazillas/?page=${page}`;
    if (filterDivision) url += `&division=${filterDivision}`;
    if (filterDistrict) url += `&district=${filterDistrict}`;

    CM.axiosInstance.get(url)
      .then(res => {
        setUpazillas(res.data.results || res.data);
        setCurrentPage(page);
        setNextPage(res.data.next);
        setPrevPage(res.data.previous);
        setTotalPages(Math.ceil((res.data.count || 0) / 10));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUpazillas(1);
  }, [filterDivision, filterDistrict]);

  // ৫. উপজেলা তৈরি করা
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await CM.axiosInstance.post(`/api/upazillas/`, { name, district });
      
      // [Saved Instruction] Sweet Alert for success
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'নতুন উপজেলা সফলভাবে যুক্ত করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });

      setName("");
      setDivision("");
      setDistrict("");
      fetchUpazillas(1);

      const modalEl = document.getElementById('addModal');
      const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
      modalInstance?.hide();

    } catch (err) {
      Swal.fire("Error", "উপজেলা সেভ করা যায়নি। ডুপ্লিকেট নাম কিনা চেক করুন।", "error");
    }
  };

  // ৬. ডিলিট করা
  const handleDelete = (id) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "এটি ডিলিট করলে আর ফিরে পাওয়া যাবে না!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'না'
    }).then((result) => {
      if (result.isConfirmed) {
        CM.axiosInstance.delete(`/api/upazillas/${id}/`)
          .then(() => {
            Swal.fire('মুছে ফেলা হয়েছে!', 'উপজেলাটি ডিলিট করা হয়েছে।', 'success');
            fetchUpazillas(currentPage);
          })
          .catch(() => Swal.fire("Error", "ডিলিট করা সম্ভব হয়নি।", "error"));
      }
    });
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card shadow-lg border-0 rounded-4">
        {/* Header */}
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 fw-bold text-primary">
            <i className="bi bi-geo-fill me-2"></i>Upazilla Management
          </h5>
          <button className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm" data-bs-toggle="modal" data-bs-target="#addModal">
            <i className="bi bi-plus-lg me-1"></i> Add Upazilla
          </button>
        </div>

        {/* Multi-Level Filter */}
        <div className="p-3 bg-white border-bottom">
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select form-select-sm rounded-pill" value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)}>
                <option value="">All Divisions</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm rounded-pill" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} disabled={!filterDivision}>
                <option value="">All Districts</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-muted text-uppercase">
                <th className="px-4 py-3"># SL</th>
                <th>Upazilla</th>
                <th>District</th>
                <th>Division</th>
                <th width="200" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary spinner-border-sm"></div></td></tr>
              ) : upazillas.length > 0 ? (
                upazillas.map((u, i) => (
                  <tr key={u.id}>
                    <td className="px-4 text-muted">{(currentPage - 1) * 10 + i + 1}</td>
                    <td><span className="fw-semibold text-dark">{u.name}</span></td>
                    <td><span className="badge bg-secondary-subtle text-secondary px-3 rounded-pill text-uppercase" style={{fontSize: '10px'}}>{u.district_name}</span></td>
                    <td><span className="badge bg-info-subtle text-info px-3 rounded-pill text-uppercase" style={{fontSize: '10px'}}>{u.division_name}</span></td>
                    <td className="text-center">
                      <div className="btn-group">
                        <Link to={`/dashboard/upazillas/edit/${u.id}`} className="btn btn-sm btn-outline-warning px-3 rounded-start">Edit</Link>
                        <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-outline-danger px-3 rounded-end">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">No data found in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-4" onClick={() => fetchUpazillas(currentPage - 1)} disabled={!prevPage || loading}>Previous</button>
          <span className="small fw-bold text-muted">PAGE {currentPage} OF {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-4" onClick={() => fetchUpazillas(currentPage + 1)} disabled={!nextPage || loading}>Next</button>
        </div>
      </div>

      {/* CREATE Modal */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <form onSubmit={handleCreate} className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0">
              <h5 className="fw-bold m-0 text-primary">Create New Upazilla</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body py-4">
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase">Select Division</label>
                <select className="form-select bg-light border-0" value={division} onChange={(e) => setDivision(e.target.value)} required>
                  <option value="">Choose...</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase">Select District</label>
                <select className="form-select bg-light border-0" value={district} onChange={(e) => setDistrict(e.target.value)} required disabled={!division}>
                  <option value="">Choose...</option>
                  {modalDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-secondary text-uppercase">Upazilla Name</label>
                <input className="form-control bg-light border-0" placeholder="e.g. Satkania" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 shadow">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpazillaList;