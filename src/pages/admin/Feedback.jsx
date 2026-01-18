import React, { useEffect, useRef, lazy, useState, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import emailjs from "@emailjs/browser";

// Lazy load navbars
const Navbar = lazy(() => import("./Navbar"));
const NavbarApp = lazy(() => import("./NavbarApp"));

const CompanyFeedbackReport = () => {
  const [companyCode, setCompanyCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [programName, setProgramName] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [trainingDates, setTrainingDates] = useState("");
  const [trainingRemarks, setTrainingRemarks] = useState("");
  const [studentsList, setStudentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const reportRef = useRef(null);
  const navigate = useNavigate();
  const params = useParams();

  const NavbarComponent = location.pathname.includes("/app") ? NavbarApp : Navbar;

  // Fetch company-specific details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const companyRef = doc(db, "CorporateClients", companyCode);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          const data = companySnap.data();
          setCompanyName(data.companyName || "");
          setProgramName(data.programName || "");
          setTrainerName(data.trainerName || "");
          setTrainingDates(data.trainingDates || "");
          setTrainingRemarks(data.trainingRemarks || "");
        } else {
          console.warn("Company not found:", companyCode);
        }
      } catch (err) {
        console.error("Error loading company details:", err);
      }
    };
    if (companyCode) fetchCompanyDetails();
  }, [companyCode]);

  // Get companyCode from local storage or URL
  useEffect(() => {
    const code =
      localStorage.getItem("orgCode") ||
      params.orgCode ||
      localStorage.getItem("companyCode");
    if (!code) {
      alert("No company code found – please log in again.");
      navigate("/");
    } else {
      setCompanyCode(code);
      localStorage.setItem("companyCode", code);
    }
  }, [params.orgCode, navigate]);

  // Fetch participant feedback list
  useEffect(() => {
    const fetchStudents = async () => {
      if (!companyCode) return;
      try {
        const qSnap = await getDocs(
          collection(db, `CorporateClients/${companyCode}/studentInfo`)
        );
        const items = await Promise.all(
          qSnap.docs.map(async (docSnap) => {
            const student = docSnap.data();
            const fbRef = doc(
              db,
              `CorporateClients/${companyCode}/studentInfo/${docSnap.id}/feedback/main`
            );
            const fbSnap = await getDoc(fbRef);
            const fb = fbSnap.exists() ? fbSnap.data() : { rating: "", comments: "" };
            return {
              id: docSnap.id,
              fullName: student.fullName || "N/A",
              rating: fb.rating,
              comments: fb.comments
            };
          })
        );
        items.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        setStudentsList(items);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };
    fetchStudents();
  }, [companyCode]);

  const handleInputChange = (id, field, value) => {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const saveFeedback = async (student) => {
    try {
      const fbRef = doc(
        db,
        `CorporateClients/${companyCode}/studentInfo/${student.id}/feedback/main`
      );
      await setDoc(fbRef, {
        rating: student.rating,
        comments: student.comments
      });
      alert(`Feedback saved for ${student.fullName}`);
    } catch (err) {
      console.error("Save feedback error:", err);
      alert("Unable to save feedback.");
    }
  };

  const saveTrainingRemarks = async () => {
    if (!companyCode) return;
    
    try {
      const companyRef = doc(db, "CorporateClients", companyCode);
      await setDoc(companyRef, { 
        trainingRemarks: trainingRemarks 
      }, { merge: true });
      
      alert("Training remarks saved successfully!");
    } catch (err) {
      console.error("Error saving training remarks:", err);
      alert("Failed to save training remarks");
    }
  };

  const sendEmailReport = async () => {
    if (!studentsList.length) return;
    try {
      const cRef = doc(db, "CorporateClients", companyCode);
      const cSnap = await getDoc(cRef);
      if (!cSnap.exists()) {
        alert("Company data missing.");
        return;
      }
      const admins = cSnap.data().adminEmails || [];
      if (!admins.length) {
        alert("No admin emails found.");
        return;
      }

      // Calculate average rating safely
      const totalRating = studentsList.reduce((sum, s) => sum + (parseFloat(s.rating) || 0, 0));
      const averageRating = studentsList.length 
        ? (totalRating / studentsList.length).toFixed(2)
        : "N/A";

      // Build HTML for the email
      const htmlRows = studentsList
        .map(
          (st, i) => `
          <tr style="background:${i % 2 ? "#fff" : "#f9f9f9"};">
            <td>${st.fullName}</td>
            <td>${st.rating}</td>
            <td>${st.comments}</td>
          </tr>
        `
        )
        .join("");

      const htmlBody = `
        <h2 style="text-align:center;">Training Participant Feedback Report</h2>
        <p><strong>Client:</strong> ${companyName}</p>
        <p><strong>Program:</strong> ${programName}</p>
        <p><strong>Trainer:</strong> ${trainerName}</p>
        <p><strong>Dates:</strong> ${trainingDates}</p>     
        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
          <thead style="background:#00796b; color:#fff;">
            <tr>
              <th style="border:1px solid #ccc; padding:8px;">Name</th>
              <th style="border:1px solid #ccc; padding:8px;">Rating</th>
              <th style="border:1px solid #ccc; padding:8px;">Feedback</th>
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
        <br/>
        
        <p><strong>Trainer's Remarks:</strong> ${trainingRemarks || "It was an interactive group; well-engaged with advanced topics."}</p>
        <br/><p>Regards,<br/><strong>${trainerName}</strong><br/>Senior Corporate Trainer</p>
      `;

      // Send to each admin
      for (const email of admins) {
		  
		const templateParams = {
        to_email: email,
        message: htmlBody,
        title:"Participants Feedback",
      };
	  
        await emailjs.send(
          "service_m0uhadr",
          "template_zniheem",
         templateParams,
          "uKaFTJVfykxCI6cPs"
        );
      }

      alert("Report emailed successfully!");
    } catch (err) {
      console.error("Email send error:", err);
      alert("Error sending report.");
    }
  };

  return (
    <>
      <Suspense fallback={<div>Loading Navbar...</div>}>
        <NavbarComponent companyName={companyName} />
      </Suspense>

      <div style={{ margin: 20 }}>
        <div ref={reportRef}>
          <h1 style={{ textAlign: "center" }}>Training Participant Feedback Report</h1>
          <div style={{ background: "#eef6f8", padding: 15, borderRadius: 8 }}>
            <p><strong>Client Name:</strong> {companyName}</p>
            <p><strong>Training Program:</strong> {programName}</p>
            <p><strong>Trainer:</strong> {trainerName}</p>
            <p><strong>Training Dates:</strong> {trainingDates}</p>
            {trainingRemarks && <p><strong>Training Remarks:</strong> {trainingRemarks}</p>}
          </div>

          <h2 style={{ marginTop: 40, textAlign: "center", color: "#333" }}>
            Individual Participant Feedback
          </h2>

          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ background: "#00796b", color: "#fff", textAlign: "left" }}>
                  <th style={{ padding: "14px", border: "1px solid #ddd" }}>Participant Name</th>
                  <th style={{ padding: "14px", border: "1px solid #ddd" }}>Rating (out of 5)</th>
                  <th style={{ padding: "14px", border: "1px solid #ddd" }}>Trainer's Feedback</th>
                  <th style={{ padding: "14px", border: "1px solid #ddd" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map((stu, i) => (
                  <tr key={stu.id} style={{ background: i % 2 === 0 ? "#f9f9f9" : "#fff", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>{stu.fullName}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", width: "10%" }}>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={stu.rating}
                        onChange={(e) => handleInputChange(stu.id, "rating", e.target.value)}
                        style={{ width: "80%", padding: "3px", borderRadius: 6, border: "1px solid #ccc" }}
                      />
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      <textarea
                        rows="2"
                        value={stu.comments}
                        onChange={(e) => handleInputChange(stu.id, "comments", e.target.value)}
                        style={{ width: "100%", padding: "3px", borderRadius: 6, border: "1px solid #ccc" }}
                      />
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                      <button
                        onClick={() => saveFeedback(stu)}
                        style={{ background: "#00796b", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer" }}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: 30 }}>
            <button
              onClick={sendEmailReport}
              style={{ background: "#004d40", color: "#fff", padding: "12px 24px", fontSize: 16, border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Send Report via Email
            </button>
          </div>

          <div style={{ background: "#e8f5e9", padding: 15, marginTop: 30, borderRadius: 8 }}>
            
            <div style={{ marginTop: 10 }}>
              <label><strong>Trainer's Remarks:</strong></label>
              <textarea
                value={trainingRemarks}
                onChange={(e) => setTrainingRemarks(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  borderRadius: 6, 
                  border: "1px solid #ccc",
                  marginTop: "5px",
                  minHeight: "100px"
                }}
                placeholder="Enter your overall remarks about the training session..."
              />
              <button
                onClick={saveTrainingRemarks}
                style={{ 
                  background: "#00796b", 
                  color: "#fff", 
                  padding: "8px 16px", 
                  border: "none", 
                  borderRadius: 6, 
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                Save Remarks
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", color: "#555", marginTop: 40 }}>
            <p>
              Thank you for the opportunity to conduct this training.<br />
              For any clarifications or extended support, feel free to reach out.<br /><br />
              Regards,<br />
              <strong>{trainerName}</strong><br />
              Senior Corporate Trainer
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyFeedbackReport;