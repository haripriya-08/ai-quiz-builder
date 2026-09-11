"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        window.location.href = "/";
      }
    };

    checkSession();
  }, [supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const {
          data: { user },
          error: signupError,
        } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (signupError) {
          setError(signupError.message);
          return;
        }

        if (!user) {
          setError("Account could not be created.");
          return;
        }

        setMessage(
          "Account created successfully. You can now start using QuizBuilder."
        );

        setMode("login");
        setPassword("");
        return;
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Authentication Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] md:grid-cols-2">

          {/* Left Side */}
          <div className="hidden bg-white p-12 text-[#171717] md:flex md:flex-col md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e83e8c] font-bold text-white">
                  AI
                </div>

                <span className="text-xl font-bold">
                  QuizBuilder
                </span>
              </button>

              <div className="mt-20">
                <p className="mb-4 text-sm font-semibold tracking-wide text-[#e83e8c]">
                  AI-POWERED LEARNING
                </p>

                <h1 className="text-4xl font-bold leading-tight text-[#171717]">
                  Learn smarter.
                  <br />
                  Practice better.
                </h1>

                <p className="mt-6 max-w-sm leading-7 text-gray-500">
                  Create AI-generated quizzes, test your knowledge,
                  track your progress, and improve over time.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Your learning journey starts here.
            </p>
          </div>

          {/* Right Side */}
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="mb-8 flex items-center gap-3 md:hidden"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e83e8c] font-bold text-white">
                  AI
                </div>

                <span className="text-xl font-bold">
                  QuizBuilder
                </span>
              </button>

              <h2 className="text-3xl font-bold text-[#171717]">
                {mode === "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {mode === "login"
                  ? "Sign in to continue your learning journey."
                  : "Create an account to save your progress."}
              </p>
            </div>

            {/* Mode Switch */}
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-pink-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-[#e83e8c] shadow-sm"
                    : "text-gray-500 hover:text-[#171717]"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-white text-[#e83e8c] shadow-sm"
                    : "text-gray-500 hover:text-[#171717]"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#171717]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[#171717] outline-none transition placeholder:text-gray-400 focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#171717]">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[#171717] outline-none transition placeholder:text-gray-400 focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#171717]">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[#171717] outline-none transition placeholder:text-gray-400 focus:border-[#e83e8c] focus:ring-2 focus:ring-pink-100"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#e83e8c] px-6 py-3.5 font-semibold text-white shadow-md shadow-pink-200 transition hover:bg-[#d9367e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By continuing, you agree to use QuizBuilder
              responsibly for learning and practice.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}