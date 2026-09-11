
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  email: string;
  name: string;
};

type QuizAttempt = {
  score: number;
  total_questions: number;
  completed_at: string;
};

export default function ProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    name: "",
  });

  const [quizCount, setQuizCount] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const calculateStreak = (attempts: QuizAttempt[]) => {
    if (attempts.length === 0) {
      return 0;
    }

    const completedDates = new Set<string>();

    attempts.forEach((attempt) => {
      const date = new Date(attempt.completed_at);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      completedDates.add(`${year}-${month}-${day}`);
    });

    const today = new Date();

    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayKey = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, "0"),
      String(yesterday.getDate()).padStart(2, "0"),
    ].join("-");

    let currentDate: Date;

    if (completedDates.has(todayKey)) {
      currentDate = new Date(today);
    } else if (completedDates.has(yesterdayKey)) {
      currentDate = new Date(yesterday);
    } else {
      return 0;
    }

    let streak = 0;

    while (true) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${day}`;

      if (!completedDates.has(dateKey)) {
        break;
      }

      streak++;

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.href = "/auth";
          return;
        }

        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "Quiz Learner";

        setProfile({
          email: user.email || "",
          name: userName,
        });

        setNameInput(userName);

        const { data: attempts, error: attemptsError } =
          await supabase
            .from("quiz_attempts")
            .select("score, total_questions, completed_at")
            .eq("user_id", user.id)
            .order("completed_at", { ascending: false });

        if (attemptsError) {
          console.error(
            "Profile Attempts Error:",
            attemptsError
          );
        } else if (attempts) {
          const typedAttempts = attempts as QuizAttempt[];

          setQuizCount(typedAttempts.length);

          setCurrentStreak(
            calculateStreak(typedAttempts)
          );

          if (typedAttempts.length > 0) {
            const latestAttempt = typedAttempts[0];

            const percentage =
              latestAttempt.total_questions > 0
                ? Math.round(
                    (latestAttempt.score /
                      latestAttempt.total_questions) *
                      100
                  )
                : 0;

            setLastScore(percentage);
          }
        }
      } catch (err) {
        console.error("Profile Loading Error:", err);
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase]);

  const handleSaveProfile = async () => {
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
          },
        });

      if (updateError) {
        console.error(
          "Profile Update Error:",
          updateError
        );

        setError(updateError.message);
        return;
      }

      setProfile((current) => ({
        ...current,
        name: trimmedName,
      }));

      setNameInput(trimmedName);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile Save Error:", err);
      setError("Failed to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError("");

      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        console.error(
          "Logout Error:",
          logoutError
        );

        setError(logoutError.message);
        return;
      }

      window.location.href = "/auth";
    } catch (err) {
      console.error("Logout Error:", err);
      setError("Failed to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-[#171717]">
        <nav className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
          <button
            type="button"
            onClick={() => (window.location.href = "/")}
            className="text-xl font-bold"
          >
            Quiz<span className="text-[#e83e8c]">Builder</span>
          </button>
        </nav>

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-[#e83e8c]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

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
            onClick={() => (window.location.href = "/history")}
            className="transition hover:text-[#e83e8c]"
          >
            History
          </button>

          <button
            type="button"
            className="text-[#e83e8c]"
          >
            Profile
          </button>
        </div>
      </nav>

      {/* Profile */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#e83e8c]">
            Account
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Your Profile
          </h1>

          <p className="mt-3 text-gray-500">
            Manage your account and view your learning progress.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-[#e83e8c]">
                {initials}
              </div>

              <div>
                {editing ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#171717]">
                      Your Name
                    </label>

                    <input
                      type="text"
                      value={nameInput}
                      onChange={(event) =>
                        setNameInput(event.target.value)
                      }
                      className="w-full max-w-sm rounded-xl border border-gray-300 bg-white px-4 py-3 text-[#171717] outline-none transition focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">
                      {profile.name}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      {profile.email}
                    </p>
                  </>
                )}
              </div>
            </div>

            {editing ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setNameInput(profile.name);
                    setError("");
                    setMessage("");
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-xl bg-[#e83e8c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d9367e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setError("");
                  setMessage("");
                }}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:border-pink-300 hover:bg-pink-50 hover:text-[#e83e8c]"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Quizzes Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {quizCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Latest Score
            </p>

            <p className="mt-2 text-3xl font-bold text-[#e83e8c]">
              {lastScore}%
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Current Streak
            </p>

            <p className="mt-2 text-3xl font-bold">
              {currentStreak}{" "}
              <span className="text-base font-medium text-gray-400">
                {currentStreak === 1 ? "day" : "days"}
              </span>
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">
            Learning Preferences
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose your preferred learning style.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Preferred Difficulty
              </label>

              <select
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
                defaultValue="Medium"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Learning Goal
              </label>

              <select
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
                defaultValue="Interview Preparation"
              >
                <option>Interview Preparation</option>
                <option>Exam Preparation</option>
                <option>General Learning</option>
                <option>Competitive Programming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">
            Account
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You are signed in with your QuizBuilder account.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Email
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {profile.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

