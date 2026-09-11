import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Quiz code is required." },
        { status: 400 }
      );
    }

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !quiz) {
      return NextResponse.json(
        { error: "Quiz not found. Check the code and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        code: quiz.code,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questions: quiz.questions,
      },
    });
  } catch (error) {
    console.error("Join Quiz Error:", error);

    return NextResponse.json(
      { error: "Failed to find quiz." },
      { status: 500 }
    );
  }
}