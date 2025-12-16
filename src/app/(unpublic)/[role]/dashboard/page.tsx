"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Users,
  Package,
  ClipboardList,
  DollarSign,
  Wrench,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import "@/styles/dashboard.css";

interface DashboardStats {
  // Admin stats
  totalUsers?: number;
  totalCustomers?: number;
  totalMechanics?: number;
  totalOrders?: number;
  inProgressOrders?: number;
  newOrders?: number;
  waitingOrders?: number;
  readyOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  pendingOrders?: number;
  totalParts?: number;
  totalPartsQuantity?: number;
  // Client stats
  myCars?: number;
  // Warehouse stats
  lowStock?: number;
  recentOrders?: number;
  totalQuantity?: number;
  // Mechanic stats
  assignedOrders?: number;
  blockedOrders?: number;
  statusBreakdown?: { status: string; label: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const totalOrders = stats?.totalOrders ?? 0;
  const newOrders = stats?.newOrders ?? 0;
  const inProgressOrders = stats?.inProgressOrders ?? 0;
  const waitingOrders = stats?.waitingOrders ?? 0;
  const readyOrders = stats?.readyOrders ?? 0;
  const completedOrders = stats?.completedOrders ?? 0;
  const cancelledOrders = stats?.cancelledOrders ?? 0;
  const statusBreakdown = stats?.statusBreakdown ?? [];
  const breakdownTotal = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
  const completionRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const progressRate =
    totalOrders > 0
      ? Math.round(
          ((completedOrders + readyOrders + inProgressOrders) / totalOrders) *
            100
        )
      : 0;

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRole(data.role);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p className="dashboard-loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard — {role?.toUpperCase()}</h1>
      </div>

      <div className="dashboard-summary">
        <p className="summary-text">
          Quick glance at your workspace: live counts, status breakdowns, and a
          short overview of what matters most today. Use the cards below to jump
          to the areas that need action.
        </p>
        <div className="highlight-grid">
          <div className="highlight-card">
            <p className="highlight-title">Workload Snapshot</p>
            <p className="highlight-desc">
              New {newOrders} • In progress {inProgressOrders} • Waiting{" "}
              {waitingOrders} • Ready {readyOrders} • Completed{" "}
              {completedOrders} • Cancelled {cancelledOrders}
            </p>
          </div>
          <div className="highlight-card">
            <p className="highlight-title">Completion Rate</p>
            <p className="highlight-desc">
              {completionRate}% of tracked work is fully done.
            </p>
          </div>
          <div className="highlight-card">
            <p className="highlight-title">Next Steps</p>
            <p className="highlight-desc">
              Review pending items and keep in-progress tasks moving to maintain
              throughput.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Dashboard */}
      {role === "admin" && stats && (
        <div>
          <div className="chart-grid" style={{ marginTop: 0 }}>
            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-title">Order Progress</p>
                <p className="chart-kpi">{progressRate}% on track</p>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressRate}%` }}
                />
              </div>
              <p className="chart-circle-desc compact">
                Tracks live throughput: ready + completed vs all active orders.
              </p>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <p className="chart-title">Completion</p>
                <p className="chart-kpi">{completionRate}%</p>
              </div>
              <div className="chart-circle-wrap">
                <div
                  className="chart-circle"
                  style={{
                    background: `radial-gradient(circle at center, var(--bg-card) 55%, transparent 56%), conic-gradient(#ad0404 0deg, #ad0404 ${
                      completionRate * 3.6
                    }deg, #1f2933 ${completionRate * 3.6}deg 360deg)`,
                  }}
                >
                  <span className="chart-circle-label">{completionRate}%</span>
                </div>
                <p className="chart-circle-desc">
                  Shows the share of completed orders out of total tracked
                  orders.
                </p>
              </div>
            </div>
          </div>

          {statusBreakdown.length > 0 && (
            <div className="status-breakdown">
              {statusBreakdown.map((item) => {
                const width =
                  breakdownTotal > 0
                    ? Math.round((item.count / breakdownTotal) * 100)
                    : 0;
                return (
                  <div className="status-row" key={item.status}>
                    <div className="status-meta">
                      <span className="status-label">{item.label}</span>
                      <span className="status-count">{item.count}</span>
                    </div>
                    <div className="status-bar">
                      <div
                        className="status-bar-fill"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="dashboard-stats-grid cols-4">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              title="Total Users"
              value={stats.totalUsers}
              color="accent-blue"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              title="Customers"
              value={stats.totalCustomers}
              color="accent-green"
            />
            <StatCard
              icon={<Wrench className="w-8 h-8" />}
              title="Mechanics"
              value={stats.totalMechanics}
              color="accent-orange"
            />
            <StatCard
              icon={<ClipboardList className="w-8 h-8" />}
              title="Total Orders"
              value={stats.totalOrders}
              color="accent-red"
            />
          </div>

          <div className="dashboard-stats-grid cols-2">
            <StatCard
              icon={<Package className="w-8 h-8" />}
              title="Parts in Inventory"
              value={stats.totalParts}
              subtitle={`Total quantity: ${stats.totalPartsQuantity}`}
              color="accent-purple"
            />
            <StatCard
              icon={<DollarSign className="w-8 h-8" />}
              title="System Health"
              value="Operational"
              subtitle="All services running"
              color="accent-green"
              isText
            />
          </div>
        </div>
      )}

      {/* Client Dashboard */}
      {role === "client" && stats && (
        <div>
          <div className="dashboard-stats-grid cols-4">
            <StatCard
              icon={<Car className="w-8 h-8" />}
              title="My Cars"
              value={stats.myCars}
              color="accent-blue"
            />
            <StatCard
              icon={<ClipboardList className="w-8 h-8" />}
              title="Total Orders"
              value={stats.totalOrders}
              color="accent-red"
            />
          </div>

          <div className="dashboard-stats-grid cols-3">
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="In Progress"
              value={stats.inProgressOrders}
              color="accent-blue"
              small
            />
            <StatCard
              icon={<ClipboardList className="w-6 h-6" />}
              title="Completed Orders"
              value={stats.completedOrders}
              color="accent-green"
              small
            />
            <StatCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Cancelled"
              value={stats.cancelledOrders}
              color="accent-rose"
              small
            />
          </div>
        </div>
      )}

      {/* Mechanic Dashboard */}
      {role === "mechanic" && stats && (
        <div>
          <div className="dashboard-stats-grid cols-3">
            <StatCard
              icon={<Wrench className="w-8 h-8" />}
              title="Assigned Tasks"
              value={stats.assignedOrders}
              color="accent-red"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="In Progress"
              value={stats.inProgressOrders}
              color="accent-blue"
            />
            <StatCard
              icon={<ClipboardList className="w-8 h-8" />}
              title="Completed"
              value={stats.completedOrders}
              color="accent-green"
            />
            <StatCard
              icon={<AlertTriangle className="w-8 h-8" />}
              title="Blocked"
              value={stats.blockedOrders}
              color="accent-rose"
            />
          </div>

          <div className="info-card">
            <h2 className="info-card-title">Quick Info</h2>
            <p className="info-card-text">
              View your assigned tasks in the Orders section. Complete pending
              tasks to improve efficiency.
            </p>
          </div>
        </div>
      )}

      {/* Warehouse Dashboard */}
      {role === "warehouse" && stats && (
        <div>
          <div className="dashboard-stats-grid cols-4">
            <StatCard
              icon={<Package className="w-8 h-8" />}
              title="Total Parts"
              value={stats.totalParts}
              color="accent-purple"
            />
            <StatCard
              icon={<AlertTriangle className="w-8 h-8" />}
              title="Low Stock Alert"
              value={stats.lowStock}
              color="accent-rose"
            />
            <StatCard
              icon={<ClipboardList className="w-8 h-8" />}
              title="Recent Orders (7d)"
              value={stats.recentOrders}
              color="accent-blue"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Total Quantity"
              value={stats.totalQuantity}
              color="accent-green"
            />
          </div>

          <div className="info-card">
            <h2 className="info-card-title">Inventory Management</h2>
            <p className="info-card-text">
              Monitor your inventory levels and restock items with low quantity.
              Check the Warehouse section for detailed part management.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string | undefined;
  subtitle?: string;
  color: string;
  small?: boolean;
  isText?: boolean;
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
  small,
  isText,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <div className={color}>{icon}</div>
      </div>
      <h3 className="stat-card-title">{title}</h3>
      <p className={`stat-card-value ${small ? "small" : ""}`}>{value ?? 0}</p>
      {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
    </div>
  );
}
