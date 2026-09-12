import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase";
import { extractText, getDocumentProxy } from "unpdf";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Get uploaded PDF and question count
    const formData = await request.formData();

    const file = formData.get("file");
    const questionCountValue = formData.get("questionCount");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF file." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // Convert question count to number
    const questionCount = Number(questionCountValue);

    // Validate question count
    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 20
    ) {
      return NextResponse.json(
        { error: "Invalid question count." },
        { status: 400 }
      );
    }

    // 2. Convert PDF to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 3. Read PDF
    const pdf = await getDocumentProxy(buffer);

    // 4. Extract text
    const result = await extractText(pdf, {
      mergePages: true,
    });

    const extractedText = result.text.trim();

    if (!extractedText) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this PDF.",
        },
        { status: 400 }
      );
    }

    console.log(
      "PDF text extracted successfully."
    );

    // Limit text sent to Gemini
    const limitedText =
      extractedText.slice(0, 20000);

    // 5. Send extracted text to Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
Create a multiple-choice quiz based ONLY on the following PDF content.

Generate exactly ${questionCount} questions.

Return ONLY valid JSON in exactly this format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A"
    }
  ]
}

Rules:

- Generate exactly ${questionCount} questions.
- Use only information contained in the PDF.
- Each question must have exactly 4 options.
- There must be exactly one correct answer.
- The "answer" field must exactly match one of the four options.
- Do not include Markdown.
- Do not include explanations.
- Return valid JSON only.

PDF CONTENT:

${limitedText}
`;

    // 6. Generate quiz
    const aiResult =
      await model.generateContent(prompt);

    let text = aiResult.response.text().trim();

    // Remove accidental Markdown code fences
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const quiz = JSON.parse(text);

    // 7. Validate Gemini response
    if (
      !quiz.questions ||
      !Array.isArray(quiz.questions) ||
      quiz.questions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "AI could not generate valid quiz questions.",
        },
        { status: 500 }
      );
    }

    // Ensure the generated count matches requested count
    if (
      quiz.questions.length !== questionCount
    ) {
      return NextResponse.json(
        {
          error:
            `AI generated ${quiz.questions.length} questions instead of ${questionCount}. Please try again.`,
        },
        { status: 500 }
      );
    }

    // 8. Generate quiz code
    const code =
      "PDF-" +
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    // 9. Save quiz to Supabase
    const { data: savedQuiz, error: databaseError } =
      await supabase
        .from("quizzes")
        .insert({
          code,
          topic: file.name.replace(
            /\.pdf$/i,
            ""
          ),
          difficulty: "PDF Generated",
          question_count:
            quiz.questions.length,
          questions: quiz.questions,
        })
        .select()
        .single();

    if (databaseError) {
      console.error(
        "Supabase Error:",
        databaseError
      );

      return NextResponse.json(
        {
          error:
            "Quiz was generated but could not be saved to the database.",
        },
        { status: 500 }
      );
    }

    // 10. Return quiz to frontend
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
    console.error(
      "PDF Quiz Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate quiz from PDF.",
      },
      { status: 500 }
    );
  }
}