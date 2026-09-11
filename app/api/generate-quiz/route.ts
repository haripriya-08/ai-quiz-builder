import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
console.log(
  "SUPABASE URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { topic, difficulty, questionCount } = body;

    if (!topic || !difficulty || !questionCount) {
      return NextResponse.json(
        { error: "Missing quiz details." },
        { status: 400 }
      );
    }

    // Generate quiz using Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `Create ${questionCount} multiple-choice quiz questions about ${topic} at ${difficulty} difficulty.

Return only valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const quiz = JSON.parse(text);

    // Generate unique quiz code
    const code =
      topic.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 8) +
      "-" +
      Math.random().toString(36).substring(2, 7).toUpperCase();

    // Save quiz to Supabase
    const { data: savedQuiz, error: databaseError } = await supabase
      .from("quizzes")
      .insert({
        code: code,
        topic: topic,
        difficulty: difficulty,
        question_count: quiz.questions.length,
        questions: quiz.questions,
      })
      .select()
      .single();

    if (databaseError) {
      console.error("Supabase Error:", databaseError);

      return NextResponse.json(
        {
          error: "Quiz was generated but could not be saved to database.",
        },
        { status: 500 }
      );
    }

    // Return quiz + database ID
    return NextResponse.json({
      quiz: {
        ...quiz,
        id: savedQuiz.id,
        code: savedQuiz.code,
        topic: savedQuiz.topic,
        difficulty: savedQuiz.difficulty,
      },
    });
  } catch (error: any) {
    console.error("Quiz Generation Error:", error);

    return NextResponse.json(
      {
        error:
          error?.status === 429
            ? "AI quota exceeded. Please try again later."
            : "Failed to generate quiz.",
      },
      { status: error?.status || 500 }
    );
  }
}