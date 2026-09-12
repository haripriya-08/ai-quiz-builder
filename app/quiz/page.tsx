"use client";

import { useEffect, useState } from "react";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [score, setScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [submitted, setSubmitted] = useState(false);

  const submitQuiz = async () => {
    if (!quiz) return;
    if (submitted) return;

    setSubmitted(true);

    let calculatedScore = 0;

    quiz.questions.forEach((q: any, index: number) => {
      if (selectedAnswers[index] === q.answer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    try {
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          selectedAnswers: selectedAnswers,
          score: calculatedScore,
          totalQuestions: quiz.questions.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Attempt save failed:", data);
      } else {
        console.log("Attempt saved:", data);
      }
    } catch (error) {
      console.error("Attempt save error:", error);
    }

    const newResult = {
      quiz: quiz,
      selectedAnswers: selectedAnswers,
      score: calculatedScore,
      date: new Date().toISOString(),
    };

    localStorage.setItem(
      "quizResult",
      JSON.stringify(newResult)
    );

    const savedHistory = localStorage.getItem("quizHistory");

    const history = savedHistory
      ? JSON.parse(savedHistory)
      : [];

    history.unshift(newResult);

    localStorage.setItem(
      "quizHistory",
      JSON.stringify(history)
    );

    window.location.href = "/results";
  };

  /*
   * Timer
   *
   * Each question gets its own 60 seconds.
   * When the question changes, another useEffect below
   * resets the timer back to 60.
   */
  useEffect(() => {
    if (submitted) return;

    if (timeLeft <= 0) {
      if (currentQuestion < quiz?.questions?.length - 1) {
        setCurrentQuestion((prev: number) => prev + 1);
      } else {
        submitQuiz();
      }

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, submitted]);

  /*
   * Reset timer whenever the current question changes.
   */
  useEffect(() => {
    if (!submitted) {
      setTimeLeft(60);
    }
  }, [currentQuestion, submitted]);

  /*
   * Load quiz from localStorage.
   */
  useEffect(() => {
    const savedQuiz = localStorage.getItem("quiz");

    if (!savedQuiz || savedQuiz === "undefined") {
      window.location.href = "/";
      return;
    }

    try {
      setQuiz(JSON.parse(savedQuiz));
    } catch (error) {
      console.error("Invalid quiz data:", error);
      localStorage.removeItem("quiz");
      window.location.href = "/";
    }
  }, []);

  if (!quiz) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#e83e8c]" />
          <h1 className="text-xl font-semibold">
            Loading Quiz...
          </h1>
        </div>
      </main>
    );
  }

  const totalQuestions = quiz.questions.length;
  const progress =
    ((currentQuestion + 1) / totalQuestions) * 100;

  const answeredCount =
    Object.keys(selectedAnswers).length;

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">

      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="text-xl font-bold tracking-tight"
          >
            Quiz<span className="text-[#e83e8c]">
              Builder
            </span>
          </button>

          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">

            <button
              type="button"
              onClick={() =>
                (window.location.href = "/dashboard")
              }
              className="transition hover:text-[#e83e8c]"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href = "/history")
              }
              className="transition hover:text-[#e83e8c]"
            >
              History
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href = "/profile")
              }
              className="transition hover:text-[#e83e8c]"
            >
              Profile
            </button>

          </div>

        </div>
      </nav>

      {/* Main Quiz Area */}
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">

          <div className="mb-3 flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-[#e83e8c]">
                AI Generated Quiz
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Test Your Knowledge
              </h1>

              {quiz.code && (
                <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-pink-200 bg-pink-50 px-4 py-2">

                  <span className="text-sm font-medium text-gray-600">
                    Quiz Code
                  </span>

                  <span className="font-bold tracking-wider text-[#e83e8c]">
                    {quiz.code}
                  </span>

                </div>
              )}

            </div>

            {/* Timer */}
            <div
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                timeLeft <= 10
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {timeLeft}s remaining
            </div>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between text-sm text-gray-500">

              <span>
                Question {currentQuestion + 1} of{" "}
                {totalQuestions}
              </span>

              <span>
                {answeredCount} / {totalQuestions} answered
              </span>

            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-[#e83e8c] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />

            </div>

          </div>

        </div>

        {/* Question Navigation */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.15)]">

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Questions
          </p>

          <div className="flex flex-wrap gap-2">

            {quiz.questions.map(
              (_: any, index: number) => {

                const isAnswered =
                  selectedAnswers[index] !== undefined;

                const isCurrent =
                  currentQuestion === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setCurrentQuestion(index)
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                      isCurrent
                        ? "bg-[#e83e8c] text-white shadow-md shadow-pink-200"
                        : isAnswered
                        ? "border border-pink-200 bg-pink-50 text-[#e83e8c]"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-[#e83e8c]"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* Question Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">

          <div className="mb-7">

            <p className="mb-3 text-sm font-semibold text-[#e83e8c]">
              Question {currentQuestion + 1}
            </p>

            <h2 className="text-2xl font-bold leading-relaxed text-[#171717]">
              {quiz.questions[currentQuestion].question}
            </h2>

          </div>

          {/* Options */}
          <div className="space-y-3">

            {quiz.questions[currentQuestion].options.map(
              (
                option: string,
                optionIndex: number
              ) => {

                const isSelected =
                  selectedAnswers[currentQuestion] ===
                  option;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestion]: option,
                      });
                    }}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#e83e8c] bg-pink-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/40"
                    }`}
                  >

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isSelected
                          ? "bg-[#e83e8c] text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-pink-100 group-hover:text-[#e83e8c]"
                      }`}
                    >
                      {String.fromCharCode(
                        65 + optionIndex
                      )}
                    </span>

                    <span
                      className={`text-[15px] font-medium ${
                        isSelected
                          ? "text-[#171717]"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </span>

                  </button>
                );
              }
            )}

          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">

            <button
              type="button"
              onClick={() =>
                setCurrentQuestion(
                  currentQuestion - 1
                )
              }
              disabled={currentQuestion === 0}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                currentQuestion === 0
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => {

                if (
                  currentQuestion <
                  totalQuestions - 1
                ) {
                  setCurrentQuestion(
                    currentQuestion + 1
                  );
                } else {
                  submitQuiz();
                }

              }}
              className="rounded-xl bg-[#e83e8c] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-pink-200 transition hover:bg-[#d9367e]"
            >
              {currentQuestion === totalQuestions - 1
                ? "Submit Quiz"
                : "Next Question"}
            </button>

          </div>

        </div>

        {/* Bottom Submit */}
        <div className="mt-6 text-center">

          <button
            type="button"
            onClick={() => {

              if (answeredCount !== totalQuestions) {
                alert(
                  "Please answer all questions before submitting."
                );
                return;
              }

              submitQuiz();

            }}
            className="text-sm font-medium text-gray-500 underline underline-offset-4 transition hover:text-[#e83e8c]"
          >
            Submit quiz now
          </button>

        </div>

      </div>
    </main>
  );
}