// services/FavouriteService.js
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

class FavouriteService {
  /**
   * Add a restaurant as a favourite for the given user.
   * We use a composite id of `${userId}_${restaurantId}` to avoid duplicates.
   * @param {string} userId - The user's id.
   * @param {object} restaurant - A restaurant object with at least { id, name, cuisineType, priceLevel, photoURL }.
   */
  async addFavourite(userId, restaurant) {
    if (!userId || !restaurant?.id) {
      throw new Error("Missing userId or restaurant id");
    }
    // Using composite id to avoid duplicates.
    const favId = `${userId}_${restaurant.id}`;
    const favDoc = doc(db, "favourites", favId);
    await setDoc(favDoc, {
      userId,
      restaurantId: restaurant.id,
      name: restaurant.name,
      cuisineType: restaurant.cuisineType,
      priceLevel: restaurant.priceLevel,
      photoURL: restaurant.photoURL || "",
      createdAt: new Date(),
    });
  }

  /**
   * Get all favourite restaurants for a given user.
   * @param {string} userId 
   * @returns {Promise<object[]>} Array of favourite records.
   */
  async getFavourites(userId) {
    if (!userId) throw new Error("Missing userId");
    const favCollection = collection(db, "favourites");
    const q = query(favCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Remove a favourite record.
   * @param {string} userId 
   * @param {string} restaurantId 
   */
  async removeFavourite(userId, restaurantId) {
    if (!userId || !restaurantId) throw new Error("Missing userId or restaurantId");
    const favId = `${userId}_${restaurantId}`;
    const favDoc = doc(db, "favourites", favId);
    await deleteDoc(favDoc);
  }
}

export default new FavouriteService();