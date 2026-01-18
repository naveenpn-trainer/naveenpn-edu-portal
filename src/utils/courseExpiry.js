import { coursesList } from "@/data/global_config";

const isCourseExpired = () => {
  const courseCode = localStorage.getItem("courseCode");

  if (courseCode && coursesList[courseCode]) {
    const { expiryDate } = coursesList[courseCode];
    if (new Date(expiryDate) < new Date()) {
      return true;
    }
    return false;
  }
};

export default isCourseExpired;
