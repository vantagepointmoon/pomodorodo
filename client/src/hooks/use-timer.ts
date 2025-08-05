import { useState, useEffect, useCallback } from "react";

export function useTimer() {
  const [timeRemaining, setTimeRemaining] = useState(1500); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<"work" | "break">("work");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerType === "work") {
              setCompletedPomodoros(count => count + 1);
              setTotalFocusTime(time => time + 25);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, timerType]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(timerType === "work" ? 1500 : 120);
  }, [timerType]);

  const switchToWork = useCallback(() => {
    setTimerType("work");
    setTimeRemaining(1500);
    setIsRunning(false);
  }, []);

  const switchToBreak = useCallback(() => {
    setTimerType("break");
    setTimeRemaining(120);
    setIsRunning(false);
  }, []);

  return {
    timeRemaining,
    isRunning,
    timerType,
    completedPomodoros,
    totalFocusTime,
    startTimer,
    pauseTimer,
    resetTimer,
    switchToWork,
    switchToBreak,
  };
}
