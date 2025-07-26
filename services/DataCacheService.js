// services/DataCacheService.js
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import RecommendationCacheService from "./RecommendationCacheService";

class DataCacheService {
  constructor() {
    this.cache = {
      restaurants: null,
      users: new Map(),
      reviews: null,
      lastFetch: {
        restaurants: 0,
        reviews: 0,
      },
    };
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Check if cache is still valid
  isCacheValid(type) {
    const now = Date.now();
    return this.cache.lastFetch[type] && 
           (now - this.cache.lastFetch[type]) < this.cacheTimeout;
  }

  // Get all restaurants with caching
  async getRestaurants() {
    if (this.cache.restaurants && this.isCacheValid('restaurants')) {
      console.log('[DataCache] Returning cached restaurants');
      return this.cache.restaurants;
    }

    console.log('[DataCache] Fetching fresh restaurants');
    try {
      const snapshot = await getDocs(collection(db, "restaurants"));
      const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.cache.restaurants = restaurants;
      this.cache.lastFetch.restaurants = Date.now();
      return restaurants;
    } catch (error) {
      console.error('[DataCache] Error fetching restaurants:', error);
      return [];
    }
  }

  // Get user data with caching
  async getUser(userId) {
    if (this.cache.users.has(userId)) {
      console.log(`[DataCache] Returning cached user: ${userId}`);
      return this.cache.users.get(userId);
    }

    console.log(`[DataCache] Fetching fresh user: ${userId}`);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = { id: userId, ...userDoc.data() };
        this.cache.users.set(userId, userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error(`[DataCache] Error fetching user ${userId}:`, error);
      return null;
    }
  }

  // Get recent reviews with caching
  async getRecentReviews(limit = 10) {
    if (this.cache.reviews && this.isCacheValid('reviews')) {
      console.log('[DataCache] Returning cached reviews');
      return this.cache.reviews;
    }

    console.log('[DataCache] Fetching fresh reviews');
    try {
      const { query, orderBy, limit: firestoreLimit } = await import('firebase/firestore');
      const reviewsQuery = query(
        collection(db, "reviews"), 
        orderBy("createdAt", "desc"), 
        firestoreLimit(limit)
      );
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.cache.reviews = reviews;
      this.cache.lastFetch.reviews = Date.now();
      return reviews;
    } catch (error) {
      console.error('[DataCache] Error fetching reviews:', error);
      return [];
    }
  }

  // Clear specific cache
  clearCache(type) {
    if (type === 'all') {
      this.cache = {
        restaurants: null,
        users: new Map(),
        reviews: null,
        lastFetch: {
          restaurants: 0,
          reviews: 0,
        },
      };
    } else if (this.cache[type]) {
      this.cache[type] = null;
      this.cache.lastFetch[type] = 0;
    }
    console.log(`[DataCache] Cleared ${type} cache`);
  }

  // Clear recommendation cache when user preferences change
  clearRecommendationCache(userId) {
    if (userId) {
      RecommendationCacheService.clearCache(userId);
      console.log(`[DataCache] Cleared recommendation cache for user ${userId}`);
    }
  }

  // Preload essential data
  async preloadData() {
    console.log('[DataCache] Preloading essential data...');
    const promises = [
      this.getRestaurants(),
      this.getRecentReviews(),
    ];
    await Promise.all(promises);
    console.log('[DataCache] Preloading complete');
  }
}

// Export singleton instance
export default new DataCacheService(); 