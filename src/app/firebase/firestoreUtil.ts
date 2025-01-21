import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Initializes the points field for a user in Firestore if it doesn't exist.
 * @param userId - The ID of the user document.
 * @returns A promise that resolves when the operation is complete.
 */
export async function initializeUserPoints(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      if (!("points" in userData)) {
        // If points field does not exist, initialize it
        await updateDoc(userRef, { points: 0 });
      }
    } else {
      throw new Error(`User with ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error("Error initializing user points:", error);
    throw error;
  }
}
