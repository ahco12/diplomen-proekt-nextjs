import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Quiz from "./Game";

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

export default async function GamePage() {
  const fetchQuestions = async (difficulty: string, limit: number): Promise<Question[]> => {
    const q = query(collection(db, "questions"), where("difficulty", "==", difficulty));
    const snapshot = await getDocs(q);
    const allQuestions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        difficulty: data.difficulty,
        answers: data.answers,
      } as Question;
    });

    if (allQuestions.length < limit) {
      throw new Error(`Not enough questions in difficulty: ${difficulty}`);
    }

    return allQuestions.sort(() => Math.random() - 0.5).slice(0, limit);
  };

  try {
    // Fetch and randomize questions for each difficulty
    const easyQuestions = await fetchQuestions("easy", 5);
    const mediumQuestions = await fetchQuestions("medium", 5);
    const hardQuestions = await fetchQuestions("hard", 5);

    // Combine questions in the correct order
    const questions: Question[] = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

    return <Quiz questions={questions} />;
  } catch (error) {
    console.error(error);
    return <div>Error loading questions. Please try again later.</div>;
  }
}
