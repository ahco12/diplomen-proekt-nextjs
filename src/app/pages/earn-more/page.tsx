"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

// Define possible operators and their multipliers
const operators = [
  { symbol: "+", multiplier: 1.2 },
  { symbol: "-", multiplier: 1.2 },
  { symbol: "*", multiplier: 1.2 },
  { symbol: "/", multiplier: 1.2 },
  { symbol: "^", multiplier: 1.8 },
  { symbol: "√", multiplier: 1.4 },
  { symbol: "sin", multiplier: 2 },
  { symbol: "cos", multiplier: 2 },
  { symbol: "tan", multiplier: 2 },
];

interface Question {
  equation: string;
  answer: number;
  multiplier: number;
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
  const [betAmount, setBetAmount] = useState<number>(0); // Points the user bets
  const [isBetPlaced, setIsBetPlaced] = useState<boolean>(false); // Whether a bet is placed

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
    const multiplier = randomOp.multiplier;

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
        answer = parseFloat(answer.toFixed(4)); // Round to 4 decimals
        break;
      }
    }

    return { equation, answer, multiplier };
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
      pointsChange = betAmount * question.multiplier;
      setUserPoints((prev) => prev + pointsChange);
    } else {
      pointsChange = -betAmount;
      setUserPoints((prev) => prev + pointsChange);
    }

    setMessage(
      isCorrect
        ? `✅ Correct! You earned ${pointsChange.toFixed(2)} points!`
        : `❌ Incorrect! You lost ${Math.abs(pointsChange).toFixed(2)} points. The correct answer was ${question.answer}`
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

    // Reset bet and generate new question after delay
    setTimeout(() => {
      if (attempts + 1 < 5) {
        setQuestion(null);
        setUserAnswer("");
        setMessage("");
        setIsBetPlaced(false);
        setBetAmount(0);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Betting Section */}
      <div className="bg-white p-6 rounded-2xl shadow-2xl mr-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Place Your Bet</h2>
        <p className="text-gray-600 mb-4">Your Points: {userPoints.toFixed(2)}</p>
        <input
          type="number"
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 w-full text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter bet amount"
          value={betAmount}
          onChange={(e) => setBetAmount(parseFloat(e.target.value))}
          min="0"
          max={userPoints}
        />
        <button
          className="bg-purple-600 text-white px-6 py-3 rounded-lg w-full hover:bg-purple-700 transition-all"
          onClick={() => {
            if (betAmount > 0 && betAmount <= userPoints) {
              setIsBetPlaced(true);
              setQuestion(generateQuestion());
            } else {
              setMessage("Invalid bet amount!");
            }
          }}
          disabled={isBetPlaced}
        >
          Place Bet
        </button>
      </div>

      {/* Question Section */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-96">
        <h1 className="text-3xl font-bold mb-6 text-purple-700">Earn More Points</h1>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : attempts >= 5 ? (
          <p className="text-red-500 font-semibold">You have reached your limit for today. Come back tomorrow!</p>
        ) : (
          <>
            <AnimatePresence>
              {isBetPlaced && question ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-2xl font-semibold mb-6 text-gray-800">Solve: {question.equation}</p>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4 w-full text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                  />
                  <button
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg w-full hover:bg-purple-700 transition-all"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`mt-4 text-lg font-semibold ${
                        message.includes("✅") ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {message}
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <motion.p
                  key="no-bet"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="text-gray-600"
                >
                  Place a bet to see the equation.
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}

        <div className="mt-6">
          <p className="text-gray-600">Attempts: {attempts}/5</p>
          <p className="text-green-600 font-semibold">Correct Answers: {correctAnswers}</p>
        </div>
      </div>
    </div>
  );
}