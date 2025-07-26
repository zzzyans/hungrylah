// services/RecommendationCacheService.js
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

class RecommendationCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes for recommendations
  }

  // Generate cache key based on user ID and filter
  getCacheKey(userId, filter) {
    return `${userId}_${filter}`;
  }

  // Check if cache is still valid
  isCacheValid(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.cacheTimeout;
  }

  // Get recommendations with caching
  async getRecommendations(userId, filter = "All") {
    const cacheKey = this.getCacheKey(userId, filter);
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log(`[RecommendationCache] Returning cached recommendations for ${userId} with filter ${filter}`);
      return this.cache.get(cacheKey).data;
    }

    console.log(`[RecommendationCache] Fetching fresh recommendations for ${userId} with filter ${filter}`);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/${userId}?filter=${encodeURIComponent(filter)}`, 
        { timeout: 8000 } // Increased timeout
      );
      
      const recommendations = response.data.recommendations;
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now()
      });
      
      console.log(`[RecommendationCache] Cached ${recommendations.length} recommendations`);
      return recommendations;
      
    } catch (error) {
      console.error('[RecommendationCache] Error fetching recommendations:', error);
      
      // Return cached data even if expired, if available
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('[RecommendationCache] Returning expired cache due to API error');
        return cached.data;
      }
      
      throw error;
    }
  }

  // Clear cache for specific user or all
  clearCache(userId = null) {
    if (userId) {
      // Clear all filters for this user
      for (const [key] of this.cache) {
        if (key.startsWith(`${userId}_`)) {
          this.cache.delete(key);
        }
      }
      console.log(`[RecommendationCache] Cleared cache for user ${userId}`);
    } else {
      // Clear all cache
      this.cache.clear();
      console.log('[RecommendationCache] Cleared all cache');
    }
  }

  // Preload recommendations for a user
  async preloadRecommendations(userId) {
    if (!userId) return;
    
    console.log(`[RecommendationCache] Preloading recommendations for ${userId}`);
    try {
      // Preload both "All" and "Highly Rated" filters
      await Promise.all([
        this.getRecommendations(userId, "All"),
        this.getRecommendations(userId, "Highly Rated")
      ]);
      console.log(`[RecommendationCache] Preloading complete for ${userId}`);
    } catch (error) {
      console.log(`[RecommendationCache] Preloading failed for ${userId}:`, error.message);
    }
  }

  // Get cache stats
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, value] of this.cache) {
      if ((now - value.timestamp) < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries
    };
  }
}

// Export singleton instance
export default new RecommendationCacheService(); 