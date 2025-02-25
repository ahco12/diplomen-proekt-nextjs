'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: { answer: string; isCorrect: boolean }[];
}

const AdminPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'easy' | 'medium' | 'hard'>('easy');

  // State for new question
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [answers, setAnswers] = useState([{ answer: '', isCorrect: false }]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionList: Question[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Question, 'id'>),
        }));
        setQuestions(questionList);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter questions by category
  const filteredQuestions = questions.filter(q => q.difficulty === activeCategory);

  // Reset form to create a new question
  const resetForm = () => {
    setQuestionText('');
    setDifficulty('easy');
    setAnswers([{ answer: '', isCorrect: false }]);
    setEditingQuestionId(null);
  };

  // Add a new answer field
  const addAnswerField = () => {
    if (answers.length >= 5) {
      alert('You can only add up to 5 answers.');
      return;
    }
    setAnswers([...answers, { answer: '', isCorrect: false }]);
  };

  // Check if question has at least one correct answer
  const hasCorrectAnswer = () => answers.some(ans => ans.isCorrect);
  
  // Handle new question submission
  const handleAddOrUpdateQuestion = async () => {
    if (!questionText.trim()) return alert('Question cannot be empty!');
    if (answers.length < 2) return alert('Add at least two answers.');
    if (!hasCorrectAnswer()) return alert('You must select at least one correct answer.');
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
        resetForm(); // Reset after editing
      } else {
        // Add new question
        const newQuestionData = {
          question: questionText,
          difficulty,
          answers: answers.filter(ans => ans.answer.trim() !== ''),
        };

        const docRef = await addDoc(collection(db, 'questions'), newQuestionData);
        setQuestions([...questions, { id: docRef.id, ...newQuestionData }]);
        resetForm();
      }

      alert('Question saved successfully!');
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel - Manage Questions</h1>

      {/* Create/Edit Question Form */}
      <div className="mb-6 border p-6 rounded-lg shadow-lg bg-white">
        <h2 className="text-lg font-semibold mb-3">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h2>
        <input
          type="text"
          placeholder="Enter question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="border p-3 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label className="block font-medium text-gray-700">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Answers */}
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700">Answers:</h3>
          {answers.map((ans, index) => (
            <div key={index} className="flex items-center space-x-3 mb-2">
              <input
                type="text"
                placeholder={`Answer ${index + 1}`}
                value={ans.answer}
                onChange={(e) => {
                  const updatedAnswers = [...answers];
                  updatedAnswers[index].answer = e.target.value;
                  setAnswers(updatedAnswers);
                }}
                className="border p-2 rounded w-full"
              />
              <input
                type="radio"
                name="correctAnswer"
                checked={ans.isCorrect}
                onChange={() => setAnswers(answers.map((a, i) => ({ ...a, isCorrect: i === index })))}
              />
              <span>Correct</span>
            </div>
          ))}
          <button onClick={addAnswerField} className="mt-2 px-3 py-1 bg-gray-500 text-white rounded shadow-md hover:bg-gray-600">
            + Add Answer
          </button>
        </div>

        <button onClick={handleAddOrUpdateQuestion} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded shadow-md hover:bg-blue-700">
          {editingQuestionId ? 'Update Question' : 'Add Question'}
        </button>

        {editingQuestionId && (
          <button onClick={resetForm} className="mt-4 ml-4 bg-gray-500 text-white px-6 py-2 rounded shadow-md hover:bg-gray-600">
            Cancel Edit
          </button>
        )}
      </div>
      
      {/* Category Filters */}
      <div className="flex justify-center space-x-4 mb-6">
        {['easy', 'medium', 'hard'].map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as 'easy' | 'medium' | 'hard')}
            className={`px-5 py-2 rounded-full shadow-md font-semibold transition-all ${
              activeCategory === category
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {loading ? <p className="text-center text-gray-600">Loading questions...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white border p-4 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="font-semibold text-gray-800">{question.question}</h3>
              <div className="flex justify-end mt-4">
                <button onClick={() => handleEditQuestion(question)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                <button onClick={() => handleDeleteQuestion(question.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
