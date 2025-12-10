"use client";

import { Order } from "@/types/serviceorders";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Table, type ColumnDef } from "../ui/table";
import { Plus } from "lucide-react";
import "@/styles/order-components.css";

interface WarehousePartsSectionProps {
  serviceOrder: Order | null;
  session: any;
  orderParts: any[];
  loadingParts: boolean;
  isSubmitting: boolean;
  isTerminalStatus: (status?: string) => boolean;
  toNumber: (val: any) => number;
  onAddPart: () => void;
  onToggleDeduct: (partId: number, currentValue: boolean) => void;
  onDeletePart: (partId: number) => void;
  onDeductFromWarehouse: () => void;
}

export function WarehousePartsSection({
  serviceOrder,
  session,
  orderParts,
  loadingParts,
  isSubmitting,
  isTerminalStatus,
  toNumber,
  onAddPart,
  onToggleDeduct,
  onDeletePart,
  onDeductFromWarehouse,
}: WarehousePartsSectionProps) {
  const columns: ColumnDef<any>[] = [
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
        const price = part.priceAtTime || part.price_at_time || 0;
        const qty = part.quantity || 1;
        return `$${(toNumber(price) / toNumber(qty)).toFixed(2)}`;
      },
    },
    {
      key: "total",
      header: "Total",
      render: (part: any) => {
        const price = part.priceAtTime || part.price_at_time || 0;
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
          onChange={() => onToggleDeduct(part.id, part.deductFromWarehouse)}
          disabled={isTerminalStatus(serviceOrder?.status)}
        />
      ),
    },
    {
      key: "deducted",
      header: "Deducted",
      render: (part: any) => (part.warehouseDeductedAt ? "✓" : "-"),
    },
    {
      key: "action",
      header: "Action",
      render: (part: any) => (
        <Button
          onClick={() => onDeletePart(part.id)}
          className="edit-button_trans parts-delete-btn"
          disabled={isTerminalStatus(serviceOrder?.status) || loadingParts}
        >
          Delete
        </Button>
      ),
    },
  ];

  const partsTotal = orderParts.reduce((sum, part) => {
    const price = part.priceAtTime || part.price_at_time || 0;
    return sum + toNumber(price);
  }, 0);

  const includedTotal = orderParts
    .filter((p) => p.deductFromWarehouse)
    .reduce((sum, part) => {
      const price = part.priceAtTime || part.price_at_time || 0;
      return sum + toNumber(price);
    }, 0);

  const hasUndeductedParts = orderParts.some(
    (p) => p.deductFromWarehouse && !p.warehouseDeductedAt
  );

  return (
    <Card className="customers-list-card">
      <div className="customers-list-inner">
        <div className="customers-header ml-5">
          <span>Warehouse Parts Used</span>
          {(session?.user?.role === "ADMIN" ||
            session?.user?.role === "MECHANIC") &&
            !isTerminalStatus(serviceOrder?.status) && (
              <div className="transaction-details-header">
                <div className="transaction-actions">
                  <Button onClick={onAddPart} className="edit-button_trans">
                    <Plus className="icon-xxx" />
                    <span>Add Part</span>
                  </Button>
                </div>
              </div>
            )}
        </div>

        <div className="parts-section-padding">
          {loadingParts ? (
            <div className="parts-loading text-center p-20">
              Loading parts...
            </div>
          ) : orderParts.length === 0 ? (
            <div className="parts-empty text-center p-20">
              No warehouse parts assigned yet
            </div>
          ) : (
            <>
              <Table
                data={orderParts}
                columns={columns}
                pageSize={10}
                getRowKey={(part) => part.id}
              />

              {/* Parts Total Summary */}
              <div className="parts-summary">
                <div className="parts-summary-row">
                  <span>Parts Total (All):</span>
                  <span>${partsTotal.toFixed(2)}</span>
                </div>

                <div className="parts-summary-row">
                  <span>Parts Included in Order Total:</span>
                  <span>${includedTotal.toFixed(2)}</span>
                </div>

                {/* Deduct from Warehouse Button */}
                {hasUndeductedParts && (
                  <Button
                    onClick={onDeductFromWarehouse}
                    className="transaction-pay-now-btn parts-deduct-btn"
                    disabled={
                      isTerminalStatus(serviceOrder?.status) ||
                      isSubmitting ||
                      !hasUndeductedParts
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
  );
}
