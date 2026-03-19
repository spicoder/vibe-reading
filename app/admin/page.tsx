"use client";

import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AdminPage() {
  const bookToReset = "isaiah";
  const chapterCount = 44;

  const handleBulkUnlock = async () => {
    try {
      // 1. Generate the chapter IDs (1 to 44)
      const chaptersToUnlock = Array.from(
        { length: chapterCount },
        (_, i) => `${bookToReset}-${i + 1}`,
      );

      // 2. Fetch all users
      const querySnapshot = await getDocs(collection(db, "users"));

      // 3. Initialize a batch write
      const batch = writeBatch(db);

      querySnapshot.forEach((userDoc) => {
        const userRef = doc(db, "users", userDoc.id);

        // 4. Update the document by OVERWRITING the completedChapters field
        // This will replace whatever was there with exactly chapters 1-44
        batch.update(userRef, { completedChapters: chaptersToUnlock });
      });

      // 5. Commit the batch
      await batch.commit();
      alert(
        `Successfully updated all players to exactly Chapters 1-${chapterCount}!`,
      );
    } catch (error) {
      console.error("Error updating players:", error);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Admin Tools</h1>
      <button
        onClick={handleBulkUnlock}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        RESET & OVERWRITE: Set Chapters 1-44 For All Players
      </button>
    </div>
  );
}
