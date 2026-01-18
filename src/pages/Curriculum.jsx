import CourseList from "@/components/CourseList";
import isCourseExpired from "@/utils/courseExpiry";
import { Navigate, Outlet } from "react-router-dom";
const Curriculum = () => {
  const courseExpired = isCourseExpired();

  if (courseExpired) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex w-full h-full justify-between">
      <div className="hidden md:block">
        <CourseList />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Curriculum;
