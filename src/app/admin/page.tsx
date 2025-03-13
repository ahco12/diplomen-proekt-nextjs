'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  deleteField,
} from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

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

  // Question State
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [answers, setAnswers] = useState([{ answer: '', isCorrect: false }]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Store Items State
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loadingStoreItems, setLoadingStoreItems] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPointsRequired, setItemPointsRequired] = useState<number>(0);
  const [editingStoreItemId, setEditingStoreItemId] = useState<string | null>(null);
  
  // Scroll button
  const [showScrollButton, setShowScrollButton] = useState(false);

  // --- Fetch Questions ---
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

  // --- Fetch Store Items ---
  useEffect(() => {
    const fetchStoreItems = async () => {
      try {
        setLoadingStoreItems(true);
        const querySnapshot = await getDocs(collection(db, 'storeItems'));

        const items: StoreItem[] = [];

        querySnapshot.forEach(docSnap => {
          const company = docSnap.id;
          const data = docSnap.data();

          Object.entries(data).forEach(([id, itemData]) => {
            const item = itemData as Omit<StoreItem, 'id' | 'company'>;
            items.push({
              id,
              company,
              name: item.name,
              description: item.description,
              pointsRequired: item.pointsRequired,
            });
          });
        });

        setStoreItems(items);
      } catch (error) {
        console.error('Error fetching store items:', error);
      } finally {
        setLoadingStoreItems(false);
      }
    };

    fetchStoreItems();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'storeItems'));
        const companyList = querySnapshot.docs.map(doc => doc.id);
        setCompanies(companyList);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies');
      }
    };

    fetchCompanies();
  }, []);

  const filteredQuestions = questions.filter(q => q.difficulty === activeCategory);

  const resetQuestionForm = () => {
    setQuestionText('');
    setDifficulty('easy');
    setAnswers([{ answer: '', isCorrect: false }]);
    setEditingQuestionId(null);
  };

  const resetStoreItemForm = () => {
    setSelectedCompany('');
    setItemName('');
    setItemDescription('');
    setItemPointsRequired(0);
    setEditingStoreItemId(null);
  };

  const addAnswerField = () => {
    if (answers.length >= 5) {
      toast.error('You can only add up to 5 answers.');
      return;
    }
    setAnswers([...answers, { answer: '', isCorrect: false }]);
  };

  const hasCorrectAnswer = () => answers.some(ans => ans.isCorrect);

  // --- Handle Add/Update Question ---
  const handleAddOrUpdateQuestion = async () => {
    if (!questionText.trim()) {
      toast.error('Question cannot be empty!');
      return;
    }
    if (answers.length < 2) {
      toast.error('Add at least two answers.');
      return;
    }
    if (!hasCorrectAnswer()) {
      toast.error('You must select at least one correct answer.');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        if (editingQuestionId) {
          const questionRef = doc(db, 'questions', editingQuestionId);
          await updateDoc(questionRef, {
            question: questionText,
            difficulty,
            answers: answers.filter(ans => ans.answer.trim() !== ''),
          });

          setQuestions(questions.map(q =>
            q.id === editingQuestionId
              ? { ...q, question: questionText, difficulty, answers }
              : q
          ));
        } else {
          const randomFloat = Math.random();
          const newQuestionData = {
            question: questionText,
            difficulty,
            answers: answers.filter(ans => ans.answer.trim() !== ''),
            randomField: randomFloat,
          };

          const docRef = await addDoc(collection(db, 'questions'), newQuestionData);
          setQuestions([...questions, { id: docRef.id, ...newQuestionData }]);
        }
        resetQuestionForm();
        resolve('Success');
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Saving question...',
      success: 'Question saved successfully!',
      error: 'Failed to save question',
    });
  };

  // --- Handle Add/Update Store Item ---
  const handleAddStoreItem = async () => {
    if (!selectedCompany || !itemName.trim() || !itemDescription.trim() || itemPointsRequired <= 0) {
      toast.error('Please fill all fields correctly!');
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const itemRef = doc(db, 'storeItems', selectedCompany);
        const fieldKey = editingStoreItemId
          ? editingStoreItemId
          : `${selectedCompany}_card_${itemPointsRequired}`;

        const newItem = {
          name: itemName,
          description: itemDescription,
          pointsRequired: itemPointsRequired,
        };

        await updateDoc(itemRef, {
          [fieldKey]: newItem,
        });

        if (editingStoreItemId) {
          setStoreItems(prev =>
            prev.map(item =>
              item.id === editingStoreItemId
                ? { id: fieldKey, company: selectedCompany, ...newItem }
                : item
            )
          );
        } else {
          setStoreItems([
            ...storeItems,
            { id: fieldKey, company: selectedCompany, ...newItem },
          ]);
        }

        resetStoreItemForm();
        resolve('Success');
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Saving store item...',
      success: 'Store item saved successfully!',
      error: 'Failed to save store item',
    });
  };

  const handleDeleteQuestion = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this question?');
    if (!confirmDelete) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        await deleteDoc(doc(db, 'questions', id));
        setQuestions(questions.filter(q => q.id !== id));
        resolve('Success');
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting question...',
      success: 'Question deleted successfully!',
      error: 'Failed to delete question',
    });
  };

  const handleDeleteStoreItem = async (item: StoreItem) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name}"?`);
    if (!confirmDelete) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const itemRef = doc(db, 'storeItems', item.company);
        await updateDoc(itemRef, {
          [item.id]: deleteField(),
        });

        setStoreItems(prev => prev.filter(i => i.id !== item.id));
        resolve('Success');
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: 'Deleting store item...',
      success: 'Store item deleted successfully!',
      error: 'Failed to delete store item',
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question);
    setDifficulty(question.difficulty);
    setAnswers(question.answers);
    scrollToTop();
  };

  const handleEditStoreItem = (item: StoreItem) => {
    setEditingStoreItemId(item.id);
    setSelectedCompany(item.company);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPointsRequired(item.pointsRequired);
    scrollToTop();
  };

  // --- Scroll-to-Top Button ---
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          },
        }}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveSection('questions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeSection === 'questions' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveSection('storeItems')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${activeSection === 'storeItems' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Store Items
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'questions' && (
          <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <input
                  type="text"
                  placeholder="Enter question"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Answers Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Answers</h3>
                    <button
                      onClick={addAnswerField}
                      className="inline-flex items-center px-5 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Add Answer
                    </button>
                  </div>
                  
                  {answers.map((ans, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder={`Answer ${index + 1}`}
                        value={ans.answer}
                        onChange={e => {
                          const updatedAnswers = [...answers];
                          updatedAnswers[index].answer = e.target.value;
                          setAnswers(updatedAnswers);
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={ans.isCorrect}
                          onChange={() => setAnswers(answers.map((a, i) => ({ ...a, isCorrect: i === index })))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Correct</label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddOrUpdateQuestion}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingQuestionId ? 'Update Question' : 'Add Question'}
                  </button>
                  {editingQuestionId && (
                    <button
                      onClick={resetQuestionForm}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Questions</h2>
                  <div className="flex space-x-2">
                    {['easy', 'medium', 'hard'].map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category as 'easy' | 'medium' | 'hard')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          ${activeCategory === category 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading questions...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {filteredQuestions.map(question => (
                    <div key={question.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-gray-900 mb-4">{question.question}</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Store Items Section - Similar structure */}
        {activeSection === 'storeItems' && (
          <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {editingStoreItemId ? 'Edit Store Item' : 'Add New Store Item'}
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={e => setSelectedCompany(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select a company</option>
                    {companies.map(company => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <textarea
                  placeholder="Enter item description"
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Enter points required"
                  value={itemPointsRequired}
                  onChange={e => setItemPointsRequired(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddStoreItem}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingStoreItemId ? 'Update Store Item' : 'Add Store Item'}
                  </button>
                  {editingStoreItemId && (
                    <button
                      onClick={resetStoreItemForm}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Store Items List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Store Items</h2>
                </div>
              </div>
              
              {loadingStoreItems ? (
                <div className="p-6 text-center text-gray-500">Loading store items...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {storeItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-gray-900 mb-4">{item.name}</p>
                      <p className="text-gray-700 mb-4">{item.description}</p>
                      <p className="text-gray-700 mb-4">Points Required: {item.pointsRequired}</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditStoreItem(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStoreItem(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AdminPage;
