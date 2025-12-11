"use client";

import {
  Order,
  ServiceOrders,
  StatusServiceOrder,
} from "@/types/serviceorders";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useRef, useState, FormEvent } from "react";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Edit,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash,
  User,
} from "lucide-react";
import "@/styles/users.css";
import "@/styles/orders.css";
import "@/styles/transaction.css";
import "@/styles/order-detail.css";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, type ColumnDef } from "../ui/table";

interface OrderDetailViewProps {
  dataServiceOrder?: Order | null;
  session?: any;
}

export function OrderDetailView({
  dataServiceOrder,
  session,
}: OrderDetailViewProps) {
  const router = useRouter();
  const [serviceOrder, setServiceOrder] = useState<Order | null>(
    dataServiceOrder ?? null
  );
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Partial<Order>>({});

  const transformOrder = (apiOrder: any): Order => {
    return {
      id: apiOrder.id,
      orderNumber: apiOrder.order_number,
      carBrand: apiOrder.vehicle?.brand || serviceOrder?.carBrand || "",
      carModel: apiOrder.vehicle?.model || serviceOrder?.carModel || "",
      carYear:
        apiOrder.vehicle?.year?.toString() || serviceOrder?.carYear || "",
      carLicensePlate:
        apiOrder.vehicle?.license_plate || serviceOrder?.carLicensePlate || "",
      issue: apiOrder.issue || "",
      description: apiOrder.description || "",
      status: apiOrder.status,
      endDate: apiOrder.end_date || "",
      total_cost: parseFloat(apiOrder.total_cost?.toString() || "0"),
      progress: parseFloat(apiOrder.progress?.toString() || "0"),
      priority: apiOrder.priority || "NORMAL",
      mechanicFirstName:
        apiOrder.employees?.users?.first_name ||
        serviceOrder?.mechanicFirstName ||
        "",
      mechanicLastName:
        apiOrder.employees?.users?.last_name ||
        serviceOrder?.mechanicLastName ||
        "",
      mechanicEmail:
        apiOrder.employees?.users?.email || serviceOrder?.mechanicEmail || "",
      mechanicPhone:
        apiOrder.employees?.users?.phone || serviceOrder?.mechanicPhone || "",
      currentUserId:
        apiOrder.currentUserId ?? serviceOrder?.currentUserId ?? null,
      currentEmployeeId:
        apiOrder.currentEmployeeId ?? serviceOrder?.currentEmployeeId ?? null,
      task:
        apiOrder.service_task?.map((t: any) => ({
          id: t.id,
          mechanic_id: t.mechanic_id ?? t.mechanicId ?? null,
          mechanicId: t.mechanic_id ?? t.mechanicId ?? null,
          mechanicUserId:
            t.mechanicUserId || t.employees?.user_id || t.employees?.users?.id,
          mechanicFirstName: t.employees?.users?.first_name || "",
          mechanicLastName: t.employees?.users?.last_name || "",
          title: t.title,
          description: t.description,
          status: t.status,
          created_at: t.created_at,
          updated_at: t.updated_at,
          priority: t.priority,
        })) ||
        serviceOrder?.task ||
        [],
    };
  };

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskMechanicId, setTaskMechanicId] = useState<number | null>(null);
  const [taskPriority, setTaskPriority] = useState<string>("LOW");
  const [taskStatus, setTaskStatus] = useState<string>("NEW");
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemDescription, setItemDescription] = useState("");
  const [itemCost, setItemCost] = useState<number>(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("CARD");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [invoiceItems, setInvoiceItems] = useState<
    Array<{ id: string; description: string; cost: number }>
  >([]);
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const [orderParts, setOrderParts] = useState<any[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [includeInTotal, setIncludeInTotal] = useState<boolean>(false);
  const [partsSearchTerm, setPartsSearchTerm] = useState<string>("");
  const [loadingAvailableParts, setLoadingAvailableParts] = useState(false);

  const [showTaskComments, setShowTaskComments] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentTitle, setCommentTitle] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
  const [showTaskStatusDialog, setShowTaskStatusDialog] = useState(false);
  const [taskToChangeStatus, setTaskToChangeStatus] = useState<any | null>(
    null
  );

  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    return parseFloat(val.toString());
  };

  function resetForm() {
    setEditedOrder({});
  }

  useEffect(() => {
    if (!serviceOrder?.id) return;

    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const res = await fetch(`/api/orders/${serviceOrder.id}/items`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const items = await res.json();
        setInvoiceItems(
          items.map((item: any) => ({
            id: item.id,
            description: item.name,
            cost: parseFloat(item.cost.toString()),
          }))
        );
      } catch (err) {
        console.warn("Failed to fetch invoice items:", err);
        setInvoiceItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [serviceOrder?.id]);

  const fetchOrderParts = async () => {
    if (!serviceOrder?.id) return;
    setLoadingParts(true);
    try {
      const res = await fetch(`/api/orders/${serviceOrder.id}/parts`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const parts = await res.json();
      setOrderParts(parts);
    } catch (err) {
      console.warn("Failed to fetch order parts:", err);
      setOrderParts([]);
    } finally {
      setLoadingParts(false);
    }
  };

  useEffect(() => {
    fetchOrderParts();
  }, [serviceOrder?.id]);

  function openAddTask() {
    setTaskTitle("");
    setTaskDescription("");
    setTaskMechanicId(null);
    setTaskPriority("LOW");
    setTaskStatus("NEW");
    fetch("/api/mechanics?minimal=true")
      .then((r) => r.json())
      .then((data) => setMechanics(data || []))
      .catch((e) => console.error(e));
    setShowAddTask(true);
  }

  async function handleCreateTask(e: FormEvent) {
    e.preventDefault();
    if (!serviceOrder) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: taskTitle,
        description: taskDescription,
        mechanicId: taskMechanicId,
        priority: taskPriority,
        status: taskStatus,
      };

      let created: any = null;
      try {
        const res = await fetch(`/api/orders/${serviceOrder.id}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        created = await res.json();
      } catch (apiErr) {
        console.warn("Task API failed, falling back to local mock:", apiErr);
        const mechanic = mechanics.find((m) => m.id === taskMechanicId) || {};
        created = {
          id: Date.now(),
          mechanic_id: taskMechanicId,
          mechanicId: taskMechanicId,
          mechanicFirstName: mechanic.first_name || "",
          mechanicLastName: mechanic.last_name || "",
          title: taskTitle,
          description: taskDescription,
          status: taskStatus || "NEW",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          priority: taskPriority,
        } as any;
      }

      setServiceOrder((prev) =>
        prev ? { ...prev, task: [...(prev.task || []), created] } : prev
      );
      setShowAddTask(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditTask(task: any) {
    setEditingTask(task);
    setTaskTitle(task.title || "");
    setTaskDescription(task.description || "");
    setTaskMechanicId(task.mechanic_id ?? task.mechanicId ?? null);
    setTaskStatus(task.status || "NEW");
    setTaskPriority(task.priority || "LOW");
    fetch("/api/mechanics?minimal=true")
      .then((r) => r.json())
      .then((data) => {
        setMechanics(data || []);
        if (!task.mechanic_id && task.mechanicFirstName) {
          const found = (data || []).find(
            (m: any) =>
              `${m.first_name || ""}`.trim() ===
                `${task.mechanicFirstName || ""}`.trim() &&
              `${m.last_name || ""}`.trim() ===
                `${task.mechanicLastName || ""}`.trim()
          );
          if (found) setTaskMechanicId(found.id);
        }
      })
      .catch((e) => console.error(e));
    setShowEditTask(true);
  }

  async function handleUpdateTask(e: FormEvent) {
    e.preventDefault();
    if (!serviceOrder || !editingTask) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: taskTitle,
        description: taskDescription,
        mechanicId: taskMechanicId,
        priority: taskPriority,
        status: taskStatus,
      };

      let updated: any = null;
      try {
        const res = await fetch(
          `/api/orders/${serviceOrder.id}/tasks/${editingTask.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        updated = await res.json();
      } catch (apiErr) {
        console.warn(
          "Task update API failed, falling back to local update:",
          apiErr
        );
        const selectedMechanic =
          mechanics.find((m) => m.id === taskMechanicId) || {};
        updated = {
          ...editingTask,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          status: taskStatus,
          mechanic_id: taskMechanicId,
          mechanicId: taskMechanicId,
          mechanicUserId:
            selectedMechanic.user_id ?? editingTask.mechanicUserId,
          mechanicFirstName:
            selectedMechanic.first_name || editingTask.mechanicFirstName,
          mechanicLastName:
            selectedMechanic.last_name || editingTask.mechanicLastName,
        };
      }
      setServiceOrder((prev) => {
        if (!prev) return prev;
        const updatedTasks = (prev.task || []).map((t: any) =>
          t.id === editingTask.id ? updated : t
        );
        return { ...prev, task: updatedTasks };
      });

      setShowEditTask(false);
      setEditingTask(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDeleteConfirm(task: any) {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  }

  async function handleDeleteTask() {
    if (!serviceOrder || !taskToDelete) return;
    setIsSubmitting(true);
    try {
      try {
        const res = await fetch(
          `/api/orders/${serviceOrder.id}/tasks/${taskToDelete.id}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) throw new Error(`API returned ${res.status}`);
      } catch (apiErr) {
        console.warn("Task delete API failed, removing locally:", apiErr);
      }

      setServiceOrder((prev) => {
        if (!prev) return prev;
        const updated = (prev.task || []).filter(
          (t: any) => t.id !== taskToDelete.id
        );
        return { ...prev, task: updated };
      });

      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangeTaskStatus(newStatus: StatusServiceOrder) {
    if (!serviceOrder || !taskToChangeStatus) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/orders/${serviceOrder.id}/tasks/${taskToChangeStatus.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskToChangeStatus.title,
            description: taskToChangeStatus.description,
            mechanicId: taskToChangeStatus.mechanic_id,
            priority: taskToChangeStatus.priority,
            status: newStatus,
          }),
        }
      );
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const updated = await res.json();

      setServiceOrder((prev) => {
        if (!prev) return prev;
        const updatedTasks = (prev.task || []).map((t: any) =>
          t.id === taskToChangeStatus.id ? updated : t
        );
        return { ...prev, task: updatedTasks };
      });

      setShowTaskStatusDialog(false);
      setTaskToChangeStatus(null);
    } catch (err) {
      console.error("Failed to change task status:", err);
      alert("Failed to change task status");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit() {
    if (!serviceOrder) return;
    setEditedOrder({
      issue: serviceOrder.issue,
      description: serviceOrder.description,
      endDate: serviceOrder.endDate
        ? String(serviceOrder.endDate).split("T")[0]
        : "",
      total_cost: serviceOrder.total_cost,
      priority: serviceOrder.priority,
    });
    setShowEditOrder(true);
  }

  async function handleUpdateOrder(e: FormEvent) {
    e.preventDefault();
    if (!serviceOrder) return;
    setIsSubmitting(true);

    try {
      const payload = {
        issue: editedOrder.issue,
        description: editedOrder.description,
        endDate: editedOrder.endDate,
        total_cost: editedOrder.total_cost,
        priority: editedOrder.priority,
      };

      const res = await fetch(`/api/orders/${serviceOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update order");
      const updated: Order = await res.json();
      setServiceOrder(updated);
      setShowEditOrder(false);
      resetForm();
    } catch (err) {
      console.error("Failed to update order:", err);
      alert("Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBack = () => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const roleSegment = segments[0] || "client";
    router.push(`/${roleSegment}/orders`);
  };

  const STATUS_MAP: Record<
    StatusServiceOrder,
    { label: string; className: string }
  > = {
    NEW: { label: "New order", className: "status-new" },
    IN_PROGRESS: { label: "In progress", className: "status-in-progress" },
    WAITING_FOR_PARTS: {
      label: "Waiting for parts",
      className: "status-waiting",
    },
    READY: { label: "Ready for pickup", className: "status-ready" },
    COMPLETED: { label: "Completed", className: "status-completed" },
    CANCELLED: { label: "Cancelled", className: "status-cancelled" },
  };
  const taskRefs = useRef<HTMLDivElement[]>([]);
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!serviceOrder?.task) return;

    const heights: number[] = [];
    for (let i = 0; i < taskRefs.current.length - 1; i++) {
      const current = taskRefs.current[i];
      const next = taskRefs.current[i + 1];
      if (current && next) {
        const currentCircle = current.querySelector(".grafic_taks")!;
        const nextCircle = next.querySelector(".grafic_taks")!;
        const currentBottom = currentCircle.getBoundingClientRect().bottom;
        const nextTop = nextCircle.getBoundingClientRect().top;
        heights.push(nextTop - currentBottom - 20);
      }
    }
    setLineHeights(heights);
  }, [serviceOrder]);

  useEffect(() => {
    if (!serviceOrder) return;
    const tasks: any[] = serviceOrder.task || [];
    if (
      serviceOrder.status === "COMPLETED" ||
      serviceOrder.status === "CANCELLED"
    )
      return;

    let newStatus: string = "NEW";
    if (tasks.length === 0) {
      newStatus = "NEW";
    } else if (tasks.some((t) => t.status === "WAITING_FOR_PARTS")) {
      newStatus = "WAITING_FOR_PARTS";
    } else if (tasks.some((t) => t.status === "IN_PROGRESS")) {
      newStatus = "IN_PROGRESS";
    } else if (tasks.some((t) => t.status === "READY")) {
      newStatus = "READY";
    } else if (tasks.every((t) => t.status === "COMPLETED")) {
      newStatus = "COMPLETED";
    } else {
      newStatus = "IN_PROGRESS";
    }

    if (newStatus !== serviceOrder.status) {
      setServiceOrder((prev) =>
        prev ? { ...prev, status: newStatus as any } : prev
      );
      (async () => {
        try {
          const res = await fetch(`/api/orders/${serviceOrder.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
          if (!res.ok) {
            console.warn("Failed to persist computed order status");
          }
        } catch (err) {
          console.warn("Failed to persist computed order status", err);
        }
      })();
    }
  }, [serviceOrder?.task]);

  const isTerminalStatus = (s?: string) =>
    s === "COMPLETED" || s === "CANCELLED";

  async function handleSetOrderStatus(newStatus: "COMPLETED" | "CANCELLED") {
    if (!serviceOrder) return;
    setIsSubmitting(true);
    try {
      setServiceOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));

      const res = await fetch(`/api/orders/${serviceOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update order status");
      }
      const updated: Order = await res.json();
      setServiceOrder(updated);
      setShowStatusDialog(false);

      if (newStatus === "COMPLETED") {
        await fetchOrderParts();
      }

      if (isTerminalStatus(newStatus)) {
        setShowAddTask(false);
        setShowEditOrder(false);
        setShowEditTask(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to change order status");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!serviceOrder || itemCost <= 0 || !itemDescription.trim()) return;
    setIsSubmitting(true);

    try {
      console.log("Sending request to add item:", {
        orderId: serviceOrder.id,
        name: itemDescription,
        type: "service",
        cost: itemCost,
      });

      const res = await fetch(`/api/orders/${serviceOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemDescription,
          type: "service",
          cost: itemCost,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `API error: ${res.status}`);
        } catch {
          throw new Error(`Failed to add item: ${res.status} ${errorText}`);
        }
      }

      const response = await res.json();

      if (!response.item) {
        throw new Error("Invalid response structure from API");
      }

      const newItem = {
        id: response.item.id.toString(),
        description: response.item.name,
        cost: parseFloat(response.item.cost.toString()),
      };

      setInvoiceItems((prev) => [...prev, newItem]);

      setShowAddItem(false);
      setItemDescription("");
      setItemCost(0);
    } catch (err: any) {
      console.error("Error in handleAddItem:", err);
      alert(`Failed to add item: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleProcessPayment(e: FormEvent) {
    e.preventDefault();
    if (!serviceOrder) return;
    setShowPaymentProcessing(true);
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const paymentData = {
        paymentStatus: "PAID",
        paymentMethod: paymentMethod,
        paidAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/orders/${serviceOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!res.ok) throw new Error("Payment failed");
      const updated: Order = await res.json();
      setServiceOrder(updated);
      setShowPayment(false);
      setShowPaymentProcessing(false);
      setCardDetails({ cardNumber: "", expiryDate: "", cvv: "" });
      setPaymentMethod("CARD");
      setInvoiceItems([]);
      alert(`Payment successful via ${paymentMethod}!`);
    } catch (err) {
      console.error(err);
      setShowPaymentProcessing(false);
      alert("Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSearchParts() {
    if (!partsSearchTerm.trim()) {
      setAvailableParts([]);
      return;
    }

    setLoadingAvailableParts(true);
    try {
      const res = await fetch(
        `/api/warehouse/parts?search=${encodeURIComponent(
          partsSearchTerm
        )}&limit=50`
      );
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const parts = await res.json();
      setAvailableParts(parts);
    } catch (err) {
      console.error("Failed to search parts:", err);
      alert("Failed to search warehouse parts");
    } finally {
      setLoadingAvailableParts(false);
    }
  }

  async function handleAddPart(e: FormEvent) {
    e.preventDefault();
    if (!serviceOrder || !selectedPart || partQuantity <= 0) return;
    setIsSubmitting(true);

    try {
      const priceAtTime = toNumber(selectedPart.price) * partQuantity;
      const res = await fetch(`/api/orders/${serviceOrder.id}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId: selectedPart.id,
          quantity: partQuantity,
          priceAtTime: priceAtTime,
          deductFromWarehouse: includeInTotal,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add part");
      }

      const response = await res.json();
      console.log("Add part response:", response);
      console.log("Part data:", response.part);
      setServiceOrder(transformOrder(response.order));

      setOrderParts((prev) => [...prev, response.part]);

      setShowAddPart(false);
      setSelectedPart(null);
      setPartQuantity(1);
      setIncludeInTotal(false);
      setPartsSearchTerm("");
      setAvailableParts([]);
    } catch (err: any) {
      console.error("Error adding part:", err);
      alert(`Failed to add part: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeletePart(partId: string) {
    if (!serviceOrder) return;
    if (!confirm("Are you sure you want to remove this part?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/orders/${serviceOrder.id}/parts/${partId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete part");
      }

      const response = await res.json();
      setServiceOrder(transformOrder(response.order));
      setOrderParts((prev) => prev.filter((p) => p.id !== partId));
    } catch (err: any) {
      console.error("Error deleting part:", err);
      alert(`Failed to delete part: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleDeduct(partId: string, currentValue: boolean) {
    if (!serviceOrder) return;

    try {
      console.log(
        `Toggling part ${partId} from ${currentValue} to ${!currentValue}`
      );
      const res = await fetch(
        `/api/orders/${serviceOrder.id}/parts/${partId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deductFromWarehouse: !currentValue,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update part");
      }

      const response = await res.json();
      console.log(
        "Toggle response - Old order total:",
        serviceOrder.total_cost
      );
      console.log(
        "Toggle response - New order total:",
        response.order.total_cost
      );
      console.log("Full response:", response);

      setServiceOrder(transformOrder(response.order));
      setOrderParts((prev) =>
        prev.map((p) =>
          p.id === partId ? { ...p, deductFromWarehouse: !currentValue } : p
        )
      );
    } catch (err: any) {
      console.error("Error updating part:", err);
      alert(`Failed to update part: ${err.message}`);
    }
  }

  async function handleDeductPartsFromWarehouse() {
    if (!serviceOrder) return;
    if (!confirm("This will deduct all marked parts from warehouse. Continue?"))
      return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${serviceOrder.id}/deduct-parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deduct parts");
      }

      const result = await res.json();
      const deductedIds = result.deductedParts?.map((dp: any) => dp.id) || [];
      setOrderParts((prev) =>
        prev.map((p) =>
          deductedIds.includes(p.id)
            ? { ...p, warehouseDeductedAt: new Date().toISOString() }
            : p
        )
      );
      alert(result.message || "Parts deducted from warehouse successfully!");
    } catch (err: any) {
      console.error("Error deducting parts:", err);
      alert(`Failed to deduct parts: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openTaskComments(task: any) {
    setSelectedTask(task);
    setShowTaskComments(true);
    setNewComment("");
    setCommentTitle("");
    setUploadedFiles([]);
    fetchTaskComments(task.id);
  }

  async function fetchTaskComments(taskId: number) {
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
  }

  const isCommentOwner = (comment: any) => {
    const currentUserId = Number(session?.user?.id || 0);
    if (!currentUserId) return false;
    return (
      comment?.employees?.users?.id === currentUserId ||
      comment?.author?.id === currentUserId
    );
  };

  async function handleDeleteComment(commentId: number) {
    if (!serviceOrder?.id || !selectedTask) return;
    if (!confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;

    setDeletingCommentId(commentId);
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
      alert("Komentarz został usunięty");
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      alert(`Nie udało się usunąć komentarza: ${err.message}`);
    } finally {
      setDeletingCommentId(null);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
  }

  function removeUploadedFile(fileId: number) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  async function handleAddComment() {
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
  }

  const statusMap: Record<StatusServiceOrder, string> = {
    NEW: "grafic-new",
    IN_PROGRESS: "grafic-in_progress",
    WAITING_FOR_PARTS: "grafic-waiting_for_parts",
    READY: "grafic-ready",
    COMPLETED: "grafic-completed",
    CANCELLED: "grafic-cancelled",
  };

  return (
    <div className="customers-view">
      <div className="customers-header order-header-spacing">
        <Button onClick={handleBack} className="add-customer-btn-override">
          <ArrowLeft className="icon-sm" />
          <span>Back to Orders</span>
        </Button>
        <div className="left_order">
          <span
            role={isTerminalStatus(serviceOrder?.status) ? undefined : "button"}
            onClick={() => {
              if (serviceOrder && !isTerminalStatus(serviceOrder.status))
                setShowStatusDialog(true);
            }}
            className={`${
              STATUS_MAP[serviceOrder?.status || "NEW"].className
            } order-status-pill ${
              serviceOrder && !isTerminalStatus(serviceOrder?.status)
                ? "order-status-pill--clickable"
                : ""
            }`}
          >
            {STATUS_MAP[serviceOrder?.status || "NEW"].label}
          </span>

          <button
            onClick={() => {
              if (!isTerminalStatus(serviceOrder?.status)) handleEdit();
            }}
            className={`edit-button_order ${
              isTerminalStatus(serviceOrder?.status) ? "disabled" : ""
            }`}
            disabled={isTerminalStatus(serviceOrder?.status)}
          >
            <Edit className="icon-xxx" />
            <span>Edit Order</span>
          </button>
        </div>
      </div>
      <div className="customers-header">
        <div className="customers-header-text">
          <h1 className="customers-title">
            Order #{serviceOrder?.id}{" "}
            <span className="order-issue-tag">{serviceOrder?.issue}</span>
          </h1>
          <p className="customers-subtitle">
            {serviceOrder?.carBrand} {serviceOrder?.carModel} (
            {serviceOrder?.carYear}) {serviceOrder?.orderNumber}
          </p>
        </div>
        <div className="customers-header-text">
          <p className="customers-subtitle order-license-label">
            License plate
          </p>
          <p className="customers-subtitle order-license-value">
            {serviceOrder?.carLicensePlate}
          </p>
        </div>
      </div>
      <div className="parts-stats-grid ">
        <Card className="stats-card order-card_id">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <Clock className="icon-md" />
            </div>
            <div>
              <p className="stats-label_order">Estimated Completion</p>
              <p className="stats-value_order">
                {" "}
                {serviceOrder?.endDate
                  ? new Date(serviceOrder.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </div>
        </Card>
        <Card className="stats-card order-card_id">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <DollarSign className="icon-md" />
            </div>
            <div>
              <p className="stats-label_order">Total Cost</p>
              <p className="stats-value_order">
                {" "}
                ${toNumber(serviceOrder?.total_cost || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="stats-card order-card_id">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <User className="icon-md" />
            </div>
            <div>
              <p className="stats-label_order">Mechanic</p>
              <p className="stats-value_order">
                {" "}
                {serviceOrder?.mechanicFirstName}{" "}
                {serviceOrder?.mechanicLastName}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className="order-stats-grid ">
        <Card className="stats-card order-card_id_2">
          <div className="stats-card-inner">
            <div>
              <p className=" stats-value_order order_desc">Issue Description</p>
              <p className="stats-label_order"> {serviceOrder?.description}</p>
            </div>
          </div>
        </Card>
        <Card className="stats-card order-card_id_2">
          <div className="stats-card-inner">
            <div>
              <p className=" stats-value_order order_desc">Mechanic Contact</p>
              <p className="stats-label_order mech_phone">
                {" "}
                <Phone className="icon-mech"></Phone>
                {serviceOrder?.mechanicPhone}
              </p>
              <p className="stats-label_order">
                {" "}
                <Mail className="icon-mech"></Mail>
                {serviceOrder?.mechanicEmail}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-header order-section-header">
            <span>Order Status Timeline / Tasks</span>
            <div className="left_order">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isTerminalStatus(serviceOrder?.status)) openAddTask();
                }}
                className={`edit-button_order ${
                  isTerminalStatus(serviceOrder?.status) ? "disabled" : ""
                }`}
                disabled={isTerminalStatus(serviceOrder?.status)}
              >
                <Plus className="icon-xxx" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
          <Card className="customers-list">
            {(serviceOrder?.task || []).map((task, index) => {
              const statusClass =
                statusMap[task.status as StatusServiceOrder] ||
                "grafic-unknown";
              const isMechanic = session?.user?.role === "MECHANIC";
              const currentUserId =
                Number(session?.user?.id ?? serviceOrder?.currentUserId ?? 0) ||
                null;
              const currentEmployeeId =
                Number(serviceOrder?.currentEmployeeId ?? 0) || null;
              const taskAssignedUserId =
                task.mechanicUserId !== undefined &&
                task.mechanicUserId !== null
                  ? Number(task.mechanicUserId)
                  : null;
              const taskAssignedEmployeeId =
                task.mechanic_id !== undefined && task.mechanic_id !== null
                  ? Number(task.mechanic_id)
                  : task.mechanicId !== undefined && task.mechanicId !== null
                  ? Number(task.mechanicId)
                  : null;

              if (isMechanic) {
                const matchesByUser =
                  currentUserId !== null &&
                  taskAssignedUserId !== null &&
                  currentUserId === taskAssignedUserId;
                const matchesByEmployee =
                  currentEmployeeId !== null &&
                  taskAssignedEmployeeId !== null &&
                  currentEmployeeId === taskAssignedEmployeeId;

                if (!matchesByUser && !matchesByEmployee) {
                  return null;
                }
              }
              return (
                <div
                  key={task.id}
                  className="order-detail-row"
                  ref={(el) => {
                    taskRefs.current[index] = el!;
                  }}
                >
                  <div className="grafic">
                    <div className={`grafic_taks ${statusClass}`}></div>
                    {index !== (serviceOrder?.task?.length || 0) - 1 && (
                      <div
                        className="grafic_line"
                        style={{
                          height: lineHeights[index] || 20,
                        }}
                      ></div>
                    )}
                  </div>

                  <div className="customer-main">
                    <div className="customer-main-header">
                      <h3 className="customer-name">{task.title}</h3>
                    </div>

                    <div className="customer-meta">
                      <span className="customer-meta-item">
                        <strong>Created:</strong>{" "}
                        {new Date(task.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                        })}
                      </span>
                      <span className="customer-meta-item">
                        <strong>Updated:</strong>{" "}
                        {new Date(task.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="customer-meta">
                      <span className="customer-meta-item">
                        <strong className="order-task-description">
                          {task.description}
                        </strong>
                      </span>
                    </div>
                    <div className="customer-meta">
                      <span className="customer-meta-item">
                        <User className="icon-xxx"></User>
                        Assigned to: {task.mechanicFirstName}{" "}
                        {task.mechanicLastName}
                      </span>
                      <span className="customer-meta-item margin-right">
                        <strong>Priority:</strong> {task.priority}
                      </span>
                      <span className="customer-meta-item">
                        <strong>Status:</strong> {task.status}
                      </span>
                    </div>
                  </div>
                  {isTerminalStatus(serviceOrder?.status) ? null : (
                    <div className="customer-actions">
                      {(session?.user?.role === "ADMIN" ||
                        session?.user?.role === "MECHANIC") && (
                        <button
                          className="icon-btn icon-btn--edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskComments(task);
                          }}
                          title="View Comments"
                        >
                          <Mail className="icon-xxx" />
                        </button>
                      )}
                      {session?.user?.role === "ADMIN" && (
                        <button
                          className="icon-btn icon-btn--edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isTerminalStatus(serviceOrder?.status))
                              openEditTask(task);
                          }}
                          disabled={isTerminalStatus(serviceOrder?.status)}
                        >
                          <Pencil className="icon-xxx" />
                        </button>
                      )}

                      {session?.user?.role === "MECHANIC" && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToChangeStatus(task);
                            setShowTaskStatusDialog(true);
                          }}
                          className={`${
                            STATUS_MAP[task.status || "NEW"].className
                          } order-status-pill order-status-pill--clickable`}
                        >
                          {STATUS_MAP[task.status || "NEW"].label}
                        </span>
                      )}

                      <button
                        className="icon-btn icon-btn--edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isTerminalStatus(serviceOrder?.status))
                            openDeleteConfirm(task);
                        }}
                        disabled={isTerminalStatus(serviceOrder?.status)}
                      >
                        <Trash className="icon-xxx" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      </Card>
      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-header order-section-indent">
            <span>Warehouse Parts Used</span>
            {(session?.user?.role === "ADMIN" ||
              session?.user?.role === "MECHANIC") &&
              !isTerminalStatus(serviceOrder?.status) && (
                <div className="transaction-details-header">
                  <div className="transaction-actions">
                    <Button
                      onClick={() => setShowAddPart(true)}
                      className="edit-button_trans"
                    >
                      <Plus className="icon-xxx" />
                      <span>Add Part</span>
                    </Button>
                  </div>
                </div>
              )}
          </div>

          <div className="order-section-padding">
            {loadingParts ? (
              <div className="order-center-message">Loading parts...</div>
            ) : orderParts.length === 0 ? (
              <div className="order-center-message order-center-message-muted">
                No warehouse parts assigned yet
              </div>
            ) : (
              <>
                {console.log("Rendering parts:", orderParts)}
                <Table
                  data={orderParts}
                  columns={[
                    {
                      key: "name",
                      header: "Part Name",
                      render: (part: any) => part.part?.name || part.partId,
                    },
                    {
                      key: "part_number",
                      header: "Part Number",
                      render: (part: any) => part.part?.part_number || "-",
                    },
                    {
                      key: "quantity",
                      header: "Quantity",
                      render: (part: any) => toNumber(part.quantity),
                    },
                    {
                      key: "unit_price",
                      header: "Unit Price",
                      render: (part: any) => {
                        const price =
                          part.priceAtTime || part.price_at_time || 0;
                        const qty = part.quantity || 1;
                        return `$${(toNumber(price) / toNumber(qty)).toFixed(
                          2
                        )}`;
                      },
                    },
                    {
                      key: "total",
                      header: "Total",
                      render: (part: any) => {
                        const price =
                          part.priceAtTime || part.price_at_time || 0;
                        return `$${toNumber(price).toFixed(2)}`;
                      },
                      className: "transaction-amount",
                    },
                    {
                      key: "include_in_total",
                      header: "Include in Total",
                      render: (part: any) => (
                        <input
                          type="checkbox"
                          checked={part.deductFromWarehouse || false}
                          onChange={() =>
                            handleToggleDeduct(
                              part.id,
                              part.deductFromWarehouse
                            )
                          }
                          disabled={isTerminalStatus(serviceOrder?.status)}
                        />
                      ),
                    },
                    {
                      key: "deducted",
                      header: "Deducted",
                      render: (part: any) =>
                        part.warehouseDeductedAt ? "✓" : "-",
                    },
                    {
                      key: "action",
                      header: "Action",
                      render: (part: any) => (
                        <Button
                          onClick={() => handleDeletePart(part.id)}
                          className="edit-button_trans order-part-delete-btn"
                          disabled={
                            isTerminalStatus(serviceOrder?.status) ||
                            loadingParts
                          }
                        >
                          Delete
                        </Button>
                      ),
                    },
                  ]}
                  pageSize={10}
                  getRowKey={(part) => part.id}
                />

                <div className="order-parts-summary">
                  {session?.user?.role !== "MECHANIC" && (
                    <>
                      {" "}
                      <div className="order-parts-summary-row">
                        <span>Parts Total (All):</span>
                        <span>
                          $
                          {orderParts
                            .reduce((sum, part) => {
                              const price =
                                part.priceAtTime || part.price_at_time || 0;
                              return sum + toNumber(price);
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="order-parts-summary-row">
                        <span>Parts Included in Order Total:</span>
                        <span>
                          $
                          {orderParts
                            .filter((p) => p.deductFromWarehouse)
                            .reduce((sum, part) => {
                              const price =
                                part.priceAtTime || part.price_at_time || 0;
                              return sum + toNumber(price);
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {orderParts.some(
                    (p) => p.deductFromWarehouse && !p.warehouseDeductedAt
                  ) && (
                    <Button
                      onClick={handleDeductPartsFromWarehouse}
                      className="transaction-pay-now-btn order-deduct-btn"
                      disabled={
                        isTerminalStatus(serviceOrder?.status) ||
                        isSubmitting ||
                        !orderParts.some(
                          (p) => p.deductFromWarehouse && !p.warehouseDeductedAt
                        )
                      }
                    >
                      {isSubmitting ? "Processing..." : "Delete from Warehouse"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
      {session?.user?.role === "MECHANIC" && (
        <Card className="customers-list-card">
          <div className="customers-list-inner">
            <div className="customers-header order-section-indent">
              <span>Payment & Transaction Details</span>
              {(session?.user?.role === "ADMIN" ||
                session?.user?.role === "MECHANIC") && (
                <div className="transaction-details-header">
                  <div className="transaction-actions">
                    {session?.user?.role === "ADMIN" && (
                      <Button className="edit-button_trans">
                        Generate Invoice
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowAddItem(true)}
                      className="edit-button_trans"
                    >
                      <Plus className="icon-xxx" />
                      <span>Add Item</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {(session?.user?.role === "ADMIN" ||
              session?.user?.role === "MECHANIC") && (
              <div className="transaction-padding">
                <div className="transaction-table-wrapper">
                  <table className="transaction-table">
                    <tbody>
                      <tr>
                        <td>Service Order Total</td>
                        <td className="transaction-amount">
                          ${toNumber(serviceOrder?.total_cost).toFixed(2)}
                        </td>
                        <td>-</td>
                      </tr>

                      {invoiceItems.length > 0 ? (
                        invoiceItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.description}</td>
                            <td className="transaction-amount">
                              ${Number(item.cost || 0).toFixed(2)}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="transaction-delete-btn"
                                onClick={async () => {
                                  if (!serviceOrder) return;
                                  try {
                                    console.log("Deleting item:", item.id);

                                    const res = await fetch(
                                      `/api/orders/${serviceOrder.id}/items/${item.id}`,
                                      { method: "DELETE" }
                                    );

                                    if (!res.ok) {
                                      const errorText = await res.text();
                                      console.error(
                                        "Delete API Error:",
                                        errorText
                                      );
                                      throw new Error(
                                        `API returned ${res.status}`
                                      );
                                    }

                                    const response = await res.json();
                                    console.log("Delete response:", response);

                                    setInvoiceItems((prev) =>
                                      prev.filter((i) => i.id !== item.id)
                                    );

                                    console.log("Item deleted successfully");
                                  } catch (err) {
                                    console.error("Delete error:", err);
                                    alert("Failed to delete item");
                                  }
                                }}
                              >
                                <Trash className="icon-xxx" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="transaction-table-empty">
                            No additional items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="transaction-total">
                  <span>Total</span>
                  <span>
                    $
                    {(
                      toNumber(serviceOrder?.total_cost || 0) +
                      invoiceItems.reduce(
                        (sum, item) => sum + Number(item.cost || 0),
                        0
                      )
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {session?.user?.role === "CLIENT" && (
              <div className="transaction-padding">
                <div className="transaction-items-list">
                  <div className="transaction-item-row">
                    <span className="transaction-item-name">
                      Service Order Total
                    </span>
                    <div className="transaction-item-details">
                      <span className="transaction-item-amount">
                        ${toNumber(serviceOrder?.total_cost).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {invoiceItems.length > 0
                    ? invoiceItems.map((item) => (
                        <div key={item.id} className="transaction-item-row">
                          <span className="transaction-item-name">
                            {item.description}
                          </span>
                          <div className="transaction-item-details">
                            <span className="transaction-item-amount">
                              ${item.cost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    : null}
                </div>

                <div className="transaction-total">
                  <span>Total</span>
                  <span>
                    $
                    {(
                      toNumber(serviceOrder?.total_cost || 0) +
                      invoiceItems.reduce((sum, item) => sum + item.cost, 0)
                    ).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={() => setShowPayment(true)}
                  className="transaction-pay-now-btn"
                >
                  Pay Now
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Dialog
        open={showAddItem}
        onOpenChange={(open) => {
          setShowAddItem(open);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">Add Item</DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleAddItem}
          >
            <div className="dialog-form-grid">
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Item Description *</label>
                <Input
                  className="dialog-input"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g., Labor, Part replacement"
                  required
                />
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Item Cost *</label>
                <Input
                  className="dialog-input"
                  type="number"
                  value={itemCost}
                  onChange={(e) => setItemCost(Number(e.target.value))}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="dialog-actions">
              <Button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="dialog-btn dialog-btn--primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="dialog-btn dialog-btn--secondary"
              >
                Add Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Warehouse Part Dialog */}
      <Dialog
        open={showAddPart}
        onOpenChange={(open) => {
          setShowAddPart(open);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Add Warehouse Part
            </DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleAddPart}
          >
            {/* Search Parts */}
            <div className="dialog-form-field dialog-field--full">
              <label className="dialog-field-label">Search Part *</label>
              <div className="order-search-row">
                <Input
                  className="dialog-input order-search-input-grow"
                  value={partsSearchTerm}
                  onChange={(e) => setPartsSearchTerm(e.target.value)}
                  placeholder="Search by name or part number..."
                />
                <Button
                  type="button"
                  onClick={handleSearchParts}
                  className="dialog-btn dialog-btn--secondary"
                  disabled={loadingAvailableParts || !partsSearchTerm.trim()}
                >
                  Search
                </Button>
              </div>

              {availableParts.length > 0 && (
                <div className="order-search-dropdown">
                  {availableParts.map((part) => (
                    <div
                      key={part.id}
                      onClick={() => {
                        setSelectedPart(part);
                        setPartsSearchTerm(part.name);
                        setAvailableParts([]);
                      }}
                      className={`order-search-item ${
                        selectedPart?.id === part.id ? "active" : ""
                      }`}
                    >
                      <div className="order-search-item-title">{part.name}</div>
                      <div className="order-search-item-meta">
                        Part #: {part.part_number} | Stock: {part.quantity} |
                        Price: ${toNumber(part.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loadingAvailableParts && (
                <div className="order-search-hint">Searching...</div>
              )}
            </div>

            {selectedPart && (
              <div className="order-selected-part">
                <p className="order-selected-part-title">
                  <strong>{selectedPart.name}</strong>
                </p>
                <p className="order-selected-part-meta">
                  Part #: {selectedPart.part_number}
                </p>
                <p className="order-selected-part-meta">
                  Available: {selectedPart.quantity} units
                </p>
                <p className="order-selected-part-price">
                  Unit Price: ${toNumber(selectedPart.price).toFixed(2)}
                </p>
              </div>
            )}

            <div className="dialog-form-grid">
              <div className="dialog-form-field">
                <label className="dialog-field-label">Quantity *</label>
                <Input
                  className="dialog-input"
                  type="number"
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(Number(e.target.value))}
                  placeholder="1"
                  min="1"
                  required
                  disabled={!selectedPart}
                />
              </div>

              {selectedPart && (
                <div className="dialog-form-field">
                  <label className="dialog-field-label">Total Price</label>
                  <Input
                    className="dialog-input"
                    type="text"
                    value={`$${(
                      toNumber(selectedPart.price) * partQuantity
                    ).toFixed(2)}`}
                    disabled
                  />
                </div>
              )}

              <div className="dialog-form-field dialog-field--full order-dialog-checkbox">
                <label className="dialog-field-label order-dialog-checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeInTotal}
                    onChange={(e) => setIncludeInTotal(e.target.checked)}
                    disabled={!selectedPart}
                  />
                  <span>Include in Order Total Cost</span>
                </label>
              </div>
            </div>

            <div className="dialog-actions">
              <Button
                type="button"
                onClick={() => {
                  setShowAddPart(false);
                  setSelectedPart(null);
                  setPartQuantity(1);
                  setIncludeInTotal(false);
                  setPartsSearchTerm("");
                  setAvailableParts([]);
                }}
                className="dialog-btn dialog-btn--primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="dialog-btn dialog-btn--secondary"
                disabled={!selectedPart || partQuantity <= 0 || isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Part"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showPayment}
        onOpenChange={(open) => {
          setShowPayment(open);
        }}
      >
        <DialogContent className="dialog-content order-payment-dialog">
          <DialogHeader>
            <DialogTitle className="dialog-title">Complete Payment</DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleProcessPayment}
          >
            {/* Order Summary */}
            <div className="order-summary-card">
              <h4 className="order-summary-title">Order Summary</h4>
              <div className="order-summary-row">
                <span>Subtotal:</span>
                <span>
                  ${" "}
                  {(
                    toNumber(serviceOrder?.total_cost || 0) +
                    invoiceItems.reduce((sum, item) => sum + item.cost, 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="order-summary-row order-summary-row-divider">
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="order-summary-total">
                <span>Total Due:</span>
                <span>
                  ${" "}
                  {(
                    toNumber(serviceOrder?.total_cost || 0) +
                    invoiceItems.reduce((sum, item) => sum + item.cost, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="order-payment-grid">
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`order-pay-option ${
                  paymentMethod === "CARD" ? "active" : ""
                }`}
              >
                💳 Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("APPLE_PAY")}
                className={`order-pay-option ${
                  paymentMethod === "APPLE_PAY" ? "active" : ""
                }`}
              >
                🍎 Apple Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`order-pay-option ${
                  paymentMethod === "BANK_TRANSFER" ? "active" : ""
                }`}
              >
                🏦 Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("GOOGLE_PAY")}
                className={`order-pay-option ${
                  paymentMethod === "GOOGLE_PAY" ? "active" : ""
                }`}
              >
                🔵 Google Pay
              </button>
            </div>

            {paymentMethod === "CARD" && (
              <>
                <div className="dialog-form-field dialog-field--full">
                  <label className="dialog-field-label">
                    Cardholder Name *
                  </label>
                  <Input
                    className="dialog-input"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="dialog-form-field dialog-field--full">
                  <label className="dialog-field-label">Card Number *</label>
                  <Input
                    className="dialog-input"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="dialog-form-field">
                  <label className="dialog-field-label">Expiry Date *</label>
                  <Input
                    className="dialog-input"
                    value={cardDetails.expiryDate}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        expiryDate: e.target.value,
                      })
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="dialog-form-field">
                  <label className="dialog-field-label">CVV *</label>
                  <Input
                    className="dialog-input"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </>
            )}

            {paymentMethod === "BANK_TRANSFER" && (
              <>
                <div className="order-summary-card">
                  <p className="order-summary-title">
                    <strong>Bank Transfer Details:</strong>
                  </p>
                  <p className="order-summary-row">Account: 1234567890</p>
                  <p className="order-summary-row">Bank: Standard Bank</p>
                  <p className="order-summary-row order-summary-row-divider">
                    Reference: ORD-{serviceOrder?.id}
                  </p>
                </div>
                <p className="order-search-item-meta">
                  Please transfer the amount and confirm below once done.
                </p>
              </>
            )}

            {(paymentMethod === "APPLE_PAY" ||
              paymentMethod === "GOOGLE_PAY") && (
              <div className="order-summary-card">
                <p className="order-summary-title">
                  <strong>
                    Ready for{" "}
                    {paymentMethod === "APPLE_PAY" ? "Apple Pay" : "Google Pay"}
                  </strong>
                </p>
                <p className="order-search-item-meta">
                  Click 'Process Payment' to complete payment via{" "}
                  {paymentMethod === "APPLE_PAY" ? "Apple Pay" : "Google Pay"}.
                </p>
              </div>
            )}
            {showPaymentProcessing && (
              <div className="order-payment-processing">
                <p className="order-summary-title">Processing payment...</p>
                <div className="order-spinner" />
              </div>
            )}

            <div className="dialog-actions">
              <Button
                type="button"
                onClick={() => setShowPayment(false)}
                className="dialog-btn--primary"
                disabled={showPaymentProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="dialog-btn--secondary"
                disabled={showPaymentProcessing}
              >
                {showPaymentProcessing ? "Processing..." : "Process Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAddTask}
        onOpenChange={(open) => {
          setShowAddTask(open);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">Add Task</DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleCreateTask}
          >
            <div className="dialog-form-grid">
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Title *</label>
                <Input
                  className="dialog-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Description</label>
                <textarea
                  className="dialog-input task-textarea"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Mechanic *</label>
                <select
                  className="dialog-input"
                  value={taskMechanicId ?? ""}
                  onChange={(e) => setTaskMechanicId(Number(e.target.value))}
                  required
                >
                  <option value="">-- Select mechanic --</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Priority</label>
                <select
                  className="dialog-input"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="dialog-form-field">
                <label className="dialog-field-label">Status</label>
                <select
                  className="dialog-input"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="WAITING_FOR_PARTS">Waiting for parts</option>
                  <option value="READY">Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="dialog-actions">
              <Button
                type="submit"
                className="dialog-btn dialog-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Task"}
              </Button>
              <Button
                type="button"
                className="dialog-btn dialog-btn--secondary"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showEditTask}
        onOpenChange={(open) => {
          setShowEditTask(open);
          if (!open) setEditingTask(null);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">Edit Task</DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleUpdateTask}
          >
            <div className="dialog-form-grid">
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Title *</label>
                <Input
                  className="dialog-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Description</label>
                <textarea
                  className="dialog-input task-textarea"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
              <div className="dialog-form-field">
                <label className="dialog-field-label">Mechanic</label>
                <Input
                  className="dialog-input"
                  value={(mechanics.find((m) => m.id === taskMechanicId)
                    ? `${
                        mechanics.find((m) => m.id === taskMechanicId)
                          ?.first_name || ""
                      } ${
                        mechanics.find((m) => m.id === taskMechanicId)
                          ?.last_name || ""
                      }`
                    : `${editingTask?.mechanicFirstName || ""} ${
                        editingTask?.mechanicLastName || ""
                      }`
                  ).trim()}
                  disabled
                />
              </div>
              <div className="dialog-form-field">
                <label className="dialog-field-label">Priority</label>
                <select
                  className="dialog-input"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="dialog-form-field">
                <label className="dialog-field-label">Status</label>
                <select
                  className="dialog-input"
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="WAITING_FOR_PARTS">Waiting for parts</option>
                  <option value="READY">Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="dialog-actions">
              <Button
                type="submit"
                className="dialog-btn dialog-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                className="dialog-btn dialog-btn--secondary"
                onClick={() => {
                  setShowEditTask(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
          setShowDeleteConfirm(open);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">Delete Task</DialogTitle>
          </DialogHeader>
          <div className="dialog-body">
            <p>Are you sure you want to delete this task?</p>
            <div className="dialog-actions">
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={handleDeleteTask}
                disabled={isSubmitting}
              >
                Delete
              </Button>
              <Button
                className="dialog-btn dialog-btn--secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showEditOrder}
        onOpenChange={(open) => {
          setShowEditOrder(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Edit Service Order
            </DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleUpdateOrder}
          >
            <div className="dialog-form-grid">
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">
                  Issue Description *
                </label>
                <Input
                  placeholder="Describe the issue or service needed"
                  className="dialog-input"
                  value={editedOrder.issue ?? ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      issue: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">
                  Detailed Description
                </label>
                <textarea
                  placeholder="Additional details about the service"
                  className="dialog-input task-textarea"
                  value={editedOrder.description ?? ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">
                  Estimated Cost ($) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="dialog-input"
                  value={editedOrder.total_cost ?? ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      total_cost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Priority *</label>
                <select
                  className="dialog-input"
                  value={editedOrder.priority ?? "NORMAL"}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">
                  Estimated Completion Date *
                </label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={editedOrder.endDate ?? ""}
                  onChange={(e) =>
                    setEditedOrder((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="dialog-actions">
              <Button
                type="submit"
                className="dialog-btn dialog-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                className="dialog-btn dialog-btn--secondary"
                onClick={() => {
                  setShowEditOrder(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showStatusDialog}
        onOpenChange={(open) => {
          setShowStatusDialog(open);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Change Order Status
            </DialogTitle>
          </DialogHeader>
          <div className="dialog-body">
            <p>
              Do you want to cancel this order or mark it as completed? Once an
              order is cancelled or completed it cannot be edited or have tasks
              added.
            </p>
            <div className="dialog-actions">
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={() => handleSetOrderStatus("COMPLETED")}
                disabled={isSubmitting}
              >
                Complete Order
              </Button>
              <Button
                className="dialog-btn dialog-btn--danger"
                onClick={() => handleSetOrderStatus("CANCELLED")}
                disabled={isSubmitting}
              >
                Cancel Order
              </Button>
              <Button
                className="dialog-btn dialog-btn--secondary"
                onClick={() => setShowStatusDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showTaskComments}
        onOpenChange={(open) => {
          setShowTaskComments(open);
          if (!open) {
            setSelectedTask(null);
            setTaskComments([]);
            setNewComment("");
            setCommentTitle("");
            setUploadedFiles([]);
          }
        }}
      >
        <DialogContent className="dialog-content order-comments-dialog">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Task Comments: {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="dialog-body order-comments-body">
            {(session?.user?.role === "ADMIN" ||
              session?.user?.role === "MECHANIC") && (
              <div className="order-comment-form">
                <h4 className="order-comment-title">✏️ Add Comment</h4>
                <div className="order-upload-section">
                  <Input
                    placeholder="Comment title (optional)"
                    value={commentTitle}
                    onChange={(e) => setCommentTitle(e.target.value)}
                    className="order-comment-input"
                  />
                  <textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="order-comment-textarea"
                  />
                </div>

                <div className="order-upload-section">
                  <label
                    htmlFor="comment-file-upload"
                    className={`order-upload-label ${
                      uploadingFile ? "disabled" : ""
                    }`}
                    aria-disabled={uploadingFile}
                  >
                    {uploadingFile ? "Uploading..." : "Attach File/Video"}
                  </label>
                  <input
                    id="comment-file-upload"
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="order-upload-input"
                  />
                  <p className="order-upload-note">
                    Supported: Images, Videos, PDF, Word documents (Max 50MB)
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="order-uploaded-list">
                    <p className="order-uploaded-list-title">Attached Files:</p>
                    <div className="order-uploaded-items">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="order-uploaded-item">
                          <span>{file.filename}</span>
                          <button
                            onClick={() => removeUploadedFile(file.id)}
                            className="order-uploaded-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="dialog-btn dialog-btn--primary order-comment-submit"
                >
                  {isSubmitting ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            )}

            <div>
              <h4 className="order-comments-heading">
                💬 Comments ({taskComments.length})
              </h4>
              {loadingComments ? (
                <p className="order-comments-loading">Loading comments...</p>
              ) : taskComments.length === 0 ? (
                <p className="order-comments-empty">
                  No comments yet. Be the first to add one!
                </p>
              ) : (
                <div className="order-comments-list">
                  {taskComments.map((comment) => {
                    const author = comment.author ||
                      comment.employees?.users ||
                      comment.admin_author || {
                        first_name: "Unknown",
                        last_name: "User",
                        email: "",
                      };

                    return (
                      <div
                        key={comment.id}
                        className="order-comment-card-wrapper"
                      >
                        <div className="order-comment-stripe" />

                        <div className="order-comment-card">
                          <div className="order-comment-author-block">
                            <div className="order-comment-author-row">
                              <strong className="order-comment-author">
                                {author.first_name || "Unknown"}{" "}
                                {author.last_name || "User"}
                              </strong>
                              {comment.title && (
                                <span className="order-comment-title-italic">
                                  - {comment.title}
                                </span>
                              )}
                            </div>

                            <div className="order-comment-meta">
                              <span>
                                🕐{" "}
                                {new Date(comment.created_at).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {(comment.employees?.users?.email ||
                                comment.admin_author?.email ||
                                author?.email) && (
                                <span className="order-comment-email">
                                  ✉️{" "}
                                  {author?.email ||
                                    comment.employees?.users?.email ||
                                    comment.admin_author?.email}
                                </span>
                              )}
                            </div>
                          </div>

                          {isCommentOwner(comment) && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="order-comment-delete"
                            >
                              <Trash size={16} />
                              {deletingCommentId === comment.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>
                        <p className="order-comment-message">
                          {comment.message}
                        </p>

                        {comment.document && comment.document.length > 0 && (
                          <div className="order-comment-attachments">
                            <p className="order-comment-attachments-title">
                              Attachments:
                            </p>
                            <div className="order-comment-attachments-list">
                              {comment.document.map((doc: any) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="order-comment-attachment"
                                >
                                  {doc.type === "PHOTO" && "📷"}
                                  {doc.type === "VIDEO" && "🎥"}
                                  {doc.type === "DOCUMENT" && "📄"}
                                  <span className="order-comment-attachment-label">
                                    {doc.filename}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="dialog-actions">
            <Button
              className="dialog-btn dialog-btn--secondary"
              onClick={() => setShowTaskComments(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Status Change Dialog */}
      <Dialog
        open={showTaskStatusDialog}
        onOpenChange={(open) => {
          setShowTaskStatusDialog(open);
          if (!open) setTaskToChangeStatus(null);
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Change Task Status
            </DialogTitle>
          </DialogHeader>
          <div className="dialog-body">
            <p>
              Change the status of task:{" "}
              <strong>{taskToChangeStatus?.title}</strong>
            </p>
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
              Current status: {taskToChangeStatus?.status}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={() => handleChangeTaskStatus("NEW")}
                disabled={isSubmitting || taskToChangeStatus?.status === "NEW"}
              >
                New
              </Button>
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={() => handleChangeTaskStatus("IN_PROGRESS")}
                disabled={
                  isSubmitting || taskToChangeStatus?.status === "IN_PROGRESS"
                }
              >
                In Progress
              </Button>
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={() => handleChangeTaskStatus("WAITING_FOR_PARTS")}
                disabled={
                  isSubmitting ||
                  taskToChangeStatus?.status === "WAITING_FOR_PARTS"
                }
              >
                Waiting for Parts
              </Button>
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={() => handleChangeTaskStatus("READY")}
                disabled={
                  isSubmitting || taskToChangeStatus?.status === "READY"
                }
              >
                Ready
              </Button>
              <Button
                className="dialog-btn dialog-btn--primary"
                onClick={() => handleChangeTaskStatus("COMPLETED")}
                disabled={
                  isSubmitting || taskToChangeStatus?.status === "COMPLETED"
                }
              >
                Completed
              </Button>
              <Button
                className="dialog-btn dialog-btn--danger"
                onClick={() => handleChangeTaskStatus("CANCELLED")}
                disabled={
                  isSubmitting || taskToChangeStatus?.status === "CANCELLED"
                }
              >
                Cancelled
              </Button>
            </div>
            <div className="dialog-actions" style={{ marginTop: "20px" }}>
              <Button
                className="dialog-btn dialog-btn--secondary"
                onClick={() => {
                  setShowTaskStatusDialog(false);
                  setTaskToChangeStatus(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
