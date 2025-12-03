"use client";

import { useState } from "react";
import { CreateOrderModal } from "./CreateOrderModal";
import { Card } from "../ui/card";
import { ServiceOrders, StatusServiceOrder } from "@/types/serviceorders";

export function OrdersView({
  session,
  dataServiceOrders,
}: {
  session: any;
  dataServiceOrders: ServiceOrders[];
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orders, setOrders] = useState<ServiceOrders[]>([
    {
      id: "1",
      orderNumber: "SO-1001",
      carBrand: "Porsche",
      carModel: "911 Carrera",
      carYear: "2023",
      description: "Engine repair and oil change",
      status: "IN_PROGRESS",
      startDate: new Date("2025-11-01T09:00:00Z"),
      endDate: new Date("2025-11-03T17:00:00Z"),
      total_cost: 850,
      created_at: new Date("2025-11-01T08:30:00Z").toISOString(),
      updated_at: new Date("2025-11-01T12:00:00Z").toISOString(),
      progress: 65,
      mechanicFirstName: "Mike",
      mechanicLastName: "Johnson",
    },
    {
      id: "2",
      orderNumber: "SO-1002",
      carBrand: "BMW",
      carModel: "M4 Competition",
      carYear: "2022",
      description: "Brake system replacement",
      status: "COMPLETED",
      startDate: new Date("2025-10-20T10:00:00Z"),
      endDate: new Date("2025-10-22T16:00:00Z"),
      total_cost: 1200,
      created_at: new Date("2025-10-20T09:45:00Z").toISOString(),
      updated_at: new Date("2025-10-22T16:00:00Z").toISOString(),
      progress: 100,
      mechanicFirstName: "Sarah",
      mechanicLastName: "Williams",
    },
    {
      id: "3",
      orderNumber: "SO-1003",
      carBrand: "Audi",
      carModel: "RS7",
      carYear: "2024",
      description: "Transmission service",
      status: "WAITING_FOR_PARTS",
      startDate: new Date("2025-11-02T08:00:00Z"),
      endDate: new Date("2025-11-10T17:00:00Z"),
      total_cost: 1500,
      created_at: new Date("2025-11-02T07:30:00Z").toISOString(),
      updated_at: new Date("2025-11-03T10:00:00Z").toISOString(),
      progress: 40,
      mechanicFirstName: "John",
      mechanicLastName: "Doe",
    },
    {
      id: "4",
      orderNumber: "SO-1004",
      carBrand: "Tesla",
      carModel: "Model S Plaid",
      carYear: "2023",
      description: "Battery replacement",
      status: "NEW",
      startDate: new Date("2025-12-01T09:00:00Z"),
      endDate: new Date("2025-12-05T17:00:00Z"),
      total_cost: 2000,
      created_at: new Date("2025-12-01T08:00:00Z").toISOString(),
      updated_at: new Date("2025-12-01T08:00:00Z").toISOString(),
      progress: 0,
      mechanicFirstName: "Alice",
      mechanicLastName: "Smith",
    },
  ]);

  const handleCreateOrder = (newOrder: ServiceOrders) => {
    setOrders([newOrder, ...orders]);
    setShowCreateModal(false);
  };

  const handleSelectOrder = (orderId: string) => {
    // Detect current role from URL
    const segments = window.location.pathname.split("/").filter(Boolean);
    const roleSegment = segments[0] || "client"; // fallback
    window.location.href = `/${roleSegment}/orders/${orderId}`;
  };

  return (
    <div>
      <h2>Order Management</h2>
      <button onClick={() => setShowCreateModal(true)}>+ Create Order</button>

      <div>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              margin: 10,
              padding: 10,
              cursor: "pointer",
            }}
            onClick={() => handleSelectOrder(order.id)}
          >
            <h3>{order.carModel}</h3>
            <p>Order #{order.id}</p>
            <p>{order.description}</p>
            <p>Status: {order.status}</p>
            <p>Mechanic: {order.mechanicFirstName}</p>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreateOrder={handleCreateOrder}
        />
      )}
    </div>
  );
}
