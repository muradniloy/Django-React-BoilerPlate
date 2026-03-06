import React from 'react';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { isInGroup } from '../utils/permissions';

const AdminRoute = ({ currentUser, children }) => {
    
    // ১. ডাটা লোড না হওয়া পর্যন্ত অপেক্ষা
    if (!currentUser) {
        return null; 
    }

    // ২. গ্রুপ চেক (কেস সেনসিটিভ চেক - Admin/admin)
    const isAdmin = isInGroup(currentUser.groups, 'Admin') || isInGroup(currentUser.groups, 'admin');
    console.log(currentUser.groups)
    if (!isAdmin) {
        // ইউজারের জন্য Sweet Alert অ্যালার্ট
        Swal.fire({
            title: 'অ্যাক্সেস ডিনাইড!',
            text: 'এই পেজটি দেখার জন্য অ্যাডমিন পারমিশন প্রয়োজন।',
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'ঠিক আছে',
        });

        // পারমিশন না থাকলে ড্যাশবোর্ড বা হোম পেজে পাঠিয়ে দেবে
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// এই লাইনটি নিশ্চিত করুন (এক্সপোর্ট এরর ফিক্স করার জন্য)
export default AdminRoute;