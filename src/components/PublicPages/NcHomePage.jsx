import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as CM from "../../componentExporter";

// Import separate components
import { HomeMarquee } from "./HomeComponents/HomeMarquee";
import { HomeSlider } from "./HomeComponents/HomeSlider";
import { HomeNoticeBoard } from "./HomeComponents/HomeNoticeBoard";
import { HomeIconicMenu } from "./HomeComponents/HomeIconicMenu";
import { HomeAbout } from "./HomeComponents/HomeAbout";
import ContactSection from "./HomeComponents/ContractSection";
import FooterSection from "./HomeComponents/FooterSection";
import { ImportantLinks } from "./HomeComponents/ImportantLinks";

const NcHomePage = () => {
    const [notices, setNotices] = useState([]); // মেইন ডেটা
    const [filteredNotices, setFilteredNotices] = useState([]); // যেটা শো করবে
    const [categories, setCategories] = useState([]);
    const [selectedCat, setSelectedCat] = useState("All");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                setFilteredNotices(activeNotices.slice(0, 8)); // শুরুতে ৮টি নোটিশ
                setCategories(cRes.data.results || cRes.data);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const handleFilter = (catName) => {
        setSelectedCat(catName);
        const filtered = catName === "All" 
            ? notices 
            : notices.filter(n => n.category_name === catName);
        setFilteredNotices(filtered.slice(0, 8));
    };

    return (
        <div className="homepage-wrapper bg-white">
            <HomeMarquee />
            <HomeSlider />
            
            {/* ডাটাগুলো প্রপস হিসেবে পাঠানো হচ্ছে */}
           <HomeNoticeBoard 
            loading={loading}
            categories={categories}
            notices={notices} // এই লাইনটি নিশ্চিত করুন (মেইন ডাটা)
            filteredNotices={filteredNotices} // (স্লাইস করা ডাটা)
            selectedCat={selectedCat}
            handleFilter={handleFilter}
            navigate={navigate}
        />
            <HomeAbout/>

            <HomeIconicMenu />
            <ContactSection />
            <ImportantLinks />
            <FooterSection />

         
        </div>
    );
};

export default NcHomePage;