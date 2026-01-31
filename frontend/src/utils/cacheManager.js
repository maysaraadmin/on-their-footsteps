/**
 * Advanced caching manager for the Islamic Characters application.
 * Implements intelligent caching with TTL, invalidation, and storage strategies.
 */

class CacheManager {
  constructor(options = {}) {
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = options.maxCacheSize || 100; // Maximum items in cache
    this.storage = options.storage || 'memory'; // 'memory', 'localStorage', 'sessionStorage'
    this.cache = new Map();
    this.timers = new Map();
    this.hitCount = new Map();
    this.lastAccessed = new Map();
    
    // Initialize storage
    this._initializeStorage();
    
    // Load existing cache from storage if applicable
    this._loadFromStorage();
  }
  
  _initializeStorage() {
    if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
      this.storageInterface = localStorage;
    } else if (this.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
      this.storageInterface = sessionStorage;
    } else {
      this.storage = 'memory';
      this.storageInterface = null;
    }
  }
  
  _generateKey(key, namespace = 'default') {
    return `${namespace}:${key}`;
  }
  
  _serializeData(data) {
    try {
      return JSON.stringify({
        data,
        timestamp: Date.now(),
        hitCount: this.hitCount.get(key) || 0
      });
    } catch (error) {
      console.error('Cache serialization error:', error);
      return null;
    }
  }
  
  _deserializeData(serializedData) {
    try {
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Cache deserialization error:', error);
      return null;
    }
  }
  
  _saveToStorage(key, data, ttl) {
    if (!this.storageInterface) return;
    
    try {
      const storageKey = this._generateKey(key, 'cache');
      const serializedData = this._serializeData(data);
      if (serializedData) {
        this.storageInterface.setItem(storageKey, serializedData);
        
        // Store TTL separately
        const ttlKey = this._generateKey(key, 'ttl');
        this.storageInterface.setItem(ttlKey, (Date.now() + ttl).toString());
      }
    } catch (error) {
      console.error('Cache storage error:', error);
      // If storage is full, try to clear some space
      if (error.name === 'QuotaExceededError') {
        this._evictOldest();
      }
    }
  }
  
  _loadFromStorage() {
    if (!this.storageInterface) return;
    
    try {
      // Load all cache keys
      const keys = [];
      for (let i = 0; i < this.storageInterface.length; i++) {
        const key = this.storageInterface.key(i);
        if (key && key.startsWith('cache:')) {
          keys.push(key.replace('cache:', ''));
        }
      }
      
      keys.forEach(key => {
        const storageKey = this._generateKey(key, 'cache');
        const ttlKey = this._generateKey(key, 'ttl');
        
        const serializedData = this.storageInterface.getItem(storageKey);
        const ttl = parseInt(this.storageInterface.getItem(ttlKey) || '0');
        
        if (serializedData && ttl > Date.now()) {
          const parsedData = this._deserializeData(serializedData);
          if (parsedData) {
            this.cache.set(key, parsedData.data);
            this.hitCount.set(key, parsedData.hitCount || 0);
            this.lastAccessed.set(key, Date.now());
          }
        } else {
          // Remove expired data
          this.storageInterface.removeItem(storageKey);
          this.storageInterface.removeItem(ttlKey);
        }
      });
    } catch (error) {
      console.error('Cache loading error:', error);
    }
  }
  
  _evictOldest() {
    if (this.cache.size === 0) return;
    
    // Find least recently used item
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.lastAccessed) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  _checkCacheSize() {
    if (this.cache.size >= this.maxCacheSize) {
      this._evictOldest();
    }
  }
  
  _clearTimer(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }
  
  _setTimer(key, ttl) {
    this._clearTimer(key);
    
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }
  }
  
  /**
   * Store data in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, data, ttl = this.defaultTTL) {
    // Check cache size limit
    this._checkCacheSize();
    
    // Store data
    this.cache.set(key, data);
    this.lastAccessed.set(key, Date.now());
    this.hitCount.set(key, 0);
    
    // Set expiration timer
    this._setTimer(key, ttl);
    
    // Save to persistent storage if configured
    this._saveToStorage(key, data, ttl);
  }
  
  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {any} Cached data or null if not found/expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    // Update access time and hit count
    this.lastAccessed.set(key, Date.now());
    const currentHits = this.hitCount.get(key) || 0;
    this.hitCount.set(key, currentHits + 1);
    
    return this.cache.get(key);
  }
  
  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }
  
  /**
   * Delete item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.hitCount.delete(key);
    this.lastAccessed.delete(key);
    this._clearTimer(key);
    
    // Remove from persistent storage
    if (this.storageInterface) {
      const storageKey = this._generateKey(key, 'cache');
      const ttlKey = this._generateKey(key, 'ttl');
      this.storageInterface.removeItem(storageKey);
      this.storageInterface.removeItem(ttlKey);
    }
  }
  
  /**
   * Clear all cache
   */
  clear() {
    // Clear timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    
    // Clear cache data
    this.cache.clear();
    this.hitCount.clear();
    this.lastAccessed.clear();
    
    // Clear persistent storage
    if (this.storageInterface) {
      const keysToRemove = [];
      for (let i = 0; i < this.storageInterface.length; i++) {
        const key = this.storageInterface.key(i);
        if (key && (key.startsWith('cache:') || key.startsWith('ttl:'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.storageInterface.removeItem(key));
    }
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const stats = {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitCount: Object.fromEntries(this.hitCount),
      lastAccessed: Object.fromEntries(this.lastAccessed),
      storage: this.storage
    };
    
    // Calculate total hits
    stats.totalHits = Array.from(this.hitCount.values()).reduce((sum, hits) => sum + hits, 0);
    
    // Calculate average hits per item
    stats.averageHits = this.cache.size > 0 ? stats.totalHits / this.cache.size : 0;
    
    return stats;
  }
  
  /**
   * Get cache keys sorted by hit count (most popular first)
   * @returns {Array} Array of keys sorted by popularity
   */
  getPopularKeys(limit = 10) {
    return Array.from(this.hitCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, hits]) => ({ key, hits }));
  }
  
  /**
   * Get cache keys sorted by last access time (most recent first)
   * @returns {Array} Array of keys sorted by access time
   */
  getRecentlyAccessedKeys(limit = 10) {
    return Array.from(this.lastAccessed.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, time]) => ({ key, lastAccessed: time }));
  }
  
  /**
   * Preload multiple items into cache
   * @param {Array} items - Array of {key, data, ttl} objects
   */
  preload(items) {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }
  
  /**
   * Update TTL for existing cache item
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in milliseconds
   */
  updateTTL(key, ttl) {
    if (this.cache.has(key)) {
      this._setTimer(key, ttl);
      this._saveToStorage(key, this.cache.get(key), ttl);
    }
  }
  
  /**
   * Create a namespaced cache instance
   * @param {string} namespace - Namespace for cache keys
   * @returns {Object} Namespaced cache interface
   */
  namespace(namespace) {
    return {
      set: (key, data, ttl) => this.set(`${namespace}:${key}`, data, ttl),
      get: (key) => this.get(`${namespace}:${key}`),
      has: (key) => this.has(`${namespace}:${key}`),
      delete: (key) => this.delete(`${namespace}:${key}`),
      clear: () => {
        const keysToDelete = Array.from(this.cache.keys()).filter(k => k.startsWith(`${namespace}:`));
        keysToDelete.forEach(key => this.delete(key));
      },
      getStats: () => {
        const stats = this.getStats();
        const namespaceKeys = Array.from(this.cache.keys()).filter(k => k.startsWith(`${namespace}:`));
        return {
          ...stats,
          size: namespaceKeys.length,
          keys: namespaceKeys
        };
      }
    };
  }
}

// API-specific cache manager
class APICacheManager extends CacheManager {
  constructor(options = {}) {
    super({
      defaultTTL: 5 * 60 * 1000, // 5 minutes for API data
      maxCacheSize: 50,
      storage: 'localStorage',
      ...options
    });
    
    this.requestCache = new Map(); // For request deduplication
  }
  
  /**
   * Cache API response with intelligent TTL based on endpoint
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @param {any} data - Response data
   */
  cacheAPIResponse(endpoint, params, data) {
    const key = this._generateAPIKey(endpoint, params);
    const ttl = this._getTTLForEndpoint(endpoint);
    this.set(key, data, ttl);
  }
  
  /**
   * Get cached API response
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {any} Cached response or null
   */
  getCachedAPIResponse(endpoint, params) {
    const key = this._generateAPIKey(endpoint, params);
    return this.get(key);
  }
  
  /**
   * Invalidate cache for specific endpoint or pattern
   * @param {string} pattern - Endpoint pattern to invalidate
   */
  invalidateEndpoint(pattern) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.delete(key));
  }
  
  /**
   * Get or create cache entry for ongoing request (request deduplication)
   * @param {string} key - Request key
   * @returns {Promise} Existing promise or null
   */
  getOngoingRequest(key) {
    return this.requestCache.get(key);
  }
  
  /**
   * Store ongoing request promise
   * @param {string} key - Request key
   * @param {Promise} promise - Request promise
   */
  setOngoingRequest(key, promise) {
    this.requestCache.set(key, promise);
    
    // Clean up after request completes
    promise.finally(() => {
      this.requestCache.delete(key);
    });
  }
  
  _generateAPIKey(endpoint, params) {
    const paramString = params ? JSON.stringify(params) : '';
    return `api:${endpoint}:${paramString}`;
  }
  
  _getTTLForEndpoint(endpoint) {
    // Different TTLs for different types of data
    if (endpoint.includes('/featured/')) {
      return 10 * 60 * 1000; // 10 minutes for featured content
    } else if (endpoint.includes('/categories')) {
      return 30 * 60 * 1000; // 30 minutes for categories (rarely change)
    } else if (endpoint.includes('/search')) {
      return 2 * 60 * 1000; // 2 minutes for search results
    } else if (endpoint.includes('/characters/')) {
      return 15 * 60 * 1000; // 15 minutes for character data
    }
    return this.defaultTTL;
  }
}

// Component-specific cache manager for React components
class ComponentCacheManager extends CacheManager {
  constructor(options = {}) {
    super({
      defaultTTL: 60 * 1000, // 1 minute for component data
      maxCacheSize: 30,
      storage: 'memory', // Keep in memory for component data
      ...options
    });
  }
  
  /**
   * Cache component state
   * @param {string} componentId - Component identifier
   * @param {any} state - Component state
   * @param {number} ttl - Time to live
   */
  cacheComponentState(componentId, state, ttl) {
    this.set(`component:${componentId}`, state, ttl);
  }
  
  /**
   * Get cached component state
   * @param {string} componentId - Component identifier
   * @returns {any} Cached state or null
   */
  getComponentState(componentId) {
    return this.get(`component:${componentId}`);
  }
  
  /**
   * Cache rendered component
   * @param {string} componentId - Component identifier
   * @param {any} rendered - Rendered component
   * @param {number} ttl - Time to live
   */
  cacheRenderedComponent(componentId, rendered, ttl) {
    this.set(`rendered:${componentId}`, rendered, ttl);
  }
  
  /**
   * Get cached rendered component
   * @param {string} componentId - Component identifier
   * @returns {any} Cached rendered component or null
   */
  getRenderedComponent(componentId) {
    return this.get(`rendered:${componentId}`);
  }
}

// Global cache instances
export const apiCache = new APICacheManager();
export const componentCache = new ComponentCacheManager();
export const defaultCache = new CacheManager();

// Export classes for custom instances
export { CacheManager, APICacheManager, ComponentCacheManager };

// Utility functions for cache management
export const cacheUtils = {
  /**
   * Create a cache key from multiple arguments
   */
  createKey: (...args) => args.join(':'),
  
  /**
   * Debounce function with cache
   */
  debounceWithCache: (func, delay = 300, cacheKey) => {
    const cache = cacheKey ? defaultCache.namespace('debounce') : null;
    
    return (...args) => {
      const key = cacheKey ? cacheUtils.createKey(...args) : null;
      
      if (cache && key && cache.has(key)) {
        return cache.get(key);
      }
      
      const debounced = setTimeout(() => {
        const result = func(...args);
        if (cache && key) {
          cache.set(key, result, delay);
        }
      }, delay);
      
      return debounced;
    };
  },
  
  /**
   * Throttle function with cache
   */
  throttleWithCache: (func, limit = 1000, cacheKey) => {
    const cache = cacheKey ? defaultCache.namespace('throttle') : null;
    let inThrottle = false;
    
    return (...args) => {
      const key = cacheKey ? cacheUtils.createKey(...args) : null;
      
      if (inThrottle) {
        if (cache && key && cache.has(key)) {
          return cache.get(key);
        }
        return;
      }
      
      const result = func(...args);
      if (cache && key) {
        cache.set(key, result, limit);
      }
      
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
      
      return result;
    };
  },
  
  /**
   * Memoize function with cache
   */
  memoizeWithCache: (func, cacheKey) => {
    const cache = cacheKey ? defaultCache.namespace('memoize') : defaultCache;
    
    return (...args) => {
      const key = cacheUtils.createKey(...args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      
      return result;
    };
  }
};

export default {
  CacheManager,
  APICacheManager,
  ComponentCacheManager,
  apiCache,
  componentCache,
  defaultCache,
  cacheUtils
};
