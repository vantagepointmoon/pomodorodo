import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useDragDrop() {
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

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    
    if (taskId) {
      updateTodoMutation.mutate({
        id: taskId,
        status: targetStatus,
        completed: targetStatus === "completed",
      });
    }
  }, [updateTodoMutation]);

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragPending: updateTodoMutation.isPending,
  };
}
