// services/RecommendationService.js

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Simple content‐based ranking:
 * +2 points if cuisine matches
 * +1 point if exact price matches
 * +0.5 if price off by 1 level
 */
function computeScore(restaurant, prefs) {
  let score = 0;
  const { cuisineType, priceLevel } = restaurant;
  if (prefs.cuisines.includes(cuisineType)) {
    score += 2;
  }
  const userPrice = parseInt(prefs.priceRange, 10);
  if (priceLevel === userPrice) {
    score += 1;
  } else if (Math.abs(priceLevel - userPrice) === 1) {
    score += 0.5;
  }
  return score;
}

class RecommendationService {
  async getRecommendations(userId) {
    // 1) Fetch user prefs
    const prefDoc = await getDoc(doc(db, "userPreferences", userId));
    if (!prefDoc.exists()) return [];
    const prefs = prefDoc.data(); // { cuisines: [...], dietaryRestrictions: [...], priceRange: "2" }

    // 2) Load all restaurants (small, 50)
    const snap = await getDocs(collection(db, "restaurants"));
    const restaurants = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // 3) Score & sort
    const scored = restaurants
      .map(r => ({ ...r, score: computeScore(r, prefs) }))
      .filter(r => r.score > 0)      // only show matches
      .sort((a, b) => b.score - a.score);

    return scored;
  }
}

export default new RecommendationService();