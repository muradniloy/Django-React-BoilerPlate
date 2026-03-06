import React from "react";

const NcHomePage = () => {
  return (
    <>
      {/* ===== Text Slider ===== */}
      <div className="text-slider py-2">
        <div className="container">
          <p className="mb-0 fw-semibold">
            📢 Admission Open 2026 | 📢 BSc, Diploma & Midwifery Programs | 📢 Apply
            Online Now
          </p>
        </div>
      </div>

      {/* ===== Image Slider ===== */}
      <div
        id="slider"
        className="carousel slide"
        data-bs-ride="carousel"
        >
        <div className="carousel-inner">
          <div
            className="carousel-item active"
          style={{
            backgroundImage: "url('/images/slider-2.jpg')",
            height: "85vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            }}
          >
            <div className="overlay d-flex align-items-center h-100">
              <div className="container text-center text-white">
                <h1 className="display-5 fw-bold">
                  Welcome to Nursing College
                </h1>
                <p className="lead">Excellence in Nursing Education</p>
              </div>
            </div>
          </div>

          <div
            className="carousel-item"
              style={{
            backgroundImage: "url('/images/slider-4.jpg')",
            height: "85vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            }}
          >
            
            <div className="overlay d-flex align-items-center h-100">
              <div className="container text-center text-white">
                <h1 className="display-5 fw-bold">
                  Modern Clinical Training
                </h1>
              </div>
            </div>
          </div>
                <div
            className="carousel-item"
              style={{
            backgroundImage: "url('/images/slider-1.jpg')",
            height: "85vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            }}
          >
            
            <div className="overlay d-flex align-items-center h-100">
              <div className="container text-center text-white">
                <h1 className="display-5 fw-bold">
                  Modern Clinical Training
                </h1>
              </div>
            </div>
          </div>
                <div
            className="carousel-item"
              style={{
            backgroundImage: "url('/images/slider-9.jpg')",
            height: "85vh",
            backgroundSize: "cover",
            backgroundPosition: "center",
            }}
          >
            
            <div className="overlay d-flex align-items-center h-100">
              <div className="container text-center text-white">
                <h1 className="display-5 fw-bold">
                  Modern Clinical Training
                </h1>
              </div>
            </div>
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#slider"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#slider"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* ===== Notice Board ===== */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="notice-box bg-white p-4">
                <h4 className="text-primary fw-bold">
                  📌 Notice Board
                </h4>
                <ul className="list-unstyled mt-3">
                  <li>📄 Admission Circular 2026</li>
                  <li>📄 BSc Nursing Form Submission</li>
                  <li>📄 Diploma Exam Routine</li>
                  <li>📄 Internship Notice</li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="notice-box bg-white p-4">
                <h4 className="text-primary fw-bold">
                  🏥 About College
                </h4>
                <p className="text-muted mt-3">
                  We prepare professional nurses with strong academic knowledge
                  and hands-on clinical training.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Iconic Options ===== */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="icon-card shadow p-4">
                <div style={{ fontSize: "40px" }}>👩‍⚕️</div>
                <h6 className="mt-3">Expert Faculty</h6>
              </div>
            </div>

            <div className="col-md-3">
              <div className="icon-card shadow p-4">
                <div style={{ fontSize: "40px" }}>🏥</div>
                <h6 className="mt-3">Clinical Practice</h6>
              </div>
            </div>

            <div className="col-md-3">
              <div className="icon-card shadow p-4">
                <div style={{ fontSize: "40px" }}>🔬</div>
                <h6 className="mt-3">Modern Lab</h6>
              </div>
            </div>

            <div className="col-md-3">
              <div className="icon-card shadow p-4">
                <div style={{ fontSize: "40px" }}>💼</div>
                <h6 className="mt-3">Career Support</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="text-center py-3 bg-dark text-white">
        <p className="mb-0">
          © 2026 Nursing College | All Rights Reserved
        </p>
      </footer>
    </>
  );
};

export default NcHomePage;
