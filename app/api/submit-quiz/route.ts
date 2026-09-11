import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      quizId,
      selectedAnswers,
      score,
      totalQuestions,
    } = body;

    if (
      !quizId ||
      selectedAnswers === undefined ||
      score === undefined ||
      !totalQuestions
    ) {
      return NextResponse.json(
        { error: "Missing quiz attempt details." },
        { status: 400 }
      );
    }

    // Get the currently logged-in user
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a quiz." },
        { status: 401 }
      );
    }

    // Save the quiz attempt with the logged-in user's ID
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        selected_answers: selectedAnswers,
        score: score,
        total_questions: totalQuestions,
      })
      .select()
      .single();

    if (error) {
      console.error("Submit Quiz Supabase Error:", error);

      return NextResponse.json(
        { error: "Failed to save quiz attempt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attempt: data,
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);

    return NextResponse.json(
      { error: "Failed to submit quiz." },
      { status: 500 }
    );
  }
}