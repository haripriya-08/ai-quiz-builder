
"use client";

import { useEffect, useState } from "react";

type QuizAttempt = {
  id?: string;
  score: number;
  total_questions: number;
  completed_at: string;
  selected_answers?: unknown;
  quizzes?: {
    topic?: string;
    difficulty?: string;
    questions?: unknown;
  } | null;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/history");
        const data = await response.json();

        if (!response.ok) {
          console.error(data.error);
          return;
        }

        setHistory(data.history || []);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const reviewQuiz = (item: QuizAttempt) => {
    const result = {
      quiz: item.quizzes,
      selectedAnswers: item.selected_answers,
      score: item.score,
    };

    localStorage.setItem(
      "quizResult",
      JSON.stringify(result)
    );

    window.location.href = "/results";
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="text-xl font-bold"
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
            className="text-[#e83e8c]"
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
      </nav>

      {/* Page */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#e83e8c]">
            Your activity
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Quiz History
          </h1>

          <p className="mt-3 text-gray-500">
            Review your previous quiz attempts and track your
            progress.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#e83e8c]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your quiz history...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-2xl font-bold text-[#e83e8c]">
              ?
            </div>

            <h2 className="text-xl font-bold">
              No quizzes yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Generate your first AI quiz and your attempts
              will appear here.
            </p>

            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="mt-6 rounded-xl bg-[#e83e8c] px-6 py-3 font-semibold text-white transition hover:bg-[#d9367e]"
            >
              Create Your First Quiz
            </button>
          </div>
        )}

        {/* History */}
        {!loading && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => {
              const percentage =
                item.total_questions > 0
                  ? Math.round(
                      (item.score /
                        item.total_questions) *
                        100
                    )
                  : 0;

              const topic =
                item.quizzes?.topic ||
                `Quiz Attempt #${
                  history.length - index
                }`;

              const difficulty =
                item.quizzes?.difficulty || "Unknown";

              return (
                <div
                  key={item.id || index}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-20px_rgba(0,0,0,0.14)]"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {/* Quiz information */}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#e83e8c]">
                        Quiz Attempt
                      </p>

                      <h2 className="mt-2 truncate text-lg font-bold">
                        {topic}
                      </h2>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <p className="text-sm text-gray-500">
                          {formatDate(item.completed_at)}
                          {" • "}
                          {formatTime(item.completed_at)}
                        </p>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                          {difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Score information */}
                    <div className="flex flex-wrap items-center gap-6 md:gap-8">
                      <div>
                        <p className="text-xs text-gray-400">
                          Score
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {item.score}/
                          {item.total_questions}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Percentage
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#e83e8c]">
                          {percentage}%
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => reviewQuiz(item)}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:border-pink-300 hover:bg-pink-50"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

