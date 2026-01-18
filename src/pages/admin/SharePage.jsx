import React, { useEffect, useState, lazy, Suspense } from "react";
import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import "./SharePage.css";
import { useLocation } from "react-router-dom";
import { PieChart } from "react-minimal-pie-chart";
import { FaCalendarAlt, FaFilePdf } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const getToday = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const Navbar = lazy(() => import("./Navbar"));
const NavbarApp = lazy(() => import("./NavbarApp"));

const SharePage = () => {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [students, setStudents] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [modules, setModules] = useState([]);
  const [companyName, setCompanyName] = useState("Loading...");
  const [programName, setProgramName] = useState("");
  const [attendanceData, setAttendanceData] = useState({
    Present: 0,
    Absent: 0,
    Late: 0,
  });

  const location = useLocation();
  const companyCode = localStorage.getItem("companyCode");
  const NavbarComponent = location.pathname.includes("/app") ? NavbarApp : Navbar;
  const todayFormatted = getToday();

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const companyRef = doc(db, "CorporateClients", companyCode);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          setCompanyName(companySnap.data().companyName || "Unknown");
        } else {
          setCompanyName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching company name:", error);
        setCompanyName("Error");
      }
    };

    if (companyCode) {
      fetchCompanyName();
    }
  }, [companyCode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyDocRef = doc(db, "CorporateClients", companyCode);
        const companySnapshot = await getDoc(companyDocRef);

        if (companySnapshot.exists()) {
          const data = companySnapshot.data();
          const admins = data.adminEmails || [];
          setAdminEmails(admins);

          const companyName = data.companyName || companyCode;
          setCompanyName(companyName);

          const programName = data.programName || "Not Defined";
          setProgramName(programName);
          
          const studentsRef = collection(db, "CorporateClients", companyCode, "studentInfo");
          const snapshot = await getDocs(studentsRef);

          const studentList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setStudents(studentList);
        } else {
          alert("Invalid company code.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyCode]);

 const getAvailableCourses = async (companyCode) => {
  try {
    const coursesRef = collection(db, `CorporateClients/${companyCode}/programInfo`);
    const snapshot = await getDocs(coursesRef);
    const courses = snapshot.docs.map(doc => doc.id);
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

const CourseSelectionModal = ({ courses, onSelectCourse, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h3>Select a Course to Share</h3>
        <div style={{ margin: '20px 0' }}>
          {courses.map(course => (
            <button
              key={course}
              onClick={() => onSelectCourse(course)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                margin: '5px 0',
                cursor: 'pointer'
              }}
            >
              {course}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ padding: '8px 16px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

   const handleMarksShare = async (e) => {
    e.preventDefault();

    if (!companyCode) {
      alert("Company code is missing.");
      return;
    }

    try {
      const courses = await getAvailableCourses(companyCode);
      
      if (courses.length === 0) {
        alert("No courses found for this company.");
        return;
      }

      setAvailableCourses(courses);
      setShowCourseModal(true);
    } catch (error) {
      console.error("Error sharing marks:", error);
      alert("An error occurred while sharing marks.");
    }
  };
let hasNonZeroAssignment = false;

students.forEach((student) => {
  const courses = student.marks || {};
  if (courses[selectedCourse]) {
    Object.entries(courses[selectedCourse]).forEach(([module, scores]) => {
      const assignmentScore = Number(scores.assignment ?? 0);
      if (assignmentScore > 0) {
        hasNonZeroAssignment = true;
      }
    });
  }
});

const handleCourseSelection = async (selectedCourse) => {
  setSelectedCourse(selectedCourse);
  setShowCourseModal(false);
  
  try {
	   let hasNonZeroAssignment = false;
    const studentData = {};
    let allRows = [];
	
	 // First pass: detect if any assignment is non-zero
    students.forEach((student) => {
      const courses = student.marks || {};
      if (courses[selectedCourse]) {
        Object.entries(courses[selectedCourse]).forEach(([module, scores]) => {
         const assignmentScore = Number(scores.assignment ?? 0);
          if (assignmentScore > 0 && assignmentScore !== -1) {
            hasNonZeroAssignment = true;
          }
        });
      }
    });

    // Organize data by student
    students.forEach((student) => {
      const fullName = student.fullName || "N/A";
      const studentId = student.id || "";
      const courses = student.marks || {};

      if (courses[selectedCourse]) {
        const studentModules = [];
        
        Object.entries(courses[selectedCourse]).forEach(([module, scores]) => {
          // Format module name (M01 -> Module 01) and extract numeric part
          const moduleNumber = module.match(/\d+/)?.[0]?.padStart(2, '0') || '00';
			const formattedModule = module || "N/A";
			
		// Round and handle -1 to "N/A"
 
          let quizScore = Number(scores.quiz ?? 0);
          let assignmentScore = Number(scores.assignment ?? 0);

          quizScore = quizScore === -1 ? "N/A" : Math.round((quizScore / 40) * 100);
          assignmentScore = assignmentScore === -1 ? "N/A" : Math.round((assignmentScore / 60) * 100);
          const comment = scores.comment || "";

          studentModules.push({
            module: formattedModule,
            moduleNumber: parseInt(moduleNumber),
            quiz:quizScore,
			assignment:assignmentScore,
            comment
          });
        });

        // Sort modules by their numeric value
        studentModules.sort((a, b) => a.moduleNumber - b.moduleNumber);

        studentData[studentId] = {
          name: fullName,
          modules: studentModules
        };

        // Add to allRows array with student info
        studentModules.forEach((module, index) => {
          allRows.push({
            studentId,
            name: fullName,
            course: selectedCourse,
            module: module.module,
            quiz: module.quiz,
			assignment: module.assignment,
            comment: module.comment,
            isFirstRow: index === 0,
            moduleCount: studentModules.length
          });
        });
      }
    });

    // Sort all rows by student ID
    allRows.sort((a, b) => a.studentId.localeCompare(b.studentId));

    let tableBody = "";
    let rowCounter = 1;

    allRows.forEach((row) => {
      tableBody += `
        <tr>
          
          ${row.isFirstRow ? 
            `<td rowspan="${row.moduleCount}">${row.name}</td>` : ''}
          ${row.isFirstRow ? 
            `<td rowspan="${row.moduleCount}">${row.course}</td>` : ''}
          <td>${row.module}</td>
		  ${hasNonZeroAssignment ? `<td>${row.assignment}</td>` : ""}
          <td>${row.quiz}</td>
          <td>${row.comment}</td>
        </tr>
      `;
      rowCounter++;
    });
	
	
	
	

    if (allRows.length === 0) {
      tableBody = `
        <tr>
          <td colspan="6" style="text-align:center;">No student records found for ${selectedCourse}.</td>
        </tr>
      `;
    }

    const htmlTable = `
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            
            <th>Name</th>
            <th>Course</th>
            <th>Module</th>
			${hasNonZeroAssignment ? `<th>Assignment %</th>` : ""}
            <th>Score</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          ${tableBody}
        </tbody>
      </table>
    `;

    const messageHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <p>Dear Admin,</p>
        <p>Please find below the <strong>Assessment report</strong> for <strong>${selectedCourse}</strong> at <strong>${companyName}</strong>.</p>
        ${htmlTable}
        
        <div style="margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">
          <p style="margin: 0; font-weight: bold;">Scoring Note:</p>
          <p style="margin: 5px 0 0 0;">Scores are calculated as: (Obtained Marks / Total Marks) × 100</p>
          <p style="margin: 5px 0 0 0;">Example: If a student scored 28 out of 40 → (28/40) × 100 = 70</p>
        </div>
        
        <p style="margin-top: 20px;">Feel free to reach out in case of any queries or clarifications.</p>
        <p>Best regards,<br/><strong>Naveen Pn</strong><br/>Corporate Trainer</p>
      </div>
    `;

    for (const email of adminEmails) {
      const templateParams = {
        to_email: email,
        message: messageHtml,
        title: `Assessment Summary – ${selectedCourse} – ${companyName}`,
      };

      await emailjs.send("service_m0uhadr", "template_zniheem", templateParams, "uKaFTJVfykxCI6cPs");
    }

    alert(`Marks for ${selectedCourse} shared successfully!`);
  } catch (error) {
    console.error("Error sharing marks:", error);
    alert("An error occurred while sharing marks.");
  }
};

   const handleAttendanceShare = (e) => {
    e.preventDefault();
  
    const sortedStudents = [...students].sort((a, b) =>
      (a.fullName || "").localeCompare(b.fullName || "")
    );
  
    const tableHeader = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>#</th>
            <th>Name</th>
            <th>${selectedDate} (Today)</th>
            <th>Days Present</th>
            <th>Days Absent</th>
            <th>Days Late</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    const tableRows = sortedStudents
      .map((student, index) => {
        const attendance = student.attendance || {};
        const comments = student.comments || {};
  
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
  
        Object.values(attendance).forEach((status) => {
          if (status === "Present") presentCount++;
          else if (status === "Absent") absentCount++;
          else if (status === "Late") lateCount++;
        });
  
        const selectedDateStatus = attendance[selectedDate] || "N/A";
        const selectedDateComment = comments[selectedDate]?.trim();
  
        let coloredStatus;
        switch (selectedDateStatus) {
          case "Present":
            coloredStatus = `<span style="color: green; font-weight: bold;">${selectedDateStatus}</span>`;
            break;
          case "Absent":
            coloredStatus = `<span style="color: red; font-weight: bold;">${selectedDateStatus}</span>`;
            break;
          case "Late":
            coloredStatus = `<span style="color: orange; font-weight: bold;">${selectedDateStatus}</span>`;
            break;
          default:
            coloredStatus = `<span>${selectedDateStatus}</span>`;
        }
  
        const statusWithComment = selectedDateComment
          ? `${coloredStatus}<br/><i style="color:gray">(${selectedDateComment})</i>`
          : coloredStatus;
  
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${student.fullName || "N/A"}</td>
            <td>${statusWithComment}</td>
            <td>${presentCount}</td>
            <td>${absentCount}</td>
            <td>${lateCount}</td>
          </tr>
        `;
      })
      .join("");
  
    const tableFooter = `</tbody></table>`;
  
    const messageHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <p>Dear Team,</p>
        <p>
        Please find below the <strong>student attendance summary</strong> for <strong>${companyName}</strong> dated <strong>${selectedDate}</strong>:</p>
        ${tableHeader + tableRows + tableFooter}
        <p>
        If you notice any discrepancies, please don't hesitate to get in touch.
      </p>
      <p>Best regards,<br/>
      <strong>Naveen Pn</strong><br/>
      Corporate Trainer</p>
      </div>
    `;
  
    adminEmails.forEach((email) => {
      const templateParams = {
        to_email: email,
        message: messageHtml,
        title:`Attendance Summary – ${companyName}`,
      };
  
      emailjs
        .send(
          "service_m0uhadr",
          "template_zniheem",
          templateParams,
          "uKaFTJVfykxCI6cPs"
        )
        .then(() => {
          console.log(`Email sent to ${email}`);
        })
        .catch((error) => {
          console.error(`Failed to send email to ${email}:`, error);
        });
    });
  
    alert(`Attendance for ${selectedDate} sent to all admin emails.`);
  };

  

  const handleSummaryShare = async (e, companyCode, adminEmails, companyName) => {
  e.preventDefault();

  if (!companyCode) {
    alert("Company code is missing.");
    return;
  }

  try {
    const sortedStudents = [...students].sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));

    // Attendance Table
    const tableHeader = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Days Present</th>
            <th>Days Absent</th>
            <th>Days Late</th>
          </tr>
        </thead>
        <tbody>
    `;

    const tableRows = sortedStudents
      .map((student, index) => {
        const attendance = student.attendance || {};
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;

        Object.values(attendance).forEach((status) => {
          if (status === "Present") presentCount++;
          else if (status === "Absent") absentCount++;
          else if (status === "Late") lateCount++;
        });

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${student.fullName || "N/A"}</td>
            <td>${presentCount}</td>
            <td>${absentCount}</td>
            <td>${lateCount}</td>
          </tr>
        `;
      })
      .join("");

    const tableFooter = `</tbody></table>`;

    // Marks Summary Table
    const marksTableHeader = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Course</th>
            <th>Module</th>
            <th>Assignment</th>
            <th>Quiz</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
    `;

    let marksTableRows = "";
    let studentRowCounter = 1;

    sortedStudents.forEach(student => {
      const fullName = student.fullName || "N/A";
      const courses = student.marks || {};
      const courseEntries = Object.entries(courses).sort(([courseA], [courseB]) => courseA.localeCompare(courseB));
      
      let studentHasEntries = false;
      let courseRowCounter = 0;

      courseEntries.forEach(([course, modules]) => {
        const moduleEntries = Object.entries(modules).sort(([modA], [modB]) => modA.localeCompare(modB));
        
        if (moduleEntries.length > 0) {
          studentHasEntries = true;
          courseRowCounter += moduleEntries.length;
        }
      });

      if (!studentHasEntries) {
        marksTableRows += `
          <tr>
            <td>${studentRowCounter++}</td>
            <td>${fullName}</td>
            <td colspan="5" style="text-align: center;">No marks recorded</td>
          </tr>
        `;
        return;
      }

      let isFirstCourse = true;
      let modulesProcessed = 0;

      courseEntries.forEach(([course, modules], courseIndex) => {
        const moduleEntries = Object.entries(modules).sort(([modA], [modB]) => modA.localeCompare(modB));
        
        if (moduleEntries.length === 0) return;

        moduleEntries.forEach(([module, scores], moduleIndex) => {
          if (isFirstCourse && moduleIndex === 0) {
            marksTableRows += `
              <tr>
                <td rowspan="${courseRowCounter}">${studentRowCounter++}</td>
                <td rowspan="${courseRowCounter}">${fullName}</td>
                <td rowspan="${moduleEntries.length}">${course}</td>
                <td>${module}</td>
                <td>${scores.assignment ?? "N/A"}</td>
                <td>${scores.quiz ?? "N/A"}</td>
                <td>${scores.comment ?? ""}</td>
              </tr>
            `;
          } else if (moduleIndex === 0) {
            marksTableRows += `
              <tr>
                <td rowspan="${moduleEntries.length}">${course}</td>
                <td>${module}</td>
                <td>${scores.assignment ?? "N/A"}</td>
                <td>${scores.quiz ?? "N/A"}</td>
                <td>${scores.comment ?? ""}</td>
              </tr>
            `;
          } else {
            marksTableRows += `
              <tr>
                <td>${module}</td>
                <td>${scores.assignment ?? "N/A"}</td>
                <td>${scores.quiz ?? "N/A"}</td>
                <td>${scores.comment ?? ""}</td>
              </tr>
            `;
          }
        });

        isFirstCourse = false;
        modulesProcessed += moduleEntries.length;
      });
    });

    const marksTableFooter = `</tbody></table>`;

    // Module Overview Table
    const programInfoSnapshot = await getDocs(
      collection(db, `CorporateClients/${companyCode}/programInfo`)
    );
    const courseList = programInfoSnapshot.docs.map((doc) => doc.id);

    const allModules = [];
    for (const course of courseList) {
      const modulesSnapshot = await getDocs(
        collection(db, `CorporateClients/${companyCode}/programInfo/${course}/modules`)
      );
      const modulesData = modulesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        course,
      }));
      allModules.push(...modulesData);
    }

    // Group modules by course
    const modulesByCourse = {};
    allModules.forEach(module => {
      if (!modulesByCourse[module.course]) {
        modulesByCourse[module.course] = [];
      }
      modulesByCourse[module.course].push(module);
    });

    // Sort courses alphabetically
    const sortedCourses = Object.keys(modulesByCourse).sort((a, b) => a.localeCompare(b));

    // Sort modules within each course alphabetically
    sortedCourses.forEach(course => {
      modulesByCourse[course].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    });

    const moduleTableHeader = `
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>#</th>
            <th>Course</th>
            <th>Module Name</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    let moduleTableRows = "";
    let moduleRowCounter = 1;

    // Generate module table rows with proper rowspan
    sortedCourses.forEach(course => {
      const modules = modulesByCourse[course];
      const rowspan = modules.length;

      moduleTableRows += `
        <tr>
          <td rowspan="${rowspan}">${moduleRowCounter++}</td>
          <td rowspan="${rowspan}">${course || "N/A"}</td>
          <td>${modules[0].name || "N/A"}</td>
          <td>${modules[0].status || "N/A"}</td>
          <td>${modules[0].startDate || "N/A"}</td>
          <td>${modules[0].endDate || "N/A"}</td>
        </tr>
      `;

      // Add remaining modules for this course
      for (let i = 1; i < modules.length; i++) {
        moduleTableRows += `
          <tr>
            <td>${modules[i].name || "N/A"}</td>
            <td>${modules[i].status || "N/A"}</td>
            <td>${modules[i].startDate || "N/A"}</td>
            <td>${modules[i].endDate || "N/A"}</td>
          </tr>
        `;
      }
    });

    const moduleTableFooter = `</tbody></table>`;

    const messageHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <p>Dear Admin,</p>
        
        <p>
          Please find below the <strong>attendance and module marks summary</strong> for <strong>${companyName}</strong>.
        </p>
    
        <h3 style="margin-top: 20px;">Attendance Summary:</h3>
        ${tableHeader + tableRows + tableFooter}
    
        <h3 style="margin-top: 20px;">Module Marks Summary:</h3>
        ${marksTableHeader + marksTableRows + marksTableFooter}
    
        <h3 style="margin-top: 20px;">Module Overview:</h3>
        ${moduleTableHeader + moduleTableRows + moduleTableFooter}
    
        <p style="margin-top: 20px;">
          Please feel free to reach out in case of any queries or clarifications.
        </p>
    
        <p>Best regards,<br/>
        <strong>Naveen Pn</strong><br/>
        Corporate Trainer</p>
      </div>
    `;

    for (const email of adminEmails) {
      const templateParams = {
        to_email: email,
        message: messageHtml,
        title: "Comprehensive Student Summary"
      };

      await emailjs.send(
        "service_m0uhadr",
        "template_zniheem",
        templateParams,
        "uKaFTJVfykxCI6cPs"
      );
      console.log(`Email sent to ${email}`);
    }

    alert("Attendance, marks, and module summary emails sent to all admin emails.");
  } catch (error) {
    console.error("Error fetching/sending data:", error);
    alert("Failed to fetch or send data.");
  }
};

const handleModuleSummaryShare = async (e, companyCode, adminEmails, companyName) => {
    e.preventDefault();

    if (!companyCode) {
      alert("Company code is missing.");
      return;
    }

    try {
      const programInfoSnapshot = await getDocs(
        collection(db, `CorporateClients/${companyCode}/programInfo`)
      );
      const courseList = programInfoSnapshot.docs.map((doc) => doc.id);

      const allModules = [];

      for (const course of courseList) {
        const modulesSnapshot = await getDocs(
          collection(db, `CorporateClients/${companyCode}/programInfo/${course}/modules`)
        );
        const modulesData = modulesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          course,
        }));
        allModules.push(...modulesData);
      }

      if (allModules.length === 0) {
        alert("No modules found.");
        return;
      }

      // Group modules by course
      const modulesByCourse = {};
      allModules.forEach(module => {
        if (!modulesByCourse[module.course]) {
          modulesByCourse[module.course] = [];
        }
        modulesByCourse[module.course].push(module);
      });

      // Sort courses alphabetically
      const sortedCourses = Object.keys(modulesByCourse).sort((a, b) => a.localeCompare(b));

      // Sort modules within each course alphabetically
      sortedCourses.forEach(course => {
        modulesByCourse[course].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      });

      const tableHeader = `
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>#</th>
              <th>Course</th>
              <th>Module</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
      `;

      let tableRows = "";
      let rowCounter = 1;

      // Generate table rows with proper rowspan for courses and serial numbers
      sortedCourses.forEach(course => {
        const modules = modulesByCourse[course];
        const rowspan = modules.length;

        tableRows += `
          <tr>
            <td rowspan="${rowspan}">${rowCounter}</td>
            <td rowspan="${rowspan}">${course || "N/A"}</td>
            <td>${modules[0].name || "N/A"}</td>
            <td>${modules[0].status || "N/A"}</td>
            <td>${modules[0].startDate || "N/A"}</td>
            <td>${modules[0].endDate || "N/A"}</td>
          </tr>
        `;

        // Add remaining modules for this course
        for (let i = 1; i < modules.length; i++) {
          tableRows += `
            <tr>
              <td>${modules[i].name || "N/A"}</td>
              <td>${modules[i].status || "N/A"}</td>
              <td>${modules[i].startDate || "N/A"}</td>
              <td>${modules[i].endDate || "N/A"}</td>
            </tr>
          `;
        }

        rowCounter++;
      });

      const tableFooter = `
          </tbody>
        </table>
      `;

      const messageHtml = `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        <p>Dear Admin,</p>
        <p>
          Please find below the <strong>module summary</strong> for <strong>${companyName}</strong>.
        </p>
        ${tableHeader + tableRows + tableFooter}
        <p>Best regards,<br/>
        <strong>Naveen Pn</strong><br/>
        Corporate Trainer</p>
      </div>
    `;
    

      for (const email of adminEmails) {
        const templateParams = {
          to_email: email,
          message: messageHtml,
          title:`Module Completion Status ${companyName}`
        };

        await emailjs.send(
          "service_m0uhadr",
          "template_zniheem",
          templateParams,
          "uKaFTJVfykxCI6cPs"
        );
        console.log(`Email sent to ${email}`);
      }

      alert("Module summary emails sent to all admin emails.");
    } catch (error) {
      console.error("Error fetching/sending module data:", error);
      alert("Failed to fetch modules or send emails.");
    }
  };

  const generateAttendancePDF = async () => {
    const input = document.createElement('div');
    input.style.fontFamily = 'Arial, sans-serif';
    input.style.padding = '20px';

    const sortedStudents = [...students].sort((a, b) =>
      (a.fullName || "").localeCompare(b.fullName || "")
    );

    let htmlContent = `
      <h1 style="text-align: center; margin-bottom: 20px;">Attendance Summary</h1>
      <h2 style="margin-bottom: 10px;">${companyName}</h2>
      <h3 style="margin-bottom: 20px;">Date: ${selectedDate}</h3>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
          </tr>
        </thead>
        <tbody>
    `;

    sortedStudents.forEach((student, index) => {
      const attendance = student.attendance || {};
      const comments = student.comments || {};

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      Object.values(attendance).forEach((status) => {
        if (status === "Present") presentCount++;
        else if (status === "Absent") absentCount++;
        else if (status === "Late") lateCount++;
      });

      const selectedDateStatus = attendance[selectedDate] || "N/A";
      const selectedDateComment = comments[selectedDate]?.trim();

      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${student.fullName || "N/A"}</td>
          <td>${selectedDateStatus}${selectedDateComment ? ` (${selectedDateComment})` : ''}</td>
          <td>${presentCount}</td>
          <td>${absentCount}</td>
          <td>${lateCount}</td>
        </tr>
      `;
    });

    htmlContent += `</tbody></table>`;

    input.innerHTML = htmlContent;
    document.body.appendChild(input);

    try {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${companyName}_Attendance_${selectedDate}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      document.body.removeChild(input);
    }
  };

  const generateMarksPDF = async () => {
    const input = document.createElement('div');
    input.style.fontFamily = 'Arial, sans-serif';
    input.style.padding = '20px';

    const sortedStudents = [...students].sort((a, b) =>
      (a.fullName || "").localeCompare(b.fullName || "")
    );

    let htmlContent = `
      <h1 style="text-align: center; margin-bottom: 20px;">Marks Summary</h1>
      <h2 style="margin-bottom: 20px;">${companyName}</h2>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Course</th>
            <th>Module</th>
            <th>Assignment</th>
            <th>Quiz</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
    `;

    let rowCount = 1;

    sortedStudents.forEach((student) => {
      const fullName = student.fullName || "N/A";
      const courses = student.marks || {};

      Object.entries(courses)
        .sort(([courseA], [courseB]) => courseA.localeCompare(courseB))
        .forEach(([course, modules]) => {
          const moduleEntries = Object.entries(modules).sort(
            ([modA], [modB]) => modA.localeCompare(modB)
          );

          moduleEntries.forEach(([module, scores], index) => {
            htmlContent += `
              <tr>
                ${index === 0 ? `
                  <td rowspan="${moduleEntries.length}">${rowCount++}</td>
                  <td rowspan="${moduleEntries.length}">${fullName}</td>
                  <td rowspan="${moduleEntries.length}">${course}</td>` : ''}
                <td>${module}</td>
                <td>${scores.assignment ?? "N/A"}</td>
                <td>${scores.quiz ?? "N/A"}</td>
                <td>${scores.comment ?? ""}</td>
              </tr>
            `;
          });
        });
    });

    htmlContent += `</tbody></table>`;
    input.innerHTML = htmlContent;
    document.body.appendChild(input);

    try {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${companyName}_Marks_Summary.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      document.body.removeChild(input);
    }
  };

  const generateModuleSummaryPDF = async () => {
    if (!companyCode) {
      alert("Company code is missing.");
      return;
    }

    try {
      const programInfoSnapshot = await getDocs(
        collection(db, `CorporateClients/${companyCode}/programInfo`)
      );
      const courseList = programInfoSnapshot.docs.map((doc) => doc.id);

      const allModules = [];
      for (const course of courseList) {
        const modulesSnapshot = await getDocs(
          collection(db, `CorporateClients/${companyCode}/programInfo/${course}/modules`)
        );
        const modulesData = modulesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          course,
        }));
        allModules.push(...modulesData);
      }

      const sortedModules = [...allModules].sort((a, b) => {
        const courseA = (a.course || "").toLowerCase();
        const courseB = (b.course || "").toLowerCase();
        if (courseA !== courseB) return courseA.localeCompare(courseB);
        const moduleA = (a.name || "").toLowerCase();
        const moduleB = (b.name || "").toLowerCase();
        return moduleA.localeCompare(moduleB);
      });

      const input = document.createElement('div');
      input.style.fontFamily = 'Arial, sans-serif';
      input.style.padding = '20px';

      let htmlContent = `
        <h1 style="text-align: center; margin-bottom: 20px;">Module Summary</h1>
        <h2 style="margin-bottom: 20px;">${companyName}</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>#</th>
              <th>Course</th>
              <th>Module Name</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
      `;

      sortedModules.forEach((module, index) => {
        htmlContent += `
          <tr>
            <td>${index + 1}</td>
            <td>${module.course || "N/A"}</td>
            <td>${module.name || "N/A"}</td>
            <td>${module.status || "N/A"}</td>
            <td>${module.startDate || "N/A"}</td>
            <td>${module.endDate || "N/A"}</td>
          </tr>
        `;
      });

      htmlContent += `</tbody></table>`;
      input.innerHTML = htmlContent;
      document.body.appendChild(input);

      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${companyName}_Module_Summary.pdf`);
      document.body.removeChild(input);
    } catch (error) {
      console.error("Error generating module summary PDF:", error);
      alert("Failed to generate module summary PDF");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
   <>
    <Suspense fallback={<div>Loading Navbar...</div>}>
      <NavbarComponent companyName={companyName} />
    </Suspense>
    <div className="share-page">
      <div className="share-header">
        <h2>📤 Send Summaries to Admins</h2>
        <p className="subtitle">Select a date and choose which summary to share with administrators</p>
      </div>
      
      <form className="share-form">
        <div className="form-group">
          <div className="date-picker-container">
            <label htmlFor="attendance-date">
              <FaCalendarAlt className="label-icon" />
              Select Attendance Date
            </label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="attendance-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <FaCalendarAlt className="input-icon" />
            </div>
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={(e) => handleAttendanceShare(e, companyCode, adminEmails, companyName)} className="btn btn-primary">
            <FaCalendarAlt className="btn-icon" />
            Share Attendance
          </button>
          <button type="button" onClick={(e) => handleMarksShare(e, companyCode, adminEmails, companyName)} className="btn btn-secondary">
            Share Marks Summary
          </button>
          <button 
            type="button" 
            onClick={(e) => handleModuleSummaryShare(e, companyCode, adminEmails, companyName)} 
            className="btn btn-tertiary"
          >
            Share Module Summary
          </button>
          <button 
            type="button" 
            onClick={(e) => handleSummaryShare(e, companyCode, adminEmails, companyName)} 
            className="btn btn-quaternary"
          >
            Share Overall Summary
          </button>
        </div>

        <div className="pdf-button-group">
          <h3>Download as PDF:</h3>
          <div className="pdf-buttons">
            <button 
              type="button" 
              onClick={generateAttendancePDF} 
              className="btn btn-pdf"
            >
              <FaFilePdf className="btn-icon" />
              Attendance PDF
            </button>
            <button 
              type="button" 
              onClick={generateMarksPDF} 
              className="btn btn-pdf"
            >
              <FaFilePdf className="btn-icon" />
              Marks PDF
            </button>
            <button 
              type="button" 
              onClick={generateModuleSummaryPDF} 
              className="btn btn-pdf"
            >
              <FaFilePdf className="btn-icon" />
              Module PDF
            </button>
          </div>
        </div>
      </form>
    </div>

    {showCourseModal && (
      <CourseSelectionModal
        courses={availableCourses}
        onSelectCourse={handleCourseSelection}
        onClose={() => setShowCourseModal(false)}
      />
    )}
  </>
  );
};

export default SharePage;