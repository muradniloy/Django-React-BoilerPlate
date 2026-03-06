import React, { useRef } from "react";
import * as CM from "../../../componentExporter";
import useStudent from "../../../utils/useStudent";
import { useParams, useNavigate } from "react-router-dom";

const StudentIDCard = ({ studentId: propId }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const studentId = useStudent(propId || paramId);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    if (!studentId) return;
    const fetchData = async () => {
      try {
        const [profRes, admRes] = await Promise.all([
          CM.axiosInstance.get(`/api/student/${studentId}/`),
          CM.axiosInstance.get(`/api/student-admission/${studentId}/`),
        ]);
        setData({
          profile: profRes.data,
          admission: admRes.data,
        });
      } catch (err) {
        CM.Swal.fire("Error", "Failed to load ID card data", "error");
      }
    };
    fetchData();
  }, [studentId]);

  if (!data) return <div className="text-center mt-5">Loading ID Card...</div>;

  return (
    <div className="id-card-page-wrapper py-5 bg-white min-vh-100">
      <div className="d-print-none text-center mb-4">
        <button className="btn btn-primary px-5 rounded-pill shadow" onClick={() => window.print()}>
          <i className="fa fa-print me-2"></i> Print ID Card
        </button>
        <button className="btn btn-outline-secondary ms-2 rounded-pill" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="id-card-container">
        {/* --- FRONT PART --- */}
        <div className="id-card front-side">
          <div className="card-header-design">
            <h5 className="college-name text-uppercase">Your College Name</h5>
            <p className="college-tagline">Education & Excellence</p>
          </div>
          
          <div className="profile-section text-center">
            <div className="photo-frame">
              <img 
                src={data.profile?.photo ? `${CM.domain}${data.profile.photo}` : "/default.png"} 
                alt="Student" 
              />
            </div>
            <h4 className="student-name text-uppercase">{data.profile?.first_name} {data.profile?.last_name}</h4>
            <p className="student-designation">STUDENT</p>
          </div>

          <div className="info-section">
            <div className="info-row">
              <span className="label">Student ID</span>
              <span className="value">: {data.admission?.student_id_no || studentId}</span>
            </div>
            <div className="info-row">
              <span className="label">Program</span>
              <span className="value">: {data.admission?.Program_Name_display}</span>
            </div>
            <div className="info-row">
              <span className="label">Session</span>
              <span className="value">: {data.admission?.Session_display}</span>
            </div>
            <div className="info-row">
              <span className="label">Blood Group</span>
              <span className="value">: {data.profile?.blood_group || "N/A"}</span>
            </div>
          </div>
          <div className="card-footer-strip"></div>
        </div>

        {/* --- BACK PART --- */}
        <div className="id-card back-side">
          <div className="back-top-bar">TERMS & CONDITIONS</div>
          <ul className="rules-list">
            <li>This card is non-transferable.</li>
            <li>Loss of card must be reported immediately.</li>
            <li>Always carry this card while in the campus.</li>
            <li>If found, please return to the college office.</li>
          </ul>

          <div className="contact-info text-center mt-3">
            <p className="m-0 fw-bold">Contact:</p>
            <p className="small text-muted">{data.profile?.mobile} | {data.profile?.email}</p>
          </div>

          <div className="signature-area d-flex justify-content-around align-items-end">
            <div className="sign-box">
              <div className="line"></div>
              <span>Student</span>
            </div>
            <div className="sign-box">
              <div className="line"></div>
              <span>Principal</span>
            </div>
          </div>
          <div className="back-footer-strip">
            www.yourcollege.com
          </div>
        </div>
      </div>

      <style>{`
        /* --- General Layout --- */
        .id-card-container {
          display: flex;
          justify-content: center;
          gap: 50px;
          flex-wrap: wrap;
        }

        .id-card {
          width: 325px; /* Standard ID Card Width */
          height: 500px; /* Standard ID Card Height */
          background: #fff;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* --- Front Side Styling --- */
        .card-header-design {
          background: #1a237e;
          color: white;
          padding: 20px 10px;
          text-align: center;
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        .college-name { font-size: 18px; font-weight: 800; margin: 0; }
        .college-tagline { font-size: 10px; opacity: 0.8; margin: 0; }

        .photo-frame {
          width: 110px;
          height: 110px;
          margin: 15px auto;
          border: 4px solid #1a237e;
          border-radius: 10px;
          overflow: hidden;
          background: #f8f9fa;
        }
        .photo-frame img { width: 100%; height: 100%; object-fit: cover; }

        .student-name { font-size: 18px; color: #1a237e; margin: 5px 0 0; }
        .student-designation { font-size: 12px; letter-spacing: 2px; color: #666; font-weight: bold; }

        .info-section { padding: 20px 30px; }
        .info-row { display: flex; font-size: 13px; margin-bottom: 8px; color: #333; }
        .info-row .label { width: 90px; font-weight: 600; color: #555; }
        .info-row .value { font-weight: 700; color: #000; }

        .card-footer-strip {
          position: absolute; bottom: 0; width: 100%; height: 15px; background: #1a237e;
        }

        /* --- Back Side Styling --- */
        .back-side { display: flex; flex-direction: column; padding: 0; }
        .back-top-bar { background: #1a237e; color: white; text-align: center; padding: 10px; font-weight: bold; font-size: 12px; }
        .rules-list { padding: 20px 30px; font-size: 11px; color: #444; margin: 0; flex-grow: 1; }
        .rules-list li { margin-bottom: 10px; }

        .signature-area { padding: 20px; }
        .sign-box { text-align: center; width: 80px; }
        .sign-box .line { border-top: 1px solid #000; margin-bottom: 5px; }
        .sign-box span { font-size: 10px; font-weight: bold; }

        .back-footer-strip {
          background: #eee; text-align: center; padding: 10px; font-size: 11px; font-weight: bold; color: #1a237e;
        }

        /* --- Print Optimization --- */
        @media print {
          body { background: none; }
          .d-print-none { display: none !important; }
          .id-card-container { display: block; margin: 0; }
          .id-card { 
            box-shadow: none; 
            border: 1px solid #000; 
            margin: 20px auto; 
            page-break-after: always; /* এক পেজে একটি পার্ট আসবে */
            -webkit-print-color-adjust: exact; 
          }
        }
      `}</style>
    </div>
  );
};

export default StudentIDCard;