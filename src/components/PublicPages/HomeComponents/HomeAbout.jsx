import React from "react";
import { Link } from "react-router-dom";

export const HomeAbout = () => {
    return (
        <section className="container py-2 mb-3 bg-light">
            <div className="container">

                <div className="row align-items-center g-5">

                    {/* Image Section */}
                    <div className="col-lg-6">
                        <div className="position-relative">
                            <img
                                src="/images/slider-2.jpg"
                                alt="Campus"
                                className="img-fluid rounded-3 shadow"
                                style={{ height: "350px", objectFit: "cover", width: "100%" }}
                            />

                            {/* Experience Badge */}
                            <div className="position-absolute top-0 start-0 translate-middle bg-primary text-white px-4 py-2 shadow">
                                <h5 className="mb-0 fw-bold">12+</h5>
                                <small>Years Experience</small>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="col-lg-6">
                        <span className="text-primary fw-bold text-uppercase small">
                            About Us
                        </span>

                        <h2 className="fw-bold mb-3">
                            World Nursing College
                        </h2>

                        <p className="text-muted mb-4" style={{ lineHeight: "1.8" }}>
                            আমাদের কলেজটি দক্ষ ও সেবাব্রতী নার্স গড়ার লক্ষ্যে প্রতিষ্ঠিত।
                            আন্তর্জাতিক মানের কারিকুলাম এবং আধুনিক ক্লিনিক্যাল প্রশিক্ষণের মাধ্যমে
                            শিক্ষার্থীদের ভবিষ্যৎ স্বাস্থ্যসেবার জন্য প্রস্তুত করা হয়।
                        </p>

                        {/* Features */}
                        <div className="row g-3 mb-4">

                            <div className="col-6">
                                <div className="d-flex align-items-center gap-3 p-3 bg-white shadow-sm rounded">
                                    <i className="fa fa-university text-primary fs-4"></i>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Govt Approved</h6>
                                        <small className="text-muted">BNMC Recognized</small>
                                    </div>
                                </div>
                            </div>

                            <div className="col-6">
                                <div className="d-flex align-items-center gap-3 p-3 bg-white shadow-sm rounded">
                                    <i className="fa fa-vial text-primary fs-4"></i>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Modern Labs</h6>
                                        <small className="text-muted">Latest Equipment</small>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Button */}
                      <Link to="/college-profile">
                        <button className="btn btn-primary px-4 py-2 fw-bold shadow">
                            View College Profile →
                        </button>
                    </Link>

                    </div>

                </div>
            </div>
        </section>
    );
};