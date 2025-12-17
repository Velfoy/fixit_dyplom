"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { User, UserRole } from "@/types/users";
import { UsersTable } from "@/components/tables/UsersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import "@/styles/users.css";

const AVAILABLE_ROLES: UserRole[] = [
  "ADMIN",
  "WAREHOUSE",
  "MECHANIC",
  "CLIENT",
];

type UsersViewProps = {
  session: any;
  dataUsers: User[];
};

const UsersView: React.FC<UsersViewProps> = ({ session, dataUsers }) => {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  const [users, setUsers] = useState<User[]>(dataUsers);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearchQuery);

  // Add-user modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("CLIENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change-role modal state
  const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);
  const [roleDialogValue, setRoleDialogValue] = useState<UserRole>("CLIENT");
  const [isRoleSaving, setIsRoleSaving] = useState(false);

  // Keep local search state in sync with URL query param (?search=)
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const fullName = session?.user?.name || "";
  const firstNameFromSession =
    (session?.user as any)?.firstName ||
    (fullName ? fullName.split(" ")[0] : null);
  const displayName = firstNameFromSession || "User";

  // -------------------------------------------
  // OPEN CHANGE ROLE DIALOG
  // -------------------------------------------
  function handleChangeRole(user: User) {
    setRoleDialogUser(user);
    setRoleDialogValue(user.role as UserRole);
  }

  // -------------------------------------------
  // CONFIRM ROLE CHANGE
  // -------------------------------------------
  async function handleConfirmRoleChange() {
    if (!roleDialogUser) return;

    const user = roleDialogUser;
    const newRole = roleDialogValue;

    if (newRole === user.role) {
      setRoleDialogUser(null);
      return;
    }

    setIsRoleSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Failed to update role");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      setRoleDialogUser(null);
    } catch {
      alert("Network error while updating role");
    } finally {
      setIsRoleSaving(false);
    }
  }

  // -------------------------------------------
  // CREATE USER HANDLER
  // -------------------------------------------
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    if (!newFirstName || !newLastName || !newEmail || !newPassword) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newFirstName,
          last_name: newLastName,
          email: newEmail,
          phone: newPhone || null,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "Failed to create user");
        return;
      }

      setUsers((prev) => [data as User, ...prev]);

      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPhone("");
      setNewPassword("");
      setNewRole("CLIENT");
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }
  //--------------------------------------------
  // DELETE USER HANDLER
  //--------------------------------------------
  async function handleUserDelete(user: User) {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
      return;
    }
  }
  // -------------------------------------------
  // RENDER
  // -------------------------------------------

  return (
    <div
      className="customers-view users-view"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="user-header"
      >
        <div className="customers-header-text">
          <h2 className="customers-title text-xl font-semibold">
            User Management
          </h2>
          <p className="customers-subtitle">
            Manage and track user information
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)}>+ Add User</Button>
      </div>

      {/* Search / Filter Bar */}
      <Card className="search-card">
        <div className="search-card-inner">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name, email or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <UsersTable
        users={users.filter((u) => {
          const q = (searchQuery || "").toLowerCase();
          if (!q) return true;
          const name = `${u.first_name || ""} ${u.last_name || ""}`;
          const email = u.email || "";
          const phone = u.phone || "";
          return (
            name.toLowerCase().includes(q) ||
            email.toLowerCase().includes(q) ||
            phone.toLowerCase().includes(q)
          );
        })}
        onClickDeleteUser={handleUserDelete}
        onChangeRole={handleChangeRole}
      />

      {/* Add User Modal */}
      {isAddOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border-subtle)",
              padding: "24px",
              width: "100%",
              maxWidth: 420,
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: 12,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Add New User
            </h3>

            <form
              onSubmit={handleCreateUser}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <Input
                placeholder="First name"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
              <Input
                placeholder="Last name"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Input
                type="tel"
                placeholder="Phone (optional)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <label
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="base-input"
                style={{ height: 40 }}
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleDialogUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border-subtle)",
              padding: "24px",
              width: "100%",
              maxWidth: 380,
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Change Role
            </h3>
            <p
              style={{
                margin: 0,
                marginBottom: 16,
                fontSize: 14,
                color: "var(--text-muted)",
              }}
            >
              {roleDialogUser.first_name} {roleDialogUser.last_name}
            </p>

            <label
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 4,
                display: "block",
              }}
            >
              Select new role
            </label>
            <select
              value={roleDialogValue}
              onChange={(e) => setRoleDialogValue(e.target.value as UserRole)}
              className="base-input"
              style={{ height: 40, marginBottom: 16 }}
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Button
                variant="outline"
                type="button"
                onClick={() => setRoleDialogUser(null)}
                disabled={isRoleSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isRoleSaving}
              >
                {isRoleSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
