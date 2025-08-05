import { useQuery } from "@tanstack/react-query";

export interface WorkoutRoutine {
  name: string;
  exercises: string[];
}

export interface Exercise {
  name: string;
  description: string;
  duration: number;
}

export function useExercise() {
  return useQuery<Exercise>({
    queryKey: ["/api/exercises"],
    staleTime: 5 * 60 * 1000, // Exercise stays fresh for 5 minutes
  });
}

// Legacy support - now returns database exercise as a routine format
export const workoutRoutines: WorkoutRoutine[] = [];
