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
        }, 1800);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black">
      <div className="flex gap-6 p-6">
        {/* Main Game Section */}
        <div className="flex-1">
          {/* Question Card */}
          <div className="mb-8 p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-white/80 text-lg">Question {currentIndex + 1}/{questions.length}</span>
            </div>
            <h2 className="text-2xl text-white font-medium mb-8">{currentQuestion.question}</h2>
            
            {/* Answers Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswerIndex === index;
                const isCorrect = answer.isCorrect;
                const isWrongSelected = isSelected && !isCorrect;

                const styles = `
                  relative p-6 rounded-xl border-2 text-white transition-all duration-300
                  ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-102 hover:border-blue-400'}
                  ${!isAnswered ? 'bg-white/5 border-white/10' : ''}
                  ${isSelected && !showCorrect ? 'bg-blue-600 border-blue-400' : ''}
                  ${showCorrect && isCorrect ? 'bg-green-600 border-green-400' : ''}
                  ${isWrongSelected && showCorrect ? 'bg-red-600 border-red-400' : ''}
                `;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={isAnswered}
                    className={styles}
                  >
                    <span className="text-lg">{answer.answer}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress & Points Column */}
        <div className="w-80 space-y-6">
          {/* Points Card */}
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <h3 className="text-xl text-white font-semibold mb-4">Score</h3>
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              {points}
            </div>
            {tempPoints > 0 && (
              <div className="absolute top-2 right-2 text-green-400 font-bold animate-bounce">
                +{tempPoints}
              </div>
            )}
          </div>

          {/* Progress Card */}
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <h3 className="text-xl text-white font-semibold mb-4">Progress</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                      ${isActive ? 'bg-blue-500 text-white' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-white/20 text-white/60' : ''}
                    `}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-xl text-white/90 mb-8">Final Score: {points} points</p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
              >
                Play Again
              </button>
              <button
                onClick={handleMainMenu}
                className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
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