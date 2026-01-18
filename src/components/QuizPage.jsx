import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/QuizPage.css";

export default function QuizPage(props) {
  const { subject, id: paramId } = useParams();
  const id = props?.id ?? paramId;
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);

  // ===== TOTAL QUIZ TIMER (FROM JSON) =====
  const [totalTime, setTotalTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const quizJsonPath =
    props?.quizPath ??
    (subject ? `/practice_mcqs/${subject}/questions.json` : "/questions.json");

  // ===== LOAD QUIZ DATA =====
  useEffect(() => {
    if (!id) return;

    fetch(quizJsonPath)
      .then((r) => r.json())
      .then((data) => {
        let mod = null;
        const mid = parseInt(id);

        if (Array.isArray(data.modules)) {
          mod = data.modules.find((m) => m.id === mid) || data.modules[0];
        } else if (Array.isArray(data)) {
          mod = {
            id: mid,
            title: "Quiz",
            duration: data.duration,
            questions: data,
          };
        } else if (data.questions) {
          mod = {
            id: mid,
            title: data.title || "Quiz",
            duration: data.duration,
            questions: data.questions,
          };
        }

        setModule(mod);
        setTotalTime(mod.duration || 600); // fallback 10 mins
        setTimeLeft(mod.duration || 600);
      })
      .catch((err) => {
        console.error("Error loading quiz:", err);
        setModule(null);
      });
  }, [quizJsonPath, id]);

  // ===== RESET STATE =====
  useEffect(() => {
    if (!module) return;

    setCurrentQ(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setScore(0);
  }, [module]);

  // ===== UPDATE PROGRESS =====
  useEffect(() => {
    if (module) {
      setProgress(((currentQ + 1) / module.questions.length) * 100);
    }
  }, [currentQ, module]);

  // ===== TOTAL QUIZ TIMER EFFECT =====
  useEffect(() => {
    if (!module || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [module, timeLeft]);

  if (!module) {
    return <div className="center">Loading...</div>;
  }

  const q = module.questions[currentQ];
  const isLastQuestion = currentQ + 1 === module.questions.length;

  // ===== SUBMIT ANSWER =====
  function submitAnswer() {
    if (feedback) return;

    if (selected === q.answer) {
      setScore((s) => s + 1);
      setFeedback("✅ Correct");
    } else {
      setFeedback("❌ Wrong — Correct: " + q.answer);
    }
    setShowExplanation(true);
  }

  // ===== NEXT QUESTION =====
  function next() {
    setFeedback(null);
    setSelected(null);
    setShowExplanation(false);

    if (currentQ + 1 < module.questions.length) {
      setCurrentQ((c) => c + 1);
    } else {
      finishQuiz();
    }
  }

  // ===== FINISH QUIZ =====
  function finishQuiz() {
    const resultState = {
      moduleTitle: module.title,
      total: module.questions.length,
      score,
      moduleId: parseInt(id),
      subject,
      timeTaken: totalTime - timeLeft,
    };

    if (props?.embedded && typeof props.onFinish === "function") {
      props.onFinish(resultState);
    } else {
      navigate("/result", { state: resultState });
    }
  }

  // ===== FORMAT TIMER =====
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header quiz-header-flex">
          <div>
            <h2 className="quiz-title">{module.title}</h2>
            <div className="quiz-sub">
              Question {currentQ + 1} of {module.questions.length}
            </div>
          </div>

          {/* TIMER RIGHT */}
          <div className={`quiz-timer ${timeLeft <= 30 ? "danger" : ""}`}>
            ⏱️ {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="quiz-inner">
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="quiz-card">
            <p className="quiz-question">{q.question}</p>

            <div className="options-list">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => !feedback && setSelected(opt)}
                  disabled={!!feedback}
                  className={`option-btn ${
                    selected === opt ? "selected" : ""
                  }`}
                >
                  <input type="radio" checked={selected === opt} readOnly />
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              {!feedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={selected === null}
                  className="quiz-btn primary"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={next}
                  className={`quiz-btn ${
                    isLastQuestion ? "complete" : "primary"
                  }`}
                >
                  {isLastQuestion ? "Complete Quiz" : "Next Question"}
                </button>
              )}
            </div>

            {feedback && q.explanation && (
              <div className="mt-6 explanation">
                <strong>Explanation:</strong>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
