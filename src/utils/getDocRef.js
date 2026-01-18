import { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebase";

const GetDocRef = (value) => {
  const [docRef, setdocRef] = useState(null);

  useEffect(() => {
    const fetchUserDoc = async () => {
      try {
        const q = query(collection(db, "AuthorizedUsers"));
        const querySnapshot = await getDocs(q);

        const doc = querySnapshot.docs.find((doc) => {
          const certificates = doc.data().Certificates || {};
          return Object.keys(certificates).includes(value);
        });

        if (doc) {
          setdocRef(doc.ref);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchUserDoc();
  }, [value]);

  return { docRef, setdocRef };
};

export default GetDocRef;
