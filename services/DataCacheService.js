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
    this.maxUserCacheSize = 100; // Limit user cache size
  }

  // Check if cache is still valid
  isCacheValid(type) {
    const now = Date.now();
    return this.cache.lastFetch[type] && 
           (now - this.cache.lastFetch[type]) < this.cacheTimeout;
  }

  // Clean up user cache if it gets too large
  cleanupUserCache() {
    if (this.cache.users.size > this.maxUserCacheSize) {
      const entries = Array.from(this.cache.users.entries());
      // Remove oldest entries (keep the most recent 50)
      const entriesToRemove = entries.slice(0, entries.length - 50);
      entriesToRemove.forEach(([key]) => this.cache.users.delete(key));
      console.log(`[DataCache] Cleaned up ${entriesToRemove.length} old user entries`);
    }
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
      // Return cached data even if expired, if available
      if (this.cache.restaurants) {
        console.log('[DataCache] Returning expired cache due to fetch error');
        return this.cache.restaurants;
      }
      return [];
    }
  }

  // Get user data with caching
  async getUser(userId) {
    if (!userId) return null;
    
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
        this.cleanupUserCache(); // Clean up if needed
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
      // Return cached data even if expired, if available
      if (this.cache.reviews) {
        console.log('[DataCache] Returning expired cache due to fetch error');
        return this.cache.reviews;
      }
      return [];
    }
  }

  // Get multiple users efficiently
  async getUsers(userIds) {
    if (!userIds || userIds.length === 0) return [];
    
    const uniqueUserIds = [...new Set(userIds)];
    const results = [];
    const uncachedUserIds = [];
    
    // Check cache first
    for (const userId of uniqueUserIds) {
      if (this.cache.users.has(userId)) {
        results.push(this.cache.users.get(userId));
      } else {
        uncachedUserIds.push(userId);
      }
    }
    
    // Fetch uncached users in parallel
    if (uncachedUserIds.length > 0) {
      try {
        const userPromises = uncachedUserIds.map(async (userId) => {
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
        });
        
        const fetchedUsers = await Promise.all(userPromises);
        results.push(...fetchedUsers.filter(Boolean));
        
        this.cleanupUserCache(); // Clean up if needed
      } catch (error) {
        console.error('[DataCache] Error fetching multiple users:', error);
      }
    }
    
    return results;
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
      console.log('[DataCache] Cleared all cache');
    } else if (this.cache[type]) {
      this.cache[type] = null;
      this.cache.lastFetch[type] = 0;
      console.log(`[DataCache] Cleared ${type} cache`);
    }
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
    try {
      const promises = [
        this.getRestaurants(),
        this.getRecentReviews(),
      ];
      await Promise.all(promises);
      console.log('[DataCache] Preloading complete');
    } catch (error) {
      console.error('[DataCache] Preloading failed:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      restaurants: this.cache.restaurants ? this.cache.restaurants.length : 0,
      users: this.cache.users.size,
      reviews: this.cache.reviews ? this.cache.reviews.length : 0,
      lastFetch: this.cache.lastFetch,
    };
  }
}

// Export singleton instance
export default new DataCacheService(); 