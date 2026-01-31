/**
 * Safe storage utilities with comprehensive error handling
 * Provides fallbacks for storage failures and private browsing mode
 */

class SafeStorage {
  constructor() {
    this.isLocalStorageAvailable = this.checkStorageAvailability('localStorage');
    this.isSessionStorageAvailable = this.checkStorageAvailability('sessionStorage');
    this.memoryStorage = new Map();
  }

  /**
   * Check if storage type is available
   * @param {string} storageType - 'localStorage' or 'sessionStorage'
   * @returns {boolean} Storage availability
   */
  checkStorageAvailability(storageType) {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = window[storageType];
      const testKey = '__storage_test__';
      
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      
      return true;
    } catch (error) {
      console.warn(`${storageType} not available:`, error);
      return false;
    }
  }

  /**
   * Get item from storage with fallback
   * @param {string} key - Storage key
   * @param {string} storageType - 'localStorage', 'sessionStorage', or 'auto'
   * @returns {string|null} Stored value
   */
  getItem(key, storageType = 'auto') {
    try {
      if (storageType === 'auto') {
        // Try localStorage first, then sessionStorage, then memory
        if (this.isLocalStorageAvailable) {
          return localStorage.getItem(key);
        }
        if (this.isSessionStorageAvailable) {
          return sessionStorage.getItem(key);
        }
        return this.memoryStorage.get(key) || null;
      }

      if (storageType === 'localStorage' && this.isLocalStorageAvailable) {
        return localStorage.getItem(key);
      }

      if (storageType === 'sessionStorage' && this.isSessionStorageAvailable) {
        return sessionStorage.getItem(key);
      }

      return this.memoryStorage.get(key) || null;
    } catch (error) {
      console.error(`Error getting item ${key} from ${storageType}:`, error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Set item in storage with fallback
   * @param {string} key - Storage key
   * @param {string} value - Storage value
   * @param {string} storageType - 'localStorage', 'sessionStorage', or 'auto'
   * @returns {boolean} Success status
   */
  setItem(key, value, storageType = 'auto') {
    try {
      if (storageType === 'auto') {
        if (this.isLocalStorageAvailable) {
          localStorage.setItem(key, value);
          return true;
        }
        if (this.isSessionStorageAvailable) {
          sessionStorage.setItem(key, value);
          return true;
        }
        this.memoryStorage.set(key, value);
        return true;
      }

      if (storageType === 'localStorage' && this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
        return true;
      }

      if (storageType === 'sessionStorage' && this.isSessionStorageAvailable) {
        sessionStorage.setItem(key, value);
        return true;
      }

      this.memoryStorage.set(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in ${storageType}:`, error);
      this.memoryStorage.set(key, value);
      return false;
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @param {string} storageType - 'localStorage', 'sessionStorage', or 'auto'
   * @returns {boolean} Success status
   */
  removeItem(key, storageType = 'auto') {
    try {
      if (storageType === 'auto') {
        if (this.isLocalStorageAvailable) {
          localStorage.removeItem(key);
        }
        if (this.isSessionStorageAvailable) {
          sessionStorage.removeItem(key);
        }
        this.memoryStorage.delete(key);
        return true;
      }

      if (storageType === 'localStorage' && this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
        return true;
      }

      if (storageType === 'sessionStorage' && this.isSessionStorageAvailable) {
        sessionStorage.removeItem(key);
        return true;
      }

      this.memoryStorage.delete(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from ${storageType}:`, error);
      this.memoryStorage.delete(key);
      return false;
    }
  }

  /**
   * Clear all storage
   * @param {string} storageType - 'localStorage', 'sessionStorage', or 'all'
   */
  clear(storageType = 'all') {
    try {
      if (storageType === 'all' || storageType === 'localStorage') {
        if (this.isLocalStorageAvailable) {
          localStorage.clear();
        }
      }
      
      if (storageType === 'all' || storageType === 'sessionStorage') {
        if (this.isSessionStorageAvailable) {
          sessionStorage.clear();
        }
      }
      
      this.memoryStorage.clear();
    } catch (error) {
      console.error(`Error clearing ${storageType}:`, error);
      this.memoryStorage.clear();
    }
  }

  /**
   * Get storage size estimate
   * @returns {Object} Storage statistics
   */
  getStorageStats() {
    const stats = {
      localStorageAvailable: this.isLocalStorageAvailable,
      sessionStorageAvailable: this.isSessionStorageAvailable,
      memoryStorageSize: this.memoryStorage.size,
      localStorageSize: 0,
      sessionStorageSize: 0
    };

    try {
      if (this.isLocalStorageAvailable) {
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            stats.localStorageSize += localStorage[key].length;
          }
        }
      }

      if (this.isSessionStorageAvailable) {
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            stats.sessionStorageSize += sessionStorage[key].length;
          }
        }
      }
    } catch (error) {
      console.warn('Error calculating storage stats:', error);
    }

    return stats;
  }

  /**
   * Check if storage is quota exceeded
   * @param {string} storageType - Storage type to check
   * @returns {boolean} Quota status
   */
  isQuotaExceeded(storageType = 'localStorage') {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      const testKey = '__quota_test__';
      
      storage.setItem(testKey, 'x'.repeat(1024)); // 1KB test
      storage.removeItem(testKey);
      
      return false;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`${storageType} quota exceeded`);
        return true;
      }
      return false;
    }
  }

  /**
   * Cleanup expired or large items
   * @param {number} maxAge - Maximum age in milliseconds
   * @param {number} maxSize - Maximum size in bytes
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000, maxSize = 1024 * 1024) { // 24 hours, 1MB
    try {
      const now = Date.now();
      const keysToRemove = [];

      // Check localStorage
      if (this.isLocalStorageAvailable) {
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                // Check age (if stored as JSON with timestamp)
                if (key.includes('_timestamp_')) {
                  const timestamp = parseInt(key.split('_timestamp_')[1]);
                  if (now - timestamp > maxAge) {
                    keysToRemove.push({ key, type: 'localStorage' });
                  }
                }
                
                // Check size
                if (value.length > maxSize) {
                  keysToRemove.push({ key, type: 'localStorage' });
                }
              }
            } catch (e) {
              // Remove corrupted items
              keysToRemove.push({ key, type: 'localStorage' });
            }
          }
        }
      }

      // Check sessionStorage
      if (this.isSessionStorageAvailable) {
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            try {
              const value = sessionStorage.getItem(key);
              if (value && value.length > maxSize) {
                keysToRemove.push({ key, type: 'sessionStorage' });
              }
            } catch (e) {
              keysToRemove.push({ key, type: 'sessionStorage' });
            }
          }
        }
      }

      // Remove identified items
      keysToRemove.forEach(({ key, type }) => {
        if (type === 'localStorage') {
          localStorage.removeItem(key);
        } else if (type === 'sessionStorage') {
          sessionStorage.removeItem(key);
        }
      });

      console.log(`Cleaned up ${keysToRemove.length} storage items`);
    } catch (error) {
      console.error('Error during storage cleanup:', error);
    }
  }
}

// Export singleton instance
export const safeStorage = new SafeStorage();
export default safeStorage;
