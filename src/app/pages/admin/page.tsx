'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: { answer: string; isCorrect: boolean }[];
  randomField?: number; // New field added
}

const AdminPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // State for new and editing question
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [answers, setAnswers] = useState([{ answer: '', isCorrect: false }]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionList: Question[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Question, 'id'>)
        }));
        setQuestions(questionList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter questions by difficulty
  const filteredQuestions = filter === 'all'
    ? questions
    : questions.filter(q => q.difficulty === filter);

  // Add a new answer field
  const addAnswerField = () => {
    setAnswers([...answers, { answer: '', isCorrect: false }]);
  };

  // Handle answer changes
  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].answer = value;
    setAnswers(updatedAnswers);
  };

  // Handle correct answer selection
  const handleCorrectAnswerChange = (index: number) => {
    const updatedAnswers = answers.map((ans, i) => ({
      ...ans,
      isCorrect: i === index,
    }));
    setAnswers(updatedAnswers);
  };

  // Handle new question submission
  const handleAddOrUpdateQuestion = async () => {
    if (!questionText.trim()) return alert('Question cannot be empty!');
    if (answers.length < 2) return alert('Add at least two answers.');

    try {
      if (editingQuestionId) {
        // Update existing question
        const questionRef = doc(db, 'questions', editingQuestionId);
        await updateDoc(questionRef, {
          question: questionText,
          difficulty,
          answers: answers.filter(ans => ans.answer.trim() !== ''),
        });

        setQuestions(questions.map(q => q.id === editingQuestionId ? { ...q, question: questionText, difficulty, answers } : q));
        setEditingQuestionId(null);
      } else {
        // Add new question with `randomField`
        const newQuestionData = {
          question: questionText,
          difficulty,
          answers: answers.filter(ans => ans.answer.trim() !== ''),
          randomField: Math.random(), // Generate a random float
        };

        const docRef = await addDoc(collection(db, 'questions'), newQuestionData);
        setQuestions([...questions, { id: docRef.id, ...newQuestionData }]);
      }

      alert('Question saved successfully!');
      setQuestionText('');
      setAnswers([{ answer: '', isCorrect: false }]);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this question?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'questions', id));
      setQuestions(questions.filter(q => q.id !== id));
      alert('Question deleted!');
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Handle edit question
  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question);
    setDifficulty(question.difficulty);
    setAnswers(question.answers);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - Manage Questions</h1>

      {/* Filter Dropdown */}
      <div className="mb-4">
        <label className="mr-2">Filter by Difficulty:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Create/Edit Question Form */}
      <div className="mb-6 border p-4 rounded-lg shadow-lg bg-white">
        <h2 className="text-lg font-semibold mb-2">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h2>
        <input
          type="text"
          placeholder="Enter question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <label>Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="border p-2 rounded ml-2"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Answers */}
        <div className="mt-4">
          <h3 className="font-semibold">Answers:</h3>
          {answers.map((ans, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                placeholder={`Answer ${index + 1}`}
                value={ans.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="radio"
                name="correctAnswer"
                checked={ans.isCorrect}
                onChange={() => handleCorrectAnswerChange(index)}
              />
              <span>Correct</span>
            </div>
          ))}
          <button onClick={addAnswerField} className="bg-gray-500 text-white px-4 py-1 rounded mt-2">
            + Add Answer
          </button>
        </div>

        <button onClick={handleAddOrUpdateQuestion} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">
          {editingQuestionId ? 'Update Question' : 'Add Question'}
        </button>
      </div>

      {/* Loading State */}
      {loading ? <p>Loading questions...</p> : null}

      {!loading && questions.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 mt-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Question</th>
              <th className="border p-2">Difficulty</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question) => (
              <tr key={question.id} className="border">
                <td className="border p-2">{question.question}</td>
                <td className="border p-2">{question.difficulty}</td>
                <td className="border p-2 flex space-x-2">
                  <button onClick={() => handleEditQuestion(question)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDeleteQuestion(question.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="text-gray-500">No questions available.</p>}
    </div>
  );
};

export default AdminPage;
