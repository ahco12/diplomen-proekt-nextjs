// app/game/Quiz.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Answer {
  answer: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  difficulty: string;
  answers: Answer[];
}

export default function Quiz({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const router = useRouter();

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswerIndex(index);
    setIsAnswered(true);

    const isCorrect = questions[currentIndex].answers[index].isCorrect;

    if (isCorrect) {
      setShowCorrect(true);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          resetState();
        } else {
          router.push("/");
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setShowCorrect(true);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }, 1400);
    }
  };

  const resetState = () => {
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setShowCorrect(false);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Who Wants to Be a Millionaire?</h1>

      <div className="bg-blue-800 text-center text-lg font-semibold p-6 rounded-md shadow-lg border-4 border-blue-400">
        <p className="mb-4">Question {currentIndex + 1}</p>
        <h2 className="text-2xl">{currentQuestion.question}</h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-2xl">
        {currentQuestion.answers.map((answer, index) => {
          const isSelected = selectedAnswerIndex === index;
          const isCorrect = answer.isCorrect;
          const isWrongSelected = isSelected && !isCorrect;

          let bgColor = "bg-gray-800";
          if (isCorrect && showCorrect) bgColor = "bg-green-600";
          if (isWrongSelected && isAnswered) bgColor = "bg-red-600";

          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={isAnswered}
              className={`p-4 rounded-md border-2 border-gray-700 text-left hover:bg-blue-700 hover:border-blue-500 transition-all duration-300 ${bgColor}`}
            >
              {answer.answer}
            </button>
          );
        })}
      </div>
    </div>
  );
}
