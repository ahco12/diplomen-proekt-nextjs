"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

// Define possible operators and their points
const operators = [
  { symbol: "+", points: 200 },
  { symbol: "-", points: 200 },
  { symbol: "*", points: 200 },
  { symbol: "/", points: 200 },
  { symbol: "^", points: 300 },
  { symbol: "√", points: 300 },
  { symbol: "sin", points: 400 },
  { symbol: "cos", points: 400 },
  { symbol: "tan", points: 400 },
];

interface Question {
  equation: string;
  answer: number;
  points: number;
}

export default function EarnMorePage() {
  const { user } = useAuth(); // Get current user
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [userPoints, setUserPoints] = useState<number>(0); // User's total points
  const [pointsEarned, setPointsEarned] = useState<number>(0); // Points earned in the current session
  const [correctStreak, setCorrectStreak] = useState<number>(0); // Current streak of correct answers
  const [maxStreak, setMaxStreak] = useState<number>(0); // Max streak of correct answers
  const [multiplier, setMultiplier] = useState<number>(1); // Current points multiplier
  const [gameStarted, setGameStarted] = useState<boolean>(false); // Track if the game has started

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  // Fetch user's total points from Firestore
  const fetchUserPoints = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      setUserPoints(data.points || 0);
    }
  };

  // Generate a random mathematical question
  const generateQuestion = (): Question => {
    const randomOp = operators[Math.floor(Math.random() * operators.length)];
    const op = randomOp.symbol;
    const points = randomOp.points;

    let equation = "";
    let answer = 0;

    switch (op) {
      case "+":
      case "-": {
        const num1 = Math.floor(Math.random() * 50) + 1;
        const num2 = Math.floor(Math.random() * 50) + 1;
        const num3 = Math.floor(Math.random() * 50) + 1;
        const num4 = Math.floor(Math.random() * 50) + 1;
        equation = `${num1} ${op} ${num2} ${op} ${num3} ${op} ${num4}`;
        answer = eval(equation); // Safe since numbers are controlled
        break;
      }
      case "*":
      case "/": {
        const num1 = Math.floor(Math.random() * 50) + 1;
        const num2 = Math.floor(Math.random() * 50) + 1;
        equation = `${num1} ${op} ${num2}`;
        answer = eval(equation); // Safe since numbers are controlled
        break;
      }
      case "^": {
        const base = Math.floor(Math.random() * 10) + 1;
        const exp = Math.floor(Math.random() * 3) + 1; // Keep small for simplicity
        equation = `${base}^${exp}`;
        answer = Math.pow(base, exp);
        break;
      }
      case "√": {
        const num = Math.pow(Math.floor(Math.random() * 10) + 1, 2); // Square numbers for clean roots
        equation = `√${num}`;
        answer = Math.sqrt(num);
        break;
      }
      case "sin":
      case "cos":
      case "tan": {
        const angle = [0, 30, 45, 60, 90][Math.floor(Math.random() * 5)]; // Common angles
        equation = `${op}(${angle})`;
        answer =
          op === "sin"
            ? Math.sin((angle * Math.PI) / 180)
            : op === "cos"
            ? Math.cos((angle * Math.PI) / 180)
            : Math.tan((angle * Math.PI) / 180);
        answer = parseFloat(answer.toFixed(2)); // Round to 2 decimals
        break;
      }
    }

    return { equation, answer: parseFloat(answer.toFixed(2)), points };
  };

  // Handle user answer submission
  const handleSubmit = async () => {
    if (!user || !question) return;

    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - question.answer) < 0.01;

    // Calculate points gained or lost
    let pointsChange = 0;
    if (isCorrect) {
      let newMultiplier = 1;
      if (correctStreak >= 5) {
        newMultiplier = 1.5;
      } else if (correctStreak >= 2) {
        newMultiplier = 1.2;
      }
      setMultiplier(newMultiplier);
      pointsChange = Math.round(question.points * newMultiplier); // Points for correct answer with multiplier
      setUserPoints((prev) => prev + pointsChange);
      setPointsEarned((prev) => prev + pointsChange);
      setCorrectStreak((prev) => prev + 1);
      setMaxStreak((prev) => Math.max(prev, correctStreak + 1));
    } else {
      pointsChange = -50; // Fixed points for incorrect answer
      setUserPoints((prev) => prev + pointsChange);
      setCorrectStreak(0); // Reset streak on incorrect answer
      setMultiplier(1); // Reset multiplier on incorrect answer
    }

    setMessage(
      isCorrect
        ? `✅ Correct! You earned ${pointsChange} points!`
        : `❌ Incorrect! You lost ${Math.abs(pointsChange)} points. The correct answer was ${question.answer}`
    );

    // Update user's points in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      points: userPoints + pointsChange,
    });

    // Reset and generate new question after delay
    setTimeout(() => {
      if (isCorrect) {
        setQuestion(generateQuestion());
      } else {
        setQuestion(null);
      }
      setUserAnswer("");
      setMessage("");
    }, 2000);
  };

  // Handle Enter key press for answer submission
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isNaN(parseFloat(userAnswer))) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1740] to-[#2a1f6f] p-8">
      {/* Header with Points Display */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
            Math Challenge
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-blue-300 text-sm">Your Points</p>
              <p className="text-2xl font-bold text-yellow-400">{userPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
          <AnimatePresence mode="wait">
            {question ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="text-3xl font-bold text-white">{question.equation}</p>
                  <p className="text-yellow-400 text-sm">Worth {question.points} points</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-center text-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-yellow-400/50"
                    placeholder="Enter your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={handleSubmit}
                    className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 ${
                      isNaN(parseFloat(userAnswer)) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isNaN(parseFloat(userAnswer))}
                  >
                    Submit Answer
                  </button>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-xl ${
                      message.includes("✅")
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    } relative`}
                  >
                    {message}
                    {multiplier > 1 && (
                      <div className="absolute top-0 right-0 mt-2 mr-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        x{multiplier}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              !gameStarted && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Ready for the next challenge?</h2>
                    <p className="text-blue-300">Test your math skills and earn points!</p>
                  </div>
                  <button
                    onClick={() => {
                      setQuestion(generateQuestion());
                      setGameStarted(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                  >
                    Start New Question
                  </button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Game End Section */}
      {!question && gameStarted && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 text-center">
            <h2 className="text-2xl font-bold text-white">Game Over</h2>
            <p className="text-blue-300 mt-4">You earned a total of {pointsEarned} points!</p>
            <p className="text-blue-300">Max streak of correct answers: {maxStreak}</p>
            <button
              onClick={() => {
                setPointsEarned(0);
                setMaxStreak(0);
                setQuestion(generateQuestion());
              }}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}