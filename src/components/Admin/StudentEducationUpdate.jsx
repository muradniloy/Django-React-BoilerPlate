import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { domain } from "../../env";

const StudentEducationUpdate = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [educationList, setEducationList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ১. বোর্ড লিস্ট ফেচ করা
        const boardRes = await axios.get(`${domain}/api/boards/`);
        setBoards(Array.isArray(boardRes.data) ? boardRes.data : boardRes.data.results || []);

        // ২. স্টুডেন্ট এডুকেশন ডাটা ফেচ করা
        const eduRes = await axios.get(`${domain}/api/education/student/${studentId}/`);
        
        if (Array.isArray(eduRes.data) && eduRes.data.length > 0) {
          const formatted = eduRes.data.map(edu => ({
            ...edu,
            // বোর্ড আইডিকে স্ট্রিং-এ রূপান্তর (ড্রপডাউন ম্যাচ করার জন্য অত্যন্ত জরুরি)
            board: edu.board ? String(edu.board) : "",
            education_group: edu.education_group || "",
            education_type: edu.education_type || ""
          }));
          setEducationList(formatted);
        } else {
          // নতুন হলে ডিফল্ট ২টা রো
          setEducationList([
            { education_type: "s", education_group: "", institution_name: "", board: "", roll: "", result: "" },
            { education_type: "h", education_group: "", institution_name: "", board: "", roll: "", result: "" }
          ]);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...educationList];
    list[index][name] = value;
    setEducationList(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${domain}/api/education/bulk-update/${studentId}/`, { 
        educations: educationList 
      });
      Swal.fire("Saved", "Education records updated successfully!", "success");
      navigate(`/student_education/${studentId}`);
    } catch (err) {
      Swal.fire("Error", "Check all fields and try again.", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="mb-0 fw-bold">🎓 Update Student Education</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {educationList.map((edu, index) => (
              <div key={index} className="row g-2 mb-3 p-3 border rounded-3 bg-light shadow-sm align-items-end">
                
                {/* Education Level */}
                <div className="col-md-2">
                  <label className="small fw-bold">Level</label>
                  <select className="form-select" name="education_type" value={edu.education_type} onChange={(e) => handleChange(index, e)} required>
                    <option value="">Select</option>
                    <option value="s">SSC</option>
                    <option value="h">HSC</option>
                    <option value="d">Diploma</option>
                    <option value="b">Bachelor</option>
                    <option value="m">Masters</option>
                  </select>
                </div>

                {/* Group - কনসোল অনুযায়ী 'c' = Commerce, 's' = Science */}
                <div className="col-md-2">
                  <label className="small fw-bold">Group</label>
                  <select className="form-select" name="education_group" value={edu.education_group} onChange={(e) => handleChange(index, e)} required>
                    <option value="">Select Group</option>
                    <option value="s">Science</option>
                    <option value="a">Arts</option>
                    <option value="c">Commerce</option>
                    <option value="v">Vocational</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="small fw-bold">Institution</label>
                  <input type="text" className="form-control" name="institution_name" value={edu.institution_name} onChange={(e) => handleChange(index, e)} required />
                </div>

                {/* Board - String ID ম্যাচিং নিশ্চিত করা হয়েছে */}
                <div className="col-md-2">
                  <label className="small fw-bold">Board</label>
                  <select className="form-select" name="board" value={String(edu.board || "")} onChange={(e) => handleChange(index, e)} required>
                    <option value="">Select Board</option>
                    {boards.map(b => (
                      <option key={b.id} value={String(b.id)}>
                        {b.Board_Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-1">
                  <label className="small fw-bold">Roll</label>
                  <input type="text" className="form-control" name="roll" value={edu.roll} onChange={(e) => handleChange(index, e)} required />
                </div>

                <div className="col-md-1">
                  <label className="small fw-bold">GPA</label>
                  <input type="text" className="form-control" name="result" value={edu.result} onChange={(e) => handleChange(index, e)} required />
                </div>

                <div className="col-md-1">
                  {educationList.length > 2 && (
                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => {
                      const list = [...educationList];
                      list.splice(index, 1);
                      setEducationList(list);
                    }}>🗑️</button>
                  )}
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setEducationList([...educationList, { education_type: "", education_group: "", institution_name: "", board: "", roll: "", result: "" }])}>
                ➕ Add Another
              </button>
              <button type="submit" className="btn btn-success px-5 fw-bold shadow-sm">💾 Save Records</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentEducationUpdate;