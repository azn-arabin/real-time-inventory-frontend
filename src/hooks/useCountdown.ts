import { useEffect, useState, useCallback } from "react";

// countdown hook - takes a target date string and returns seconds left
export function useCountdown(expiresAt: string | null) {
  const calcSecsLeft = useCallback(() => {
    if (!expiresAt) return 0;
    const diff = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / 1000,
    );
    return Math.max(0, diff);
  }, [expiresAt]);

  const [secondsLeft, setSecondsLeft] = useState(calcSecsLeft);

  useEffect(() => {
    setSecondsLeft(calcSecsLeft());

    if (!expiresAt) return;

    const interval = setInterval(() => {
      const left = calcSecsLeft();
      setSecondsLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calcSecsLeft]);

  return secondsLeft;
}
