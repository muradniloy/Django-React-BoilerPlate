import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as CM from "../../../componentExporter"; 
import useStudent from "../../../utils/useStudent"; 

const StudentEducationUpdate = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const studentId = useStudent(propId || state?.id);

  const [student, setStudent] = useState(null); 
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [educationList, setEducationList] = useState([]);

  // সাজেশন স্টেট
  const [suggestions, setSuggestions] = useState({ index: null, field: "", data: [] });

  const getDefaultRows = () => [
    { education_type: "s", education_group: "s", course_name: "", institution_name: "", board: "", roll: "", registration_no: "", result: "", passing_year: "", educational_file: null },
    { education_type: "h", education_group: "s", course_name: "", institution_name: "", board: "", roll: "", registration_no: "", result: "", passing_year: "", educational_file: null }
  ];

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentRes, boardRes, eduRes] = await Promise.all([
          CM.axiosInstance.get(`/api/student/${studentId}/`), 
          CM.axiosInstance.get(`/api/boards/`),
          CM.axiosInstance.get(`/api/education/add/?student_id=${studentId}`)
        ]);

        setStudent(studentRes.data); 
        setBoards(Array.isArray(boardRes.data) ? boardRes.data : boardRes.data?.results || []);

        if (eduRes.data && eduRes.data.length > 0) {
          const formatted = eduRes.data.map(edu => ({
            id: edu?.id || null,
            education_type: edu?.education_type || "s",
            education_group: edu?.education_group || "s",
            course_name: edu?.course_name || "",
            institution_name: edu?.institution_name || "",
            board: edu?.board ? String(edu.board) : "",
            roll: edu?.roll || "",
            registration_no: edu?.registration_no || "",
            result: edu?.result || "",
            passing_year: edu?.passing_year  || "",
            educational_file: null,
            existing_file: edu?.educational_file || null
          }));
          setEducationList(formatted);
        } else {
          setEducationList(getDefaultRows());
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setEducationList(getDefaultRows());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  // সাজেশন ফেচিং লজিক
  const fetchSuggestions = async (index, name, value) => {
    if (value.length >= 4 && (name === "institution_name" || name === "course_name")) {
      try {
        // আপনার ব্যাকএন্ডের প্যারামিটার (query এবং type) অনুযায়ী
        const res = await CM.axiosInstance.get(`/api/education-suggestions/?query=${value}&type=${name}`);
        setSuggestions({ index, field: name, data: res.data || [] });
      } catch (err) {
        console.error("Suggestion Error", err);
      }
    } else {
      setSuggestions({ index: null, field: "", data: [] });
    }
  };

  const handleSelectSuggestion = (index, field, value) => {
    const list = [...educationList];
    list[index][field] = value;
    setEducationList(list);
    setSuggestions({ index: null, field: "", data: [] });
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      CM.Swal.fire("Large File", "ফাইলের সাইজ ৩০০ কেবির বেশি হতে পারবে না।", "warning");
      e.target.value = null;
      return;
    }

    const list = [...educationList];
    list[index].educational_file = file;
    setEducationList(list);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...educationList];
    if (name === "result") {
        if (parseFloat(value) > 5.0) return;
    }
    list[index][name] = value;
    setEducationList(list);
    fetchSuggestions(index, name, value); // সাজেশন কল
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    CM.Swal.fire({
      title: 'সংরক্ষণ হচ্ছে...',
      text: 'দয়া করে অপেক্ষা করুন',
      allowOutsideClick: false,
      didOpen: () => { CM.Swal.showLoading(); }
    });

    try {
      const uploadPromises = educationList.map(edu => {
        const formData = new FormData();
        formData.append('student', studentId);
        formData.append('education_type', edu.education_type);
        formData.append('education_group', edu.education_group);
        formData.append('course_name', edu.course_name || "");
        formData.append('institution_name', edu.institution_name);
        formData.append('board', edu.board);
        formData.append('roll', edu.roll);
        formData.append('registration_no', edu.registration_no || "");
        formData.append('result', edu.result);
        formData.append('passing_year', edu.passing_year);
        
        if (edu.educational_file instanceof File) {
          formData.append('educational_file', edu.educational_file);
        }

        if (edu.id) {
          return CM.axiosInstance.put(`/api/education/update/${edu.id}/`, formData);
        } else {
          return CM.axiosInstance.post(`/api/education/add/`, formData);
        }
      });

      await Promise.all(uploadPromises);

      CM.Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'শিক্ষাগত তথ্য আপডেট করা হয়েছে।',
        timer: 1500,
        showConfirmButton: false
      });
      
      setTimeout(() => navigate(`/education`, { state: { id: studentId } }), 1500);

    } catch (err) {
      console.error(err);
      CM.Swal.fire("এরর", "তথ্য সেভ করতে সমস্যা হয়েছে।", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container mt-2 mb-5 pb-5 px-4">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-primary py-3 text-white d-flex justify-content-between align-items-center">
           <div className="d-flex align-items-center gap-3">
            <img
              src={student?.photo ? (student.photo.startsWith('http') ? student.photo : `${CM.domain}${student.photo}`) : "/default.png"}
              alt="Student"
              className="rounded-circle border shadow-sm"
              style={{ width: '55px', height: '55px', objectFit: 'cover' }}
            />
            <div>
              <h5 className="mb-0 fw-bold text-dark">{student?.first_name} {student?.last_name}</h5>
              <div className="badge bg-light text-primary border rounded-pill px-3 mt-1">
                Student ID: {studentId}
              </div>
            </div>
          </div>
          <h6 className="mb-0 fw-bold"><i className="fa fa-edit me-2"></i>Update Educational Qualifications</h6>
          <button type="button" className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={() => navigate(-1)}>Back</button>
        </div>
        
        <div className="card-body p-4 bg-light">
          <form onSubmit={handleSubmit}>
            {educationList.map((edu, index) => (
              <div key={index} className="mb-4 border-0 rounded-4 bg-white shadow-sm p-4 position-relative border-start border-5 border-primary">
                <div className="row g-3 mb-3">
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Level</label>
                    <select className="form-select form-select-sm border-2 shadow-none" name="education_type" value={edu.education_type} onChange={(e) => handleChange(index, e)} required>
                      <option value="s">SSC</option>
                      <option value="h">HSC</option>
                      <option value="d">Diploma</option>
                      <option value="b">Bachelor</option>
                      <option value="m">Masters</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Group</label>
                    <select className="form-select form-select-sm border-2 shadow-none" name="education_group" value={edu.education_group} onChange={(e) => handleChange(index, e)} required>
                      <option value="s">Science</option>
                      <option value="a">Arts</option>
                      <option value="c">Commerce</option>
                      <option value="t">Technical</option>
                      <option value="n">Nursing</option>
                    </select>
                  </div>
                  
                  {/* Institution Name Input with Suggestion Dropdown */}
                  <div className="col-md-4 position-relative">
                    <label className="form-label small fw-bold text-secondary">Institution Name</label>
                    <input type="text" className="form-control form-control-sm border-2 shadow-none" name="institution_name" value={edu.institution_name} onChange={(e) => handleChange(index, e)} autoComplete="off" required />
                    {suggestions.index === index && suggestions.field === "institution_name" && suggestions.data.length > 0 && (
                      <ul className="list-group position-absolute w-100 shadow-lg z-3 mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {suggestions.data.map((item, i) => (
                          <li key={i} className="list-group-item list-group-item-action small py-1" style={{ cursor: 'pointer' }} onClick={() => handleSelectSuggestion(index, "institution_name", item)}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Roll</label>
                    <input type="text" className="form-control form-control-sm border-2 shadow-none" name="roll" value={edu.roll} onChange={(e) => handleChange(index, e)} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Reg No</label>
                    <input type="text" className="form-control form-control-sm border-2 shadow-none" name="registration_no" value={edu.registration_no} onChange={(e) => handleChange(index, e)} required />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Board</label>
                    <select className="form-select form-select-sm border-2 shadow-none" name="board" value={edu.board} onChange={(e) => handleChange(index, e)} required>
                      <option value="">Select Board</option>
                      {boards.map(b => <option key={b.id} value={String(b.id)}>{b.Board_Name}</option>)}
                    </select>
                  </div>

                  {/* Course Name Input with Suggestion Dropdown */}
                  <div className="col-md-3 position-relative">
                    <label className="form-label small fw-bold text-secondary">Course Name</label>
                    <input type="text" className="form-control form-control-sm border-2 shadow-none" name="course_name" value={edu.course_name} onChange={(e) => handleChange(index, e)} autoComplete="off" required />
                    {suggestions.index === index && suggestions.field === "course_name" && suggestions.data.length > 0 && (
                      <ul className="list-group position-absolute w-100 shadow-lg z-3 mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {suggestions.data.map((item, i) => (
                          <li key={i} className="list-group-item list-group-item-action small py-1" style={{ cursor: 'pointer' }} onClick={() => handleSelectSuggestion(index, "course_name", item)}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Result (GPA)</label>
                    <input type="number" step="0.01" className="form-control form-control-sm border-2 shadow-none" name="result" value={edu.result} onChange={(e) => handleChange(index, e)} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-secondary">Passing Year</label>
                    <input type="number" className="form-control form-control-sm border-2 shadow-none" name="passing_year" value={edu.passing_year} onChange={(e) => handleChange(index, e)} required />
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-primary">Certificate</label>
                    <div className="input-group input-group-sm">
                        <input type="file" className="form-control border-2 shadow-none" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(index, e)} />
                        {edu.existing_file && (
                            <a href={`${CM.domain}${edu.existing_file}`} target="_blank" rel="noreferrer" className="btn btn-primary">
                                <i className="fa fa-eye"></i>
                            </a>
                        )}
                    </div>
                  </div>
                </div>

                {educationList.length > 2 && (
                    <button type="button" className="btn btn-danger position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" style={{width: '25px', height: '25px', padding: '0', fontSize: '12px'}} onClick={() => {const list = [...educationList]; list.splice(index,1); setEducationList(list);}}>
                        <i className="fa fa-times"></i>
                    </button>
                )}
              </div>
            ))}

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-outline-dark rounded-pill px-4 fw-bold shadow-sm btn-sm" onClick={() => setEducationList([...educationList, { education_type: "s", education_group: "s", course_name: "", institution_name: "", board: "", roll: "", registration_no: "", result: "", educational_file: null }])}>
                <i className="fa fa-plus-circle me-2"></i> Add More
              </button>
              <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow btn-sm" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentEducationUpdate;