import { db } from "./firebase/firebaseConfig"; // Adjust if needed
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const updateQuestionsWithRandomField = async () => {
  const querySnapshot = await getDocs(collection(db, "questions"));

  querySnapshot.forEach(async (docSnapshot) => {
    const randomValue = Math.random(); // Generate a random number between 0 and 1
    const questionRef = doc(db, "questions", docSnapshot.id);

    await updateDoc(questionRef, {
      randomField: randomValue,
    });

    console.log(`Updated ${docSnapshot.id} with randomField: ${randomValue}`);
  });

  console.log("All questions updated!");
};

updateQuestionsWithRandomField();
