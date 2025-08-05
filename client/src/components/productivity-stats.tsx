import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Todo } from "@shared/schema";

interface ProductivityStatsProps {
  todos: Todo[];
}

export default function ProductivityStats({ todos }: ProductivityStatsProps) {
  const completedToday = todos.filter(todo => 
    todo.completed && 
    new Date(todo.completedAt || "").toDateString() === new Date().toDateString()
  ).length;

  const totalToday = todos.filter(todo => 
    new Date(todo.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const activeTasks = todos.filter(todo => !todo.completed).length;
  const completedTasks = todos.filter(todo => todo.completed).length;

  // Calculate stats based on actual data
  const stats = {
    tasksCompleted: completedToday,
    totalTasks: totalToday || 0,
    focusSessions: 0, // Will be updated when timer sessions are tracked
    totalSessions: 0,
    weeklyProgress: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
    streak: 0, // Will be calculated based on consecutive completion days
  };

  const taskProgress = stats.totalTasks > 0 ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0;
  const sessionProgress = stats.totalSessions > 0 ? (stats.focusSessions / stats.totalSessions) * 100 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
          <TrendingUp className="mr-2 text-secondary" />
          Today's Progress
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Tasks Completed</span>
            <div className="flex items-center space-x-2">
              <Progress value={taskProgress} className="w-24" />
              <span className="text-sm font-medium text-slate-800">
                {stats.tasksCompleted}/{stats.totalTasks}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">Focus Sessions</span>
            <div className="flex items-center space-x-2">
              <Progress value={sessionProgress} className="w-24" />
              <span className="text-sm font-medium text-slate-800">
                {stats.focusSessions}/{stats.totalSessions}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600">Weekly Goal</span>
            <div className="flex items-center space-x-2">
              <Progress value={stats.weeklyProgress} className="w-24" />
              <span className="text-sm font-medium text-slate-800">
                {stats.weeklyProgress}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Streak</span>
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-slate-800">
                {stats.streak} days
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
