import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * A hook that combines related effects and optimizes their dependencies
 * to reduce unnecessary re-renders.
 */
export const useOptimizedEffects = () => {
  // Use refs to store stable references for effect callbacks
  const effectCallbacksRef = useRef<Map<string, (...args: any[]) => void>>(new Map());

  /**
   * Register an effect callback with a stable reference
   */
  const registerEffect = useCallback((key: string, callback: (...args: any[]) => void) => {
    effectCallbacksRef.current.set(key, callback);
  }, []);

  /**
   * Execute a registered effect callback
   */
  const executeEffect = useCallback((key: string, ...args: any[]) => {
    const callback = effectCallbacksRef.current.get(key);
    if (callback) {
      callback(...args);
    }
  }, []);

  /**
   * Create a memoized callback that doesn't change unless dependencies change
   */
  const createStableCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    deps: any[]
  ): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(callback, deps) as T;
  }, []);

  /**
   * Create a debounced version of a callback
   */
  const createDebouncedCallback = useCallback((
    callback: (...args: any[]) => void,
    delay: number
  ) => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
  }, []);

  return {
    registerEffect,
    executeEffect,
    createStableCallback,
    createDebouncedCallback,
  };
};