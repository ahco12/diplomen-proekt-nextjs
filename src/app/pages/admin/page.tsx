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

interface StoreItem {
  id: string;
  company: string;
  name: string;
  description: string;
  pointsRequired: number;
}

const AdminPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [activeSection, setActiveSection] = useState<'questions' | 'storeItems'>('questions');

  // State for new question
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [answers, setAnswers] = useState([{ answer: '', isCorrect: false }]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Store Items State
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loadingStoreItems, setLoadingStoreItems] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPointsRequired, setItemPointsRequired] = useState<number>(0);
  

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

  const handleAddStoreItem = async () => {
    if (!selectedCompany || !itemName.trim() || !itemDescription.trim() || itemPointsRequired <= 0) {
      return alert('Please fill all fields correctly!');
    }
  
    try {
      const itemRef = doc(db, 'storeItems', selectedCompany);
      await updateDoc(itemRef, {
        [`${selectedCompany}_card_${itemPointsRequired}`]: {
          name: itemName,
          description: itemDescription,
          pointsRequired: itemPointsRequired,
        },
      });
  
      setStoreItems([...storeItems, {
        id: `${selectedCompany}_card_${itemPointsRequired}`,
        company: selectedCompany,
        name: itemName,
        description: itemDescription,
        pointsRequired: itemPointsRequired,
      }]);
  
      // Reset Form
      setSelectedCompany('');
      setItemName('');
      setItemDescription('');
      setItemPointsRequired(0);
    } catch (error) {
      console.error('Error adding store item:', error);
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

  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

// Show button only when scrolled down
useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // Handle edit question
  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question);
    setDifficulty(question.difficulty);
    setAnswers(question.answers);
    scrollToTop();
  };

  // Handle edit store item
  const handleEditStoreItem = (item: StoreItem) => {
    setEditingStoreItemId(item.id);
    setStoreItemName(item.name);
    setStoreItemDescription(item.description);
    setStoreItemPoints(item.pointsRequired);
    setSelectedCompany(item.company);
    scrollToTop();
  };

  // Handle delete store item
  const handleDeleteStoreItem = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this store item?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'storeItems', id));
      setStoreItems(storeItems.filter(item => item.id !== id));
      alert('Store item deleted!');
    } catch (error) {
      console.error('Error deleting store item:', error);
    }
  };

  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel</h1>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveSection('questions')}
          className={`px-5 py-2 rounded-lg shadow-md font-semibold transition-all ${
            activeSection === 'questions' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Questions
        </button>
        <button
          onClick={() => setActiveSection('storeItems')}
          className={`px-5 py-2 rounded-lg shadow-md font-semibold transition-all ${
            activeSection === 'storeItems' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Store Items
        </button>
      </div>

      {/* Create/Edit Question Form */}
      {activeSection === 'questions' && (
      <>
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
      </>
)}

      {activeSection === 'storeItems' && (
        <>
          <div className="mb-6 border p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-lg font-semibold mb-3">Add New Store Item</h2>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Company</option>
              <option value="amazon">Amazon</option>
              <option value="billa">Billa</option>
            </select>

            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="border p-3 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Description"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="border p-3 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="number"
              placeholder="Points Required"
              value={itemPointsRequired}
              onChange={(e) => setItemPointsRequired(Number(e.target.value))}
              className="border p-3 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleAddStoreItem}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow-md hover:bg-blue-700"
            >
              Add Store Item
            </button>
          </div>

          {/* Display Existing Store Items */}
          {loadingStoreItems ? (
          <p className="text-center text-gray-600">Loading store items...</p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeItems.map((item) => (
              <div key={item.id} className="bg-white border p-4 rounded-lg shadow-lg flex flex-col justify-between">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-sm font-semibold">Points Required: {item.pointsRequired}</p>
                <div className="flex justify-end mt-4">
                  <button onClick={() => handleEditStoreItem(item)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteStoreItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>)}
        </>
      )}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
};

export default AdminPage;
