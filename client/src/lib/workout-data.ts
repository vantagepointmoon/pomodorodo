export interface WorkoutRoutine {
  name: string;
  exercises: string[];
}

export const workoutRoutines: WorkoutRoutine[] = [
  {
    name: "Desk Stretches",
    exercises: [
      "Neck rolls (5 each direction)",
      "Shoulder shrugs (10 reps)",
      "Seated spinal twist (5 each side)",
      "Ankle circles (10 each direction)"
    ]
  },
  {
    name: "Quick Energizer",
    exercises: [
      "Jumping jacks (30 seconds)",
      "Push-ups (10 reps)",
      "High knees (30 seconds)",
      "Deep breathing (10 breaths)"
    ]
  },
  {
    name: "Eye Rest & Stretch",
    exercises: [
      "Look away from screen (20-20-20 rule)",
      "Eye circles (5 each direction)",
      "Shoulder blade squeezes (10 reps)",
      "Wrist stretches (30 seconds each)"
    ]
  },
  {
    name: "Core Activation",
    exercises: [
      "Standing desk plank (30 seconds)",
      "Wall push-ups (15 reps)",
      "Calf raises (20 reps)",
      "Standing hip circles (10 each direction)"
    ]
  },
  {
    name: "Posture Reset",
    exercises: [
      "Cat-cow stretches (10 reps)",
      "Chest doorway stretch (30 seconds)",
      "Hip flexor stretch (30 seconds each)",
      "Upper trap stretch (30 seconds each)"
    ]
  }
];
