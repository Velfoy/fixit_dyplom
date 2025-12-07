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
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface OrderDetailViewProps {
  dataServiceOrder?: Order | null;
  session?: number;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Partial<Order>>({});

  function resetForm() {
    setEditedOrder({});
  }

  async function handleEdit() {
    if (!serviceOrder) return;
    setEditedOrder({
      issue: serviceOrder.issue,
      description: serviceOrder.description,
      endDate: serviceOrder.endDate,
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
      // Currently no PUT endpoint exists for orders in the API, so update locally.
      const updated: Order = {
        ...serviceOrder,
        issue: editedOrder.issue ?? serviceOrder.issue,
        description: editedOrder.description ?? serviceOrder.description,
        endDate: editedOrder.endDate ?? serviceOrder.endDate,
        total_cost: Number(editedOrder.total_cost ?? serviceOrder.total_cost),
        priority: (editedOrder.priority as string) ?? serviceOrder.priority,
      };

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
            className={STATUS_MAP[serviceOrder?.status || "NEW"].className}
            style={{ fontSize: "14px", marginRight: "10px" }}
          >
            {STATUS_MAP[serviceOrder?.status || "NEW"].label}
          </span>
          <button onClick={handleEdit} className="edit-button_order">
            <Edit className="icon-xxx" />
            <span>Edit Order</span>
          </button>
        </div>
      </div>
      <div className="customers-header">
        <div className="customers-header-text">
          <h1 className="customers-title">Order #{serviceOrder?.id}</h1>
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
                $ {serviceOrder?.total_cost || 0}
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
              <button onClick={handleEdit} className="edit-button_order">
                <Plus className="icon-xxx" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
          <Card className="customers-list">
            {serviceOrder?.task.map((task, index) => {
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
                    {index !== serviceOrder.task.length - 1 && (
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
                      <h3 className="customer-name">
                        {task.mechanicFirstName} {task.mechanicLastName} –{" "}
                        {task.title}
                      </h3>
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

                  <div className="customer-actions">
                    <button
                      className="icon-btn icon-btn--edit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="icon-xxx" />
                    </button>
                    <button
                      className="icon-btn icon-btn--edit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash className="icon-xxx" />
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </Card>
      <Card className="customers-list-card">
        <div className="customers-list-inner"></div>
      </Card>
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
    </div>
  );
}
