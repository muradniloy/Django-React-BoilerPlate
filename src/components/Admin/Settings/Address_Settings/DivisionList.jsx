import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as CM from "../../../../componentExporter";// CM ইম্পোর্ট করা হলো
import Swal from "sweetalert2";

const DivisionList = () => {
  const [divisions, setDivisions] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ১. ডাটা ফেচ করা (CM.axiosInstance ব্যবহার করে)
  const fetchDivisions = () => {
    setLoading(true);
    // এখানে আলাদা করে হেডার দেওয়ার দরকার নেই যদি axiosInstance এ ইন্টারসেপ্টর থাকে
    CM.axiosInstance.get(`/api/divisions/`) 
      .then((res) => {
        setDivisions(res.data.results || res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          Swal.fire({
            icon: "error",
            title: "সেশন শেষ!",
            text: "দয়া করে আবার লগইন করুন।",
          });
        } else {
          Swal.fire("Error", "ডাটা লোড হচ্ছে না", "error");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  // ২. নতুন ডিভিশন তৈরি
  const handleCreate = (e) => {
    e.preventDefault();
    if (!name) return;

    CM.axiosInstance.post(`/api/divisions/`, { name })
      .then(() => {
        setName("");
        const modalElement = document.getElementById("addModal");
        const modal = window.bootstrap?.Modal?.getInstance(modalElement);
        if (modal) modal.hide();

        // [Saved Instruction] Sweet Alert for success
        Swal.fire({
          icon: "success",
          title: "অভিনন্দন!",
          text: "নতুন ডিভিশন যুক্ত হয়েছে।",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchDivisions();
      })
      .catch(() => {
        Swal.fire("ভুল হয়েছে!", "সেভ করা সম্ভব হয়নি।", "error");
      });
  };

  // ৩. ডিলিট লজিক
  const handleDelete = (id) => {
    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এটি ডিলিট করলে আর ফিরে পাবেন না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
    }).then((result) => {
      if (result.isConfirmed) {
        CM.axiosInstance.delete(`/api/divisions/${id}/`)
          .then(() => {
            Swal.fire("ডিলিট হয়েছে!", "মুছে ফেলা হয়েছে।", "success");
            fetchDivisions();
          })
          .catch(() => {
            Swal.fire("ব্যর্থ!", "মুছে ফেলা সম্ভব হয়নি।", "error");
          });
      }
    });
  };

  return (
    <div className="container mt-5">
      {/* আপনার আগের রিটার্ন করা UI কোড হুবহু এখানে থাকবে */}
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 fw-bold text-primary">Division Directory</h5>
          <button className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm" data-bs-toggle="modal" data-bs-target="#addModal">
            + Add Division
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4"># SL</th>
                <th>Division Name</th>
                <th className="text-center">Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
              ) : (
                divisions.map((d, i) => (
                  <tr key={d.id}>
                    <td className="px-4">{i + 1}</td>
                    <td className="fw-semibold">{d.name}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <Link to={`/dashboard/divisions/edit/${d.id}`} className="btn btn-sm btn-outline-info">Edit</Link>
                        <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CODE ... (আগের মতোই থাকবে) */}
      <div className="modal fade" id="addModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <form onSubmit={handleCreate} className="modal-content border-0 shadow">
            <div className="modal-body py-4">
              <input className="form-control" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" required />
            </div>
            <div className="modal-footer border-0">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DivisionList;