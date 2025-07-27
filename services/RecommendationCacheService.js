// services/RecommendationCacheService.js
import axios from 'axios';

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = "https://12102b64ef42.ngrok-free.app";

class RecommendationCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes for recommendations
    this.maxRetries = 2;
    this.retryDelay = 1000; // 1 second
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

  // Retry logic for failed requests
  async retryRequest(requestFn, retries = this.maxRetries) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries) {
          throw error;
        }
        console.log(`[RecommendationCache] Retry ${i + 1}/${retries} after error:`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  // Get recommendations with caching and retry logic
  async getRecommendations(userId, filter = "All") {
    const cacheKey = this.getCacheKey(userId, filter);
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log(`[RecommendationCache] Returning cached recommendations for ${userId} with filter ${filter}`);
      return this.cache.get(cacheKey).data;
    }

    console.log(`[RecommendationCache] Fetching fresh recommendations for ${userId} with filter ${filter}`);
    
    try {
      const requestFn = () => axios.get(
        `${API_BASE_URL}/recommendations/${userId}?filter=${encodeURIComponent(filter)}`, 
        { 
          timeout: 8000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      const response = await this.retryRequest(requestFn);
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

  // Preload recommendations for a user with error handling
  async preloadRecommendations(userId) {
    if (!userId) return;
    
    console.log(`[RecommendationCache] Preloading recommendations for ${userId}`);
    try {
      // Preload both "All" and "Highly Rated" filters
      const promises = [
        this.getRecommendations(userId, "All").catch(error => {
          console.log(`[RecommendationCache] Failed to preload "All" filter:`, error.message);
          return [];
        }),
        this.getRecommendations(userId, "Highly Rated").catch(error => {
          console.log(`[RecommendationCache] Failed to preload "Highly Rated" filter:`, error.message);
          return [];
        })
      ];
      
      await Promise.allSettled(promises);
      console.log(`[RecommendationCache] Preloading complete for ${userId}`);
    } catch (error) {
      console.log(`[RecommendationCache] Preloading failed for ${userId}:`, error.message);
    }
  }

  // Get cache stats with detailed information
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalRecommendations = 0;
    
    for (const [key, value] of this.cache) {
      if ((now - value.timestamp) < this.cacheTimeout) {
        validEntries++;
        totalRecommendations += value.data.length;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      totalRecommendations,
      cacheTimeout: this.cacheTimeout,
      maxRetries: this.maxRetries
    };
  }

  // Check if backend is reachable
  async checkBackendHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      console.error('[RecommendationCache] Backend health check failed:', error.message);
      return false;
    }
  }

  // Warm up cache for better performance
  async warmupCache(userId) {
    if (!userId) return;
    
    console.log(`[RecommendationCache] Warming up cache for ${userId}`);
    try {
      // Check backend health first
      const isHealthy = await this.checkBackendHealth();
      if (!isHealthy) {
        console.log('[RecommendationCache] Backend not healthy, skipping warmup');
        return;
      }
      
      // Warm up cache in background
      this.preloadRecommendations(userId);
    } catch (error) {
      console.error('[RecommendationCache] Cache warmup failed:', error);
    }
  }
}

export default new RecommendationCacheService(); 