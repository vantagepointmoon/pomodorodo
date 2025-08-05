import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Dumbbell, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useExercise, type Exercise } from "@/lib/workout-data";

interface MotivationalContentProps {
  timerType: "work" | "break";
  isRunning?: boolean;
}

interface Quote {
  content: string;
  author: string;
}

export default function MotivationalContent({ timerType, isRunning = false }: MotivationalContentProps) {
  const queryClient = useQueryClient();

  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ["/api/quotes"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: exercise, isLoading: exerciseLoading } = useExercise();

  const refreshQuoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/quotes");
      return res.json();
    },
    onSuccess: (newQuote) => {
      queryClient.setQueryData(["/api/quotes"], newQuote);
    },
  });

  const refreshExerciseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/exercises");
      return res.json();
    },
    onSuccess: (newExercise) => {
      queryClient.setQueryData(["/api/exercises"], newExercise);
    },
  });

  // Show workout routine by default (when timer is not running)
  // Show inspirational quotes when timer is running
  const shouldShowQuote = isRunning;
  const shouldShowWorkout = !shouldShowQuote;

  if (shouldShowQuote) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center justify-center">
              <Quote className="mr-2 text-primary" />
              Daily Motivation
            </h4>

            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200"
                alt="Serene mountain landscape with clouds"
                className="w-full h-32 object-cover"
              />
            </div>

            {isLoading ? (
              <div className="text-slate-500">Loading quote...</div>
            ) : quote ? (
              <>
                <blockquote className="text-slate-600 italic mb-3">
                  "{quote.content}"
                </blockquote>
                <cite className="text-sm text-slate-500 font-medium">
                  — {quote.author}
                </cite>
              </>
            ) : (
              <>
                <blockquote className="text-slate-600 italic mb-3">
                  "The way to get started is to quit talking and begin doing."
                </blockquote>
                <cite className="text-sm text-slate-500 font-medium">
                  — Walt Disney
                </cite>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => refreshQuoteMutation.mutate()}
              disabled={refreshQuoteMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshQuoteMutation.isPending ? "animate-spin" : ""}`} />
              New Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show workout routine (default state or during break)
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center justify-center">
            <Dumbbell className="mr-2 text-break" />
            {isRunning && timerType === "break" ? "Break Time Workout" : "Quick Exercise Break"}
          </h4>

          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200"
              alt="Person doing desk stretches"
              className="w-full h-32 object-cover"
            />
          </div>

          {exerciseLoading ? (
            <div className="text-slate-500">Loading exercise...</div>
          ) : exercise ? (
            <div className="space-y-3 text-left">
              <div className="p-3 bg-slate-50 rounded-lg">
                <h5 className="font-semibold text-slate-800 mb-2">{exercise.name}</h5>
                <p className="text-slate-600 mb-2">{exercise.description}</p>
                <div className="flex items-center text-sm text-slate-500">
                  <div className="w-3 h-3 bg-break rounded-full mr-2" />
                  Duration: {exercise.duration} seconds
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-left">
              <div className="p-3 bg-slate-50 rounded-lg">
                <h5 className="font-semibold text-slate-800 mb-2">Deep Breathing</h5>
                <p className="text-slate-600 mb-2">Take 10 deep breaths to refresh your mind</p>
                <div className="flex items-center text-sm text-slate-500">
                  <div className="w-3 h-3 bg-break rounded-full mr-2" />
                  Duration: 60 seconds
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-break text-break hover:bg-break hover:text-white"
            onClick={() => refreshExerciseMutation.mutate()}
            disabled={refreshExerciseMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshExerciseMutation.isPending ? "animate-spin" : ""}`} />
            New Exercise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
