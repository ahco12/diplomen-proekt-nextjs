"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../components/AuthProvider";

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

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showCorrect, setShowCorrect] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [initialPoints, setInitialPoints] = useState<number>(0);
  const [tempPoints, setTempPoints] = useState<number>(0);
  const [pointsInterval] = useState<NodeJS.Timeout | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchNewQuestions();
  }, []);

  useEffect(() => {
    if (user) fetchUserPoints();
  }, [user]);

  useEffect(() => {
    return () => {
      if (pointsInterval) {
        clearInterval(pointsInterval);
      }
    };
  }, [pointsInterval]);

  const fetchUserPoints = async (): Promise<void> => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setInitialPoints(userDoc.data().points || 0);
      }
    }
  };

  const fetchNewQuestions = async () => {
    try {
      const fetchQuestions = async (difficulty: string, limit: number): Promise<Question[]> => {
        const q = query(
          collection(db, "questions"),
          where("difficulty", "==", difficulty)
        );
        const snapshot = await getDocs(q);
  
        const allQuestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          question: doc.data().question,
          difficulty: doc.data().difficulty,
          answers: doc.data().answers,
        }));
  
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  
        return shuffled.slice(0, limit);
      };
  
      const easyQuestions = await fetchQuestions("easy", 5);
      const mediumQuestions = await fetchQuestions("medium", 5);
      const hardQuestions = await fetchQuestions("hard", 5);
  
      setQuestions([...easyQuestions, ...mediumQuestions, ...hardQuestions]);
      setCurrentIndex(0);
  
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };
  
  

  const handleAnswerClick = async (index: number): Promise<void> => {
    if (isAnswered) return;
  
    setSelectedAnswerIndex(index);
    setIsAnswered(true);
    if (!questions[currentIndex]) return;
  
    const currentQuestion = questions[currentIndex];
    const isCorrect = currentQuestion.answers[index].isCorrect;
  
    let earnedPoints = 0;
    if (isCorrect) {
      if (currentQuestion.difficulty === "easy") earnedPoints = 50;
      if (currentQuestion.difficulty === "medium") earnedPoints = 100;
      if (currentQuestion.difficulty === "hard") earnedPoints = 200;
  
      setTempPoints(earnedPoints);
      setPoints((prev) => prev + earnedPoints);
    }
  
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          questionsAnswered: increment(1),
        });
      } catch (error) {
        console.error("Error updating questions answered:", error);
      }
    }
  
    if (isCorrect) {
      setTimeout(() => {
        setShowCorrect(true); // Show green after 1.2s
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            resetState();
          } else {
            endGame();
          }
        }, 1500);
      }, 1200); // 1.2s delay before changing to green
    } else {
      setTimeout(() => {
        setShowCorrect(true);
        setTimeout(() => {
          endGame();
        }, 1000);
      }, 1400);
    }
  };
  
  
  


  const resetState = (): void => {
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setShowCorrect(false);
  };

  const endGame = async (): Promise<void> => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        const totalPoints = initialPoints + points;
        await updateDoc(userDocRef, { points: totalPoints });
      } catch (error) {
        console.error("Error updating points:", error);
      }
    }
    setIsGameOver(true);
  };

  const handleRestart = (): void => {
    if (pointsInterval) {
      clearInterval(pointsInterval);
    }
    setPoints(0);
    setSelectedAnswerIndex(null);
    setIsAnswered(false);
    setShowCorrect(false);
    setIsGameOver(false);
    fetchNewQuestions();
  };

  const handleMainMenu = (): void => {
    router.push("/");
  };

  if (questions.length === 0) {
    return <div className="text-white text-center">Loading questions...</div>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex">
      {/* Main Game Section */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Who Wants to Be a Millionaire?</h1>
        <div className="bg-blue-800 text-center text-lg font-semibold p-6 rounded-md shadow-lg border-4 border-blue-400 w-full max-w-3xl">
          <p className="mb-4">Question {currentIndex + 1}</p>
          <h2 className="text-2xl">{currentQuestion.question}</h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-3xl">
        {currentQuestion.answers.map((answer, index) => {
          const isSelected = selectedAnswerIndex === index;
          const isCorrect = answer.isCorrect;
          const isWrongSelected = isSelected && !isCorrect;

          // Default color
          let bgColor = "bg-gray-800";

          if (isSelected) {
            bgColor = "bg-blue-600"; // Keep blue until color change
          }

          if (isAnswered) {
            if (isCorrect && showCorrect) {
              bgColor = "bg-green-600"; // Change to green after delay
            } else if (isWrongSelected) {
              bgColor = "bg-red-600"; // Change to red instantly
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={isAnswered}
              className={`p-4 rounded-md border-2 border-gray-700 text-left transition-all duration-300 
                ${isAnswered ? "pointer-events-none" : "hover:bg-blue-700 hover:border-blue-500"} 
                ${bgColor}`}
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
        <div className="mt-4 p-4 bg-gray-700 rounded-md text-center relative">
          <h3 className="text-md font-semibold">Points</h3>
          <p className="text-lg font-bold">{points}</p>
          {tempPoints > 0 && (
            <div className="temp-points">+{tempPoints}</div>
          )}
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