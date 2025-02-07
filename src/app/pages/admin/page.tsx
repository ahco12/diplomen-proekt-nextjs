"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../components/AuthProvider";

export default function AdminPanel() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [answers, setAnswers] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push("/"); // Redirect if not an admin
    }
  }, [user, role, loading, router]);

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (!user || role !== "admin") {
    return <div className="text-white text-center">Access Denied</div>;
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index].text = value;
    setAnswers(newAnswers);
  };

  const handleCorrectChange = (index: number) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "questions"), {
        question,
        difficulty,
        answers,
      });
      alert("Question added successfully!");
      setQuestion("");
      setAnswers([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Question</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <select
            className="p-2 rounded bg-gray-700 border border-gray-600"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
                placeholder={`Answer ${index + 1}`}
                value={answer.text}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                required
              />
              <input
                type="radio"
                name="correctAnswer"
                checked={answer.isCorrect}
                onChange={() => handleCorrectChange(index)}
              />
            </div>
          ))}
          <button type="submit" className="p-2 bg-blue-600 rounded hover:bg-blue-700">
            Add Question
          </button>
        </form>
      </div>
    </div>
  );
}
