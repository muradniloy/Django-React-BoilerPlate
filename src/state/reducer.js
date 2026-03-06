import Cookies from "js-cookie";

export const initialstate = {
    profile: null,
    // সেশন কুকি থেকে ডাটা রিড করা
    access: Cookies.get("access") || null,
    refresh: Cookies.get("refresh") || null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case "ADD_DATA":
            // ১. পুরনো লোকাল বা সেশন স্টোরেজ থাকলে তা পুরোপুরি মুছে ফেলা
            localStorage.clear();
            sessionStorage.clear();

            // ২. নতুন ডাটা সেশন কুকিতে সেট করা (Expires নেই, তাই ব্রাউজার ক্লোজে মুছে যাবে)
            Cookies.set("access", action.access);
            Cookies.set("refresh", action.refresh);

            return {
                ...state,
                access: action.access,
                refresh: action.refresh
            };

        case "ADD_PROFILE":
            // প্রোফাইল ডাটা স্টেটে সেভ করা
            return {
                ...state,
                profile: action.profile
            };
        
        // আপনার Login.jsx এ যদি SET_PROFILE বা SET_TOKENS থাকে, তবে সেগুলোকে সাপোর্ট দেওয়া
        case "SET_PROFILE":
            return { ...state, profile: action.profile };
            
        case "SET_TOKENS":
            Cookies.set("access", action.access);
            Cookies.set("refresh", action.refresh);
            return { ...state, access: action.access, refresh: action.refresh };

        case "LOGOUT":
            // ৩. সব জায়গা থেকে ডাটা রিমুভ করা
            Cookies.remove("access");
            Cookies.remove("refresh");
            localStorage.clear();
            sessionStorage.clear();
            
            return {
                ...state,
                profile: null,
                access: null,
                refresh: null
            };

        default:
            return state;
    }
};

export default reducer;