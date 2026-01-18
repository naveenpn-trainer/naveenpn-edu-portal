import { coursesList } from "@/data/global_config";

const Welcome = () => {
  const courseCode = localStorage.getItem("courseCode");
  const courseWelcomePage = coursesList[courseCode]?.courseWelcomePage;

  return (
    <div className="w-full h-full overflow-y-auto p-3 md:p-2">
      <iframe
        src={courseWelcomePage}
        className="h-full w-full overflow-y-scroll rounded-md pointer-events-auto"
      />
    </div>
  );
};

export default Welcome;
