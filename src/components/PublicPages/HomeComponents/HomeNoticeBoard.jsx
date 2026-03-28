import React from "react";
import { domain } from "../../../componentExporter";

// এখানে 'notices' প্রপসটি যোগ করা হয়েছে যা NcHomePage থেকে আসবে
export const HomeNoticeBoard = ({ loading, categories, notices, filteredNotices, selectedCat, handleFilter, navigate }) => {
    return (
        <section className="py-3">
            <div className="container">
                {/* --- Notice Board Header (Center) --- */}
                <div className="row justify-content-center mb-2">
                    <div className="col-lg-8 text-center">
                        <div className="notice-title-wrapper position-relative d-inline-block">
                            <h2 className="fw-bold text-dark text-uppercase mb-1" style={{ letterSpacing: '2px', fontSize: '2.2rem' }}>
                                Notice <span className="text-primary">Board</span>
                            </h2>
                            <div className="title-underline mx-auto">
                                <span className="line-long"></span>
                                <span className="line-dot"></span>
                                <span className="line-long"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* বাম পাশের ফিল্টার */}
                    <div className="col-lg-2">
                        <h6 className="fw-bold text-dark mb-3 px-1 small text-uppercase">Filter Notice</h6>
                        <div className="d-flex flex-column gap-2">
                            <button 
                                onClick={() => handleFilter("All")} 
                                className={`btn btn-sm text-start rounded-3 px-3 py-2 fw-medium ${selectedCat === "All" ? "btn-primary shadow" : "btn-light border"}`}
                            >
                                All Notices
                            </button>
                            {categories && categories.map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => handleFilter(cat.name)} 
                                    className={`btn btn-sm text-start rounded-3 px-3 py-2 fw-medium ${selectedCat === cat.name ? "btn-primary shadow" : "btn-light border"}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ডান পাশের টেবিল */}
                    <div className="col-lg-10">
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light text-muted small">
                                        <tr>
                                            <th className="ps-4 py-3">DATE</th>
                                            <th>TITLE</th>
                                            <th>CATEGORY</th>
                                            <th className="text-center">FILE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="4" className="text-center py-5">Loading...</td></tr>
                                        ) : (filteredNotices && filteredNotices.length > 0) ? (
                                            filteredNotices.map((n, i) => (
                                                <tr key={i}>
                                                    <td className="ps-4 text-muted small">{n.published_date?.split('T')[0]}</td>
                                                    <td className="fw-bold text-dark">
                                                        {n.title?.split(" ").length > 10 
                                                            ? n.title.split(" ").slice(0, 10).join(" ") + "..." 
                                                            : n.title
                                                        }
                                                    </td>
                                                    <td>
                                                        <span className="badge py-1 px-3 rounded-pill bg-primary text-white small fw-semibold">
                                                            {n.category_name}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {n.attachment ? (
                                                            <a href={n.attachment.startsWith('http') ? n.attachment : `${domain}${n.attachment}`} target="_blank" rel="noreferrer">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                                            </a>
                                                        ) : "--"}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="4" className="text-center py-5">No notices found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* View All Button Logic */}
                        {!loading && notices && (
                            <div className="text-center mt-4">
                                {(selectedCat === "All" ? notices.length : notices.filter(n => n.category_name === selectedCat).length) > 8 && (
                                    <button 
                                        onClick={() => navigate("/all-notices")} 
                                        className="btn btn-outline-primary rounded-0 px-4 py-2 fw-bold shadow-sm hover-up"
                                        style={{ fontSize: '12px', letterSpacing: '1px' }}
                                    >
                                        VIEW ALL NOTICES <i className="fa fa-arrow-right ms-2"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .title-underline { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px; }
                .line-long { width: 40px; height: 3px; background: #0d6efd; border-radius: 10px; }
                .line-dot { width: 10px; height: 10px; background: #ffc107; border-radius: 50%; }
                .hover-up { transition: transform 0.2s ease; }
                .hover-up:hover { transform: translateY(-2px); }
            `}</style>
        </section> 
    );
};