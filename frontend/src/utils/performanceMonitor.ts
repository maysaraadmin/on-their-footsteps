/**
 * Performance monitoring utilities for the Islamic Characters application
 * Provides comprehensive performance tracking, metrics collection, and optimization suggestions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  type: 'timing' | 'size' | 'count' | 'memory';
  category: 'navigation' | 'render' | 'api' | 'interaction' | 'resource';
}

interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
  entryType: string;
  initiatorType: string;
  transferSize?: number;
  encodedBodySize?: number;
  decodedBodySize?: number;
}

interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  INP: number; // Interaction to Next Paint
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
    modules: string[];
  }>;
  recommendations: string[];
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  private vitals: CoreWebVitals | null = null;
  private bundleAnalysis: BundleAnalysis | null = null;
  private config = {
    enableAutoTracking: true,
    enableCoreWebVitals: true,
    enableBundleAnalysis: true,
    enableResourceTracking: true,
    enableInteractionTracking: true,
    enableAPITracking: true,
    enableMemoryTracking: true,
    sampleRate: 1.0,
    maxMetricsPerType: 100
  };

  constructor(config = {}) {
    this.config = { ...this.config, ...config };
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Initialize performance observers
    this.setupObservers();
    
    // Start auto tracking
    if (this.config.enableAutoTracking) {
      this.startAutoTracking();
    }
    
    // Load initial metrics
    this.loadInitialMetrics();
  }

  // Add cleanup method
  public dispose(): void {
    this.cleanup();
  }

  private cleanup(): void {
    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    
    // Clear references
    this.observers = [];
    this.metrics.clear();
    this.vitals = null;
    this.bundleAnalysis = null;
    this.isMonitoring = false;
  }

  private setupObservers(): void {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing observer
      if (this.config.enableResourceTracking) {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordResourceMetric(entry as PerformanceResourceTiming);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      }

      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime, 'ms', 'timing', 'render');
          } else if (entry.name === 'largest-contentful-paint') {
            this.recordMetric('LCP', entry.startTime, 'ms', 'timing', 'render');
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Layout shift observer
      if ('LayoutShift' in window) {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.recordMetric('CLS', clsValue, '', 'layout-shift', 'render');
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      }

      // First input delay observer
      if ('PerformanceEventTiming' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              this.recordMetric('FID', (entry as any).processingStart - entry.startTime, 'ms', 'timing', 'interaction');
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      }

      // Interaction to Next Paint observer
      if ('PerformanceEventTiming' in window) {
        const inpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'event') {
              const inp = (entry as any).processingStart - entry.startTime;
              this.recordMetric('INP', inp, 'ms', 'timing', 'interaction');
            }
          }
        });
        inpObserver.observe({ entryTypes: ['event'] });
        this.observers.push(inpObserver);
      }
    }
  }

  private startAutoTracking(): void {
    // Track page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.recordPageLoadMetrics();
      }, 0);
    });

    // Track route changes (for SPA)
    this.trackRouteChanges();

    // Track interactions
    if (this.config.enableInteractionTracking) {
      this.trackInteractions();
    }

    // Track memory usage
    if (this.config.enableMemoryTracking) {
      this.trackMemoryUsage();
    }
  }

  private trackRouteChanges(): void {
    let lastPath = window.location.pathname;
    
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        this.recordMetric('route_change', 1, 'count', 'navigation');
        lastPath = currentPath;
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private trackInteractions(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const interactionType = this.getInteractionType(target);
      this.recordMetric('click', 1, 'count', 'interaction', interactionType);
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formName = form.getAttribute('name') || 'unnamed';
      this.recordMetric('form_submit', 1, 'count', 'interaction', formName);
    });

    // Track scroll events
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.recordMetric('scroll', 1, 'count', 'interaction');
      }, 150);
    });
  }

  private trackMemoryUsage(): void {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes', 'memory');
        this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes', 'memory');
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes', 'memory');
      }
    };

    // Measure memory every 5 seconds
    setInterval(measureMemory, 5000);
  }

  private getInteractionType(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'button') return 'button';
    if (tagName === 'a') return 'link';
    if (tagName === 'input') return `input_${(element as HTMLInputElement).type}`;
    if (tagName === 'select') return 'select';
    if (tagName === 'form') return 'form';
    if (element.classList.contains('character-card')) return 'character_card';
    if (element.classList.contains('search-box')) return 'search';
    
    return tagName;
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    this.recordMetric('TTFB', (entry as any).responseStart - (entry as any).requestStart, 'ms', 'timing', 'navigation');
    this.recordMetric('dom_interactive', (entry as any).domInteractive - (entry as any).navigationStart, 'ms', 'timing', 'render');
    this.recordMetric('load_complete', (entry as any).loadEventEnd - (entry as any).navigationStart, 'ms', 'timing', 'navigation');
    
    // Calculate Core Web Vitals
    this.calculateCoreWebVitals(entry);
  }

  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    const size = entry.transferSize || 0;
    
    this.recordMetric('resource_size', size, 'bytes', 'resource', resourceType);
    this.recordMetric('resource_time', entry.duration, 'ms', 'timing', resourceType);
    
    // Track slow resources
    if (entry.duration > 1000) {
      this.recordMetric('slow_resource', 1, 'count', 'resource', resourceType);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private calculateCoreWebVitals(navEntry: PerformanceNavigationTiming): void {
    // Get LCP (already recorded by paint observer)
    // Get FCP (already recorded by paint observer)
    // Get CLS (already recorded by layout shift observer)
    
    // Calculate TTFB
    const ttfb = navEntry.responseStart - navEntry.requestStart;
    
    // Calculate FID (already recorded by first input observer)
    // Calculate INP (already recorded by event observer)
    
    this.vitals = {
      LCP: this.getMetricValue('LCP') || 0,
      FID: this.getMetricValue('FID') || 0,
      CLS: this.getMetricValue('CLS') || 0,
      FCP: this.getMetricValue('FCP') || 0,
      TTFB: ttfb,
      INP: this.getMetricValue('INP') || 0
    };
  }

  private recordPageLoadMetrics(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordNavigationMetrics(navigation as PerformanceNavigationTiming);
      }
    }
  }

  private loadInitialMetrics(): void {
    // Load metrics from localStorage if available
    const stored = localStorage.getItem('performance_metrics');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.metrics = new Map(Object.entries(data));
      } catch (error) {
        console.warn('Failed to load stored metrics:', error);
      }
    }
  }

  public recordMetric(name: string, value: number, unit: string, type: string, category?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      type: type as any,
      category: category as any,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Limit metrics per type
    if (metrics.length > this.config.maxMetricsPerType) {
      metrics.shift();
    }

    // Save to localStorage
    this.saveMetrics();
  }

  public getMetricValue(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;
    return metrics[metrics.length - 1].value;
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    return allMetrics;
  }

  public getCoreWebVitals(): CoreWebVitals | null {
    return this.vitals;
  }

  public getPerformanceScore(): number {
    if (!this.vitals) return 0;
    
    let score = 100;
    
    // LCP scoring
    if (this.vitals.LCP > 2500) score -= 25;
    else if (this.vitals.LCP > 1000) score -= 10;
    
    // FID scoring
    if (this.vitals.FID > 300) score -= 25;
    else if (this.vitals.FID > 100) score -= 10;
    
    // CLS scoring
    if (this.vitals.CLS > 0.25) score -= 25;
    else if (this.vitals.CLS > 0.1) score -= 10;
    
    // INP scoring
    if (this.vitals.INP > 500) score -= 25;
    else if (this.vitals.INP > 200) score -= 10;
    
    return Math.max(0, score);
  }

  public getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check Core Web Vitals
    if (this.vitals) {
      if (this.vitals.LCP > 2500) {
        recommendations.push('Optimize largest contentful paint - consider image optimization and lazy loading');
      }
      if (this.vitals.FID > 300) {
        recommendations.push('Reduce first input delay - optimize JavaScript execution and main thread work');
      }
      if (this.vitals.CLS > 0.1) {
        recommendations.push('Reduce cumulative layout shift - ensure proper dimensions for images and ads');
      }
      if (this.vitals.INP > 200) {
        recommendations.push('Improve interaction to next paint - optimize event handlers and animations');
      }
    }
    
    // Check resource metrics
    const slowResources = this.getMetrics('slow_resource');
    if (slowResources.length > 5) {
      recommendations.push('Optimize slow resources - consider compression, caching, or CDN');
    }
    
    // Check memory usage
    const memoryUsed = this.getMetricValue('memory_used');
    if (memoryUsed && memoryUsed > 50 * 1024 * 1024) { // 50MB
      recommendations.push('High memory usage detected - consider memory optimization');
    }
    
    // Check API performance
    const apiTime = this.getMetrics('resource_time');
    const avgAPITime = apiTime.reduce((sum, m) => sum + m.value, 0) / apiTime.length;
    if (avgAPITime > 1000) {
      recommendations.push('Slow API responses detected - consider API optimization or caching');
    }
    
    return recommendations;
  }

  public analyzeBundle(): BundleAnalysis {
    if (this.bundleAnalysis) {
      return this.bundleAnalysis;
    }

    // This would be called from the build process
    // For now, return a placeholder
    this.bundleAnalysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      recommendations: [
        'Enable code splitting for better caching',
        'Optimize imports to reduce bundle size',
        'Consider tree shaking for unused code'
      ]
    };

    return this.bundleAnalysis;
  }

  public generateReport(): string {
    const vitals = this.getCoreWebVitals();
    const score = this.getPerformanceScore();
    const recommendations = this.getRecommendations();
    
    return `
# Performance Report

## Core Web Vitals
- LCP: ${vitals?.LCP || 0}ms
- FID: ${vitals?.FID || 0}ms
- CLS: ${vitals?.CLS || 0}
- FCP: ${vitals?.FCP || 0}ms
- TTFB: ${vitals?.TTFB || 0}ms
- INP: ${vitals?.INP || 0}ms

## Performance Score: ${score}/100

## Recommendations
${recommendations.map(rec => `- ${rec}`).join('\n')}

## Top Issues
${this.getTopIssues().map(issue => `- ${issue}`).join('\n')}
    `.trim();
  }

  private getTopIssues(): string[] {
    const issues: string[] = [];
    
    if (this.vitals) {
      if (this.vitals.LCP > 2500) issues.push(`Slow LCP: ${this.vitals.LCP}ms`);
      if (this.vitals.FID > 300) issues.push(`Slow FID: ${this.vitals.FID}ms`);
      if (this.vitals.CLS > 0.1) issues.push(`High CLS: ${this.vitals.CLS}`);
      if (this.vitals.INP > 200) issues.push(`Slow INP: ${this.vitals.INP}ms`);
    }
    
    return issues;
  }

  private saveMetrics(): void {
    try {
      const data: Record<string, PerformanceMetric[]> = {};
      for (const [key, value] of this.metrics.entries()) {
        data[key] = value;
      }
      localStorage.setItem('performance_metrics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save metrics:', error);
    }
  }

  public startMonitoring(): void {
    this.initialize();
  }

  public stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }

  public clearMetrics(): void {
    this.metrics.clear();
    localStorage.removeItem('performance_metrics');
  }

  // Static methods
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export types
export type {
  PerformanceMetric,
  PerformanceEntry,
  CoreWebVitals,
  BundleAnalysis
};

export default performanceMonitor;
