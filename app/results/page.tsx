"use client";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem("quizResult");

    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center text-[#171717]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#e83e8c]" />
          <h1 className="text-xl font-semibold">Loading Results...</h1>
        </div>
      </main>
    );
  }

  const totalQuestions = result.quiz.questions.length;
  const percentage = Math.round(
    (result.score / totalQuestions) * 100
  );
  const incorrect = totalQuestions - result.score;

  let message = "";
  let subMessage = "";

  if (percentage >= 80) {
    message = "Excellent performance!";
    subMessage = "You have a strong understanding of this topic.";
  } else if (percentage >= 60) {
    message = "Good job!";
    subMessage = "You are on the right track. Keep practicing.";
  } else {
    message = "Keep practicing!";
    subMessage = "Review your mistakes and try another quiz.";
  }

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
            Quiz<span className="text-[#e83e8c]">Builder</span>
          </button>

          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">

            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="transition hover:text-[#e83e8c]"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/history")}
              className="transition hover:text-[#e83e8c]"
            >
              History
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/profile")}
              className="transition hover:text-[#e83e8c]"
            >
              Profile
            </button>

          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Header */}
        <div className="mb-10 text-center">

          <p className="mb-2 text-sm font-semibold text-[#e83e8c]">
            QUIZ COMPLETED
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Your Results
          </h1>

          <p className="mt-3 text-gray-500">
            {message}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {subMessage}
          </p>

        </div>

        {/* Score Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">

          <div className="flex flex-col items-center">

            {/* Score Circle */}
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-pink-100">

              <div className="absolute inset-0 rounded-full border-[10px] border-[#e83e8c]" />

              <div className="relative text-center">
                <p className="text-4xl font-bold">
                  {percentage}%
                </p>

                <p className="mt-1 text-xs font-medium text-gray-400">
                  SCORE
                </p>
              </div>

            </div>

            <p className="mt-6 text-lg font-semibold">
              {result.score} / {totalQuestions} correct
            </p>

          </div>
          {/* Share Quiz */}
<div className="mt-6 rounded-3xl border border-pink-100 bg-pink-50 p-6">
  <p className="text-sm font-semibold uppercase tracking-wider text-[#e83e8c]">
    Share this quiz
  </p>

  <h2 className="mt-2 text-xl font-bold">
    Challenge someone else
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Share the quiz code with another learner so they can take the same quiz.
  </p>

  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="flex-1 rounded-xl border border-pink-200 bg-white px-4 py-3">
      <p className="text-xs text-gray-400">
        Quiz Code
      </p>

      <p className="mt-1 text-lg font-bold tracking-wider text-[#e83e8c]">
        {result.quiz.code || "Not available"}
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(result.quiz.code);

        alert("Quiz code copied!");
      }}
      className="rounded-xl bg-[#e83e8c] px-5 py-3 font-semibold text-white transition hover:bg-[#d6337f]"
    >
      Copy Code
    </button>
  </div>
</div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">

            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">
                {result.score}
              </p>

              <p className="mt-1 text-sm font-medium text-green-700">
                Correct Answers
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <p className="text-3xl font-bold text-red-500">
                {incorrect}
              </p>

              <p className="mt-1 text-sm font-medium text-red-600">
                Incorrect Answers
              </p>
            </div>

          </div>

        </div>

        {/* Review */}
        <div className="mt-8">

          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Review Your Answers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              See where you performed well and where you can improve.
            </p>
          </div>

          <div className="space-y-4">

            {result.quiz.questions.map(
              (q: any, index: number) => {

                const userAnswer =
                  result.selectedAnswers[index];

                const isCorrect =
                  userAnswer === q.answer;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border bg-white p-6 shadow-sm ${
                      isCorrect
                        ? "border-green-100"
                        : "border-red-100"
                    }`}
                  >

                    {/* Question */}
                    <div className="flex gap-4">

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1">

                        <h3 className="font-semibold leading-relaxed text-[#171717]">
                          {q.question}
                        </h3>

                        {/* Your Answer */}
                        <div className="mt-4">

                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Your Answer
                          </p>

                          <p
                            className={`mt-1 font-medium ${
                              isCorrect
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {userAnswer || "Not answered"}
                          </p>

                        </div>

                        {/* Correct Answer */}
                        {!isCorrect && (
                          <div className="mt-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Correct Answer
                            </p>

                            <p className="mt-1 font-medium text-green-600">
                              {q.answer}
                            </p>

                          </div>
                        )}

                        {/* Status */}
                        <div className="mt-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isCorrect
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {isCorrect
                              ? "Correct"
                              : "Incorrect"}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("quizResult");
              window.location.href = "/";
            }}
            className="rounded-xl bg-[#e83e8c] px-7 py-3.5 font-semibold text-white shadow-md shadow-pink-200 transition hover:bg-[#d9367e]"
          >
            Generate Another Quiz
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/dashboard")}
            className="rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:border-pink-300 hover:text-[#e83e8c]"
          >
            Go to Dashboard
          </button>

        </div>

      </div>
    </main>
  );
}