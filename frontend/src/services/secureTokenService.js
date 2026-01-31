/**
 * Secure token management service using httpOnly cookies
 * Provides secure token storage with XSS protection
 */

class SecureTokenService {
  constructor() {
    this.tokenCookieName = 'auth_token';
    this.userCookieName = 'user_data';
    this.apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  /**
   * Set authentication token in httpOnly cookie via API
   * @param {string} token - JWT token
   */
  async setToken(token) {
    try {
      // Call backend to set httpOnly cookie
      const response = await fetch(`${this.apiBaseUrl}/auth/set-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Failed to set secure token');
      }

      return true;
    } catch (error) {
      console.error('Error setting secure token:', error);
      // Fallback to localStorage for development only
      if (import.meta.env.DEV) {
        localStorage.setItem('token', token);
        return true;
      }
      return false;
    }
  }

  /**
   * Get token from server-side (httpOnly cookie)
   * Token is automatically sent via cookies
   */
  getToken() {
    // Token is handled by httpOnly cookie
    // Return null as we don't access it client-side
    return null;
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  async isAuthenticated() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/check-auth`, {
        method: 'GET',
        credentials: 'include'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  /**
   * Remove token by calling backend to clear httpOnly cookie
   */
  async removeToken() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/clear-token`, {
        method: 'POST',
        credentials: 'include'
      });

      // Clear fallback localStorage
      if (import.meta.env.DEV) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      return response.ok;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  }

  /**
   * Store user data securely
   * @param {Object} userData - User information
   */
  async setUser(userData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/set-user-data`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to set user data');
      }

      // Fallback for development
      if (import.meta.env.DEV) {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return true;
    } catch (error) {
      console.error('Error setting user data:', error);
      return false;
    }
  }

  /**
   * Get user data from backend
   * @returns {Promise<Object|null>} User data
   */
  async getUser() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/get-user-data`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      }

      // Fallback for development
      if (import.meta.env.DEV) {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      }

      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Refresh token
   * @returns {Promise<string|null>} New token
   */
  async refreshToken() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const secureTokenService = new SecureTokenService();
export default secureTokenService;
