"use client";

import { FormEvent, useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { ServiceOrders, StatusServiceOrder } from "@/types/serviceorders";
import "@/styles/users.css";
import "@/styles/orders.css";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type CustomerOrder = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
};

type Vehicle = {
  id: number;
  customer_id: number;
  brand: string;
  model: string;
  year: string;
  vin: string;
  license_plate: string;
};

type Mechanic = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialization?: string;
};

export function OrdersView({
  session,
  dataServiceOrders,
}: {
  session: any;
  dataServiceOrders: ServiceOrders[];
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orders, setOrders] = useState<ServiceOrders[]>(dataServiceOrders);
  console.log(orders);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCustomers, setExistingCustomers] = useState<CustomerOrder[]>(
    []
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const filteredVehicles = selectedCustomerId
    ? vehicles.filter((vehicle) => vehicle.customer_id === selectedCustomerId)
    : [];

  useEffect(() => {
    fetch("/api/customers?minimal=true")
      .then((res) => res.json())
      .then((data) => {
        setExistingCustomers(data);
      })
      .catch(console.error);

    fetch("/api/cars?minimal=true")
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
      })
      .catch(console.error);

    fetch("/api/mechanics?minimal=true")
      .then((res) => res.json())
      .then((data) => {
        setMechanics(data);
      })
      .catch(console.error);
  }, []);

  const [newOrder, setNewOrder] = useState<Partial<ServiceOrders>>({
    orderNumber: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    description: "",
    issue: "",
    status: "NEW",
    startDate: "",
    endDate: "",
    total_cost: 0,
    progress: 0,
    priority: "NORMAL",
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );
  const [selectedMechanicId, setSelectedMechanicId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusServiceOrder | "ALL">(
    "ALL"
  );
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.carBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.carModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.carLicensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.mechanicFirstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.mechanicLastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "ALL" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  async function handleCreateOrder(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...newOrder,
      mechanicId: selectedMechanicId,
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create order");
      }
      const createdOrder: ServiceOrders = await response.json();
      setOrders((prev) => [...prev, createdOrder]);
      setShowAddOrder(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Error creating order");
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDeleteOrder(orderId: number) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((c) => c.id !== orderId));
        if (selectedOrderId === orderId) setSelectedOrderId(null);
      } else {
        alert("Failed to delete car.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting order.");
    }
  }

  const handleSelectOrder = (orderId: number) => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const roleSegment = segments[0] || session?.user?.role;
    window.location.href = `/${roleSegment}/orders/${orderId}`;
  };

  function resetForm() {
    setNewOrder({
      orderNumber: "",
      carBrand: "",
      carModel: "",
      carYear: "",
      description: "",
      issue: "",
      status: "NEW",
      startDate: "",
      endDate: "",
      total_cost: 0,
      progress: 0,
      priority: "NORMAL",
    });
    setSelectedCustomerId(null);
    setSelectedVehicleId(null);
    setSelectedMechanicId(null);
  }

  function openAddModal() {
    resetForm();
    setSelectedOrderId(null);
    setShowAddOrder(true);
  }

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

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (selectedVehicle) {
      setNewOrder((prev) => ({
        ...prev,
        carBrand: selectedVehicle.brand,
        carModel: selectedVehicle.model,
        carYear: selectedVehicle.year,
      }));
    }
  };

  const handleMechanicSelect = (mechanicId: number) => {
    setSelectedMechanicId(mechanicId);
  };

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "NORMAL", label: "Normal" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
  ];

  return (
    <div className="customers-view">
      {/* Header */}
      <div className="customers-header">
        <div className="customers-header-text">
          <h1 className="customers-title">Order Management</h1>
          <p className="customers-subtitle">
            Manage and track order information
          </p>
        </div>
        <Button onClick={openAddModal} className="add-customer-btn-override">
          <Plus className="icon-sm" />
          <span>Create Order</span>
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="search-card">
        <div className="search-card-inner">
          <div className="filter-grid">
            <div className="filter-field">
              <label className="filter-label">Search Orders</label>
              <div className="search-wrapper">
                <Search className="search-icon" />
                <Input
                  className="search-input"
                  placeholder="Search by car, license plate, issue, order number, mechanic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-field">
              <label className="filter-label">Status</label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusServiceOrder | "ALL")
                }
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                <option value="READY">Ready</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">Priority</label>
              <select
                className="filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div className="filter-results">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </Card>

      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-list">
            {filteredOrders?.map((order) => (
              <div
                key={order.id}
                className="customer-row paddingBottom"
                onClick={() => handleSelectOrder(order.id)}
              >
                <div
                  className="customer-avatar"
                  style={{ background: "#4d0000" }}
                >
                  <span className="customer-avatar-letter">
                    <Car className="icon-sm" />
                  </span>
                </div>

                <div className="customer-main">
                  <div className="customer-main-header order-header">
                    <h3 className="customer-name">
                      {order.carBrand} {order.carModel}
                    </h3>

                    <h2 className="order_car_year">{order.carYear} </h2>
                    <div className=" order_car_year ">
                      Priority:{" "}
                      <span className={`priority_${order.priority}`}>
                        {order.priority}
                      </span>
                    </div>
                    <div className="customer-total order_chevron">
                      <p className="customer-total-orders">
                        <ChevronRight className="icon-xs"></ChevronRight>
                        <Trash
                          className="icon-xs delete_hover"
                          style={{ marginLeft: "5px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.id);
                          }}
                        ></Trash>
                      </p>
                    </div>
                  </div>

                  <div className="customer-meta">
                    <span className="customer-meta-item">
                      Order #{order.id}
                    </span>
                    <span className="customer-meta-item">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="customer-meta">
                    <span
                      className="customer-meta-item"
                      style={{ marginTop: "5px" }}
                    >
                      {order.issue.length > 35
                        ? order.issue.slice(0, 35) + "..."
                        : order.issue}
                    </span>
                  </div>

                  <div className="customer-meta status-order">
                    <span className="customer-meta-item">
                      <Clock
                        className="icon-xs"
                        style={{ marginRight: "7px" }}
                      />

                      <span className={STATUS_MAP[order.status].className}>
                        {STATUS_MAP[order.status].label}
                      </span>
                    </span>
                    <span className="customer-meta-item">
                      Mechanic: {order.mechanicFirstName}{" "}
                      {order.mechanicLastName}
                    </span>
                    <span className="customer-meta-item">
                      Est:{" "}
                      {Math.ceil(
                        (new Date(order.endDate).getTime() -
                          new Date(order.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </span>
                    <span className="customer-meta-item mechanic-right">
                      Price: {order.total_cost}$
                    </span>
                  </div>
                  {order.status === "IN_PROGRESS" && (
                    <div
                      className="customer-meta"
                      style={{ marginTop: "10px" }}
                    >
                      <div className="progress-header">
                        <span className="customer-meta-item">Progress</span>
                        <span className="progress-value-top">
                          {order.progress}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Dialog
        open={showAddOrder}
        onOpenChange={(open) => {
          setShowAddOrder(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              Create New Service Order
            </DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleCreateOrder}
          >
            <div className="dialog-form-grid">
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Customer *</label>
                <select
                  className="dialog-input"
                  value={selectedCustomerId ?? ""}
                  onChange={(e) => {
                    const customerId = Number(e.target.value);
                    setSelectedCustomerId(customerId);
                    setSelectedVehicleId(null);
                    setNewOrder((prev) => ({
                      ...prev,
                      carBrand: "",
                      carModel: "",
                      carYear: "",
                    }));
                  }}
                  required
                >
                  <option value="">-- Select a customer --</option>
                  {existingCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} (
                      {customer.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerId && (
                <div className="dialog-form-field dialog-field--full">
                  <label className="dialog-field-label">Vehicle *</label>
                  <select
                    className="dialog-input"
                    value={selectedVehicleId ?? ""}
                    onChange={(e) =>
                      handleVehicleSelect(Number(e.target.value))
                    }
                    required
                  >
                    <option value="">-- Select a vehicle --</option>
                    {filteredVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.year}) -{" "}
                        {vehicle.license_plate}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Mechanic *</label>
                <select
                  className="dialog-input"
                  value={selectedMechanicId ?? ""}
                  onChange={(e) => handleMechanicSelect(Number(e.target.value))}
                  required
                >
                  <option value="">-- Select a mechanic --</option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.first_name} {mechanic.last_name}
                      {mechanic.specialization &&
                        ` - ${mechanic.specialization}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">
                  Issue Description *
                </label>
                <Input
                  placeholder="Describe the issue or service needed"
                  className="dialog-input"
                  value={newOrder.issue}
                  onChange={(e) =>
                    setNewOrder((prev) => ({ ...prev, issue: e.target.value }))
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
                  className="dialog-input min-h-[100px]"
                  value={newOrder.description}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
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
                  value={newOrder.total_cost || ""}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
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
                  value={newOrder.priority}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      priority: e.target.value as
                        | "LOW"
                        | "NORMAL"
                        | "HIGH"
                        | "URGENT",
                    }))
                  }
                  required
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Start Date *</label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={newOrder.startDate}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">
                  Estimated Completion Date *
                </label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={newOrder.endDate}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
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
                {isSubmitting ? "Creating Order..." : "Create Order"}
              </Button>

              <Button
                type="button"
                className="dialog-btn dialog-btn--secondary"
                onClick={() => {
                  setShowAddOrder(false);
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
