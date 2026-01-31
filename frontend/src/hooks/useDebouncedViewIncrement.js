/**
 * Debounced view increment hook for character views
 * Prevents excessive API calls and improves performance
 */

import { useCallback, useRef } from 'react';
import { safeStorage } from '../utils/safeStorage';

export const useDebouncedViewIncrement = (characterId, debounceMs = 300000) => { // 5 minutes default
  const debounceTimeoutRef = useRef(null);
  const lastViewKey = `lastView_${characterId}`;

  const incrementView = useCallback(async () => {
    try {
      // Check if we should increment views
      const lastViewTime = safeStorage.getItem(lastViewKey);
      const now = Date.now();
      
      // Only increment if it's been more than debounceMs since last view
      if (lastViewTime && (now - parseInt(lastViewTime)) < debounceMs) {
        return false; // Skip increment
      }

      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the increment
      return new Promise((resolve) => {
        debounceTimeoutRef.current = setTimeout(async () => {
          try {
            const response = await fetch(`/api/characters/${characterId}/increment-views`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });

            if (response.ok) {
              // Update the last view time
              safeStorage.setItem(lastViewKey, now.toString());
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (error) {
            console.error('Error incrementing views:', error);
            resolve(false);
          }
        }, 1000); // 1 second debounce for API calls
      });
    } catch (error) {
      console.error('Error in view increment logic:', error);
      return false;
    }
  }, [characterId, debounceMs, lastViewKey]);

  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  return {
    incrementView,
    cleanup
  };
};

export default useDebouncedViewIncrement;
