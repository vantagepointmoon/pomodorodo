import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Inbox, PlayCircle, CheckCircle } from "lucide-react";
import TaskCard from "./task-card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Todo } from "@shared/schema";

interface TaskSectionProps {
  title: string;
  icon: "inbox" | "play-circle" | "check-circle";
  tasks: Todo[];
  dropZone: string;
  bgColor: "slate" | "amber" | "emerald";
}

export default function TaskSection({ title, icon, tasks, dropZone, bgColor }: TaskSectionProps) {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const dragOverClass = bgColor === "slate" ? "bg-blue-50 border-blue-300" : 
                         bgColor === "amber" ? "bg-amber-100 border-amber-400" : 
                         "bg-emerald-100 border-emerald-400";
    e.currentTarget.className += ` ${dragOverClass}`;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const dragOverClasses = ["bg-blue-50", "border-blue-300", "bg-amber-100", "border-amber-400", "bg-emerald-100", "border-emerald-400"];
    const currentClasses = e.currentTarget.className.split(" ");
    e.currentTarget.className = currentClasses.filter(cls => !dragOverClasses.includes(cls)).join(" ");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragOverClasses = ["bg-blue-50", "border-blue-300", "bg-amber-100", "border-amber-400", "bg-emerald-100", "border-emerald-400"];
    const currentClasses = e.currentTarget.className.split(" ");
    e.currentTarget.className = currentClasses.filter(cls => !dragOverClasses.includes(cls)).join(" ");
    
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      updateTodoMutation.mutate({
        id: taskId,
        status: dropZone,
        completed: dropZone === "completed",
      });
    }
  };

  const IconComponent = {
    inbox: Inbox,
    "play-circle": PlayCircle,
    "check-circle": CheckCircle,
  }[icon];

  const getBgClass = () => {
    switch (bgColor) {
      case "amber":
        return "bg-amber-50 border-amber-200";
      case "emerald":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getIconColor = () => {
    switch (bgColor) {
      case "amber":
        return "text-accent";
      case "emerald":
        return "text-secondary";
      default:
        return "text-slate-500";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800 flex items-center">
        <IconComponent className={`mr-2 h-5 w-5 ${getIconColor()}`} />
        {title}
      </h2>
      <div
        className={`space-y-3 min-h-[200px] p-4 rounded-xl border-2 border-dashed transition-colors ${getBgClass()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No {title.toLowerCase()} tasks
          </div>
        )}
      </div>
    </div>
  );
}
