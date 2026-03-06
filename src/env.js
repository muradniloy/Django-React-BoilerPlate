// import Cookies from 'js-cookie';

const localIP = "192.168.100.150"; 

// এটি অটোমেটিক চেক করবে আপনি কি লোকালহোস্ট নাকি আইপি দিয়ে ব্রাউজ করছেন
export const domain = window.location.hostname === "localhost" 
    ? "http://localhost:8000" 
    : `http://${window.location.hostname}:8000`;

export const userToken =  window.localStorage.getItem("token");
export const header = {
    Authorization: `token ${userToken}`
}
// export const domain = "";

/*
    window.localStorage.setItem('myCat', 'Tom');
    window.localStorage.removeItem('myCat');
    window.localStorage.clear();
    window.localStorage.getItem("token");
*/


// const csrftoken = Cookies.get('csrftoken')
// export const header2 = {
//     Authorization: `token ${token}`,
//     'X-CSRFToken': csrftoken,
// }