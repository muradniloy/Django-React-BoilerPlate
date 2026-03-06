import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const PublicRoute = () => {
    const token = Cookies.get("access");
    const location = useLocation();

    // যদি ইউজার লগইন করা থাকে এবং সে '/login' পেজে যাওয়ার চেষ্টা করে
    // তবেই তাকে ড্যাশবোর্ডে পাঠান। অন্যথায় সব পাবলিক পেজ দেখতে দিন।
    if (token && location.pathname === "/login") {
        return <Navigate to="/dashboard" replace />;
    }

    // হোম পেজ বা অন্য পাবলিক পেজের জন্য সরাসরি Outlet রিটার্ন করুন
    return <Outlet />;
};

export default PublicRoute;