import { coursesList } from "@/data/global_config";

const QNA = () => {
  const courseCode = localStorage.getItem("courseCode");
  const qnaPage = coursesList[courseCode]?.askQuestionsPage;
  return (
    <div className="w-full h-full overflow-y-auto p-3 md:p-2">
      <iframe
        src={qnaPage}
        title="Q & A"
        className="h-full w-full overflow-y-scroll rounded-md pointer-events-auto"
      />
    </div>
  );
};

export default QNA;
