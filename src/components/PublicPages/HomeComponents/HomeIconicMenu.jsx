import React from "react";
import { Link } from "react-router-dom"; // Link ইমপোর্ট করা হয়েছে

export const HomeIconicMenu = () => {
    const menuItems = [
        { 
            icon: "👨‍🏫", 
            title: "Expert Faculty", 
            color: "#0d6efd", 
            desc: "Learn from clinical experts.",
            path: "/faculty-view" // আপনার কাঙ্ক্ষিত লিঙ্ক এখানে দিন
        },
        { 
            icon: "🔬", 
            title: "Modern Labs", 
            color: "#198754", 
            desc: "State-of-the-art simulation labs.",
            path: "/lab-photos"
        },
        { 
            icon: "🎓", 
            title: "Career Support", 
            color: "#ffc107", 
            desc: "100% placement assistance.",
            path: "/career"
        },
        { 
            icon: "🏥", 
            title: "Clinical Training", 
            color: "#dc3545", 
            desc: "Hands-on experience in hospital.",
            path: "/training"
        }
    ];

    return (
        <section className="pb-5 bg-white">
            <div className="container">
                <div className="row g-4 text-center">
                    {menuItems.map((item, idx) => (
                        <div key={idx} className="col-md-3">
                            {/* পুরো কার্ডকে Link দিয়ে র‍্যাপ করা হয়েছে */}
                            <Link to={item.path} className="text-decoration-none h-100 d-block">
                                <div 
                                    className="card border-0 shadow-sm p-4 h-100 iconic-hover" 
                                    style={{ 
                                        borderTop: `4px solid ${item.color}`,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="display-5 mb-3">{item.icon}</div>
                                    <h6 className="fw-bold text-dark">{item.title}</h6>
                                    <p className="small text-muted mb-0">{item.desc}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .iconic-hover { 
                    transition: transform 0.3s ease, box-shadow 0.3s ease; 
                }
                .iconic-hover:hover { 
                    transform: translateY(-10px); 
                    box-shadow: 0 12px 25px rgba(0,0,0,0.1) !important; 
                }
                /* Link এর ডিফল্ট কালার এবং স্টাইল ঠিক রাখার জন্য */
                .text-decoration-none:hover {
                    text-decoration: none;
                }
            `}</style>
        </section>
    );
};