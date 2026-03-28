import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { domain } from "../../../env";

export const HomeSlider = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef(null);

    // এপিআই থেকে ডেটা ফেচ করা
    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const res = await axios.get(`${domain}/api/home-sliders/`);
                const data = res.data.results || res.data;

                if (Array.isArray(data)) {
                    const filtered = data.filter(slider => {
                        const hasHomeId = slider.positions?.includes(1);
                        const hasHomeSlug = (slider.positions_details || slider.positions)?.some(
                            pos => typeof pos === 'object' && pos.slug === 'home_section'
                        );
                        return (hasHomeId || hasHomeSlug) && slider.active !== false;
                    });
                    setSliders(filtered);
                }
            } catch (err) {
                console.error("Slider loading error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSliders();
    }, []);

    // ১০ সেকেন্ড টাইমার ফাংশন (useCallback দিয়ে র‍্যাপ করা হয়েছে ওয়ার্নিং সরানোর জন্য)
    const startTimer = useCallback(() => {
        clearInterval(intervalRef.current);
        if (sliders.length > 1) {
            intervalRef.current = setInterval(() => {
                setActiveIndex((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
            }, 5000);
        }
    }, [sliders.length]);

    // অটো-প্লে ইফেক্ট
    useEffect(() => {
        startTimer();
        return () => clearInterval(intervalRef.current);
    }, [startTimer]);

    if (loading || sliders.length === 0) return null;

    // নেভিগেশন কন্ট্রোল
    const nextSlide = () => {
        setActiveIndex((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
        startTimer();
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
        startTimer();
    };

    return (
        <div className="container mt-3 px-2 px-md-0">
            {/* মেইন বর্ডার র‍্যাপার */}
            <div className="slider-border-wrapper p-2 rounded-5 bg-white shadow-lg border-dashed border-2 border-primary overflow-hidden">
                
                <div id="heroSlider" className="carousel-container rounded-4 overflow-hidden position-relative" style={{ height: "60vh" }}>
                    
                    {/* সেন্টারে থাকা ইন্ডিকেটর ডটস */}
                    <div className="custom-indicators">
                        {sliders.map((_, index) => (
                            <button 
                                key={index} 
                                className={`dot ${index === activeIndex ? "active" : ""}`}
                                onClick={() => { setActiveIndex(index); startTimer(); }}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <div className="carousel-wrapper h-100 w-100 position-relative">
                        {sliders.map((slider, i) => (
                            <div 
                                key={slider.id} 
                                className={`custom-slide ${i === activeIndex ? "active" : "inactive"}`}
                            >
                                {/* ব্যাকগ্রাউন্ড ইমেজ উইথ কেন-বার্নস জুম */}
                                <div 
                                    className="zoom-bg"
                                    style={{ 
                                        position: "absolute",
                                        top: 0, left: 0, width: "100%", height: "100%",
                                        background: `url(${slider.image}) center/cover no-repeat`,
                                    }}
                                />

                                {/* ব্লার এবং গ্রাডিয়েন্ট ওভারলে */}
                                <div className="overlay-layer h-100 w-100 d-flex align-items-center justify-content-center" 
                                     style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))", position: "relative", zIndex: 2 }}>
                                    
                                    <div className="container px-5 text-center">
                                        <h1 className="outline-title mb-2 fw-bolder">
                                            {slider.title}
                                        </h1>
                                        
                                        <p className="lead text-white opacity-90 mx-auto w-75 d-none d-md-block mb-4 small">
                                            {slider.subtitle}
                                        </p>
                                        
                                        <Link to={slider.button_url || "/admission-query"} className="text-decoration-none">
                                            <button className="btn btn-outline-warning rounded-pill px-5 py-2 fw-bold text-uppercase">
                                                {slider.button_text || "Explore Now"}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* প্রিভিয়াস এবং নেক্সট বাটন */}
                    <button className="nav-btn prev" onClick={prevSlide}>
                        <span className="carousel-control-prev-icon bg-primary rounded-circle p-3" aria-hidden="true"></span>
                    </button>
                    <button className="nav-btn next" onClick={nextSlide}>
                        <span className="carousel-control-next-icon bg-primary rounded-circle p-3" aria-hidden="true"></span>
                    </button>
                </div>
            </div>

            {/* কাস্টম সিএসএস */}
            <style>{`
                .carousel-container { background: #000; position: relative; }

                /* ইন্ডিকেটর সেন্টারিং */
                .custom-indicators {
                    position: absolute;
                    bottom: 20px;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10;
                    gap: 10px;
                }

                .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    background: transparent;
                    padding: 0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    opacity: 0.5;
                }

                .dot.active {
                    background: white;
                    opacity: 1;
                    transform: scale(1.3);
                }

                /* স্মুথ ফেইড ট্রানজিশন */
                .custom-slide {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    opacity: 0; visibility: hidden;
                    transition: opacity 1.5s ease-in-out; /* ১.৫ সেকেন্ড ধরে স্মুথলি চেঞ্জ হবে */
                    z-index: 1;
                }

                .custom-slide.active { opacity: 1; visibility: visible; z-index: 2; }

                /* কেন বার্নস জুম ইফেক্ট */
                .active .zoom-bg { animation: kenburns 12s infinite alternate; }
                @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.18); } }

                /* টেক্সট অ্যানিমেশন */
                .active .outline-title { animation: fadeInBlur 1.2s ease-out 0.4s both; }
                .active .lead { animation: fadeInBlur 1.2s ease-out 0.6s both; }
                .active .btn { animation: fadeInBlur 1.2s ease-out 0.8s both; }

                @keyframes fadeInBlur {
                    from { opacity: 0; filter: blur(10px); transform: translateY(30px); }
                    to { opacity: 1; filter: blur(0); transform: translateY(0); }
                }

                .outline-title {
                    font-size: 2.5rem;
                    color: transparent;
                    -webkit-text-stroke: 1px white;
                    letter-spacing: 4px;
                }

                .btn-outline-warning { color: white; border: 2px solid #ffc107; background: transparent; transition: 0.3s; }
                .btn-outline-warning:hover { color: black; background: #ffc107; }

                .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: none; border: none; z-index: 10; cursor: pointer; }
                .prev { left: 20px; }
                .next { right: 20px; }

                @media (max-width: 768px) {
                    .outline-title { font-size: 1.6rem; }
                    .carousel-container { height: 45vh !important; }
                }
            `}</style>
        </div>
    );
};