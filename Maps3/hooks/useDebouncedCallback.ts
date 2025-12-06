import { useCallback, useRef } from 'react';

type DebouncedFunc = (latitude: number, longitude: number) => void;

export function useDebouncedCallback(
  callback: DebouncedFunc,
  delay: number
): DebouncedFunc {
  const timeoutRef = useRef<any>(null);

  const debouncedCallback = useCallback(
    (latitude: number, longitude: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(latitude, longitude);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
}