import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { domain } from "../../env";

const StudentNavButtons = ({ studentId }) => {
  const location = useLocation();
  const [status, setStatus] = useState({
    personal: false,
    address: false,
    education: false,
    loading: true,
  });

  useEffect(() => {
    const checkDataStatus = async () => {
      if (!studentId) return;
      try {
        const [resPers, resAddr, resEdu] = await Promise.allSettled([
          axios.get(`${domain}/api/student/${studentId}/`),
          axios.get(`${domain}/api/student_address/${studentId}/`),
          axios.get(`${domain}/api/education/student/${studentId}/`)
        ]);

        setStatus({
          personal: resPers.status === "fulfilled" && !!resPers.value.data,
          address: resAddr.status === "fulfilled" && (Array.isArray(resAddr.value.data) ? resAddr.value.data.length > 0 : !!resAddr.value.data?.id),
          education: resEdu.status === "fulfilled" && (Array.isArray(resEdu.value.data) ? resEdu.value.data.length > 0 : !!resEdu.value.data?.id),
          loading: false,
        });
      } catch (error) {
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };
    checkDataStatus();
  }, [studentId, domain]);

  const isAtAddressPage = location.pathname.includes("student_address");
  const isAtEducationPage = location.pathname.includes("education");

  // --- কড়া সিকোয়েন্সিয়াল লজিক (Sequential Logic) ---

  // ১. এড্রেস লক হবে যদি আগের ধাপ (Personal) এ ডাটা না থাকে।
  // তবে ইউজার যদি অলরেডি এড্রেস পেজে থাকে, তাকে আটকানো হবে না।
  const lockAddress = !status.personal && !isAtAddressPage;

  // ২. এডুকেশন লক হবে যদি তার আগের ধাপ (Address) এ ডাটা না থাকে।
  // তবে ইউজার যদি অলরেডি এডুকেশন পেজে থাকে, তাকে আটকানো হবে না।
  const lockEducation = !status.address && !isAtEducationPage;

  if (status.loading) return <div className="text-center small py-2 text-muted">Checking Status...</div>;

const getButtonClass = (isActive, hasData, isLocked) => {
    // baseClass এ আমরা 'text-reset' বা সরাসরি কালার কন্ট্রোল যোগ করব
    let baseClass = "btn btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 w-100 fw-bold ";
    
    // ১. ডিসেবল বাটন (ধূসর)
    if (isLocked) {
      return baseClass + "btn-light text-danger border opacity-50 pe-none";
    }

    // ২. একটিভ পেজ (নীল ব্যাকগ্রাউন্ড, সাদা টেক্সট)
    if (isActive) {
      return baseClass + "btn-primary shadow text-white";
    }
    
    // ৩. ডাটা থাকলে: বুটস্ট্র্যাপের ডিফল্ট আউটলাইন সাকসেস
    // 'link-underline-opacity-0' এবং 'text-decoration-none' নিশ্চিত করে টেক্সট কালার ঠিক থাকবে
    if (hasData) {
      return baseClass + "btn-outline-success border-2";
    }
    
    // ৪. ডাটা না থাকলে: বুটস্ট্র্যাপের ডিফল্ট আউটলাইন ডেঞ্জার
    return baseClass + "btn-outline-danger border-2";
};

  return (
    <div className="col-md-2 p-3 bg-light rounded-3 d-flex flex-column justify-content-center gap-2 border shadow-sm">
      
      {/* Personal Info */}
      <NavLink
        to={`/StudentPage/${studentId}`}
        className={({ isActive }) => getButtonClass(isActive, status.personal, false)}
      >
        <i className="bi bi-person"></i>  👤 Personal
      </NavLink>

      {/* Address - Personal Data থাকলেই শুধু কাজ করবে */}
      <NavLink
        to={lockAddress ? "#" : `/student_address/${studentId}`}
        onClick={(e) => lockAddress && e.preventDefault()}
        className={({ isActive }) => getButtonClass(isActive, status.address, lockAddress)}
      >
        <i className={`bi ${lockAddress ? "bi-lock-fill" : "bi-house"}`}></i>🏠 Address
      </NavLink>

      {/* Education - Address Data থাকলেই শুধু কাজ করবে */}
      <NavLink
        to={lockEducation ? "#" : `/education/${studentId}`}
        onClick={(e) => lockEducation && e.preventDefault()}
        className={({ isActive }) => getButtonClass(isActive, status.education, lockEducation)}
      >
        <i className={`bi ${lockEducation ? "bi-lock-fill" : "bi-mortarboard"}`}></i> 🎓 Education
      </NavLink>
      
    </div>
  );
};

export default StudentNavButtons;