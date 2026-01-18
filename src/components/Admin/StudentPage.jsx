import React, { useEffect, useState } from "react";
import StudentProfile from "./StudentProfile";
import axios from "axios";
import { domain } from "../../env";
import { useParams } from 'react-router-dom';

const StudentPage = () => {
  const { id } = useParams(); 
  const [student, setStudent] = useState(null);
console.log(student)
  useEffect(() => {
    // Example API call
    axios.get(`${domain}/api/student/${id}/`)  // replace with your API endpoint
      .then(res => setStudent(res.data))
      .catch(err => console.log(err));
  }, [id]);

  return <StudentProfile student={student} />;
};

export default StudentPage;
