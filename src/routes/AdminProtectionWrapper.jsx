import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useGlobalState } from '../state/provider';

const AdminProtectionWrapper = ({ allowedGroups = ['Admin'] }) => {
    const [{ profile }] = useGlobalState();
    const location = useLocation();

    useEffect(() => {
     
        
        // আপনার ডাটা অনুযায়ী চেক করছি
        const groups = profile?.groups || profile?.prouser?.groups;
    
    }, [profile, allowedGroups]);

    // ১. লোডিং স্টেট
    if (profile === undefined) return null;

    // ২. প্রোফাইল না থাকলে
    if (!profile) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // ৩. পারমিশন লজিক (আপনার ডাটা ফরম্যাট অনুযায়ী ফিক্সড)
    // যদি profile.groups থাকে সেটা নিবে, নাহলে profile.prouser.groups চেক করবে
    const userGroups = profile?.groups || profile?.prouser?.groups || [];
    
    const isAdmin = userGroups.some(group => 
        group.toString().toLowerCase() === 'admin'
    );

    const hasPermission = allowedGroups.some(group => 
        userGroups.some(userGroup => userGroup.toString().toLowerCase() === group.toLowerCase())
    ) || isAdmin;

    // ৪. যদি অনুমতি না থাকে
    if (!hasPermission) {
        // [Saved Instruction] Sweet Alert with full debug info
        Swal.fire({
            title: 'অ্যাক্সেস রিফিউজড!',
            html: `
                <div style="text-align: left; font-size: 14px; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <p>🔴 <b>আপনার অনুমতি নেই।</b></p>
                    <p>প্রয়োজনীয় রোল: <span class="badge bg-success">${allowedGroups.join(', ')}</span></p>
                    <p>আপনার রোল: <span class="badge bg-danger">${userGroups.length > 0 ? userGroups.join(', ') : 'পাওয়া যায়নি'}</span></p>
                    <hr/>
                    <small>টিপস: ব্যাকএন্ড থেকে 'groups' ফিল্ডটি ঠিকভাবে আসছে কি না চেক করুন।</small>
                </div>
            `,
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#d33'
        });

        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminProtectionWrapper;