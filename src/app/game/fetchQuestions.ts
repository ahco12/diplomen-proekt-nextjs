// game/fetchQuestions.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

interface Answer {
  answer: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  question: string;
  category: string;
  answers: Answer[];
}

export const fetchQuestions = async (): Promise<Question[]> => {
  const questionsRef = collection(db, "questions");
  const snapshot = await getDocs(questionsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
};
