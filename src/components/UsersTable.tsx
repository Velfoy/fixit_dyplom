"use client";

import React from "react";
import type { User, UserRole } from "@/types/users";
import { Table, type ColumnDef } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type UsersTableProps = {
  users: User[];
  onChangeRole?: (user: User) => void;
  className?: string;
};

export function UsersTable({
  users,
  onChangeRole,
  className,
}: UsersTableProps) {
  const columns: ColumnDef<User>[] = [
    {
      key: "name",
      header: "Name",
      className: "table-cell--truncate",
      render: (user) => `${user.first_name} ${user.last_name}`.trim() || "—",
    },
    {
      key: "email",
      header: "Email",
      className: "table-cell--truncate",
      render: (user) => user.email,
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => user.phone || "—",
    },
    {
      key: "role",
      header: "Role",
      render: (user) => user.role.toLowerCase(),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (user) => {
        const raw = (user as any).created_at ?? (user as any).createdAt ?? null;
        if (!raw) return "—";
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return String(raw);
        return d.toLocaleString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "table-cell--actions",
      render: (user) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChangeRole?.(user)}
        >
          Edit role
        </Button>
      ),
    },
  ];

  return (
    <Table
      data={users}
      columns={columns}
      pageSize={15}
      getRowKey={(u) => u.id}
      className={className}
    />
  );
}
