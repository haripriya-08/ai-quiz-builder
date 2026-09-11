
"use client";

import { useEffect, useState } from "react";

type QuizAttempt = {
  id?: string;
  score: number;
  total_questions: number;
  completed_at: string;
  quizzes?: {
    topic?: string;
    difficulty?: string;
  } | null;
};

export default function DashboardPage() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        if (!response.ok) {
          console.error(data.error);
          return;
        }

        setHistory(data.attempts || []);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalQuizzes = history.length;

  const averageScore =
    totalQuizzes > 0
      ? Math.round(
          history.reduce((sum, item) => {
            if (!item.total_questions) return sum;

            return (
              sum +
              (item.score / item.total_questions) * 100
            );
          }, 0) / totalQuizzes
        )
      : 0;

  const bestScore =
    totalQuizzes > 0
      ? Math.max(
          ...history.map((item) => {
            if (!item.total_questions) return 0;

            return Math.round(
              (item.score / item.total_questions) * 100
            );
          })
        )
      : 0;

  const currentStreak = (() => {
    if (history.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(
        history.map((item) =>
          new Date(item.completed_at).toDateString()
        )
      )
    );

    const dates = uniqueDates
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestDate = new Date(dates[0]);
    latestDate.setHours(0, 0, 0, 0);

    const daysSinceLatest = Math.floor(
      (today.getTime() - latestDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLatest > 1) return 0;

    let streak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i + 1]);

      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const difference =
        (current.getTime() - previous.getTime()) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  })();

  const topicScores: {
    [key: string]: number[];
  } = {};

  history.forEach((item) => {
    const topic = item.quizzes?.topic || "Unknown Topic";

    if (!item.total_questions) return;

    const percentage = Math.round(
      (item.score / item.total_questions) * 100
    );

    if (!topicScores[topic]) {
      topicScores[topic] = [];
    }

    topicScores[topic].push(percentage);
  });

  const improvementAreas = Object.entries(topicScores)
    .map(([topic, scores]) => {
      const average = Math.round(
        scores.reduce((sum, score) => sum + score, 0) /
          scores.length
      );

      return {
        topic,
        average,
      };
    })
    .sort((a, b) => a.average - b.average)
    .slice(0, 4);

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
            className="text-[#e83e8c]"
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
      </nav>

      {/* Dashboard */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#e83e8c]">
            Overview
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Your Dashboard
          </h1>

          <p className="mt-3 text-gray-500">
            Track your learning progress and improve your
            performance.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#e83e8c]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Quizzes Completed
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {totalQuizzes}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Average Score
                </p>

                <p className="mt-3 text-3xl font-bold text-[#e83e8c]">
                  {averageScore}%
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Best Score
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {bestScore}%
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Current Streak
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {currentStreak}{" "}
                  <span className="text-base font-medium text-gray-400">
                    {currentStreak === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
            </div>

            {/* Progress + Areas */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Learning Progress */}
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold">
                  Learning Progress
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Your overall quiz performance.
                </p>

                {totalQuizzes === 0 ? (
                  <div className="mt-8 rounded-2xl bg-gray-50 p-6">
                    <p className="font-semibold">
                      No progress yet
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Complete your first quiz to start
                      tracking your performance.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium">
                        Average performance
                      </span>

                      <span className="font-bold text-[#e83e8c]">
                        {averageScore}%
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#e83e8c] transition-all duration-700"
                        style={{
                          width: `${averageScore}%`,
                        }}
                      />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Best Performance
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          {bestScore}%
                        </p>
                      </div>

                      <div className="rounded-2xl bg-pink-50 p-4">
                        <p className="text-xs text-[#e83e8c]">
                          Current Streak
                        </p>

                        <p className="mt-1 text-xl font-bold text-[#e83e8c]">
                          {currentStreak}{" "}
                          {currentStreak === 1
                            ? "day"
                            : "days"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Areas to Improve */}
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold">
                  Areas to Improve
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Topics where you can focus your practice.
                </p>

                {history.length === 0 ? (
                  <div className="mt-8 rounded-2xl bg-pink-50 p-5">
                    <p className="text-sm font-semibold text-[#e83e8c]">
                      Start Taking Quizzes
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Complete some quizzes to see which
                      topics need more practice.
                    </p>
                  </div>
                ) : improvementAreas.length === 0 ? (
                  <div className="mt-8 rounded-2xl bg-gray-50 p-5">
                    <p className="text-sm text-gray-600">
                      Keep completing quizzes to build
                      topic-level insights.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {improvementAreas.map((item) => {
                      let status = "Needs Practice";
                      let statusClass =
                        "text-red-500 bg-red-50";

                      if (item.average >= 70) {
                        status = "Good";
                        statusClass =
                          "text-green-600 bg-green-50";
                      } else if (item.average >= 50) {
                        status = "Improving";
                        statusClass =
                          "text-yellow-600 bg-yellow-50";
                      }

                      return (
                        <div
                          key={item.topic}
                          className="rounded-2xl border border-gray-100 p-5"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {item.topic}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Average performance:{" "}
                                {item.average}%
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#e83e8c] transition-all duration-700"
                              style={{
                                width: `${item.average}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Quizzes */}
            <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Recent Quizzes
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Your latest quiz attempts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/history")
                  }
                  className="text-sm font-semibold text-[#e83e8c] hover:underline"
                >
                  View History
                </button>
              </div>

              {history.length === 0 ? (
                <div className="mt-8 rounded-2xl bg-gray-50 p-8 text-center">
                  <p className="font-semibold">
                    No quizzes completed yet.
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Your completed quizzes will appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = "/")
                    }
                    className="mt-5 rounded-xl bg-[#e83e8c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d9367e]"
                  >
                    Create Quiz
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {history.slice(0, 5).map((item, index) => {
                    const percentage =
                      item.total_questions > 0
                        ? Math.round(
                            (item.score /
                              item.total_questions) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 p-5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {item.quizzes?.topic ||
                              `Quiz Attempt #${
                                history.length - index
                              }`}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(
                              item.completed_at
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <p className="ml-4 shrink-0 font-bold text-[#e83e8c]">
                          {percentage}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Quiz */}
            <div className="mt-8 rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-white p-8 shadow-sm">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#e83e8c]">
                    Keep Learning
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Ready for another challenge?
                  </h2>

                  <p className="mt-2 max-w-lg text-sm text-gray-500">
                    Generate a new AI-powered quiz and keep
                    improving your knowledge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/")
                  }
                  className="shrink-0 rounded-xl bg-[#e83e8c] px-6 py-3 font-semibold text-white shadow-md shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-[#d9367e]"
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

