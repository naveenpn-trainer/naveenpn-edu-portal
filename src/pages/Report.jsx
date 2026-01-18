import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Studentdetails.css";

ChartJS.register(
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ChartDataLabels
);

const RegisterStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [companyCode, setCompanyCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [overallAttendance, setOverallAttendance] = useState({ present: 0, absent: 0, late: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("studentDetails");
  const [moduleInfo, setModuleInfo] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  const handleLogout = () => {
    localStorage.removeItem("companyCode");
    navigate("/");
  };

  useEffect(() => {
    const codeFromState = location.state?.companyCode;
    const codeFromStorage = localStorage.getItem("companyCode");

    if (codeFromState) {
      setCompanyCode(codeFromState);
      localStorage.setItem("companyCode", codeFromState);
    } else if (codeFromStorage) {
      setCompanyCode(codeFromStorage);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!companyCode) return;
      try {
        const companyDocRef = doc(db, "CorporateClients", companyCode);
        const docSnap = await getDoc(companyDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCompanyName(data.companyName || companyCode);
        }
      } catch (err) {
        console.error("Error fetching company name:", err);
        setCompanyName(companyCode);
      }
    };

    fetchCompanyName();
  }, [companyCode]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!companyCode) return;
      try {
        const studentsRef = collection(db, "CorporateClients", companyCode, "studentInfo");
        const snapshot = await getDocs(studentsRef);
        const studentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

       

        let present = 0, absent = 0, late = 0;
        studentList.forEach((student) => {
          const attendance = student.attendance || {};
          Object.values(attendance).forEach((status) => {
            if (status === "Present") present++;
            else if (status === "Absent") absent++;
            else if (status === "Late Came") late++;
          });
        });
        setOverallAttendance({ present, absent, late });
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [companyCode]);

  const fetchModules = async () => {
    if (!companyCode) return;
    setLoading(true); // ✅ Start loading
    try {
      const moduleRef = collection(db, "CorporateClients", companyCode, "moduleInfo");
      const snapshot = await getDocs(moduleRef);
      const modules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setModuleInfo(modules);
    } catch (error) {
      console.error("Error fetching module info:", error);
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  const getAttendanceCounts = (attendance = {}) => {
    let present = 0, absent = 0, late = 0;
    Object.values(attendance).forEach((status) => {
      if (status === "Present") present++;
      else if (status === "Absent") absent++;
      else if (status === "Late Came") late++;
    });
    return { present, absent, late };
  };

  const getMarksData = (marks = {}) => {
    const labels = Object.keys(marks);
    const assignmentData = labels.map((mod) => marks[mod]?.assignment || 0);
    const quizData = labels.map((mod) => marks[mod]?.quiz || 0);

    return {
      labels,
      datasets: [
        { label: "Assignment", data: assignmentData, backgroundColor: "#42A5F5" },
        { label: "Quiz", data: quizData, backgroundColor: "#66BB6A" },
      ],
    };
  };

  const getPieData = (attendance) => {
    const { present, absent, late } = getAttendanceCounts(attendance);
    return {
      labels: ["Present", "Absent", "Late Came"],
      datasets: [
        {
          data: [present, absent, late],
          backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
        },
      ],
    };
  };

  const filteredStudents = [...students].filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="top-bar">
        <h2>Student Dashboard - {companyName}</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <div className="register-student-container">
        <div className="view-buttons">
          <button
            className={activeView === "studentDetails" ? "active" : ""}
            onClick={() => setActiveView("studentDetails")}
          >
            Student Details
          </button>
          <button
            className={activeView === "marksSummary" ? "active" : ""}
            onClick={() => setActiveView("marksSummary")}
          >
            Overall Marksheet Summary
          </button>
          <button
            className={activeView === "attendanceSummary" ? "active" : ""}
            onClick={() => setActiveView("attendanceSummary")}
          >
            Overall Attendance Summary
          </button>
          <button
            className={activeView === "modules" ? "active" : ""}
            onClick={() => {
              setActiveView("modules");
              fetchModules();
            }}
          >
            View Modules
          </button>
        </div>

        {activeView === "studentDetails" && (
          <div className="controls">
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {activeView === "studentDetails" && (
          <div className="student-grid">
            {filteredStudents.map((student) => {
              const { present, absent, late } = getAttendanceCounts(student.attendance);
              return (
                <div className="student-card" key={student.id}>
                  <div className="student-info">
                    <h3>{student.name}</h3>
                    <p>{student.email}</p>
                  </div>
                  <div className="attendance-row">
                    <div className="attendance-item present">{present}</div>
                    <div className="attendance-item absent">{absent}</div>
                    <div className="attendance-item late">{late}</div>
                  </div>
                  <button onClick={() => setSelectedStudent(student)}>View More</button>
                </div>
              );
            })}
          </div>
        )}

        {activeView === "marksSummary" && (
          <div className="marks-table" style={{ marginTop: "3rem", overflowX: "auto" }}>
            <h2>📘 Overall Students Marksheet</h2>
            {(() => {
              const allModules = new Set();
              filteredStudents.forEach((student) => {
                const marks = student.marks || {};
                Object.keys(marks).forEach((module) => allModules.add(module));
              });
              const moduleList = Array.from(allModules);

              return (
                <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                  <thead>
                    <tr>
                      <th rowSpan="2">Name</th>
                      {moduleList.map((module) => (
                        <th colSpan="2" key={module}>{module}</th>
                      ))}
                    </tr>
                    <tr>
                      {moduleList.map((module) => (
                        <React.Fragment key={`${module}-sub`}>
                          <th>Assignment</th>
                          <th>Quiz</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const marks = student.marks || {};
                      return (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          {moduleList.map((module) => (
                            <React.Fragment key={`${student.id}-${module}`}>
                              <td>{marks[module]?.assignment ?? "-"}</td>
                              <td>{marks[module]?.quiz ?? "-"}</td>
                            </React.Fragment>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        )}

        {activeView === "attendanceSummary" && (
          <div className="overall-summary" style={{ marginTop: "2rem" }}>
            <h2>🧾 Overall Attendance Summary</h2>
            <div style={{ maxWidth: "300px", margin: "0 auto" }}>
              <Pie
                data={{
                  labels: ["Present", "Absent", "Late Came"],
                  datasets: [
                    {
                      data: [
                        overallAttendance.present,
                        overallAttendance.absent,
                        overallAttendance.late,
                      ],
                      backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { position: "bottom" },
                    datalabels: {
                      formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        return total === 0 ? "0%" : ((value / total) * 100).toFixed(1) + "%";
                      },
                      color: "#fff",
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* ✅ Fixed this condition */}
        {activeView === "modules" && (
          
          <div className="module-cards">
          
          {loading ? (
            <p>Loading module info...</p>
          ) : moduleInfo.length === 0 ? (
            <p>No module information available.</p>
          ) : (
            moduleInfo.map((module) => (
              
              <div className="module-card" key={module.id}>
                <span className={`module-status ${module.status.toLowerCase()}`}>
                  {module.status}
                </span>
                <h3>{module.moduleName}</h3>
                <p><strong>Description:</strong> {module.description}</p>
                <p><strong>Start Date:</strong> {module.startDate}</p>
                <p><strong>End Date:</strong> {module.endDate}</p>
              </div>
            ))
          )}
        </div>
        
        )}
      </div>
    </>
  );
};

export default RegisterStudent;
