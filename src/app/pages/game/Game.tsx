"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
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
  const [points, setPoints] = useState(0); // Points earned in-game
  const [initialPoints, setInitialPoints] = useState(0); // Points fetched from Firestore
  const [isGameOver, setIsGameOver] = useState(false); // Control modal visibility
  const router = useRouter();
  const { user } = useAuth(); // Get current user from authentication

  useEffect(() => {
    if (user) fetchUserPoints();
  }, [user]);

  const fetchUserPoints = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setInitialPoints(data.points || 0);
      }
    }
  };

  const handleAnswerClick = async (index: number) => {
    if (isAnswered) return;
    setSelectedAnswerIndex(index);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = currentQuestion.answers[index].isCorrect;

    let earnedPoints = 0;
    if (isCorrect) {
      if (currentQuestion.difficulty === "easy") earnedPoints = 50;
      if (currentQuestion.difficulty === "medium") earnedPoints = 100;
      if (currentQuestion.difficulty === "hard") earnedPoints = 200;
      setPoints((prev) => prev + earnedPoints);
    }

    // Increment questionsAnswered in Firestore
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          questionsAnswered: increment(1), // Increment by 1
        });
      } catch (error) {
        console.error("Error updating questions answered:", error);
      }
    }

    if (isCorrect) {
      setShowCorrect(true);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          resetState();
        } else {
          endGame(); // Trigger end-game logic
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setShowCorrect(true);
        setTimeout(() => {
          endGame(); // Trigger end-game logic
        }, 1000);
      }, 1400);
    }
  };

  const resetState = () => {
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setShowCorrect(false);
  };

  const endGame = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        const totalPoints = initialPoints + points;
        await updateDoc(userDocRef, { points: totalPoints });
      } catch (error) {
        console.error("Error updating points:", error);
      }
    }
    setIsGameOver(true); // Show the modal
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setPoints(0);
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setShowCorrect(false);
    setIsGameOver(false);
  };

  const handleMainMenu = () => {
    router.push("/");
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

      {/* Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="text-lg mb-4">You earned {points} points!</p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Play Again
              </button>
              <button
                onClick={handleMainMenu}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
