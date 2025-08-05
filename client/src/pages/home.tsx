import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import TaskInput from "@/components/task-input";
import TaskSection from "@/components/task-section";
import PomodoroTimer from "@/components/pomodoro-timer";
import MotivationalContent from "@/components/motivational-content";
import ProductivityStats from "@/components/productivity-stats";
import CurrentTask from "@/components/current-task";
import { Check, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Todo } from "@shared/schema";

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [timerType, setTimerType] = useState<"work" | "break">("work");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState<Todo | null>(null);

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case "active":
        return !todo.completed;
      case "completed":
        return todo.completed;
      default:
        return true;
    }
  });

  const todoItems = filteredTodos.filter(todo => todo.status === "todo");
  const workingItems = filteredTodos.filter(todo => todo.status === "working");
  const completedItems = filteredTodos.filter(todo => todo.status === "completed");

  // Set current task from working items
  useEffect(() => {
    const workingTask = workingItems[0] || null;
    setCurrentTask(workingTask);
  }, [workingItems]);

  const stats = {
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-700">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Check className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800">Focus Flow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <UserCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Motivational Content */}
        <div className="mb-8">
          <MotivationalContent timerType={timerType} isRunning={isTimerRunning} />
        </div>

        {/* Current Task and Timer Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrentTask 
              currentTask={currentTask} 
              onTaskSet={setCurrentTask}
            />
            <PomodoroTimer 
              onTimerTypeChange={setTimerType} 
              onTimerStateChange={setIsTimerRunning}
              currentTask={currentTask}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Task Input */}
            <TaskInput />

            {/* Task Filters */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <Button
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All Tasks
                  </Button>
                  <Button
                    variant={filter === "active" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filter === "completed" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </Button>
                </div>
                <div className="text-sm text-slate-500">
                  {stats.active} active, {stats.completed} completed
                </div>
              </div>
            </Card>

            {/* Task Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskSection
                title="Todo"
                icon="inbox"
                tasks={todoItems}
                dropZone="todo"
                bgColor="slate"
              />
              <TaskSection
                title="Working On"
                icon="play-circle"
                tasks={workingItems}
                dropZone="working"
                bgColor="amber"
              />
              <TaskSection
                title="Completed"
                icon="check-circle"
                tasks={completedItems}
                dropZone="completed"
                bgColor="emerald"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ProductivityStats todos={todos} />
          </div>
        </div>
      </main>
    </div>
  );
}
