import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore"; // ADDED collection, query, where, getDocs
import { db } from "../firebaseConfig";

class InteractionService {
  async addDislike(userId, restaurantId) {
    if (!userId || !restaurantId) {
      console.error("Missing userId or restaurantId for dislike");
      return;
    }
    const dislikeId = `${userId}_${restaurantId}`; // composite ID
    const dislikeDocRef = doc(db, "dislikes", dislikeId);

    await setDoc(dislikeDocRef, {
      userId,
      restaurantId,
      createdAt: serverTimestamp(),
    });
  }

  async getDislikeIds(userId) {
    if (!userId) throw new Error("Missing userId");
    const dislikesCollection = collection(db, "dislikes");
    const q = query(dislikesCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const ids = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data && data.restaurantId) {
        ids.add(data.restaurantId);
      }
    });
    return ids;
  }
}

export default new InteractionService();