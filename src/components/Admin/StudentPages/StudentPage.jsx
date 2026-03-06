import * as CM from '../../../componentExporter'; 

const StudentPage = () => {
  const location = CM.useLocation();
  const navigate = CM.useNavigate();
  const [student, setStudent] = CM.useState(null);
  const [loading, setLoading] = CM.useState(true);

  // ID চেক: প্রথমে state থেকে, তারপর sessionStorage থেকে
  const studentId = location.state?.id || sessionStorage.getItem("activeStudentId");

  CM.useEffect(() => {
    if (studentId) {
      sessionStorage.setItem("activeStudentId", studentId);

      // ✅ সরাসরি CM.axiosInstance ব্যবহার
      CM.axiosInstance.get(`/api/student/${studentId}/`)
        .then(res => {
          setStudent(res.data);
           CM.Swal.fire({
              title: "Waiting...",
              text: `Profile page is loading`,
              allowOutsideClick: false,
              showConfirmButton: false,
              timer: 500,
              didOpen: () => {
                  CM.Swal.showLoading(); // এটি স্পিনিং অ্যানিমেশন দেখাবে
              }
          });
        })
        .catch(err => {
          console.error("Error fetching student:", err);
          
          // [Saved Instruction] Sweet Alert configuration for errors
          CM.Swal.fire({
            icon: 'error',
            title: 'দুঃখিত!',
            text: err.response?.status === 401 
                  ? 'আপনার লগইন সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।' 
                  : 'শিক্ষার্থীর তথ্য খুঁজে পাওয়া যায়নি।',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'ঠিক আছে'
          });

          if (err.response?.status === 401) {
            navigate("/login");
          } else {
            navigate("/dashboard/students");
          }
        })
        .finally(() => setLoading(false));
    } else {
      // যদি কোনো আইডি-ই না পাওয়া যায়
      CM.Swal.fire({
        icon: 'warning',
        title: 'অ্যাক্সেস ডিনাইড!',
        text: 'সরাসরি এই পেজটি দেখা সম্ভব নয়। তালিকা থেকে শিক্ষার্থী সিলেক্ট করুন।',
        timer: 3000,
        showConfirmButton: false
      });
      navigate("/dashboard/students");
    }
  }, [studentId, navigate]);

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
      <div className="spinner-border text-light" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-white mt-3 fw-bold tracking-wide">তথ্য সংগ্রহ করা হচ্ছে, অপেক্ষা করুন...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {student ? <CM.StudentProfile student={student} /> : null}
    </div>
  );
};

export default StudentPage;