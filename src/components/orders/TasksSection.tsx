"use client";

import { Order, StatusServiceOrder } from "@/types/serviceorders";
import { Card } from "../ui/card";
import { Mail, Pencil, Plus, Trash, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "@/styles/order-components.css";

interface TasksSectionProps {
  serviceOrder: Order | null;
  session: any;
  isTerminalStatus: (status?: string) => boolean;
  statusMap: Record<StatusServiceOrder, string>;
  onAddTask: () => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (task: any) => void;
  onOpenComments: (task: any) => void;
}

export function TasksSection({
  serviceOrder,
  session,
  isTerminalStatus,
  statusMap,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onOpenComments,
}: TasksSectionProps) {
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  useEffect(() => {
    const heights = taskRefs.current.map((ref) => {
      if (!ref) return 20;
      const h = ref.getBoundingClientRect().height;
      return h > 0 ? h : 20;
    });
    setLineHeights(heights);
  }, [serviceOrder?.task]);

  return (
    <Card className="customers-list-card">
      <div className="customers-list-inner">
        <div className="customers-header tasks-header">
          <span>Order Status Timeline / Tasks</span>
          <div className="left_order">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isTerminalStatus(serviceOrder?.status)) onAddTask();
              }}
              className={`edit-button_order ${
                isTerminalStatus(serviceOrder?.status) ? "disabled" : ""
              }`}
              disabled={isTerminalStatus(serviceOrder?.status)}
            >
              <Plus className="icon-xxx" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
        <Card className="customers-list">
          {(serviceOrder?.task || []).map((task, index) => {
            const statusClass =
              statusMap[task.status as StatusServiceOrder] || "grafic-unknown";

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
                  {index !== (serviceOrder?.task?.length || 0) - 1 && (
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
                    <h3 className="customer-name">{task.title}</h3>
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
                      <strong className="task-description-text">
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
                {isTerminalStatus(serviceOrder?.status) ? null : (
                  <div className="customer-actions">
                    {session?.user?.role === "ADMIN" && (
                      <button
                        className="icon-btn icon-btn--edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComments(task);
                        }}
                        title="View Comments"
                      >
                        <Mail className="icon-xxx" />
                      </button>
                    )}
                    <button
                      className="icon-btn icon-btn--edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isTerminalStatus(serviceOrder?.status))
                          onEditTask(task);
                      }}
                      disabled={isTerminalStatus(serviceOrder?.status)}
                    >
                      <Pencil className="icon-xxx" />
                    </button>
                    <button
                      className="icon-btn icon-btn--edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isTerminalStatus(serviceOrder?.status))
                          onDeleteTask(task);
                      }}
                      disabled={isTerminalStatus(serviceOrder?.status)}
                    >
                      <Trash className="icon-xxx" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </Card>
  );
}
