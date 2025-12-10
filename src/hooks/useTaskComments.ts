import { useState, useCallback } from "react";
import { Order } from "@/types/serviceorders";

export function useTaskComments(serviceOrder: Order | null) {
  const [showTaskComments, setShowTaskComments] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentTitle, setCommentTitle] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openTaskComments = useCallback((task: any) => {
    setSelectedTask(task);
    setShowTaskComments(true);
    setNewComment("");
    setCommentTitle("");
    setUploadedFiles([]);
    fetchTaskComments(task.id);
  }, []);

  const fetchTaskComments = useCallback(
    async (taskId: number) => {
      if (!serviceOrder?.id) return;
      setLoadingComments(true);
      try {
        const res = await fetch(
          `/api/orders/${serviceOrder.id}/tasks/${taskId}/comments`
        );
        if (!res.ok) throw new Error("Failed to fetch comments");
        const comments = await res.json();
        setTaskComments(comments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setTaskComments([]);
      } finally {
        setLoadingComments(false);
      }
    },
    [serviceOrder?.id]
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !selectedTask || !serviceOrder?.id) return;

      const file = e.target.files[0];
      if (!file) return;

      setUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `/api/orders/${serviceOrder.id}/tasks/${selectedTask.id}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

        const uploadedFile = await res.json();
        setUploadedFiles((prev) => [...prev, uploadedFile]);
        alert("File uploaded successfully!");
      } catch (err: any) {
        console.error("Error uploading file:", err);
        alert(`Failed to upload file: ${err.message}`);
      } finally {
        setUploadingFile(false);
        e.target.value = "";
      }
    },
    [selectedTask, serviceOrder?.id]
  );

  const removeUploadedFile = useCallback((fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleAddComment = useCallback(async () => {
    if (!selectedTask || !serviceOrder?.id || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/orders/${serviceOrder.id}/tasks/${selectedTask.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: newComment,
            title: commentTitle || null,
            documentIds: uploadedFiles.map((f) => f.id),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add comment");
      }

      const newCommentData = await res.json();
      setTaskComments((prev) => [newCommentData, ...prev]);
      setNewComment("");
      setCommentTitle("");
      setUploadedFiles([]);
      alert("Comment added successfully!");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      alert(`Failed to add comment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTask, serviceOrder?.id, newComment, commentTitle, uploadedFiles]);

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (!serviceOrder?.id || !selectedTask) return;

      if (!confirm("Are you sure you want to delete this comment?")) {
        return;
      }

      try {
        const res = await fetch(
          `/api/orders/${serviceOrder.id}/tasks/${selectedTask.id}/comments?commentId=${commentId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete comment");
        }

        setTaskComments((prev) => prev.filter((c) => c.id !== commentId));
        alert("Comment deleted successfully!");
      } catch (err: any) {
        console.error("Error deleting comment:", err);
        alert(`Failed to delete comment: ${err.message}`);
      }
    },
    [selectedTask, serviceOrder?.id]
  );

  return {
    showTaskComments,
    setShowTaskComments,
    selectedTask,
    setSelectedTask,
    taskComments,
    setTaskComments,
    loadingComments,
    newComment,
    setNewComment,
    commentTitle,
    setCommentTitle,
    uploadedFiles,
    setUploadedFiles,
    uploadingFile,
    isSubmitting,
    openTaskComments,
    fetchTaskComments,
    handleFileUpload,
    removeUploadedFile,
    handleAddComment,
    handleDeleteComment,
  };
}
