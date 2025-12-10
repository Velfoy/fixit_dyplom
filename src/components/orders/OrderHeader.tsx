// "use client";

// import { Order, StatusServiceOrder } from "@/types/serviceorders";
// import { ArrowLeft, Edit } from "lucide-react";
// import { useRouter } from "next/navigation";
// import "@/styles/order-components.css";

// interface OrderHeaderProps {
//   serviceOrder: Order | null;
//   onEdit: () => void;
//   onStatusChange: () => void;
//   isTerminalStatus: (status?: string) => boolean;
//   STATUS_MAP: Record<StatusServiceOrder, { label: string; className: string }>;
// }

// export function OrderHeader({
//   serviceOrder,
//   onEdit,
//   onStatusChange,
//   isTerminalStatus,
//   STATUS_MAP,
// }: OrderHeaderProps) {
//   const router = useRouter();

//   return (
//     <div className="customers-header-back">
//       <div>
//         <button
//           onClick={() => router.push(`/${serviceOrder?.id}/orders`)}
//           className="back-button"
//         >
//           <ArrowLeft className="icon-xxx" />
//           <span>Back</span>
//         </button>
//       </div>
//       <div className="order-nav-group">
//         <span
//           onClick={() => {
//             if (serviceOrder && !isTerminalStatus(serviceOrder.status)) {
//               onStatusChange();
//             }
//           }}
//           className={`${
//             STATUS_MAP[serviceOrder?.status || "NEW"].className
//           } order-status-badge ${
//             serviceOrder && !isTerminalStatus(serviceOrder.status)
//               ? "clickable"
//               : "disabled"
//           }`}
//         >
//           {STATUS_MAP[serviceOrder?.status || "NEW"].label}
//         </span>

//         <button
//           onClick={() => {
//             if (!isTerminalStatus(serviceOrder?.status)) onEdit();
//           }}
//           className={`edit-button_order ${
//             isTerminalStatus(serviceOrder?.status) ? "disabled" : ""
//           }`}
//           disabled={isTerminalStatus(serviceOrder?.status)}
//         >
//           <Edit className="icon-xxx" />
//           <span>Edit Order</span>
//         </button>
//       </div>
//     </div>
//   );
// }
