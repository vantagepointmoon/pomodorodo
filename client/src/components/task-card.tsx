import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Undo, Pause, OctagonMinus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Todo } from "@shared/schema";

interface TaskCardProps {
  task: Todo;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateTodoMutation = useMutation({
    mutationFn: async (updates: Partial<Todo>) => {
      const res = await apiRequest("PATCH", `/api/todos/${task.id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/todos/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleToggleComplete = () => {
    updateTodoMutation.mutate({
      completed: !task.completed,
      status: !task.completed ? "completed" : "todo",
    });
  };

  const handleToggleCurrent = () => {
    updateTodoMutation.mutate({
      isCurrent: !task.isCurrent,
    });
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTodoMutation.mutate({ title: editTitle.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleUndo = () => {
    updateTodoMutation.mutate({
      completed: false,
      status: "todo",
    });
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

  const getBorderColor = () => {
    switch (task.status) {
      case "working":
        return "border-amber-200";
      case "completed":
        return "border-emerald-200";
      default:
        return "border-slate-200";
    }
  };

  return (
    <Card
      className={`cursor-move hover:shadow-md transition-all ${getBorderColor()} ${
        task.completed ? "opacity-75" : ""
      }`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          {/* Current task checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={task.isCurrent}
              onCheckedChange={handleToggleCurrent}
              className="flex-shrink-0"
              disabled={updateTodoMutation.isPending}
            />
            <span className="text-xs text-slate-500">Current</span>
          </div>
          
          {task.status === "working" && (
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
          )}
          {task.status !== "working" && (
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="flex-shrink-0"
            />
          )}
          
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
                className="h-6 text-sm"
              />
            ) : (
              <span
                className={`text-slate-700 ${task.completed ? "line-through text-slate-500" : ""}`}
              >
                {task.title}
              </span>
            )}
          </div>
          
          <div className="flex space-x-1">
            {task.status === "working" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateTodoMutation.mutate({ status: "todo" })}
                >
                  <Pause className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateTodoMutation.mutate({ status: "completed", completed: true })}
                >
                  <OctagonMinus className="h-3 w-3" />
                </Button>
              </>
            )}
            {task.status === "completed" && (
              <Button variant="ghost" size="sm" onClick={handleUndo}>
                <Undo className="h-3 w-3" />
              </Button>
            )}
            {task.status !== "working" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTodoMutation.mutate()}
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span className={`capitalize ${getPriorityColor(task.priority)}`}>
            {task.priority} Priority
          </span>
          <span>
            {task.status === "working" && task.timeSpent > 0
              ? `${Math.floor(task.timeSpent / 60)} min`
              : formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Card>
  );
}
