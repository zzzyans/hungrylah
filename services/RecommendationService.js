// services/RecommendationService.js
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Simple content‐based ranking:
 * +2 points if cuisine matches,
 * +1 point if exact price matches,
 * +0.5 if price off by 1 level.
 */
function computeScore(restaurant, prefs) {
  let score = 0;
  const { cuisineType, priceLevel } = restaurant;
  console.log(`[computeScore] Processing: ${restaurant.name} (cuisine: ${cuisineType}, priceLevel: ${priceLevel})`);
  if (prefs.cuisines.includes(cuisineType)) {
    score += 2;
    console.log(`[computeScore] +2 for cuisine match`);
  }
  const userPrice = parseInt(prefs.priceRange, 10);
  if (priceLevel === userPrice) {
    score += 1;
    console.log(`[computeScore] +1 for exact price match`);
  } else if (Math.abs(priceLevel - userPrice) === 1) {
    score += 0.5;
    console.log(`[computeScore] +0.5 for near price match`);
  }
  console.log(`[computeScore] Final score for ${restaurant.name}: ${score}`);
  return score;
}

class RecommendationService {
  async getRecommendations(userId) {
    console.log(`[RecommendationService] Getting recommendations for user: ${userId}`);
    // 1) Fetch user preferences
    const prefDoc = await getDoc(doc(db, "userPreferences", userId));
    if (!prefDoc.exists()) {
      console.log("[RecommendationService] No preferences found.");
      return [];
    }
    const prefs = prefDoc.data();
    console.log("[RecommendationService] Fetched user preferences:", prefs);

    // 2) Fetch restaurants from Firestore
    const snap = await getDocs(collection(db, "restaurants"));
    const restaurants = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
    console.log(`[RecommendationService] Fetched ${restaurants.length} restaurants.`);

    // 3) Compute scores and filter out those with zero score, then sort descending.
    const scored = restaurants
      .map(r => {
        const score = computeScore(r, prefs);
        return { ...r, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
    
    console.log(`[RecommendationService] Final sorted recommendations:`, scored);
    return scored;
  }
}

export default new RecommendationService();