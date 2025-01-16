// app/game/Quiz.tsx
"use client";

import { useState } from "react";

interface Answer {
  answer: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  category: string;
  answers: Answer[];
}

export default function Quiz({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <h1>Quiz</h1>

      {/* Display Current Question */}
      <div key={currentQuestion.id}>
        <h2>Question {currentIndex + 1}: {currentQuestion.question}</h2>
        <ul>
          {currentQuestion.answers.map((answer, i) => (
            <li key={i}>{answer.answer}</li>
          ))}
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
