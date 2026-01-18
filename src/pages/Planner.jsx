import { coursesList } from "@/data/global_config";

const Planner = () => {
  const courseCode = localStorage.getItem("courseCode");
  const plannerPage = coursesList[courseCode]?.plannerPage;
  return (
    <div className="w-full h-full overflow-y-auto p-3 md:p-2">
      <iframe
        src={plannerPage}
        title="Report"
        className="h-full w-full overflow-y-scroll rounded-md pointer-events-auto"
      />
    </div>
  );
};

export default Planner;
