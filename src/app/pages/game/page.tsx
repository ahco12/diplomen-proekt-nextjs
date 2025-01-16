// app/game/page.tsx
import { fetchQuestions } from "./fetchQuestions";
import Quiz from "./Game";

export default async function GamePage() {
  const questions = await fetchQuestions(); // Fetch questions on the server

  return <Quiz questions={questions} />; // Pass questions to the client component
}
