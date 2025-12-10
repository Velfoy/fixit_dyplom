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

  // Helper to transform API order response to frontend Order type
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
      task:
        apiOrder.service_task?.map((t: any) => ({
          id: t.id,
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

  // Parts management state
  const [orderParts, setOrderParts] = useState<any[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [includeInTotal, setIncludeInTotal] = useState<boolean>(false);
  const [partsSearchTerm, setPartsSearchTerm] = useState<string>("");
  const [loadingAvailableParts, setLoadingAvailableParts] = useState(false);

  // Task comments state
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

  // Helper to convert Decimal/string to number
  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    return parseFloat(val.toString());
  };

  function resetForm() {
    setEditedOrder({});
  }

  // Fetch invoice items from API on component mount
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

  // Function to fetch warehouse parts
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

  // Fetch warehouse parts assigned to this order
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
        updated = {
          ...editingTask,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          status: taskStatus,
          mechanic_id: taskMechanicId,
          mechanicId: taskMechanicId,
          mechanicFirstName:
            (mechanics.find((m) => m.id === taskMechanicId) || {}).first_name ||
            editingTask.mechanicFirstName,
          mechanicLastName:
            (mechanics.find((m) => m.id === taskMechanicId) || {}).last_name ||
            editingTask.mechanicLastName,
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

      // If completing order, refresh parts list to show deducted status
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

      console.log("Response status:", res.status);

      // First check if response is OK
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

      // Parse the successful response
      const response = await res.json();
      console.log("API Success Response:", response);

      // Now backend returns only { item }, NOT { item, order }
      if (!response.item) {
        throw new Error("Invalid response structure from API");
      }

      // Update local state with the new item
      const newItem = {
        id: response.item.id.toString(),
        description: response.item.name,
        cost: parseFloat(response.item.cost.toString()),
      };

      // Update invoice items - this is the only state we need to update
      setInvoiceItems((prev) => [...prev, newItem]);

      // DO NOT update serviceOrder since total_cost is not changing
      // setServiceOrder(response.order); // Remove this line

      // Reset form
      setShowAddItem(false);
      setItemDescription("");
      setItemCost(0);

      console.log("Item added successfully:", newItem);
      console.log("Service order total remains:", serviceOrder.total_cost);
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
      // Simulate payment gateway processing
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

  // Search warehouse parts
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

  // Add part to order
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

      // Add the newly created part with its full data to the list
      setOrderParts((prev) => [...prev, response.part]);

      // Reset form
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

  // Delete part from order
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

  // Toggle deduct from warehouse flag
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

  // Deduct parts from warehouse
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

  // Task Comments Functions
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
      // Reset file input
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
      <div
        className="customers-header"
        style={{ marginTop: "4px", marginBottom: "12px" }}
      >
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
            className={STATUS_MAP[serviceOrder?.status || "NEW"].className}
            style={{
              fontSize: "14px",
              marginRight: "10px",
              cursor:
                serviceOrder && !isTerminalStatus(serviceOrder.status)
                  ? "pointer"
                  : "default",
            }}
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
            <span style={{ fontSize: "14px", marginLeft: "10px" }}>
              {serviceOrder?.issue}
            </span>
          </h1>
          <p className="customers-subtitle">
            {serviceOrder?.carBrand} {serviceOrder?.carModel} (
            {serviceOrder?.carYear}) {serviceOrder?.orderNumber}
          </p>
        </div>
        <div className="customers-header-text">
          <p
            className="customers-subtitle"
            style={{ color: "white", margin: "0px" }}
          >
            License plate
          </p>
          <p className="customers-subtitle" style={{ textAlign: "end" }}>
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
          <div
            className="customers-header"
            style={{ marginBottom: "10px", marginLeft: "5px" }}
          >
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
                        <strong
                          style={{
                            marginTop: "5px",
                            marginBottom: "5px",
                            fontSize: "14px",
                            color: "#cccccc",
                          }}
                        >
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
                      {session?.user?.role === "ADMIN" && (
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
      {/* Warehouse Parts Management Section */}
      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-header" style={{ marginLeft: "5px" }}>
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

          <div style={{ paddingTop: "15px" }}>
            {loadingParts ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Loading parts...
              </div>
            ) : orderParts.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#999" }}
              >
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
                          className="edit-button_trans"
                          disabled={
                            isTerminalStatus(serviceOrder?.status) ||
                            loadingParts
                          }
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                          }}
                        >
                          Delete
                        </Button>
                      ),
                    },
                  ]}
                  pageSize={10}
                  getRowKey={(part) => part.id}
                />

                {/* Parts Total Summary */}
                <div
                  style={{
                    padding: "15px",
                    borderTop: "1px solid #ddd",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
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

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
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

                  {/* Deduct from Warehouse Button */}
                  {orderParts.some(
                    (p) => p.deductFromWarehouse && !p.warehouseDeductedAt
                  ) && (
                    <Button
                      onClick={handleDeductPartsFromWarehouse}
                      className="transaction-pay-now-btn"
                      disabled={
                        isTerminalStatus(serviceOrder?.status) ||
                        isSubmitting ||
                        !orderParts.some(
                          (p) => p.deductFromWarehouse && !p.warehouseDeductedAt
                        )
                      }
                      style={{
                        marginTop: "10px",
                        backgroundColor: "#ff9800",
                      }}
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
      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-header" style={{ marginLeft: "5px" }}>
            <span>Payment & Transaction Details</span>
            {session?.user?.role === "ADMIN" && (
              <div className="transaction-details-header">
                <div className="transaction-actions">
                  <Button className="edit-button_trans">
                    Generate Invoice
                  </Button>
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

          {session?.user?.role !== "ADMIN" && (
            <div style={{ paddingTop: "15px" }}>
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

                                  // Just remove item from local state, don't update serviceOrder
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

          {session?.user?.role === "ADMIN" && (
            <div style={{ paddingTop: "15px" }}>
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
              <div style={{ display: "flex", gap: "8px" }}>
                <Input
                  className="dialog-input"
                  value={partsSearchTerm}
                  onChange={(e) => setPartsSearchTerm(e.target.value)}
                  placeholder="Search by name or part number..."
                  style={{ flex: 1 }}
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

              {/* Search Results Dropdown */}
              {availableParts.length > 0 && (
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginTop: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {availableParts.map((part) => (
                    <div
                      key={part.id}
                      onClick={() => {
                        setSelectedPart(part);
                        setPartsSearchTerm(part.name);
                        setAvailableParts([]);
                      }}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor:
                          selectedPart?.id === part.id ? "#f0f8ff" : "#fff",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPart?.id !== part.id) {
                          e.currentTarget.style.backgroundColor = "#f9f9f9";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPart?.id !== part.id) {
                          e.currentTarget.style.backgroundColor = "#fff";
                        }
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>{part.name}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Part #: {part.part_number} | Stock: {part.quantity} |
                        Price: ${toNumber(part.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loadingAvailableParts && (
                <div
                  style={{ marginTop: "8px", color: "#999", fontSize: "12px" }}
                >
                  Searching...
                </div>
              )}
            </div>

            {/* Selected Part Details */}
            {selectedPart && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  marginBottom: "12px",
                }}
              >
                <p style={{ margin: "0 0 4px 0" }}>
                  <strong>{selectedPart.name}</strong>
                </p>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Part #: {selectedPart.part_number}
                </p>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Available: {selectedPart.quantity} units
                </p>
                <p
                  style={{ margin: "0", fontSize: "12px", fontWeight: "bold" }}
                >
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

              <div
                className="dialog-form-field dialog-field--full"
                style={{ marginTop: "8px" }}
              >
                <label
                  className="dialog-field-label"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
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
        <DialogContent
          className="dialog-content"
          style={{ maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}
        >
          <DialogHeader>
            <DialogTitle className="dialog-title">Complete Payment</DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleProcessPayment}
          >
            {/* Order Summary */}
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: "8px" }}>
                Order Summary
              </h4>
              <div
                style={{
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Subtotal:</span>
                <span>
                  ${" "}
                  {(
                    toNumber(serviceOrder?.total_cost || 0) +
                    invoiceItems.reduce((sum, item) => sum + item.cost, 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total Due:</span>
                <span style={{ color: "#1976d2" }}>
                  ${" "}
                  {(
                    toNumber(serviceOrder?.total_cost || 0) +
                    invoiceItems.reduce((sum, item) => sum + item.cost, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="dialog-form-grid">
              <label className="dialog-field-label">
                Select Payment Method
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  style={{
                    padding: "12px",
                    border: `2px solid ${
                      paymentMethod === "CARD" ? "#1976d2" : "#ddd"
                    }`,
                    borderRadius: "8px",
                    backgroundColor:
                      paymentMethod === "CARD" ? "#f0f8ff" : "#fff",
                    cursor: "pointer",
                    fontWeight: paymentMethod === "CARD" ? "bold" : "normal",
                  }}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("APPLE_PAY")}
                  style={{
                    padding: "12px",
                    border: `2px solid ${
                      paymentMethod === "APPLE_PAY" ? "#1976d2" : "#ddd"
                    }`,
                    borderRadius: "8px",
                    backgroundColor:
                      paymentMethod === "APPLE_PAY" ? "#f0f8ff" : "#fff",
                    cursor: "pointer",
                    fontWeight:
                      paymentMethod === "APPLE_PAY" ? "bold" : "normal",
                  }}
                >
                  🍎 Apple Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  style={{
                    padding: "12px",
                    border: `2px solid ${
                      paymentMethod === "BANK_TRANSFER" ? "#1976d2" : "#ddd"
                    }`,
                    borderRadius: "8px",
                    backgroundColor:
                      paymentMethod === "BANK_TRANSFER" ? "#f0f8ff" : "#fff",
                    cursor: "pointer",
                    fontWeight:
                      paymentMethod === "BANK_TRANSFER" ? "bold" : "normal",
                  }}
                >
                  🏦 Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("GOOGLE_PAY")}
                  style={{
                    padding: "12px",
                    border: `2px solid ${
                      paymentMethod === "GOOGLE_PAY" ? "#1976d2" : "#ddd"
                    }`,
                    borderRadius: "8px",
                    backgroundColor:
                      paymentMethod === "GOOGLE_PAY" ? "#f0f8ff" : "#fff",
                    cursor: "pointer",
                    fontWeight:
                      paymentMethod === "GOOGLE_PAY" ? "bold" : "normal",
                  }}
                >
                  🔵 Google Pay
                </button>
              </div>

              {/* Card Payment Form */}
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

              {/* Bank Transfer Form */}
              {paymentMethod === "BANK_TRANSFER" && (
                <>
                  <div
                    style={{
                      backgroundColor: "#fff3cd",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                    }}
                  >
                    <p style={{ marginTop: 0, marginBottom: "8px" }}>
                      <strong>Bank Transfer Details:</strong>
                    </p>
                    <p style={{ marginBottom: "4px", fontSize: "14px" }}>
                      Account: 1234567890
                    </p>
                    <p style={{ marginBottom: "4px", fontSize: "14px" }}>
                      Bank: Standard Bank
                    </p>
                    <p style={{ marginBottom: "0px", fontSize: "14px" }}>
                      Reference: ORD-{serviceOrder?.id}
                    </p>
                  </div>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    Please transfer the amount and confirm below once done.
                  </p>
                </>
              )}

              {/* Apple/Google Pay Message */}
              {(paymentMethod === "APPLE_PAY" ||
                paymentMethod === "GOOGLE_PAY") && (
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ marginTop: 0, marginBottom: "8px" }}>
                    <strong>
                      Ready for{" "}
                      {paymentMethod === "APPLE_PAY"
                        ? "Apple Pay"
                        : "Google Pay"}
                    </strong>
                  </p>
                  <p style={{ marginBottom: "0px", fontSize: "14px" }}>
                    Click 'Process Payment' to complete payment via{" "}
                    {paymentMethod === "APPLE_PAY" ? "Apple Pay" : "Google Pay"}
                    .
                  </p>
                </div>
              )}
            </div>
            {showPaymentProcessing && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ marginTop: 0 }}>Processing payment...</p>
                <div
                  style={{
                    display: "inline-block",
                    width: "30px",
                    height: "30px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #1976d2",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
                  className="dialog-input"
                  style={{ minHeight: "100px" }}
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
                  className="dialog-input"
                  style={{ minHeight: "100px" }}
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
                  className="dialog-input "
                  style={{ minHeight: "100px" }}
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

      {/* Task Comments Dialog */}
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
        <DialogContent
          className="dialog-content"
          style={{
            maxWidth: "850px",
            overflowY: "scroll",
            overflowX: "hidden",
          }}
        >
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Task Comments: {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="dialog-body" style={{ padding: "10px" }}>
            {/* Add Comment Form - Only for Admin */}
            {session?.user?.role === "ADMIN" && (
              <div
                style={{
                  padding: "20px",
                  background:
                    "linear-gradient(135deg, #0f0f0fff 0%, #242424ff 100%)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
                }}
              >
                <h4
                  style={{
                    marginBottom: "15px",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "0px",
                    marginTop: "0px",
                  }}
                >
                  ✏️ Add Comment
                </h4>
                <div style={{ marginBottom: "14px" }}>
                  <Input
                    placeholder="Comment title (optional)"
                    value={commentTitle}
                    onChange={(e) => setCommentTitle(e.target.value)}
                    style={{
                      marginBottom: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  />
                  <textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      width: "-webkit-fill-available",
                      minHeight: "110px",
                      padding: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      resize: "vertical",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      color: "#333",
                      fontFamily: "inherit",
                      lineHeight: "1.5",
                    }}
                  />
                </div>

                {/* File Upload */}
                <div style={{ marginBottom: "14px" }}>
                  <label
                    htmlFor="comment-file-upload"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      borderRadius: "6px",
                      cursor: uploadingFile ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      transition: "all 0.3s ease",
                      opacity: uploadingFile ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!uploadingFile) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255, 255, 255, 0.3)";
                        e.currentTarget.style.borderColor =
                          "rgba(255, 255, 255, 0.6)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.borderColor =
                        "rgba(255, 255, 255, 0.4)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {uploadingFile ? "Uploading..." : "Attach File/Video"}
                  </label>
                  <input
                    id="comment-file-upload"
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    style={{ display: "none" }}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.8)",
                      marginTop: "6px",
                    }}
                  >
                    Supported: Images, Videos, PDF, Word documents (Max 50MB)
                  </p>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div
                    style={{
                      marginBottom: "14px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "rgba(255, 255, 255, 0.9)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Attached Files:
                    </p>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 10px",
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "#fff",
                          }}
                        >
                          <span>{file.filename}</span>
                          <button
                            onClick={() => removeUploadedFile(file.id)}
                            style={{
                              marginLeft: "6px",
                              background: "none",
                              border: "none",
                              color: "#fff",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "16px",
                            }}
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
                  className="dialog-btn dialog-btn--primary"
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    color: "white",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isSubmitting ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div>
              <h4
                style={{
                  marginBottom: "18px",
                  paddingBottom: "12px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#212529",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderBottom: "3px solid #0f0f0fff",
                }}
              >
                💬 Comments ({taskComments.length})
              </h4>
              {loadingComments ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    color: "#999",
                    fontSize: "14px",
                  }}
                >
                  Loading comments...
                </p>
              ) : taskComments.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    color: "#999",
                    fontStyle: "italic",
                    fontSize: "14px",
                  }}
                >
                  No comments yet. Be the first to add one!
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
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
                        style={{
                          padding: "16px",
                          background:
                            "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
                          border: "2px solid #0f0f0fff",
                          borderRadius: "10px",
                          transition: "all 0.3s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(102, 126, 234, 0.15)";
                          e.currentTarget.style.borderColor = "#0f0f0fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor =
                            "rgba(92, 92, 92, 1)";
                        }}
                      >
                        {/* Top gradient stripe */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "3px",
                            background:
                              "linear-gradient(90deg, #0f0f0fff 0%, #242424ff 100%)",
                          }}
                        />

                        {/* Comment header with author info */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "14px",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            {/* Author name and title */}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "baseline",
                                gap: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "#242424ff",
                                  padding: "2px 6px",
                                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                                  borderRadius: "4px",
                                }}
                              >
                                {author.first_name || "Unknown"}{" "}
                                {author.last_name || "User"}
                              </strong>
                              {comment.title && (
                                <span
                                  style={{
                                    color: "#0c080fff",
                                    fontSize: "13px",
                                    fontStyle: "italic",
                                    fontWeight: "600",
                                    padding: "2px 6px",
                                    backgroundColor: "rgba(118, 75, 162, 0.08)",
                                    borderRadius: "4px",
                                  }}
                                >
                                  - {comment.title}
                                </span>
                              )}
                            </div>

                            {/* Meta info (timestamp and email) */}
                            <div
                              style={{
                                display: "flex",
                                gap: "16px",
                                alignItems: "center",
                                flexWrap: "wrap",
                                padding: "8px",
                                backgroundColor: "rgba(255, 255, 255, 0.6)",
                                borderRadius: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#242424ff",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
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
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#764ba2",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
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
                              style={{
                                border: "none",
                                background: "rgba(15,15,15,0.85)",
                                color: "white",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                cursor:
                                  deletingCommentId === comment.id
                                    ? "not-allowed"
                                    : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: 700,
                                boxShadow: "0 4px 10px rgba(15,15,15,0.25)",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Trash size={16} />
                              {deletingCommentId === comment.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>

                        {/* Comment message */}
                        <p
                          style={{
                            fontSize: "14px",
                            marginBottom: "12px",
                            whiteSpace: "pre-wrap",
                            color: "#333",
                            lineHeight: "1.6",
                            padding: "12px",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            borderLeft: "3px solid #242424ff",
                            borderRadius: "4px",
                          }}
                        >
                          {comment.message}
                        </p>

                        {/* Attached Documents */}
                        {comment.document && comment.document.length > 0 && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "12px",
                              backgroundColor: "rgba(102, 126, 234, 0.08)",
                              borderRadius: "6px",
                              borderLeft: "3px solid #242424ff",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                marginBottom: "8px",
                                color: "#242424ff",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                              }}
                            >
                              Attachments:
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                              }}
                            >
                              {comment.document.map((doc: any) => (
                                <a
                                  key={doc.id}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "6px 12px",
                                    background:
                                      "linear-gradient(135deg, #242424ff 0%, #764ba2 100%)",
                                    color: "white",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    textDecoration: "none",
                                    transition: "all 0.2s ease",
                                    fontWeight: "600",
                                    boxShadow:
                                      "0 2px 6px rgba(102, 126, 234, 0.3)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 10px rgba(102, 126, 234, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow =
                                      "0 2px 6px rgba(102, 126, 234, 0.3)";
                                  }}
                                >
                                  {doc.type === "PHOTO" && "📷"}
                                  {doc.type === "VIDEO" && "🎥"}
                                  {doc.type === "DOCUMENT" && "📄"}
                                  <span style={{ marginLeft: "6px" }}>
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
    </div>
  );
}
