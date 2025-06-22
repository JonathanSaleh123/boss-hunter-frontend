// src/hooks/usePrevious.ts
import { useRef, useEffect } from 'react';

// This hook stores and returns the value of a variable from the previous render
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}