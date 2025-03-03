"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
  const [attempts, setAttempts] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userPoints, setUserPoints] = useState<number>(0); // User's total points

  useEffect(() => {
    if (user) {
      checkDailyLimit();
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

  // Check how many attempts the user has for today
  const checkDailyLimit = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const docRef = doc(db, "users", user.uid, "earnMore", today);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setAttempts(data.attempts);
      setCorrectAnswers(data.correctAnswers);
    } else {
      // First attempt today, create new entry
      await setDoc(docRef, { attempts: 0, correctAnswers: 0, lastAttempt: new Date().toISOString() });
    }

    setLoading(false);
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
      case "-":
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

    return { equation, answer, points };
  };

  // Handle user answer submission
  const handleSubmit = async () => {
    if (!user || !question) return;
    if (attempts >= 5) {
      setMessage("You have reached the limit of 5 attempts today.");
      return;
    }

    const userNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userNum - question.answer) < 0.0001;

    // Calculate points gained or lost
    let pointsChange = 0;
    if (isCorrect) {
      pointsChange = question.points; // Points for correct answer
      setUserPoints((prev) => prev + pointsChange);
    } else {
      pointsChange = -50; // Fixed points for incorrect answer
      setUserPoints((prev) => prev + pointsChange);
    }

    setMessage(
      isCorrect
        ? `✅ Correct! You earned ${pointsChange} points!`
        : `❌ Incorrect! You lost ${Math.abs(pointsChange)} points. The correct answer was ${question.answer}`
    );

    // Update Firestore with attempt and points
    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "users", user.uid, "earnMore", today);
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      await updateDoc(docRef, {
        attempts: data.attempts + 1,
        correctAnswers: isCorrect ? data.correctAnswers + 1 : data.correctAnswers,
        lastAttempt: new Date().toISOString(),
      });
    }

    // Update user's points in Firestore
    await updateDoc(userDocRef, {
      points: userPoints + pointsChange,
    });

    // Update state
    setAttempts(attempts + 1);
    if (isCorrect) setCorrectAnswers(correctAnswers + 1);

    // Reset and generate new question after delay
    setTimeout(() => {
      if (attempts + 1 < 5) {
        setQuestion(null);
        setUserAnswer("");
        setMessage("");
      }
    }, 2000);
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
            <div className="text-right">
              <p className="text-blue-300 text-sm">Daily Progress</p>
              <p className="text-xl font-semibold text-white">{attempts}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
          {loading ? (
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : attempts >= 5 ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-yellow-400">Daily Limit Reached!</h2>
              <p className="text-blue-200">You&apos;ve completed today&apos;s challenges. Come back tomorrow!</p>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-green-400 font-semibold">Total Correct: {correctAnswers}/5</p>
                <p className="text-blue-300">Points Earned Today: {correctAnswers * 200}+</p>
              </div>
            </div>
          ) : (
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
                    <p className="text-blue-200 text-sm">Question {attempts + 1} of 5</p>
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
                    />
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200"
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
                      }`}
                    >
                      {message}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
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
                    onClick={() => setQuestion(generateQuestion())}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                  >
                    Start New Question
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Progress Display */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center text-sm">
              <p className="text-blue-300">Questions Completed: {attempts}/5</p>
              <p className="text-green-400">Correct Answers: {correctAnswers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}