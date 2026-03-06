import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { domain } from "../../../env";
import * as CM from "../../../componentExporter"; // axiosInstance এর জন্য

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState({ username: "", date: "", model: "", changeQuery: "" });
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await CM.axiosInstance.get(`/api/logs/`);
            // API থেকে আসা ডাটা সরাসরি অ্যারে না হলে results থেকে নেবে
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setLogs(data);
        } catch (err) {
            if (err.response?.status === 401) {
                Swal.fire({
                    title: "Session Expired!",
                    text: "Please login again to access audit logs.",
                    icon: "warning",
                    confirmButtonColor: "#3085d6",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // আপনার অরিজিনাল ফিল্টারিং লজিক
    const filteredLogs = logs.filter(log => {
        const usernameMatch = log.changed_by?.toLowerCase().includes(filter.username.toLowerCase()) || false;
        const modelMatch = log.model_name?.toLowerCase().includes(filter.model.toLowerCase()) || false;
        const dateMatch = filter.date === "" || log.history_date?.startsWith(filter.date);
        
        const changeMatch = filter.changeQuery === "" || 
            (log.changes && log.changes.some(c => 
                c.field.toLowerCase().includes(filter.changeQuery.toLowerCase()) ||
                String(c.old).toLowerCase().includes(filter.changeQuery.toLowerCase()) ||
                String(c.new).toLowerCase().includes(filter.changeQuery.toLowerCase())
            )) ||
            (log.object_repr && log.object_repr.toLowerCase().includes(filter.changeQuery.toLowerCase()));

        return usernameMatch && modelMatch && dateMatch && changeMatch;
    });

    // ------------------- Pagination Logic -------------------
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    // এখানে স্লাইস করা হচ্ছে যাতে শুধু ১০টি ডাটা দেখানো হয়
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    // -------------------------------------------------------

    const showDetails = (log) => {
        let contentHtml = "";
        if (log.history_type === '-') {
            contentHtml = `
                <div style="background-color: #fff5f5; border: 1px solid #feb2b2; padding: 15px; border-radius: 8px;">
                    <h6 style="color: #c53030; margin-bottom: 10px;">⚠️ Record Deleted</h6>
                    <p style="margin-bottom: 5px;"><b>Model:</b> ${log.model_name}</p>
                    <p style="margin-bottom: 0;"><b>Deleted Item:</b> <span style="color: #c53030; font-weight: bold;">${log.object_repr || 'Unknown Record'}</span></p>
                </div>
            `;
        } else {
            contentHtml = `
                <h6 class="mt-3">Change Details:</h6>
                <table class="table table-sm border" style="font-size: 13px; text-align: left;">
                    <thead class="table-light">
                        <tr><th>Field</th><th>Old Value</th><th>New Value</th></tr>
                    </thead>
                    <tbody>
                        ${(log.changes || []).map(c => `
                            <tr>
                                <td><b>${c.field}</b></td>
                                <td class="text-danger">${c.old || '∅'}</td>
                                <td class="text-success">${c.new || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        Swal.fire({
            title: `<strong>Audit log Details</strong>`,
            html: `
                <div style="text-align: left; font-family: sans-serif;">
                    <p><b>Performed By:</b> ${log.changed_by || 'System'}</p>
                    <p><b>Date:</b> ${new Date(log.history_date).toLocaleString()}</p>
                    <hr/>
                    ${contentHtml}
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6',
        });
    };

    return (
        <main className="admin-content p-4 bg-secondary-subtle min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">System Audit Logs</h4>
                <button className="btn btn-sm btn-outline-primary" onClick={fetchLogs}>Refresh Logs</button>
            </div>

            {/* Filter Section (আপনার অরিজিনাল ডিজাইন) */}
            <div className="row mb-4 g-2">
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Search User..." 
                        onChange={(e) => {setFilter({...filter, username: e.target.value}); setCurrentPage(1);}} />
                </div>
                <div className="col-md-3">
                    <input type="text" className="form-control" placeholder="Search Model (e.g. Student)..." 
                        onChange={(e) => {setFilter({...filter, model: e.target.value}); setCurrentPage(1);}} />
                </div>
                <div className="col-md-3">
                    <input type="text" className="form-control border-primary" placeholder="Search in Changes/Data..." 
                        onChange={(e) => {setFilter({...filter, changeQuery: e.target.value}); setCurrentPage(1);}} />
                </div>
                <div className="col-md-3">
                    <input type="date" className="form-control" 
                        onChange={(e) => {setFilter({...filter, date: e.target.value}); setCurrentPage(1);}} />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="mt-2">Loading logs...</p>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            {/* টেবিল হেডার হুবহু আপনার ডিজাইন */}
                            <thead className="table-dark">
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User</th>
                                    <th>Model</th>
                                    <th>Action</th>
                                    <th>Quick Summary</th>
                                    <th className="text-center">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs.length > 0 ? currentLogs.map((log, i) => (
                                    <tr key={i}>
                                        <td style={{fontSize: '13px'}}>{new Date(log.history_date).toLocaleString()}</td>
                                        <td className="fw-semibold">{log.changed_by || 'System'}</td>
                                        <td><span className="badge bg-light text-dark border">{log.model_name}</span></td>
                                        <td>
                                            {log.history_type === '+' && <span className="badge bg-success">Created</span>}
                                            {log.history_type === '~' && <span className="badge bg-warning text-dark">Updated</span>}
                                            {log.history_type === '-' && <span className="badge bg-danger">Deleted</span>}
                                        </td>
                                        <td style={{fontSize: '12px', maxWidth: '300px'}}>
                                            {log.history_type === '-' ? (
                                                <span className="text-danger fw-bold italic">
                                                    Removed: {log.object_repr || 'Record'}
                                                </span>
                                            ) : log.changes && log.changes.length > 0 ? (
                                                log.changes.slice(0, 2).map((c, idx) => (
                                                    <div key={idx} className="text-truncate">
                                                        <span className="text-primary fw-bold">{c.field}</span>: {c.old || '∅'} → <span className="text-success">{c.new}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-muted italic">Initial Entry</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white shadow-sm" onClick={() => showDetails(log)}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-4">No matching logs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - আপনার অরিজিনাল ডিজাইনের ক্লাসগুলো দিয়ে */}
                    {totalPages > 1 && (
                        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                            <small className="text-muted">Page {currentPage} of {totalPages}</small>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}