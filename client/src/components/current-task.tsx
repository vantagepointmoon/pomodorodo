import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Todo } from "@shared/schema";

interface CurrentTaskProps {
  currentTask: Todo | null;
  onTaskSet: (task: Todo | null) => void;
}

export default function CurrentTask({ currentTask, onTaskSet }: CurrentTaskProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, completed, isCurrent }: { id: string; completed?: boolean; isCurrent?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/todos/${id}`, { 
        completed,
        isCurrent,
        status: completed ? "completed" : "todo"
      });
      return res.json();
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      if (!updatedTask.isCurrent) {
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

  const handleCompleteTask = () => {
    if (currentTask) {
      updateTodoMutation.mutate({
        id: currentTask.id,
        completed: true,
        isCurrent: false,
      });
    }
  };

  const handleRemoveFromCurrent = () => {
    if (currentTask) {
      updateTodoMutation.mutate({
        id: currentTask.id,
        isCurrent: false,
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
          className={`min-h-[120px] border-2 rounded-lg p-4 transition-colors ${
            currentTask 
              ? "border-amber-200 bg-amber-50" 
              : "border-slate-300 bg-slate-50"
          }`}
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
                  onClick={handleRemoveFromCurrent}
                  disabled={updateTodoMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <Clock className="h-8 w-8 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium mb-1">No current task</p>
              <p className="text-xs">Check the "Current" box on any task to focus on it</p>
            </div>
          )}
        </div>
    </div>
  );
}