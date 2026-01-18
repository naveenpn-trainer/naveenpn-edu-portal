import { useState } from "react";
import { coursesList } from "@/data/global_config";
import QuizPage from "@/components/QuizPage";

const Home = () => {
  const courseCode = localStorage.getItem("courseCode");
  const course = coursesList[courseCode];

  const homePage = course?.homePage;
  const moduleId = course?.moduleId || 1; // map course → quiz module

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  if (!homePage) {
    return (
      <div className="p-6 text-red-600">
        Course content not available
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-3 md:p-2">

      {/* ===== COURSE CONTENT ===== */}
      {!showQuiz && (
        <>
          <iframe
            src={homePage}
            className="h-[80vh] w-full rounded-md border"
          />

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setQuizResult(null);
                setShowQuiz(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Start Quiz
            </button>
          </div>
        </>
      )}

      {/* ===== QUIZ SECTION ===== */}
      {showQuiz && (
        <QuizPage
          embedded={true}
          quizPath="/questions.json"
          moduleId={moduleId}
          onFinish={(result) => {
            setQuizResult(result);
            setShowQuiz(false);
          }}
        />
      )}

      {/* ===== RESULT SUMMARY ===== */}
      {quizResult && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">
            Quiz Completed 🎉
          </h3>
          <p className="text-sm">
            <strong>Module:</strong> {quizResult.moduleTitle}
          </p>
          <p className="text-sm">
            <strong>Score:</strong> {quizResult.score} / {quizResult.total}
          </p>
        </div>
      )}

    </div>
  );
};

export default Home;
