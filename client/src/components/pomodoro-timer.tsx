import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, Square } from "lucide-react";
import { useTimer } from "@/hooks/use-timer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PomodoroTimerProps {
  onTimerTypeChange: (type: "work" | "break") => void;
}

export default function PomodoroTimer({ onTimerTypeChange }: PomodoroTimerProps) {
  const {
    timeRemaining,
    isRunning,
    timerType,
    completedPomodoros,
    totalFocusTime,
    startTimer,
    pauseTimer,
    resetTimer,
    switchToBreak,
    switchToWork,
  } = useTimer();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTimerSessionMutation = useMutation({
    mutationFn: async (data: { type: string; duration: number; completed: boolean }) => {
      const res = await apiRequest("POST", "/api/timer-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timer-sessions"] });
    },
  });

  useEffect(() => {
    onTimerTypeChange(timerType);
  }, [timerType, onTimerTypeChange]);

  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      // Timer completed
      const duration = timerType === "work" ? 1500 : 120; // 25 min or 2 min
      createTimerSessionMutation.mutate({
        type: timerType,
        duration,
        completed: true,
      });

      // Play audio notification
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUdBDSI0e7UfSsGH23A7t2ZRQM");
      audio.play().catch(() => {
        // Fallback if audio doesn't play
        console.log("Audio notification failed");
      });

      if (timerType === "work") {
        toast({
          title: "Pomodoro Complete!",
          description: "Time for a well-deserved break.",
        });
        switchToBreak();
      } else {
        toast({
          title: "Break Complete!",
          description: "Ready to get back to work?",
        });
        switchToWork();
      }
    }
  }, [timeRemaining, isRunning, timerType, createTimerSessionMutation, toast, switchToBreak, switchToWork]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const totalTime = timerType === "work" ? 1500 : 120; // 25 min or 2 min
    return ((totalTime - timeRemaining) / totalTime) * 283; // 283 is circumference
  };

  const getTimerColor = () => {
    return timerType === "work" ? "#F59E0B" : "#EC4899";
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-center">
            <Clock className="mr-2 text-accent" />
            Pomodoro Timer
          </h3>

          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getTimerColor()}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - getProgress()}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-slate-500 font-medium uppercase">
                  {timerType}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 mb-4">
            <Button
              onClick={startTimer}
              disabled={isRunning}
              className="p-3 rounded-full"
              size="sm"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              onClick={pauseTimer}
              disabled={!isRunning}
              variant="secondary"
              className="p-3 rounded-full"
              size="sm"
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="p-3 rounded-full"
              size="sm"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-slate-800">{completedPomodoros}</div>
              <div className="text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-800">
                {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
              </div>
              <div className="text-slate-500">Focus Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
