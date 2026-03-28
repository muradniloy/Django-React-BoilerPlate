import React, { useState, useEffect } from "react";
import * as CM from "../../../componentExporter";
import { HomeMarquee } from "./HomeMarquee";
import { domain } from "../../../componentExporter";
import { useSearchParams } from "react-router-dom"; 

const AllNoticeList = () => {
    const [notices, setNotices] = useState([]); 
    const [filteredNotices, setFilteredNotices] = useState([]); 
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    // URL থেকে ক্যাটাগরি নেওয়া (না থাকলে "All")
    const categoryFromUrl = searchParams.get("category") || "All";

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const [nRes, cRes] = await Promise.all([
                    CM.axiosInstance.get("/api/notices/"),
                    CM.axiosInstance.get("/api/notice-categories/")
                ]);
                
                const nData = nRes.data.results || nRes.data;
                const activeNotices = Array.isArray(nData) ? nData.filter(n => n.is_active) : [];
                
                setNotices(activeNotices);
                setCategories(cRes.data.results || cRes.data);
                
                // প্রাথমিক ফিল্টারিং (URL অনুযায়ী)
                applyFiltering(activeNotices, categoryFromUrl);

            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // URL বা নোটিশ লিস্ট চেঞ্জ হলে ফিল্টার আপডেট হবে
    useEffect(() => {
        if (notices.length > 0) {
            applyFiltering(notices, categoryFromUrl);
        }
    }, [categoryFromUrl, notices]);

    const applyFiltering = (allNotices, catFromUrl) => {
        setCurrentPage(1);
        if (catFromUrl === "All") {
            setFilteredNotices(allNotices);
        } else {
            const filtered = allNotices.filter(n => 
                n.category_slug === catFromUrl || n.category_name === catFromUrl
            );
            setFilteredNotices(filtered);
        }
    };

    const handleFilterClick = (catName) => {
        if (catName === "All") {
            searchParams.delete("category");
        } else {
            searchParams.set("category", catName);
        }
        setSearchParams(searchParams);
    };

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 100, behavior: 'smooth' });
    };

    return (
        <div className="homepage-wrapper bg-white">
            <HomeMarquee />
            <section className="py-2">
                <div className="container">
                    {/* Header */}
                    <div className="row justify-content-center mb-2">
                        <div className="col-lg-8 text-center">
                            <div className="notice-title-wrapper position-relative d-inline-block">
                                <h2 className="fw-bold text-dark text-uppercase mb-1" style={{ letterSpacing: '2px', fontSize: '2.2rem' }}>
                                    All <span className="text-primary">Notices</span>
                                </h2>
                                <div className="title-underline mx-auto">
                                    <span className="line-long"></span>
                                    <span className="line-dot"></span>
                                    <span className="line-long"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 mt-2">
                        {/* Filter Section */}
                        <div className="col-lg-2">
                            <h6 className="fw-bold text-dark mb-3 px-1 small text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Filter by Category</h6>
                            <div className="d-flex flex-column gap-2">
                                <button 
                                    onClick={() => handleFilterClick("All")} 
                                    className={`btn btn-sm text-start rounded-0 px-3 py-2 fw-medium ${categoryFromUrl === "All" ? "btn-primary shadow" : "btn-light border"}`}
                                >
                                    All Notices
                                </button>
                                {categories && categories.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        onClick={() => handleFilterClick(cat.slug || cat.name)} 
                                        className={`btn btn-sm text-start rounded-0 px-3 py-2 fw-medium ${categoryFromUrl === (cat.slug || cat.name) ? "btn-primary shadow" : "btn-light border"}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="col-lg-10">
                            <div className="card shadow-sm border-0 rounded-0 overflow-hidden">
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
                                            ) : (currentItems && currentItems.length > 0) ? (
                                                currentItems.map((n, i) => (
                                                    <tr key={i}>
                                                        <td className="ps-4 text-muted small">{n.published_date?.split('T')[0]}</td>
                                                        <td className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                                                            {n.title}
                                                        </td>
                                                        <td>
                                                            <span className="badge py-1 px-3 rounded-0 bg-primary-subtle text-primary small fw-bold">
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

                            {/* Pagination Controls */}
                            {!loading && totalPages > 1 && (
                                <nav className="mt-4">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-0" onClick={() => paginate(currentPage - 1)}>Previous</button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                <button className="page-link rounded-0" onClick={() => paginate(i + 1)}>
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link rounded-0" onClick={() => paginate(currentPage + 1)}>Next</button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .title-underline { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px; }
                    .line-long { width: 40px; height: 3px; background: #0d6efd; border-radius: 10px; }
                    .line-dot { width: 10px; height: 10px; background: #ffc107; border-radius: 50%; }
                    .pagination .page-link { color: #0d6efd; font-size: 13px; font-weight: 600; padding: 8px 16px; border: 1px solid #dee2e6; }
                    .pagination .page-item.active .page-link { background-color: #0d6efd; border-color: #0d6efd; color: white; }
                    .pagination .page-link:focus { box-shadow: none; }
                `}</style>
            </section>
        </div>
    );
};

export default AllNoticeList;