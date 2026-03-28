import React, { useState, useEffect } from "react";
import axios from "axios";
import { domain } from "../../../env";

const FooterSection = () => {
    const [inst, setInst] = useState(null);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await axios.get(`${domain}/api/institution/`);
                const data = res.data.results ? res.data.results[0] : res.data;
                setInst(data);
            } catch (err) {
                console.error("Footer Data Error:", err);
            }
        };
        fetchInstitution();
    }, []);

    // ডেটা লোড না হওয়া পর্যন্ত একটি সাধারণ কপিরাইট টেক্সট দেখাবে
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-white py-2">
            <div className="container text-center">
            
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center opacity-50 small">
                    <p className="mb-0">
                        © {currentYear} {inst?.name || "Nursing College Management System"}. All Rights Reserved.
                    </p>
                    <p className="mb-0 mt-2 mt-md-0">
                        Developed with ❤️ by Spark Software Ltd
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;