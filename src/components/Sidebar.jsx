import { useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { IoIosPie, IoIosSettings,IoIosAnalytics,IoIosStats  } from "react-icons/io";
import { IoCalendarSharp } from "react-icons/io5";
import { HiDocumentChartBar } from "react-icons/hi2";
import { GiProgression } from "react-icons/gi";
import { ImBooks } from "react-icons/im";
import { GoQuestion } from "react-icons/go";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./ui/use-toast";
import isCourseExpired from "@/utils/courseExpiry";
import { coursesList } from "@/data/global_config";
import GetUserRef from "@/utils/getUserRef";
import { getDoc } from "firebase/firestore";

const Sidebar = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const { docRef } = GetUserRef();

  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState("");

  const courseExpired = isCourseExpired();

  const courseCode = localStorage.getItem("courseCode");
  const plannerPage = coursesList[courseCode]?.plannerPage;
  const qnaPage = coursesList[courseCode]?.askQuestionsPage;
  const evaluationPage = coursesList[courseCode]?.evaluationPage;

  useEffect(() => {
    if (courseExpired) {
      toast({
        variant: "destructive",
        title: "Course Expired!",
        description: "Please contact administrator",
      });
    }
  }, [courseExpired, toast]);

  useEffect(() => {
    const fetchUserDoc = async () => {
      try {
        if (docRef) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setNotes(data.MyNotes || "");
            setProgress(data.MyProgress || "");
          }
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    };

    fetchUserDoc();
  }, [docRef]);

  const isCurriculum = pathname.includes("curriculum");

  const getSidebarLinks = () => {
    const links = [
      { title: "Home", icon: FaHome, link: "/", visible: true },
      { title: "Modules", icon: ImBooks, link: "/curriculum", visible: !courseExpired },
      { title: "Planner", icon: IoCalendarSharp, link: "/planner", visible: !!plannerPage },
      { title: "Q&A", icon: GoQuestion, link: "/qna", visible: !!qnaPage },
      { title: "Evaluation", icon: HiDocumentChartBar, link: "/evaluation",visible: true},
      { title: "Notes", icon: HiDocumentChartBar, link: "/notes", visible: !!notes },
      { title: "Progress", icon: GiProgression, link: "/progress", visible: !!progress },
	  
    ];

    if (isAdmin) {
      links.push(
        /* { title: "Report", icon: IoIosPie, link: "/reports", visible: true }, */
        { title: "Summary Report", icon: IoIosPie, link: "/summary", visible: true },
        { title: "Admin", icon: IoIosSettings, link: "/admin", visible: true }
      );
    }

    return links.filter((item) => item.visible);
  };

  return (
<div
      className={`bg-primary  ${
        isCurriculum ? "w-[4.6rem]" : "w-[275px]"
      }  md:w-[4.1rem] lg:w-[4.6rem] h-full md:max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden`}
    >

      <div className="w-full mx-auto bg-transparent flex flex-col items-center justify-start gap-1">
        {getSidebarLinks().map((item, index) => {
          const Icon = item.icon;
          const isActive =
            item.title === "Home"
              ? pathname === item.link
              : pathname.includes(item.link);
          const isNewSection =
            item.title === "Q&A" || item.title === "Progress";

          return (
            <Link
              to={item.link}
              key={index}
              className={`py-3 px-4 md:px-3 w-full ${
                isCurriculum ? "flex-col text-xs" : "flex-row text-base"
              } flex md:flex-col justify-start md:justify-center max-md:gap-x-2 items-center md:text-xs lg:scale-110 ${
                isActive ? "bg-[#e3ecfa] text-primary" : "bg-primary text-white"
              } ${isNewSection ? "border-b-[3px]" : ""}`}
            >
              <Icon />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
