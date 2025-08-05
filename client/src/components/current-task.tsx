import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, CheckCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Todo } from "@shared/schema";

interface CurrentTaskProps {
  currentTask: Todo | null;
  onTaskSet: (task: Todo | null) => void;
}

export default function CurrentTask({ currentTask, onTaskSet }: CurrentTaskProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, status, completed }: { id: string; status: string; completed?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/todos/${id}`, { 
        status, 
        completed: completed !== undefined ? completed : status === "completed" 
      });
      return res.json();
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      if (updatedTask.status === "working") {
        onTaskSet(updatedTask);
      } else {
        onTaskSet(null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      updateTodoMutation.mutate({
        id: taskId,
        status: "working",
        completed: false,
      });
    }
  };

  const handleCompleteTask = () => {
    if (currentTask) {
      updateTodoMutation.mutate({
        id: currentTask.id,
        status: "completed",
        completed: true,
      });
    }
  };

  const handlePauseTask = () => {
    if (currentTask) {
      updateTodoMutation.mutate({
        id: currentTask.id,
        status: "todo",
        completed: false,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-green-600";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <Clock className="mr-2 text-accent" />
        Current Task
      </h3>

        <div
          className={`min-h-[120px] border-2 border-dashed rounded-lg p-4 transition-colors ${
            isDragOver 
              ? "border-accent bg-amber-50" 
              : currentTask 
                ? "border-amber-200 bg-amber-50" 
                : "border-slate-300 bg-slate-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {currentTask ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-800 text-lg mb-2">
                  {currentTask.title}
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span className={`capitalize font-medium ${getPriorityColor(currentTask.priority)}`}>
                    {currentTask.priority} Priority
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-slate-600">Working on it</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleCompleteTask}
                  disabled={updateTodoMutation.isPending}
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
                <Button
                  onClick={handlePauseTask}
                  disabled={updateTodoMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <Play className="h-8 w-8 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium mb-1">No task selected</p>
              <p className="text-xs">Drag a task here to start working on it</p>
            </div>
          )}
        </div>
    </div>
  );
}