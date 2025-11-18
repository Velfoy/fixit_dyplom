"use client";

import { useState, FormEvent } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import {
  Search,
  Plus,
  Mail,
  Phone,
  Car,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";

import "../../styles/users.css";

type CustomerStatus = "active" | "vip" | "inactive";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  cars: { model: string; year: number; plate: string }[];
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  memberSince: string;
  status: CustomerStatus;
};

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 0 });

export default function CustomersView({ session }: { session: any }) {
  const [searchQuery, setSearchQuery] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001",
      cars: [{ model: "Tesla Model S", year: 2023, plate: "ABC 1234" }],
      totalOrders: 12,
      totalSpent: 4500,
      lastVisit: "2025-11-10",
      memberSince: "2023-03-15",
      status: "active",
    },
    {
      id: 2,
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Ave, Los Angeles, CA 90001",
      cars: [
        { model: "BMW X5", year: 2022, plate: "XYZ 5678" },
        { model: "BMW M4", year: 2021, plate: "BMW 9012" },
      ],
      totalOrders: 18,
      totalSpent: 6800,
      lastVisit: "2025-11-15",
      memberSince: "2022-08-20",
      status: "active",
    },
    {
      id: 3,
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine Rd, Chicago, IL 60601",
      cars: [{ model: "Audi A8", year: 2024, plate: "AUD 3456" }],
      totalOrders: 8,
      totalSpent: 3200,
      lastVisit: "2025-11-12",
      memberSince: "2023-11-10",
      status: "active",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 456-7890",
      address: "321 Elm St, Miami, FL 33101",
      cars: [{ model: "Mercedes-AMG GT", year: 2023, plate: "MER 7890" }],
      totalOrders: 15,
      totalSpent: 8900,
      lastVisit: "2025-11-08",
      memberSince: "2022-01-05",
      status: "vip",
    },
    {
      id: 5,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 567-8901",
      address: "654 Maple Dr, Seattle, WA 98101",
      cars: [{ model: "Porsche 911", year: 2024, plate: "POR 1234" }],
      totalOrders: 5,
      totalSpent: 2100,
      lastVisit: "2025-09-20",
      memberSince: "2024-06-12",
      status: "inactive",
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // если null — режим "Add", если id — режим "Edit"
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(
    null
  );

  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    status: CustomerStatus;
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

  function getStatusBadge(status: CustomerStatus) {
    switch (status) {
      case "active":
        return (
          <span className="status-badge status-badge--active">Active</span>
        );
      case "vip":
        return <span className="status-badge status-badge--vip">VIP</span>;
      case "inactive":
        return (
          <span className="status-badge status-badge--inactive">Inactive</span>
        );
    }
  }

  function resetForm() {
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    });
    setEditingCustomerId(null);
  }

  function openAddModal() {
    resetForm();
    setShowAddCustomer(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomerId(customer.id);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
    });
    setSelectedCustomer(null);
    setShowAddCustomer(true);
  }

  async function handleSaveCustomer(e: FormEvent) {
    e.preventDefault();
    if (!newCustomer.name.trim()) return;

    try {
      setIsSubmitting(true);

      // === EDIT MODE ===
      if (editingCustomerId !== null) {
        // если есть бэк:
        // await fetch(`/api/customers/${editingCustomerId}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(newCustomer),
        // });

        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCustomerId
              ? {
                  ...c,
                  name: newCustomer.name,
                  email: newCustomer.email,
                  phone: newCustomer.phone,
                  address: newCustomer.address,
                  status: newCustomer.status,
                }
              : c
          )
        );
      } else {
        // === ADD MODE ===
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCustomer),
        });

        let created = null;
        if (res.ok) created = await res.json();

        const newId =
          created?.id ?? (customers[customers.length - 1]?.id ?? 0) + 1;

        const newEntry: Customer = {
          id: newId,
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          status: newCustomer.status,
          cars: [],
          totalOrders: 0,
          totalSpent: 0,
          lastVisit: new Date().toISOString().slice(0, 10),
          memberSince: new Date().toISOString().slice(0, 10),
        };

        setCustomers((prev) => [...prev, newEntry]);
      }

      setShowAddCustomer(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeleteCustomer(id: number) {
    // если есть бэк: await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (selectedCustomer === id) {
      setSelectedCustomer(null);
    }
  }

  function handleViewOrders(customer: Customer) {
    // тут потом можешь сделать router.push(`/admin/orders?customerId=${customer.id}`)
    alert(
      `Here you could show orders for ${customer.name} (id: ${customer.id})`
    );
  }

  return (
    <div className="customers-view">
      {/* Header */}
      <div className="customers-header">
        <div className="customers-header-text">
          <h1 className="customers-title">Customer Management</h1>
          <p className="customers-subtitle">
            Manage and track customer information
          </p>
        </div>

        <Button onClick={openAddModal} className="add-customer-btn-override">
          <Plus className="icon-sm" />
          <span>Add Customer</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="customers-stats-grid">
        <Card className="stats-card">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <Car className="icon-md" />
            </div>
            <div>
              <p className="stats-value">{customers.length}</p>
              <p className="stats-label">Total Customers</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <DollarSign className="icon-md" />
            </div>
            <div>
              <p className="stats-value">
                ${formatMoney(customers.reduce((s, c) => s + c.totalSpent, 0))}
              </p>
              <p className="stats-label">Total Revenue</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <Car className="icon-md" />
            </div>
            <div>
              <p className="stats-value">
                {customers.reduce((s, c) => s + c.cars.length, 0)}
              </p>
              <p className="stats-label">Total Vehicles</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <Calendar className="icon-md" />
            </div>
            <div>
              <p className="stats-value">
                {customers.reduce((s, c) => s + c.totalOrders, 0)}
              </p>
              <p className="stats-label">Total Orders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="search-card">
        <div className="search-card-inner">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </Card>

      {/* Customers list */}
      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-list">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="customer-row"
                onClick={() => setSelectedCustomer(customer.id)}
              >
                <div className="customer-avatar">
                  <span className="customer-avatar-letter">
                    {customer.name.charAt(0)}
                  </span>
                </div>

                <div className="customer-main">
                  <div className="customer-main-header">
                    <h3 className="customer-name">{customer.name}</h3>
                    {getStatusBadge(customer.status)}
                  </div>

                  <div className="customer-meta">
                    <span className="customer-meta-item">
                      <Mail className="icon-xs" />
                      {customer.email}
                    </span>
                    <span className="customer-meta-item">
                      <Phone className="icon-xs" />
                      {customer.phone}
                    </span>
                    <span className="customer-meta-item">
                      <Car className="icon-xs" />
                      {customer.cars.length} vehicle(s)
                    </span>
                  </div>
                </div>

                <div className="customer-total">
                  <p className="customer-total-amount">
                    ${formatMoney(customer.totalSpent)}
                  </p>
                  <p className="customer-total-orders">
                    {customer.totalOrders} orders
                  </p>
                </div>

                <div className="customer-actions">
                  <button
                    className="icon-btn icon-btn--edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(customer);
                    }}
                  >
                    <Edit className="icon-sm" />
                  </button>

                  <button
                    className="icon-btn icon-btn--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustomer(customer.id);
                    }}
                  >
                    <Trash2 className="icon-sm icon-sm--red" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Customer Details Modal */}
      <Dialog
        open={selectedCustomer !== null}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomerData && (
            <div className="dialog-body">
              <div className="dialog-header-block">
                <div className="dialog-avatar">
                  {selectedCustomerData.name.charAt(0)}
                </div>
                <div className="dialog-header-text">
                  <div className="dialog-name-row">
                    <h2 className="dialog-name">{selectedCustomerData.name}</h2>
                    {getStatusBadge(selectedCustomerData.status)}
                  </div>
                  <p className="dialog-member-since">
                    Member since {selectedCustomerData.memberSince}
                  </p>
                </div>
              </div>

              <div className="dialog-grid">
                <div className="dialog-field">
                  <p className="dialog-field-label">Email</p>
                  <p className="dialog-field-value">
                    {selectedCustomerData.email}
                  </p>
                </div>

                <div className="dialog-field">
                  <p className="dialog-field-label">Phone</p>
                  <p className="dialog-field-value">
                    {selectedCustomerData.phone}
                  </p>
                </div>

                <div className="dialog-field dialog-field--full">
                  <p className="dialog-field-label">Address</p>
                  <p className="dialog-field-value">
                    {selectedCustomerData.address}
                  </p>
                </div>
              </div>

              <div className="dialog-divider" />

              <div className="dialog-vehicles">
                <h3 className="dialog-section-title">Vehicles</h3>
                <div className="dialog-vehicles-list">
                  {selectedCustomerData.cars.map((car, idx) => (
                    <div key={idx} className="dialog-vehicle-row">
                      <div className="dialog-vehicle-icon">
                        <Car className="icon-md" />
                      </div>
                      <div className="dialog-vehicle-text">
                        <p className="dialog-vehicle-model">{car.model}</p>
                        <p className="dialog-vehicle-meta">
                          {car.year} • {car.plate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dialog-divider" />

              <div className="dialog-stats-grid">
                <div className="dialog-stat-card">
                  <p className="dialog-stat-value">
                    {selectedCustomerData.totalOrders}
                  </p>
                  <p className="dialog-stat-label">Total Orders</p>
                </div>

                <div className="dialog-stat-card">
                  <p className="dialog-stat-value">
                    ${formatMoney(selectedCustomerData.totalSpent)}
                  </p>
                  <p className="dialog-stat-label">Total Spent</p>
                </div>

                <div className="dialog-stat-card">
                  <p className="dialog-stat-value">
                    {selectedCustomerData.lastVisit}
                  </p>
                  <p className="dialog-stat-label">Last Visit</p>
                </div>
              </div>

              <div className="dialog-actions">
                <Button
                  className="dialog-btn dialog-btn--primary"
                  onClick={() => openEditModal(selectedCustomerData)}
                >
                  Edit Customer
                </Button>
                <Button
                  className="dialog-btn dialog-btn--secondary"
                  onClick={() => handleViewOrders(selectedCustomerData)}
                >
                  View Orders
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Customer Modal */}
      <Dialog
        open={showAddCustomer}
        onOpenChange={(open) => {
          setShowAddCustomer(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              {editingCustomerId ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleSaveCustomer}
          >
            <div className="dialog-form-grid">
              <div className="dialog-form-field">
                <label className="dialog-field-label">Full Name</label>
                <Input
                  placeholder="John Doe"
                  className="dialog-input"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Email</label>
                <Input
                  type="email"
                  placeholder="john@email.com"
                  className="dialog-input"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Phone</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  className="dialog-input"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Status</label>
                <select
                  className="dialog-select"
                  value={newCustomer.status}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      status: e.target.value as CustomerStatus,
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="vip">VIP</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Address</label>
                <Input
                  placeholder="123 Main St"
                  className="dialog-input"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="dialog-actions">
              <Button
                type="submit"
                className="dialog-btn dialog-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingCustomerId
                  ? "Save Changes"
                  : "Add Customer"}
              </Button>

              <Button
                type="button"
                className="dialog-btn dialog-btn--secondary"
                onClick={() => {
                  setShowAddCustomer(false);
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
