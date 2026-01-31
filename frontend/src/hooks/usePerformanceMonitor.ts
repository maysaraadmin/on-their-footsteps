/**
 * React hook for performance monitoring
 * Provides automatic cleanup and lifecycle management
 */

import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface UsePerformanceMonitorOptions {
  enableAutoTracking?: boolean;
  enableCoreWebVitals?: boolean;
  enableResourceTracking?: boolean;
  enableInteractionTracking?: boolean;
  enableMemoryTracking?: boolean;
  sampleRate?: number;
}

interface UsePerformanceMonitorReturn {
  monitor: PerformanceMonitor | null;
  recordMetric: (name: string, value: number, unit: string, type?: string, category?: string) => void;
  getMetrics: () => Map<string, any[]>;
  getVitals: () => any;
  getRecommendations: () => string[];
  clearMetrics: () => void;
  dispose: () => void;
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}): UsePerformanceMonitorReturn => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const isInitialized = useRef(false);

  const {
    enableAutoTracking = true,
    enableCoreWebVitals = true,
    enableResourceTracking = true,
    enableInteractionTracking = true,
    enableMemoryTracking = true,
    sampleRate = 1.0
  } = options;

  // Initialize monitor
  useEffect(() => {
    if (isInitialized.current || typeof window === 'undefined') {
      return;
    }

    // Check sample rate
    if (Math.random() > sampleRate) {
      return; // Skip monitoring for this session
    }

    try {
      monitorRef.current = new PerformanceMonitor({
        enableAutoTracking,
        enableCoreWebVitals,
        enableResourceTracking,
        enableInteractionTracking,
        enableMemoryTracking,
        sampleRate
      });

      isInitialized.current = true;
      console.log('Performance monitor initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitor:', error);
    }

    // Cleanup on unmount
    return () => {
      if (monitorRef.current) {
        monitorRef.current.dispose();
        monitorRef.current = null;
        isInitialized.current = false;
        console.log('Performance monitor disposed');
      }
    };
  }, [
    enableAutoTracking,
    enableCoreWebVitals,
    enableResourceTracking,
    enableInteractionTracking,
    enableMemoryTracking,
    sampleRate
  ]);

  // Record metric
  const recordMetric = useCallback((
    name: string,
    value: number,
    unit: string,
    type: string = 'timing',
    category: string = 'custom'
  ) => {
    if (monitorRef.current) {
      monitorRef.current.recordMetric(name, value, unit, type, category);
    }
  }, []);

  // Get metrics
  const getMetrics = useCallback(() => {
    if (monitorRef.current) {
      return monitorRef.current.getMetrics();
    }
    return new Map();
  }, []);

  // Get vitals
  const getVitals = useCallback(() => {
    if (monitorRef.current) {
      return monitorRef.current.getVitals();
    }
    return null;
  }, []);

  // Get recommendations
  const getRecommendations = useCallback(() => {
    if (monitorRef.current) {
      return monitorRef.current.getRecommendations();
    }
    return [];
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.clearMetrics();
    }
  }, []);

  // Manual dispose
  const dispose = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.dispose();
      monitorRef.current = null;
      isInitialized.current = false;
    }
  }, []);

  return {
    monitor: monitorRef.current,
    recordMetric,
    getMetrics,
    getVitals,
    getRecommendations,
    clearMetrics,
    dispose
  };
};

export default usePerformanceMonitor;
