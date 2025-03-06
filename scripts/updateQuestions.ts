import { db } from "../src/app/firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
const email = "admin@gmail.com"; // Use a real admin email
const password = "admin123"; // Use a real password

const updateQuestionsWithRandomField = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Signed in successfully!");

    const querySnapshot = await getDocs(collection(db, "questions"));

    for (const docSnapshot of querySnapshot.docs) {
      const randomValue = Math.random();
      const questionRef = doc(db, "questions", docSnapshot.id);

      await updateDoc(questionRef, { randomField: randomValue });
      console.log(`Updated ${docSnapshot.id} with randomField: ${randomValue}`);
    }

    console.log("All questions updated!");
  } catch (error) {
    console.error("Error updating questions:", error);
  }
};

updateQuestionsWithRandomField();
