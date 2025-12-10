"use client";

import { Order, StatusServiceOrder } from "@/types/serviceorders";
import { useEffect, useState } from "react";
import "@/styles/users.css";
import "@/styles/orders.css";
import "@/styles/transaction.css";
import "@/styles/order-components.css";
import { Mail, Phone } from "lucide-react";
import { Card } from "../ui/card";

// Import new modular components
import { OrderHeader } from "../orders/OrderHeader";
import { OrderInfo } from "../orders/OrderInfo";
import { TasksSection } from "../orders/TasksSection";
import { WarehousePartsSection } from "../orders/WarehousePartsSection";
import { TaskCommentsDialog } from "../orders/TaskCommentsDialog";

// Import custom hooks
import { useOrderParts } from "@/hooks/useOrderParts";
import { useTaskComments } from "@/hooks/useTaskComments";

interface OrderDetailViewProps {
  dataServiceOrder?: Order | null;
  session?: any;
}

const STATUS_MAP: Record<
  StatusServiceOrder,
  { label: string; className: string }
> = {
  NEW: { label: "New", className: "status-new" },
  IN_PROGRESS: { label: "In Progress", className: "status-inprogress" },
  WAITING_FOR_PARTS: {
    label: "Waiting for Parts",
    className: "grafic-waiting_for_parts",
  },
  READY: { label: "Ready", className: "grafic-ready" },
  COMPLETED: { label: "Completed", className: "grafic-completed" },
  CANCELLED: { label: "Cancelled", className: "grafic-cancelled" },
};

const statusMap: Record<StatusServiceOrder, string> = {
  NEW: "grafic-new",
  IN_PROGRESS: "grafic-inprogress",
  WAITING_FOR_PARTS: "grafic-waiting_for_parts",
  READY: "grafic-ready",
  COMPLETED: "grafic-completed",
  CANCELLED: "grafic-cancelled",
};

export function OrderDetailView({
  dataServiceOrder,
  session,
}: OrderDetailViewProps) {
  const [serviceOrder, setServiceOrder] = useState<Order | null>(
    dataServiceOrder ?? null
  );
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Use custom hooks for parts and comments
  const partsHook = useOrderParts(serviceOrder);
  const commentsHook = useTaskComments(serviceOrder);

  const isTerminalStatus = (s?: string) =>
    s === "COMPLETED" || s === "CANCELLED";

  // Fetch parts when order changes
  useEffect(() => {
    partsHook.fetchOrderParts();
  }, [serviceOrder?.id]);

  const handleEdit = () => {
    setShowEditOrder(true);
  };

  const handleStatusChange = () => {
    setShowStatusDialog(true);
  };

  // Task management (simplified - can be extracted to another hook)
  const openAddTask = () => {
    // TODO: Implement add task
    console.log("Add task");
  };

  const openEditTask = (task: any) => {
    // TODO: Implement edit task
    console.log("Edit task", task);
  };

  const openDeleteConfirm = (task: any) => {
    // TODO: Implement delete task
    console.log("Delete task", task);
  };

  return (
    <div className="users-page">
      <OrderHeader
        serviceOrder={serviceOrder}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        isTerminalStatus={isTerminalStatus}
        STATUS_MAP={STATUS_MAP}
      />

      <OrderInfo serviceOrder={serviceOrder} toNumber={partsHook.toNumber} />

      <div className="order-stats-grid">
        <Card className="stats-card order-card_id_2">
          <div className="stats-card-inner">
            <div>
              <p className="stats-value_order order_desc">Issue Description</p>
              <p className="stats-label_order">{serviceOrder?.description}</p>
            </div>
          </div>
        </Card>
        <Card className="stats-card order-card_id_2">
          <div className="stats-card-inner">
            <div>
              <p className="stats-value_order order_desc">Mechanic Contact</p>
              <p className="stats-label_order mech_phone">
                <Phone className="icon-mech" />
                {serviceOrder?.mechanicPhone}
              </p>
              <p className="stats-label_order">
                <Mail className="icon-mech" />
                {serviceOrder?.mechanicEmail}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <TasksSection
        serviceOrder={serviceOrder}
        session={session}
        isTerminalStatus={isTerminalStatus}
        statusMap={statusMap}
        onAddTask={openAddTask}
        onEditTask={openEditTask}
        onDeleteTask={openDeleteConfirm}
        onOpenComments={commentsHook.openTaskComments}
      />

      <WarehousePartsSection
        serviceOrder={serviceOrder}
        session={session}
        orderParts={partsHook.orderParts}
        loadingParts={partsHook.loadingParts}
        isSubmitting={partsHook.isSubmitting}
        isTerminalStatus={isTerminalStatus}
        toNumber={partsHook.toNumber}
        onAddPart={() => partsHook.setShowAddPart(true)}
        onToggleDeduct={(partId, currentValue) =>
          partsHook.handleToggleDeduct(partId, currentValue, setServiceOrder)
        }
        onDeletePart={(partId) =>
          partsHook.handleDeletePart(partId, setServiceOrder)
        }
        onDeductFromWarehouse={partsHook.handleDeductPartsFromWarehouse}
      />

      <TaskCommentsDialog
        show={commentsHook.showTaskComments}
        onClose={() => {
          commentsHook.setShowTaskComments(false);
          commentsHook.setSelectedTask(null);
          commentsHook.setTaskComments([]);
          commentsHook.setNewComment("");
          commentsHook.setCommentTitle("");
          commentsHook.setUploadedFiles([]);
        }}
        selectedTask={commentsHook.selectedTask}
        session={session}
        taskComments={commentsHook.taskComments}
        loadingComments={commentsHook.loadingComments}
        newComment={commentsHook.newComment}
        setNewComment={commentsHook.setNewComment}
        commentTitle={commentsHook.commentTitle}
        setCommentTitle={commentsHook.setCommentTitle}
        uploadedFiles={commentsHook.uploadedFiles}
        uploadingFile={commentsHook.uploadingFile}
        isSubmitting={commentsHook.isSubmitting}
        onFileUpload={commentsHook.handleFileUpload}
        onRemoveFile={commentsHook.removeUploadedFile}
        onAddComment={commentsHook.handleAddComment}
      />

      {/* TODO: Add dialogs for Edit Order, Status Change, Add Part, etc. */}
    </div>
  );
}
