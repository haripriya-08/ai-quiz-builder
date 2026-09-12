"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GeneratedQuiz = {
  id?: string;
  code?: string;
  topic?: string;
  difficulty?: string;
  questions?: unknown[];
};

export default function Home() {
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questionCount, setQuestionCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [generatedQuiz, setGeneratedQuiz] =
    useState<GeneratedQuiz | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // =========================
  // GENERATE QUIZ
  // =========================
  const generateQuiz = async () => {
  const count = Number(questionCount);

  if (
    questionCount.trim() === "" ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 50
  ) {
    alert("Please choose between 1 and 50 questions.");
    return;
  }

    // =========================
    // PDF QUIZ
    // =========================
    if (pdfFile) {
      try {
        setIsGenerating(true);

        const formData = new FormData();

        formData.append("file", pdfFile);
        formData.append(
  "questionCount",
  count.toString()
);

        const response = await fetch(
          "/api/generate-pdf-quiz",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.quiz) {
          alert(
            data.error ||
              "Failed to generate quiz from PDF."
          );
          return;
        }

        const quiz = data.quiz;

        localStorage.setItem(
          "quiz",
          JSON.stringify(quiz)
        );

        setGeneratedQuiz(quiz);
      } catch (error) {
        console.error("PDF Quiz Error:", error);
        alert("Failed to generate quiz from PDF.");
      } finally {
        setIsGenerating(false);
      }

      return;
    }

    // =========================
    // NORMAL TOPIC QUIZ
    // =========================
    if (!topic.trim()) {
      alert("Please enter a topic or upload a PDF.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch(
        "/api/generate-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  topic,
  difficulty,
  questionCount: count,
}),
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok || !data.quiz) {
        alert(
          data.error ||
            "Failed to generate quiz. Please try again."
        );
        return;
      }

      const quiz = {
        ...data.quiz,
        topic,
        difficulty,
      };

      localStorage.setItem(
        "quiz",
        JSON.stringify(quiz)
      );

      setGeneratedQuiz(quiz);
    } catch (error) {
      console.error("Quiz Generation Error:", error);
      alert("Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================
  // START GENERATED QUIZ
  // =========================
  const startGeneratedQuiz = () => {
    if (!generatedQuiz) return;

    localStorage.setItem(
      "quiz",
      JSON.stringify(generatedQuiz)
    );

    window.location.href = "/quiz";
  };

  // =========================
  // COPY QUIZ CODE
  // =========================
  const copyQuizCode = async () => {
    if (!generatedQuiz?.code) return;

    try {
      await navigator.clipboard.writeText(
        generatedQuiz.code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy quiz code:",
        error
      );
    }
  };

  // =========================
  // JOIN QUIZ
  // =========================
  const joinQuiz = async () => {
    const code = joinCode.trim().toUpperCase();

    if (!code) {
      alert("Please enter a quiz code.");
      return;
    }

    try {
      const response = await fetch(
        "/api/join-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.quiz) {
        alert(
          data.error ||
            "Quiz not found. Check the code and try again."
        );
        return;
      }

      localStorage.setItem(
        "quiz",
        JSON.stringify(data.quiz)
      );

      window.location.href = "/quiz";
    } catch (error) {
      console.error("Join Quiz Error:", error);
      alert(
        "Unable to join quiz. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={() =>
              (window.location.href = "/")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e83e8c] font-bold text-white">
              AI
            </div>

            <span className="text-xl font-bold tracking-tight">
              QuizBuilder
            </span>
          </button>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/dashboard")
              }
              className="transition hover:text-black"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/history")
              }
              className="transition hover:text-black"
            >
              History
            </button>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/profile")
              }
              className="transition hover:text-black"
            >
              Profile
            </button>
          </div>

          {userEmail ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  (window.location.href =
                    "/profile")
                }
                className="hidden text-sm font-medium text-gray-600 transition hover:text-black sm:block"
              >
                {userEmail}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                (window.location.href = "/auth")
              }
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
            ✦ AI-Powered Learning
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Create smarter quizzes
            <span className="block text-[#e83e8c]">
              with AI.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Generate personalized quizzes on any
            topic, test your knowledge, and discover
            what you need to improve.
          </p>
        </div>

        {/* =========================
            CREATE QUIZ CARD
        ========================= */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">
                Create your quiz
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Customize your quiz and let AI
                generate the questions.
              </p>
            </div>

            {/* TOPIC */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                What do you want to learn?
              </label>

              <input
                type="text"
                placeholder="e.g. Java, DSA, React, Machine Learning"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 outline-none transition focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Java",
                  "DSA",
                  "React",
                  "Python",
                  "Machine Learning",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setTopic(suggestion)
                    }
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* DIFFICULTY + QUESTIONS */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* DIFFICULTY */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 outline-none transition focus:border-[#e83e8c]"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              {/* QUESTION COUNT */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Number of Questions
                </label>

                <input
  type="number"
  inputMode="numeric"
  min={1}
  max={50}
  value={questionCount}
  onChange={(e) => {
    const value = e.target.value;

    if (value === "") {
      setQuestionCount("");
      return;
    }

    if (/^\d{0,2}$/.test(value)) {
      setQuestionCount(value);
    }
  }}
  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 outline-none transition focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
/>

                <p className="mt-2 text-xs text-gray-500">
                  Choose any number from 1 to 50.
                </p>
              </div>
            </div>

            {/* PDF UPLOAD */}
            <div className="mt-6">
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition hover:border-pink-300 hover:bg-pink-50">
                <div className="text-2xl">↑</div>

                <p className="mt-2 font-semibold">
                  Upload study material
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  PDF → AI-generated quiz
                </p>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  id="pdf-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    if (
                      file.type !==
                      "application/pdf"
                    ) {
                      alert(
                        "Please select a PDF file."
                      );
                      return;
                    }

                    setPdfFile(file);
                  }}
                />

                <label
                  htmlFor="pdf-upload"
                  className="mt-5 inline-block cursor-pointer rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Choose PDF
                </label>

                {pdfFile && (
                  <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50 px-4 py-3">
                    <p className="text-xs font-medium text-gray-500">
                      Selected PDF
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-[#e83e8c]">
                      {pdfFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* GENERATE */}
            <button
              type="button"
              onClick={generateQuiz}
              disabled={isGenerating}
              className="mt-6 w-full rounded-xl bg-[#e83e8c] px-6 py-3.5 font-semibold text-white shadow-md shadow-pink-200 transition hover:bg-[#d9367e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating
                ? "Generating Quiz..."
                : pdfFile
                  ? "Generate Quiz from PDF"
                  : "Generate Quiz"}
            </button>

            {/* =========================
                GENERATED QUIZ SHARE PANEL
            ========================= */}
            {generatedQuiz && (
              <div className="mt-6 rounded-2xl border border-pink-200 bg-pink-50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#e83e8c]">
                      Quiz Ready
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      Your quiz has been generated.
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Share this code with others so
                      they can join your quiz.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-green-600">
                    Saved
                  </div>
                </div>

                {generatedQuiz.code && (
                  <div className="mt-5 rounded-2xl border border-pink-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Quiz Code
                    </p>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-all text-2xl font-bold tracking-widest text-[#e83e8c]">
                        {generatedQuiz.code}
                      </p>

                      <button
                        type="button"
                        onClick={copyQuizCode}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:border-pink-300 hover:bg-pink-50"
                      >
                        {copied
                          ? "Copied!"
                          : "Copy Code"}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={startGeneratedQuiz}
                  className="mt-5 w-full rounded-xl bg-[#e83e8c] px-5 py-3 font-semibold text-white transition hover:bg-[#d9367e]"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {/* DIVIDER */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                or
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* JOIN QUIZ */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="font-semibold">
                Have a quiz code?
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter a code to join someone else's
                quiz.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="e.g. JAVA-7K29X"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(
                      e.target.value.toUpperCase()
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      joinQuiz();
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-pink-400"
                />

                <button
                  type="button"
                  onClick={joinQuiz}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold transition hover:border-pink-300 hover:bg-pink-50"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURES
      ========================= */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3">
          <div>
            <div className="mb-4 text-2xl">
              ✦
            </div>

            <h3 className="font-bold">
              AI Generated
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Generate questions instantly based on
              your chosen topic and difficulty.
            </p>
          </div>

          <div>
            <div className="mb-4 text-2xl">
              ◉
            </div>

            <h3 className="font-bold">
              Track Progress
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              See your scores, weak areas, and learning
              progress over time.
            </p>
          </div>

          <div>
            <div className="mb-4 text-2xl">
              ↗
            </div>

            <h3 className="font-bold">
              Learn Smarter
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Use AI-powered insights to focus your
              practice where it matters most.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}