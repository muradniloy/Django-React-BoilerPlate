import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as CM from "../../../componentExporter";
import useStudent from "../../../utils/useStudent";

const StudentNavButtons = ({ studentId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const id = useStudent(studentId);

  const [status, setStatus] = useState({
    personal: false,
    address: false,
    education: false,
    admission: false,
    payment: false,
    loading: true,
  });

  useEffect(() => {
    const checkDataStatus = async () => {
      if (!id) {
        setLoadingStatus(false);
        return;
      }

      try {
        const [resPers, resAddr, resEdu, resAdm, resPay] = await Promise.allSettled([
          CM.axiosInstance.get(`/api/student/${id}/`),
          CM.axiosInstance.get(`/api/student_address/${id}/`),
          // ✅ এডুকেশন ডাটা চেক করার জন্য সঠিক এন্ডপয়েন্ট নিশ্চিত করা হলো
          CM.axiosInstance.get(`/api/education/add/?student_id=${id}`), 
          CM.axiosInstance.get(`/api/student-admission/${id}/`),
          CM.axiosInstance.get(`/api/payment-contacts/by-student/${id}/`)
        ]);

        const hasData = (res) => {
          if (res.status !== "fulfilled") return false;
          const data = res.value.data;
          if (Array.isArray(data)) return data.length > 0;
          // ✅ লজিক পরিবর্তন: যদি অবজেক্টে শুধু student id থাকে কিন্তু অন্য তথ্য না থাকে তবে false দিবে
          if (data && typeof data === 'object') return Object.keys(data).length > 2;
          return !!data;
        };

        setStatus({
          personal: hasData(resPers),
          address: hasData(resAddr),
          education: hasData(resEdu),
          admission: hasData(resAdm),
          payment: hasData(resPay),
          loading: false,
        });

      } catch (error) {
        console.error("Status Check Error:", error);
        setLoadingStatus(false);
      }
    };

    const setLoadingStatus = (val) => setStatus(prev => ({ ...prev, loading: val }));
    checkDataStatus();
  }, [id]);

  const handleNavigation = (path) => {
    navigate(path, { state: { id: id } });
  };

  const currentPath = location.pathname;

  // লকিং লজিক পরিবর্তন
  const lockAddress = !status.personal && currentPath !== "/student_address";
  const lockEducation = !status.address && currentPath !== "/education";
  const lockAdmission = !status.education && currentPath !== "/student_admission"; // ✅ এডুকেশন না থাকলে লক
  const lockPayment = !status.admission && currentPath !== "/student_payment";
  const lockFullView = !status.payment && currentPath !== "/student_full_view";

  const getButtonClass = (targetPath, hasData, isLocked) => {
    const isActive = currentPath === targetPath;
    let baseClass = "btn btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 w-100 fw-bold border-2 mb-1 ";
    
    if (isLocked) return baseClass + "btn-light text-secondary opacity-50 pe-none";
    if (isActive) return baseClass + "btn-primary shadow text-white";
    if (hasData) return baseClass + "btn-outline-success";
    return baseClass + "btn-outline-danger";
  };

  if (status.loading) return <div className="text-center small py-2 text-muted"><div className="spinner-border spinner-border-sm me-2"></div>Checking...</div>;

  return (
    <div className="col-md-2 p-2 bg-white rounded-3 d-flex flex-column gap-1 border shadow-sm h-100">
      <button onClick={() => handleNavigation("/StudentPage")} className={getButtonClass("/StudentPage", status.personal, false)}>
        <i className="bi bi-person-fill"></i> Personal
      </button>

      <button onClick={() => !lockAddress && handleNavigation("/student_address")} className={getButtonClass("/student_address", status.address, lockAddress)} disabled={lockAddress}>
        <i className={`bi ${lockAddress ? "bi-lock-fill" : "bi-house-door-fill"}`}></i> Address
      </button>

      <button onClick={() => !lockEducation && handleNavigation("/education")} className={getButtonClass("/education", status.education, lockEducation)} disabled={lockEducation}>
        <i className={`bi ${lockEducation ? "bi-lock-fill" : "bi-mortarboard-fill"}`}></i> Education
      </button>

      <button onClick={() => !lockAdmission && handleNavigation("/student_admission")} className={getButtonClass("/student_admission", status.admission, lockAdmission)} disabled={lockAdmission}>
        <i className={`bi ${lockAdmission ? "bi-lock-fill" : "bi-patch-check-fill"}`}></i> Admission
      </button>

      <button onClick={() => !lockPayment && handleNavigation("/student_payment")} className={getButtonClass("/student_payment", status.payment, lockPayment)} disabled={lockPayment}>
        <i className={`bi ${lockPayment ? "bi-lock-fill" : "bi-credit-card-fill"}`}></i> Payment
      </button>

      <button onClick={() => !lockFullView && handleNavigation("/student_pay_history")} className={getButtonClass("/student_full_view", status.payment, lockFullView)} disabled={lockFullView}>
        <i className={`bi ${lockFullView ? "bi-lock-fill" : "bi-file-earmark-person-fill"}`}></i> Payment History
      </button>
      <button onClick={() => !lockFullView && handleNavigation("/student_full_view")} className={getButtonClass("/student_full_view", status.payment, lockFullView)} disabled={lockFullView}>
        <i className={`bi ${lockFullView ? "bi-lock-fill" : "bi-file-earmark-person-fill"}`}></i> Full View
      </button>
      <button onClick={() => !lockFullView && handleNavigation("/student_id_card")} className={getButtonClass("/student_id_card", status.payment, lockFullView)} disabled={lockFullView}>
        <i className={`bi ${lockFullView ? "bi-lock-fill" : "bi-file-earmark-person-fill"}`}></i> ID Card
      </button>
    </div>
  );
};

export default StudentNavButtons;