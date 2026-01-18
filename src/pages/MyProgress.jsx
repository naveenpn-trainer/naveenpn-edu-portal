import { useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import GetUserRef from "@/utils/getUserRef";
import Fallback from "@/components/Fallback";

const MyProgress = () => {
  const { docRef } = GetUserRef();
  const [progress, setProgress] = useState("");

  useEffect(() => {
    const fetchUserDoc = async () => {
      try {
        if (docRef) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProgress(docSnap.data().MyProgress || "");
          } else {
            console.error("Document does not exist");
          }
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };

    fetchUserDoc();
  }, [docRef]);

  return (
    <div className="w-full h-full overflow-y-auto p-3 md:p-2">
      {progress ? (
        <iframe
          src={progress}
          title="My Progress"
          className="h-full w-full overflow-y-scroll rounded-md pointer-events-auto"
        />
      ) : (
        <Fallback message="No Progress Found" styles="text-red-500" />
      )}
    </div>
  );
};

export default MyProgress;
