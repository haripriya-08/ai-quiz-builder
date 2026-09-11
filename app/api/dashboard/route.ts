import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to view the dashboard." },
        { status: 401 }
      );
    }

    // Load only this user's quiz attempts
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select(`
        id,
        score,
        total_questions,
        completed_at,
        quizzes (
          topic,
          difficulty
        )
      `)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Dashboard Supabase Error:", error);

      return NextResponse.json(
        { error: "Failed to load dashboard." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      attempts: data,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard." },
      { status: 500 }
    );
  }
}