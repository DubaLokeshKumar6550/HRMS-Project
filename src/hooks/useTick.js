import { useState, useEffect } from 'react';

/**
 * Hook that updates state at a specified interval (default 1000ms).
 * Keeps timestamp calculations strictly reactive without relying on a tick counter.
 */
export function useTick(intervalMs = 1000) {
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return tick;
}

export default useTick;

