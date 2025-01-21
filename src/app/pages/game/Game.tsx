"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // Adjust import path if needed
import { useAuth } from "../../components/AuthProvider"; // Assuming you have a custom hook for authentication

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
  const [points, setPoints] = useState(0); // Current points earned during the game
  const [initialPoints, setInitialPoints] = useState(0); // Points from Firestore
  const router = useRouter();
  const { user } = useAuth(); // Get current user from authentication

  useEffect(() => {
    if (user) fetchUserPoints(); // Fetch initial points from Firestore
  }, [user]);

  const fetchUserPoints = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setInitialPoints(data.points || 0); // Fetch initial points
      }
    }
  };

  const handleAnswerClick = async (index: number) => {
    if (isAnswered) return; // Prevent multiple clicks
    setSelectedAnswerIndex(index);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = currentQuestion.answers[index].isCorrect;

    // Calculate points based on difficulty
    let earnedPoints = 0;
    if (isCorrect) {
      if (currentQuestion.difficulty === "easy") earnedPoints = 50;
      if (currentQuestion.difficulty === "medium") earnedPoints = 100;
      if (currentQuestion.difficulty === "hard") earnedPoints = 200;
      setPoints((prev) => prev + earnedPoints); // Update local points
    }

    if (isCorrect) {
      setShowCorrect(true);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          resetState();
        } else {
          savePoints(); // Save points and navigate to the main page
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setShowCorrect(true);
        setTimeout(() => {
          savePoints(); // Save points and navigate on incorrect answer
        }, 1000);
      }, 1400);
    }
  };

  const savePoints = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        // Add initial points + earned points
        const totalPoints = initialPoints + points;
        await updateDoc(userDocRef, {
          points: totalPoints,
        });
        console.log("Points updated successfully!");
      } catch (error) {
        console.error("Error updating points:", error);
      }
    }
    router.push("/"); // Navigate to the main page
  };

  const resetState = () => {
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setShowCorrect(false);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex">
      {/* Main Quiz Area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Who Wants to Be a Millionaire?</h1>

        {/* Question Area */}
        <div className="bg-blue-800 text-center text-lg font-semibold p-6 rounded-md shadow-lg border-4 border-blue-400 w-full max-w-3xl">
          <p className="mb-4">Question {currentIndex + 1}</p>
          <h2 className="text-2xl">{currentQuestion.question}</h2>
        </div>

        {/* Answers Area */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-3xl">
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

      {/* Progress Column */}
      <div className="w-1/5 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Progress</h2>
        <ul className="flex flex-col-reverse space-y-2 space-y-reverse">
          {questions.map((_, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <li
                key={index}
                className={`p-2 rounded-md text-center text-sm ${
                  isActive
                    ? "bg-blue-600"
                    : isCompleted
                    ? "bg-green-600"
                    : "bg-gray-600"
                }`}
              >
                Question {index + 1}
              </li>
            );
          })}
        </ul>

        {/* Points Tracker */}
        <div className="mt-4 p-4 bg-gray-700 rounded-md text-center">
          <h3 className="text-md font-semibold">Points</h3>
          <p className="text-lg font-bold">{points}</p>
        </div>
      </div>
    </div>
  );
}
