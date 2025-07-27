// services/FavouriteService.js
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

class FavouriteService {
  /**
   * Add a restaurant as a favourite for the given user.
   * @param {string} userId 
   * @param {object} restaurant - Should include at least { id, name, cuisineType, priceLevel, photoURL }
   */
  async addFavourite(userId, restaurant) {
    if (!userId || !restaurant?.id) {
      throw new Error("Missing userId or restaurant id");
    }
    const favId = `${userId}_${restaurant.id}`;
    const favDoc = doc(db, "favourites", favId);
    console.log(`[FavouriteService.addFavourite] Adding favourite: ${favId}`);
    await setDoc(favDoc, {
      userId,
      restaurantId: restaurant.id,
      name: restaurant.name,
      cuisineType: restaurant.cuisineType,
      priceLevel: restaurant.priceLevel,
      photoURL: restaurant.photoURL || "",
      createdAt: new Date(),
    });
    console.log(`[FavouriteService.addFavourite] Added favourite successfully: ${favId}`);
  }

  /**
   * Get all favourite restaurants for a given user.
   * @param {string} userId 
   * @returns {Promise<object[]>}
   */
  async getFavourites(userId) {
    if (!userId) throw new Error("Missing userId");
    console.log(`[FavouriteService.getFavourites] Fetching favourites for user: ${userId}`);
    const favCollection = collection(db, "favourites");
    const q = query(favCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const favs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`[FavouriteService.getFavourites] Fetched ${favs.length} favourites`);
    return favs;
  }

  /**
   * Get IDs of all favourite restaurants for a given user.
   * @param {string} userId
   * @returns {Promise<Set<string>>} Set of favourite restaurant IDs.
   */
  async getFavouriteIds(userId) {
    if (!userId) throw new Error("Missing userId");
    const favCollection = collection(db, "favourites");
    const q = query(favCollection, where("userId", "==", userId));
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

  /**
   * Remove a favourite.
   * @param {string} userId 
   * @param {string} restaurantId 
   */
  async removeFavourite(userId, restaurantId) {
    if (!userId || !restaurantId) throw new Error("Missing userId or restaurantId");
    const favId = `${userId}_${restaurantId}`;
    const favDoc = doc(db, "favourites", favId);
    console.log(`[FavouriteService.removeFavourite] Removing favourite: ${favId}`);
    await deleteDoc(favDoc);
    console.log(`[FavouriteService.removeFavourite] Removed favourite successfully: ${favId}`);
  }
}

export default new FavouriteService();