import { Link } from "react-router-dom";
import { coursesList } from "@/data/global_config";

const CourseHeader = () => {
  const courseCode = localStorage.getItem("courseCode");
  const { header } = coursesList[courseCode]?.globalTitles || {};
  return (
    <div className="fixed w-full z-10 py-1.5 top-12 bg-primary h-12 m-auto">
      <div className="w-full h-full flex justify-between pl-4 m-auto items-center gap-x-4 px-4">
        <h1 className="text-base lg:text-[21px] font-medium text-white">
          {header?.courseTitle}
        </h1>
        <Link to="profile" className=" flex min-w-fit gap-3 items-center">
          <img
            src="/profile.jpeg"
            alt="Profile"
            className="w-9 h-9 rounded-full overflow-hidden z-20 bg-white"
          />
        </Link>
      </div>
    </div>
  );
};

export default CourseHeader;
