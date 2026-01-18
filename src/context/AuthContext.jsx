/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { sessionDuration } from "@/data/global_config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    const run = async () => {
      let sessionTimeout = null;

      if (currentUser) {
        try {
          const token = await currentUser.getIdTokenResult();
          const authTime = token.claims.auth_time * 1000;
          const timeLeft = sessionDuration - (Date.now() - authTime);
          sessionTimeout = setTimeout(() => signOut(auth), timeLeft);

          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));

          const orgCode = localStorage.getItem("orgCode");
          const courseCode = localStorage.getItem("courseCode");

          if (!orgCode || !courseCode) {
            console.warn("Missing orgCode or courseCode in localStorage.");
            return;
          }

          // ✅ Step 1: Get org-level enrolled courses
          const orgRef = doc(db, `CorporateClients/${orgCode}`);
          const orgSnap = await getDoc(orgRef);
          const orgData = orgSnap.data();
          const enrolledCourses = orgData?.EnrolledCourses ?? [];
          const isCourseValid = enrolledCourses.includes(courseCode);

          // ✅ Step 2: Look for current user's email in studentInfo
          const studentRef = collection(db, `CorporateClients/${orgCode}/studentInfo`);
          const studentSnap = await getDocs(studentRef);

          let matched = false;
          let isUserAdmin = false;

          studentSnap.forEach((doc) => {
            const data = doc.data();
            if (data?.email?.toLowerCase() === currentUser.email.toLowerCase()) {
              matched = true;
              isUserAdmin = data?.isAdmin === true;
				const studentId = doc.id;
				localStorage.setItem("studentId", studentId);
				console.log("🎯 studentId from Firestore doc ID:", studentId);
            }
          });

          const authorized = matched && isCourseValid;

          setIsEnrolled(authorized);
          setIsAdmin(isUserAdmin);
          localStorage.setItem("isEnrolled", authorized);
          localStorage.setItem("isAdmin", isUserAdmin);
		  console.log("🎯 Set isAdmin:", isUserAdmin);
        } catch (err) {
          console.error("Authorization Failed:", err);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsEnrolled(false);
        localStorage.removeItem("user");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("isEnrolled");
        localStorage.removeItem("orgCode");
        localStorage.removeItem("courseCode");
        sessionTimeout && clearTimeout(sessionTimeout);
      }
    };

    run();
  });

  return () => unsubscribe();
}, []);


  const logout = () => {
    signOut(auth);
    setIsAdmin(false);
    setIsEnrolled(false);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isEnrolled, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
