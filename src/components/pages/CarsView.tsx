"use client";

import { useState, useEffect, FormEvent } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Search,
  Plus,
  Edit,
  Calendar,
  Car as CarIcon,
  Trash,
} from "lucide-react";

import "../../styles/users.css";
import type { Car, FuelType, Transmission, StatusCar } from "@/types/car";

const fuelTypes: FuelType[] = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"];
const transmissions: Transmission[] = ["AUTOMATIC", "MANUAL"];
const carStatuses: StatusCar[] = [
  "NEW",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const formatDate = (date?: string | Date | null) => {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString();
};

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface CarsViewProps {
  session: any;
  dataCars: Car[];
  branches: { id: number; name: string }[];
  customers: Customer[];
}

export default function CarsView({
  session,
  dataCars,
  branches,
  customers,
}: CarsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cars, setCars] = useState<Car[]>(dataCars);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [showAddCar, setShowAddCar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);

  const [newCar, setNewCar] = useState<Partial<Car> & { customerId?: number }>({
    first_name: "",
    last_name: "",
    brand: "",
    model: "",
    year: undefined,
    vin: "",
    license_plate: "",
    mileage: undefined,
    fuel_type: undefined,
    engine_size: "",
    transmission: undefined,
    body_type: "",
    color: "",
    last_service: null,
    next_service: null,
    service_interval_km: undefined,
    next_inspection: null,
    insurance_expiry: null,
    status: "NEW",
    branchId: null,
    branchName: "",
    customerId: undefined,
  });

  useEffect(() => {
    setCars(dataCars);
  }, [dataCars]);

  const filteredCars = cars.filter((car) =>
    [car.brand, car.model, car.vin, car.license_plate].some((v) =>
      v?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const selectedCar = cars.find((c) => c.id === selectedCarId);

  const totalCars = cars.length;
  const carsInRepair = cars.filter(
    (c) => c.status === "IN_PROGRESS" || c.status === "WAITING_FOR_PARTS"
  ).length;
  const nextServiceDue = cars
    .filter((c) => c.next_service)
    .sort(
      (a, b) =>
        new Date(a.next_service!).getTime() -
        new Date(b.next_service!).getTime()
    )[0];

  function resetForm() {
    setNewCar({
      first_name: "",
      last_name: "",
      brand: "",
      model: "",
      year: undefined,
      vin: "",
      license_plate: "",
      mileage: undefined,
      fuel_type: undefined,
      engine_size: "",
      transmission: undefined,
      body_type: "",
      color: "",
      last_service: null,
      next_service: null,
      service_interval_km: undefined,
      next_inspection: null,
      insurance_expiry: null,
      status: "NEW",
      branchId: null,
      branchName: "",
      customerId: undefined,
    });
    setEditingCarId(null);
  }

  function openAddModal() {
    resetForm();
    setSelectedCarId(null);
    setShowAddCar(true);
  }

  // When opening the edit modal
  function openEditModal(car: Car) {
    setEditingCarId(car.id);
    setNewCar({
      ...car,
      year: car.year ?? undefined,
      mileage: car.mileage ?? undefined,
      service_interval_km: car.service_interval_km ?? undefined,
      customerId: car.customerId ?? undefined, // keep the selected customer
    });
    setSelectedCarId(null);
    setShowAddCar(true);
  }

  async function handleDeleteCar(carId: number) {
    if (!confirm("Are you sure you want to delete this car?")) return;
    try {
      const res = await fetch(`/api/cars?id=${carId}`, { method: "DELETE" });
      if (res.ok) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
        if (selectedCarId === carId) setSelectedCarId(null);
      } else {
        alert("Failed to delete car.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting car.");
    }
  }

  async function handleSaveCar(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newCar.customerId) {
        alert("Please select a customer for the car owner");
        setIsSubmitting(false);
        return;
      }

      if (editingCarId !== null) {
        const res = await fetch("/api/cars", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCarId, ...newCar }),
        });

        if (res.ok) {
          const updatedCar: Car = await res.json();
          setCars((prev) =>
            prev.map((c) => (c.id === editingCarId ? updatedCar : c))
          );
        } else {
          const error = await res.json();
          alert(`Failed to update car: ${error.error}`);
        }
      } else {
        const res = await fetch("/api/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCar),
        });

        if (res.ok) {
          const created: Car = await res.json();
          setCars((prev) => [...prev, created]);
        } else {
          const error = await res.json();
          alert(`Failed to create car: ${error.error}`);
        }
      }
      setShowAddCar(false);
      resetForm();
    } catch (error) {
      console.error("Error saving car:", error);
      alert("An error occurred while saving the car");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="customers-view">
      {/* Header */}
      <div className="customers-header">
        <div className="customers-header-text">
          <h1 className="customers-title">Car Management</h1>
          <p className="customers-subtitle">Manage and track car information</p>
        </div>
        <Button onClick={openAddModal} className="add-customer-btn-override">
          <Plus className="icon-sm" />
          <span>Add Car</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="parts-stats-grid ">
        <Card className="stats-card">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <CarIcon className="icon-md" />
            </div>
            <div>
              <p className="stats-value">{totalCars}</p>
              <p className="stats-label">Total Cars</p>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="stats-card-inner">
            <div className="stats-icon">
              <CarIcon className="icon-md" />
            </div>
            <div>
              <p className="stats-value">{carsInRepair}</p>
              <p className="stats-label">Cars In Repair</p>
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
                {nextServiceDue ? formatDate(nextServiceDue.next_service) : "-"}
              </p>
              <p className="stats-label">Next Service Due</p>
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
              placeholder="Search by brand, model, VIN, or license plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </Card>

      {/* Car List */}
      <Card className="customers-list-card">
        <div className="customers-list-inner">
          <div className="customers-list">
            {filteredCars.map((car) => (
              <div key={car.id} className="customer-row">
                <div
                  className="customer-avatar"
                  onClick={() => setSelectedCarId(car.id)}
                >
                  <span className="customer-avatar-letter">
                    {car.brand?.charAt(0)}
                  </span>
                </div>
                <div
                  className="customer-main"
                  onClick={() => setSelectedCarId(car.id)}
                >
                  <div className="customer-main-header">
                    <h3 className="customer-name">
                      {car.brand} {car.model} ({car.year || "-"})
                    </h3>
                  </div>
                  <div className="customer-meta">
                    <span className="customer-meta-item">
                      VIN: {car.vin || "-"}
                    </span>
                    <span className="customer-meta-item">
                      License: {car.license_plate || "-"}
                    </span>
                    <span className="customer-meta-item">
                      Latest order status: {car.status}
                    </span>
                  </div>
                </div>
                <div className="customer-actions">
                  <button
                    className="icon-btn icon-btn--edit"
                    onClick={() => openEditModal(car)}
                  >
                    <Edit className="icon-sm" />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    onClick={() => handleDeleteCar(car.id)}
                  >
                    <Trash className="icon-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Car Details Dialog */}
      <Dialog
        open={selectedCarId !== null}
        onOpenChange={(open) => !open && setSelectedCarId(null)}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">Car Details</DialogTitle>
          </DialogHeader>

          {selectedCar && (
            <div className="dialog-body">
              <div className="dialog-header-block">
                <div className="dialog-avatar">
                  {selectedCar.brand?.charAt(0)}
                </div>
                <div className="dialog-header-text">
                  <h2 className="dialog-name">
                    {selectedCar.brand} {selectedCar.model}
                  </h2>
                  <p>
                    VIN: {selectedCar.vin || "-"} | License:{" "}
                    {selectedCar.license_plate || "-"}
                  </p>
                </div>
              </div>

              {/* In Car Details dialog */}
              <div className="dialog-grid">
                {[
                  [
                    "Owner",
                    selectedCar.customerId
                      ? `${
                          customers.find((c) => c.id === selectedCar.customerId)
                            ?.first_name || ""
                        } ${
                          customers.find((c) => c.id === selectedCar.customerId)
                            ?.last_name || ""
                        }`
                      : "-",
                  ],
                  ["Year", selectedCar.year],
                  ["Mileage", selectedCar.mileage],
                  ["Fuel Type", selectedCar.fuel_type],
                  ["Transmission", selectedCar.transmission],
                  ["Latest order status", selectedCar.status],
                  ["Branch", selectedCar.branchName],
                  ["Engine Size", selectedCar.engine_size],
                  ["Body Type", selectedCar.body_type],
                  ["Color", selectedCar.color],
                  ["Last Service", selectedCar.last_service?.toString()],
                  ["Next Service", selectedCar.next_service?.toString()],
                  ["Next Inspection", selectedCar.next_inspection?.toString()],
                  [
                    "Insurance Expiry",
                    selectedCar.insurance_expiry?.toString(),
                  ],
                  ["Service Interval (km)", selectedCar.service_interval_km],
                ].map(([label, value]) => (
                  <div key={label as string} className="dialog-field">
                    <p className="dialog-field-label">{label}</p>
                    <p className="dialog-field-value">{value || "-"}</p>
                  </div>
                ))}
              </div>

              <div className="dialog-actions">
                <Button
                  className="dialog-btn dialog-btn--primary"
                  onClick={() => openEditModal(selectedCar)}
                >
                  Edit Car
                </Button>
                <Button
                  className="dialog-btn dialog-btn--danger"
                  onClick={() => handleDeleteCar(selectedCar.id)}
                >
                  Delete Car
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Car Dialog */}
      <Dialog
        open={showAddCar}
        onOpenChange={(open) => {
          setShowAddCar(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              {editingCarId ? "Edit Car" : "Add New Car"}
            </DialogTitle>
          </DialogHeader>

          <form
            className="dialog-body dialog-body--form"
            onSubmit={handleSaveCar}
          >
            <div className="dialog-form-grid">
              {/* Customer Select */}
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Car Owner *</label>
                <select
                  className="dialog-input"
                  value={newCar.customerId || ""}
                  onChange={(e) => {
                    const customerId = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setNewCar((prev) => ({ ...prev, customerId }));
                  }}
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.first_name} ${c.last_name} (${c.email})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand, Model, VIN, License */}
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Brand *</label>
                <Input
                  className="dialog-input"
                  value={newCar.brand || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Model *</label>
                <Input
                  className="dialog-input"
                  value={newCar.model || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({ ...prev, model: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">VIN *</label>
                <Input
                  className="dialog-input"
                  value={newCar.vin || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({ ...prev, vin: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">License Plate</label>
                <Input
                  className="dialog-input"
                  value={newCar.license_plate || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      license_plate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Branch */}
              <div className="dialog-form-field dialog-field--full">
                <label className="dialog-field-label">Branch</label>
                <select
                  className="dialog-input"
                  value={newCar.branchId || ""}
                  onChange={(e) => {
                    const branchId = e.target.value
                      ? Number(e.target.value)
                      : null;
                    const branch = branches.find((b) => b.id === branchId);
                    setNewCar((prev) => ({
                      ...prev,
                      branchId,
                      branchName: branch?.name || "",
                    }));
                  }}
                >
                  <option value="">-- Select Branch --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel, Transmission, Year, Mileage */}
              <div className="dialog-form-field">
                <label className="dialog-field-label">Fuel Type</label>
                <select
                  className="dialog-input"
                  value={newCar.fuel_type || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      fuel_type: e.target.value as FuelType,
                    }))
                  }
                >
                  <option value="">-- Select Fuel --</option>
                  {fuelTypes.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Transmission</label>
                <select
                  className="dialog-input"
                  value={newCar.transmission || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      transmission: e.target.value as Transmission,
                    }))
                  }
                >
                  <option value="">-- Select Transmission --</option>
                  {transmissions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Year</label>
                <Input
                  type="number"
                  className="dialog-input"
                  value={newCar.year || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      year: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Mileage</label>
                <Input
                  type="number"
                  className="dialog-input"
                  value={newCar.mileage || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      mileage: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {/* Status */}
              <div className="dialog-form-field">
                <label className="dialog-field-label">
                  Latest order status
                </label>
                <select
                  className="dialog-input"
                  value={newCar.status || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      status: e.target.value as StatusCar,
                    }))
                  }
                >
                  {carStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color, Engine, Body */}
              <div className="dialog-form-field">
                <label className="dialog-field-label">Color</label>
                <Input
                  className="dialog-input"
                  value={newCar.color || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Engine Size</label>
                <Input
                  className="dialog-input"
                  value={newCar.engine_size || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      engine_size: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Body Type</label>
                <Input
                  className="dialog-input"
                  value={newCar.body_type || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      body_type: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="dialog-form-field">
                <label className="dialog-field-label">Last Service</label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={newCar.last_service?.toString().slice(0, 10) || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      last_service: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Next Service</label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={newCar.next_service?.toString().slice(0, 10) || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      next_service: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Next Inspection</label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={newCar.next_inspection?.toString().slice(0, 10) || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      next_inspection: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="dialog-form-field">
                <label className="dialog-field-label">Insurance Expiry</label>
                <Input
                  type="date"
                  className="dialog-input"
                  value={newCar.insurance_expiry?.toString().slice(0, 10) || ""}
                  onChange={(e) =>
                    setNewCar((prev) => ({
                      ...prev,
                      insurance_expiry: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="dialog-form-field">
              <label className="dialog-field-label">
                Service Interval (km)
              </label>
              <Input
                type="number"
                className="dialog-input"
                value={newCar.service_interval_km || ""}
                onChange={(e) =>
                  setNewCar((prev) => ({
                    ...prev,
                    service_interval_km: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="dialog-actions">
              <Button
                type="submit"
                className="dialog-btn dialog-btn--primary"
                disabled={isSubmitting}
              >
                {editingCarId ? "Update Car" : "Add Car"}
              </Button>
              <Button
                type="button"
                className="dialog-btn dialog-btn--secondary"
                onClick={() => setShowAddCar(false)}
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
