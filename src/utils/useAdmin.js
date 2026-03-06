import { useGlobalState } from "../state/provider";

export const useAdmin = () => {
    const [{ profile }] = useGlobalState();
    
    // ১. ডাটা পাথ ঠিক করা: আপনার ব্যাকএন্ড রেসপন্স অনুযায়ী profile.prouser.groups চেক করুন
    // যদি আপনার ব্যাকএন্ড সরাসরি profile.groups পাঠায় তবে এটাই ঠিক আছে।
    const userGroups = profile?.prouser?.groups || profile?.groups || []; 

    const checkGroup = (groupName) => {
        return userGroups.some(group => 
            String(group).toLowerCase().trim() === String(groupName).toLowerCase().trim()
        );
    };

    // ২. রোল চেক করা (বুলিয়ান ভ্যালু নিশ্চিত করা)
    // অনেক সময় Django-তে is_superuser ডাটা prouser এর ভেতর থাকে
    const isSuperUser = profile?.prouser?.is_superuser || profile?.is_superuser || false;
    
    const isAdmin = isSuperUser || checkGroup('admin');
    const isManager = checkGroup('manager');
    const isStaff = profile?.prouser?.is_staff || profile?.is_staff || checkGroup('staff');

    return {
        isAdmin,
        isManager,
        isStaff,
        checkGroup,
        userGroups, // ডিবাগিং এর জন্য এটি রিটার্ন করা ভালো
        currentUser: profile,
        isLoading: !profile // প্রোফাইল না আসা পর্যন্ত এটি ট্রু থাকবে
    };
};

export default useAdmin;