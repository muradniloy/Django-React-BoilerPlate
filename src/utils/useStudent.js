import { useState, useEffect } from "react";

const useStudent = (propId) => {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const id = propId || sessionStorage.getItem("activeStudentId");
    setActiveId(id);
  }, [propId]);

  return activeId;
};

export default useStudent;