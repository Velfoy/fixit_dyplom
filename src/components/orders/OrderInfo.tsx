// "use client";

// import { Order } from "@/types/serviceorders";
// import { Card } from "../ui/card";
// import { Clock, DollarSign, User } from "lucide-react";
// import "@/styles/order-components.css";

// interface OrderInfoProps {
//   serviceOrder: Order | null;
//   toNumber: (val: any) => number;
// }

// export function OrderInfo({ serviceOrder, toNumber }: OrderInfoProps) {
//   return (
//     <>
//       <div className="customers-header">
//         <div className="customers-header-text">
//           <h1 className="customers-title">
//             Order #{serviceOrder?.id}{" "}
//             <span className="order-title-issue">{serviceOrder?.issue}</span>
//           </h1>
//           <p className="customers-subtitle">
//             {serviceOrder?.carBrand} {serviceOrder?.carModel} (
//             {serviceOrder?.carYear}) {serviceOrder?.orderNumber}
//           </p>
//         </div>
//         <div className="customers-header-text">
//           <p className="customers-subtitle order-license-label">
//             License plate
//           </p>
//           <p className="customers-subtitle order-license-value">
//             {serviceOrder?.carLicensePlate}
//           </p>
//         </div>
//       </div>
//       <div className="parts-stats-grid ">
//         <Card className="stats-card order-card_id">
//           <div className="stats-card-inner">
//             <div className="stats-icon">
//               <Clock className="icon-md" />
//             </div>
//             <div>
//               <p className="stats-label_order">Estimated Completion</p>
//               <p className="stats-value_order">
//                 {serviceOrder?.endDate
//                   ? new Date(serviceOrder.endDate).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "short",
//                       day: "numeric",
//                     })
//                   : ""}
//               </p>
//             </div>
//           </div>
//         </Card>
//         <Card className="stats-card order-card_id">
//           <div className="stats-card-inner">
//             <div className="stats-icon">
//               <DollarSign className="icon-md" />
//             </div>
//             <div>
//               <p className="stats-label_order">Total Cost</p>
//               <p className="stats-value_order">
//                 ${toNumber(serviceOrder?.total_cost || 0).toFixed(2)}
//               </p>
//             </div>
//           </div>
//         </Card>
//         <Card className="stats-card order-card_id">
//           <div className="stats-card-inner">
//             <div className="stats-icon">
//               <User className="icon-md" />
//             </div>
//             <div>
//               <p className="stats-label_order">Mechanic</p>
//               <p className="stats-value_order">
//                 {serviceOrder?.mechanicFirstName}{" "}
//                 {serviceOrder?.mechanicLastName}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </>
//   );
// }
