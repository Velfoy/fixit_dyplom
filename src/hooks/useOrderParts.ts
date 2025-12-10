import { useState, useCallback } from "react";
import { Order } from "@/types/serviceorders";

export function useOrderParts(serviceOrder: Order | null) {
  const [orderParts, setOrderParts] = useState<any[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [includeInTotal, setIncludeInTotal] = useState<boolean>(false);
  const [partsSearchTerm, setPartsSearchTerm] = useState<string>("");
  const [loadingAvailableParts, setLoadingAvailableParts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    return parseFloat(val.toString());
  };

  const transformOrder = useCallback(
    (apiOrder: any): Order => {
      return {
        id: apiOrder.id,
        orderNumber: apiOrder.order_number,
        carBrand: apiOrder.vehicle?.brand || serviceOrder?.carBrand || "",
        carModel: apiOrder.vehicle?.model || serviceOrder?.carModel || "",
        carYear:
          apiOrder.vehicle?.year?.toString() || serviceOrder?.carYear || "",
        carLicensePlate:
          apiOrder.vehicle?.license_plate ||
          serviceOrder?.carLicensePlate ||
          "",
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
    },
    [serviceOrder]
  );

  const fetchOrderParts = useCallback(async () => {
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
  }, [serviceOrder?.id]);

  const searchWarehouseParts = useCallback(async () => {
    if (!partsSearchTerm.trim()) {
      setAvailableParts([]);
      return;
    }

    setLoadingAvailableParts(true);
    try {
      const res = await fetch(
        `/api/warehouse/parts?search=${encodeURIComponent(partsSearchTerm)}`
      );
      if (!res.ok) throw new Error("Failed to search parts");
      const parts = await res.json();
      setAvailableParts(parts);
    } catch (err) {
      console.error("Error searching parts:", err);
      alert("Failed to search warehouse parts");
      setAvailableParts([]);
    } finally {
      setLoadingAvailableParts(false);
    }
  }, [partsSearchTerm]);

  const handleAddPart = useCallback(
    async (onOrderUpdate: (order: Order) => void) => {
      if (!serviceOrder || !selectedPart) return;

      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/orders/${serviceOrder.id}/parts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partId: selectedPart.id,
            quantity: partQuantity,
            deductFromWarehouse: includeInTotal,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to add part");
        }

        const response = await res.json();
        const updatedOrder = transformOrder(response.order);
        onOrderUpdate(updatedOrder);

        await fetchOrderParts();
        setShowAddPart(false);
        setSelectedPart(null);
        setPartQuantity(1);
        setIncludeInTotal(false);
        setPartsSearchTerm("");
        setAvailableParts([]);
        alert("Part added successfully!");
      } catch (err: any) {
        console.error("Error adding part:", err);
        alert(`Failed to add part: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      serviceOrder,
      selectedPart,
      partQuantity,
      includeInTotal,
      transformOrder,
      fetchOrderParts,
    ]
  );

  const handleToggleDeduct = useCallback(
    async (
      partId: number,
      currentValue: boolean,
      onOrderUpdate: (order: Order) => void
    ) => {
      if (!serviceOrder) return;

      setIsSubmitting(true);
      try {
        const res = await fetch(
          `/api/orders/${serviceOrder.id}/parts/${partId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deductFromWarehouse: !currentValue }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update part");
        }

        const response = await res.json();
        const updatedOrder = transformOrder(response.order);
        onOrderUpdate(updatedOrder);

        setOrderParts((prev) =>
          prev.map((p) =>
            p.id === partId ? { ...p, deductFromWarehouse: !currentValue } : p
          )
        );
      } catch (err: any) {
        console.error("Error updating part:", err);
        alert(`Failed to update part: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [serviceOrder, transformOrder]
  );

  const handleDeletePart = useCallback(
    async (partId: number, onOrderUpdate: (order: Order) => void) => {
      if (!serviceOrder) return;
      if (!confirm("Are you sure you want to remove this part?")) return;

      setIsSubmitting(true);
      try {
        const res = await fetch(
          `/api/orders/${serviceOrder.id}/parts/${partId}`,
          {
            method: "DELETE",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete part");
        }

        const response = await res.json();
        const updatedOrder = transformOrder(response.order);
        onOrderUpdate(updatedOrder);

        setOrderParts((prev) => prev.filter((p) => p.id !== partId));
        alert("Part removed successfully!");
      } catch (err: any) {
        console.error("Error deleting part:", err);
        alert(`Failed to delete part: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [serviceOrder, transformOrder]
  );

  const handleDeductPartsFromWarehouse = useCallback(async () => {
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
  }, [serviceOrder]);

  return {
    orderParts,
    setOrderParts,
    loadingParts,
    showAddPart,
    setShowAddPart,
    availableParts,
    selectedPart,
    setSelectedPart,
    partQuantity,
    setPartQuantity,
    includeInTotal,
    setIncludeInTotal,
    partsSearchTerm,
    setPartsSearchTerm,
    loadingAvailableParts,
    isSubmitting,
    toNumber,
    transformOrder,
    fetchOrderParts,
    searchWarehouseParts,
    handleAddPart,
    handleToggleDeduct,
    handleDeletePart,
    handleDeductPartsFromWarehouse,
  };
}
