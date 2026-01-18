import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs } from "firebase/firestore";

const GetUserRef = () => {
  const { user } = useAuth();
  const [docRef, setdocRef] = useState(null);

  useEffect(() => {
    const fetchUserDoc = async () => {
      try {
        if (!user) return;

        const orgCode = localStorage.getItem("orgCode");
        const studentCollection = collection(db, `CorporateClients/${orgCode}/studentInfo`);
        const querySnapshot = await getDocs(studentCollection);

        const userDoc = querySnapshot.docs.find(
          (doc) => doc.data().email?.toLowerCase() === user.email?.toLowerCase()
        );

        if (userDoc) {
          setdocRef(userDoc.ref);
        }
      } catch (error) {
        console.error("Error fetching student reference:", error);
      }
    };

    fetchUserDoc();
  }, [user]);

  return { docRef };
};

export default GetUserRef;
