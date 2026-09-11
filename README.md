# 🧠 AI Quiz Builder

> An AI-powered quiz generation platform that turns topics and PDF documents into interactive quizzes.

## 🚀 Live Demo

👉 **[Try AI Quiz Builder](https://ai-quiz-builder-steel-nine.vercel.app/)**

AI Quiz Builder is a full-stack AI-powered EdTech application that allows users to **generate quizzes using AI, upload PDFs to create quizzes automatically, share quizzes using unique codes, attempt quizzes, and track their performance**.

The project was built to understand and implement a complete real-world application flow — from **frontend → backend APIs → AI integration → database → authentication → deployment**.

## ✨ Features

### 🤖 AI Quiz Generation

* Enter any topic and generate a quiz using AI.
* Choose difficulty level.
* Select the number of questions.
* AI generates questions, options, and correct answers.

### 📄 PDF → Quiz

* Upload a PDF document.
* The application extracts the text from the PDF.
* AI analyzes the content and automatically generates a quiz.

### 🔗 Quiz Sharing

* Every generated quiz receives a unique quiz code.
* Share the code with others.
* Users can join and attempt quizzes using the code.

### 📝 Interactive Quiz

* Multiple-choice questions.
* Question navigation.
* Answer tracking.
* Countdown timer.
* Automatic score calculation.
* Submit quiz and receive results instantly.

### 📊 Results & Review

* View final score and percentage.
* See correct and incorrect answers.
* Review the correct answer for every question.
* Share or reuse the quiz code.

### 📈 Dashboard

* Track completed quizzes.
* Average score.
* Best score.
* Current streak.
* Areas that need improvement.
* Recent quiz activity.

### 🕒 Quiz History

* View previously completed quizzes.
* See topic, difficulty, score, percentage, and completion time.
* Review previous quiz attempts.

### 👤 Authentication & Profile

* User signup and login.
* User profile.
* Full name management.
* Learning preferences.
* Quiz statistics.
* Logout functionality.

## 🛠️ Tech Stack

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**

### Backend

* **Next.js API Routes**
* REST-style API endpoints

### AI

* **Google Gemini API**
* Gemini is used for:

  * Topic-based quiz generation
  * PDF-based quiz generation
  * Question and answer generation

### Database

* **Supabase**
* PostgreSQL database
* Stores:

  * Quizzes
  * Quiz questions
  * Quiz attempts
  * User-related attempt data

### Authentication

* **Supabase Authentication**
* Email/password authentication
* Server-side session handling

### PDF Processing

* **unpdf**
* Used to extract text from uploaded PDF documents before sending the content to the AI model.

### Deployment

* **Vercel**

## 🔄 How It Works


                    ┌──────────────────┐
                    │   User opens app │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Choose quiz method  │
                  └─────────┬───────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      ┌───────────────┐           ┌────────────────┐
      │ Topic Based   │           │   Upload PDF   │
      │ Quiz          │           │                │
      └───────┬───────┘           └───────┬────────┘
              │                           │
              ▼                           ▼
      ┌─────────────────────────────────────────┐
      │              Gemini AI                  │
      │       Generates quiz questions          │
      └────────────────────┬────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Supabase Database│
                  │   Save Quiz      │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Unique Quiz Code│
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Attempt Quiz    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Calculate Score  │
                  └────────┬─────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │ Results + History +      │
              │ Dashboard Statistics     │
              └──────────────────────────┘


## 🏗️ Project Architecture

AI Quiz Builder
│
├── Frontend
│   ├── Home / Quiz Creation
│   ├── Quiz Attempt
│   ├── Results
│   ├── Dashboard
│   ├── History
│   ├── Profile
│   └── Authentication
│
├── Backend
│   ├── Generate Quiz API
│   ├── Generate PDF Quiz API
│   ├── Join Quiz API
│   ├── Submit Quiz API
│   ├── Dashboard API
│   └── History API
│
├── AI Layer
│   └── Google Gemini API
│
├── Database
│   └── Supabase / PostgreSQL
│
└── Authentication
    └── Supabase Auth


## 📂 Main Project Structure

ai-quiz-builder/
│
├── app/
│   ├── api/
│   │   ├── dashboard/
│   │   ├── generate-pdf-quiz/
│   │   ├── generate-quiz/
│   │   ├── history/
│   │   ├── join-quiz/
│   │   └── submit-quiz/
│   │
│   ├── auth/
│   ├── dashboard/
│   ├── history/
│   ├── profile/
│   ├── quiz/
│   ├── results/
│   └── page.tsx
│
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── supabase.ts
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


> Never commit `.env.local` or API keys to GitHub.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/haripriya-08/ai-quiz-builder.git
```

### 2. Move into the project

```bash
cd ai-quiz-builder
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create `.env.local` and add:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🗄️ Database

The application uses Supabase PostgreSQL.

### `quizzes`

Stores generated quizzes.

Main fields include:

* Quiz ID
* Quiz code
* Topic
* Difficulty
* Question count
* Questions
* Creation time

### `quiz_attempts`

Stores user quiz attempts.

Main fields include:

* Attempt ID
* Quiz ID
* User ID
* Selected answers
* Score
* Total questions
* Completion time

Row Level Security is used to ensure authenticated users can access their own quiz attempt data.

---

## 🔒 Security

The project uses several security practices:

* Environment variables for API keys.
* Supabase Authentication.
* Server-side authentication checks.
* Row Level Security for quiz attempts.
* User-specific dashboard and history data.
* Protected routes for authenticated pages.

---

## 🎯 What This Project Demonstrates

This project goes beyond a basic CRUD application and demonstrates experience with:

* Full-stack application development
* Next.js and React
* TypeScript
* REST API development
* AI API integration
* Prompt-based structured JSON generation
* PDF text extraction
* PostgreSQL database design
* Supabase
* Authentication
* Row Level Security
* Protected routes
* User-specific data
* File uploads
* State management
* Local storage
* Quiz scoring logic
* API error handling
* Deployment

---

## 🧠 AI Integration

Google Gemini is the core AI component of the application.

For topic-based quizzes, the user provides:

```text
Topic
Difficulty
Number of questions
```

The backend sends these requirements to Gemini and receives structured quiz data.

For PDF quizzes:

```text
PDF
 ↓
Text extraction
 ↓
Extracted content
 ↓
Gemini
 ↓
Generated questions
 ↓
Supabase
 ↓
Interactive quiz
```

This makes the application useful for creating quizzes from both **general topics and user-provided learning material**.

---

## 🌱 Future Improvements

Possible future improvements include:

* More quiz question types
* Better PDF processing for complex documents
* Image-based question generation
* Quiz categories
* Public quiz discovery
* Leaderboards
* Teacher/classroom features
* More detailed analytics
* Improved AI-generated explanations
* Production-level monitoring

---

## 📸 Application Flow

```text
Create Quiz
     ↓
AI Generation
     ↓
Quiz Ready
     ↓
Share Quiz Code
     ↓
Attempt Quiz
     ↓
Submit
     ↓
View Results
     ↓
Save Attempt
     ↓
Dashboard / History / Profile
```

---

## 💡 Why I Built This

I built AI Quiz Builder to understand how a modern AI-powered full-stack application works end-to-end.

Instead of building only a frontend project, this project combines **AI, APIs, authentication, database operations, PDF processing, user data, and deployment** into one complete application.

---

## 👩‍💻 Author

  Haripriya R
---

## ⭐ If You Like This Project

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
