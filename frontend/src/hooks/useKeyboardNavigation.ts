/**
 * Keyboard navigation utilities for accessibility
 * Provides comprehensive keyboard navigation support following WCAG guidelines
 */

import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onSpace?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onSpace,
    onHome,
    onEnd,
    onPageUp,
    onPageDown,
    trapFocus = false,
    restoreFocus = false
  } = options;

  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Get all focusable elements
  const getFocusableElements = useCallback((container?: HTMLElement) => {
    const root = container || document.body;
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'summary',
      'details',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]',
      '[role="treeitem"]',
      '[role="gridcell"]',
      '[role="listbox"]',
      '[role="combobox"]',
      '[role="spinbutton"]',
      '[role="tooltip"]',
      '[role="dialog"]',
      '[role="status"]',
      '[role="progressbar"]',
      '[role="timer"]',
      '[role="slider"]',
      '[role="menu"]',
      '[role="menubar"]',
      '[role="navigation"]',
      '[role="search"]',
      '[role="tree"]',
      '[role="grid"]',
      '[role="list"]',
      '[role="table"]',
      '[role="rowgroup"]',
      '[role="row"]',
      '[role="cell"]',
      '[role="columnheader"]',
      '[role="rowheader"]',
      '[role="column"]',
      '[role="group"]',
      '[role="figure"]',
      '[role="img"]',
      '[role="link"]',
      '[role="region"]',
      '[role="article"]',
      '[role="status"]',
      '[role="alert"]'
    ].join(', ');

    return root.querySelectorAll(selector);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, defaultPrevented } = event;

    // Prevent default behavior for handled keys
    if (defaultPrevented) return;

    switch (key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Tab':
        if (!trapFocus) {
          return; // Let default tab behavior
        }
        event.preventDefault();
        onTab?.();
        break;
      case ' ':
        onSpace?.();
        break;
      case 'Home':
        event.preventDefault();
        onHome?.();
        break;
      case 'End':
        event.preventDefault();
        onEnd?.();
        break;
      case 'PageUp':
        event.preventDefault();
        onPageUp?.();
        break;
      case 'PageDown':
        event.preventDefault();
        onPageDown?.();
        break;
    }
  }, [
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onSpace,
    onHome,
    onEnd,
    onPageUp,
    onPageDown
  ]);

  // Trap focus within container
  const trapFocusInContainer = useCallback((container: HTMLElement) => {
    if (!trapFocus) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      event.preventDefault();
      
      const currentElement = document.activeElement as HTMLElement;
      const currentIndex = Array.from(focusableElements).indexOf(currentElement);
      
      let nextElement;
      if (event.shiftKey) {
        // Shift+Tab: go to previous element
        nextElement = currentIndex > 0 ? focusableElements[currentIndex - 1] : lastElement;
      } else {
        // Tab: go to next element
        nextElement = currentIndex < focusableElements.length - 1 ? focusableElements[currentIndex + 1] : firstElement;
      }
      
      if (nextElement) {
        (nextElement as HTMLElement).focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [trapFocus, getFocusableElements]);

  // Restore focus when component unmounts
  const saveFocusedElement = useCallback(() => {
    if (restoreFocus && document.activeElement) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  const restoreFocusElement = useCallback(() => {
    if (lastFocusedElement.current && lastFocusedElement.current.focus) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    focusableElements: focusableElementsRef,
    trapFocusInContainer,
    saveFocusedElement,
    restoreFocus: restoreFocusElement,
    getFocusableElements
  };
};

export default useKeyboardNavigation;
