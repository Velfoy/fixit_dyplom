// "use client";

// import { Order } from "@/types/serviceorders";
// import { useState, useEffect } from "react";
// import { Plus } from "lucide-react";
// import { Card } from "../ui/card";
// import { Button } from "../ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import { Input } from "../ui/input";
// import { Table } from "../ui/table";
// import { toNumber } from "@/lib/orderTransform";

// interface PaymentSectionProps {
//   serviceOrder: Order | null;
//   session?: any;
//   isTerminalStatus: boolean;
//   onOrderUpdate?: (order: Order) => void;
// }

// export function PaymentSection({
//   serviceOrder,
//   session,
//   isTerminalStatus,
//   onOrderUpdate,
// }: PaymentSectionProps) {
//   const [showAddItem, setShowAddItem] = useState(false);
//   const [itemDescription, setItemDescription] = useState("");
//   const [itemCost, setItemCost] = useState<number>(0);
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<string>("CARD");
//   const [cardNumber, setCardNumber] = useState("");
//   const [cardExpiry, setCardExpiry] = useState("");
//   const [cardCvv, setCardCvv] = useState("");
//   const [cardName, setCardName] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [items, setItems] = useState<any[]>([]);
//   const [loadingItems, setLoadingItems] = useState(false);

//   useEffect(() => {
//     const fetchItems = async () => {
//       if (!serviceOrder?.id) return;
//       setLoadingItems(true);
//       try {
//         const res = await fetch(`/api/orders/${serviceOrder.id}/items`);
//         if (!res.ok) throw new Error(`API returned ${res.status}`);
//         const data = await res.json();
//         const mapped = (data || []).map((item: any) => ({
//           id: item.id?.toString?.() || item.id,
//           description: item.name || item.description,
//           cost: toNumber(item.cost),
//           created_at: item.created_at || item.createdAt || new Date().toISOString(),
//         }));
//         setItems(mapped);
//       } catch (err) {
//         console.error("Failed to load items", err);
//         setItems([]);
//       } finally {
//         setLoadingItems(false);
//       }
//     };

//     fetchItems();
//   }, [serviceOrder?.id]);

//   const orderTotal = toNumber(serviceOrder?.total_cost || 0);
//   const itemsTotal = items.reduce((sum, item) => sum + toNumber(item.cost), 0);
//   const fullTotal = orderTotal + itemsTotal;

//   async function handleAddItem(e: React.FormEvent) {
//     e.preventDefault();
//     if (!itemDescription.trim() || itemCost <= 0 || !serviceOrder) return;

//     try {
//       const res = await fetch(`/api/orders/${serviceOrder.id}/items`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: itemDescription,
//           type: "service",
//           cost: itemCost,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to add item");
//       const response = await res.json();
//       if (!response.item) throw new Error("Invalid response structure");

//       const newItem = {
//         id: response.item.id?.toString?.() || response.item.id,
//         description: response.item.name,
//         cost: toNumber(response.item.cost),
//         created_at: response.item.created_at || new Date().toISOString(),
//       };

//       setItems((prev) => [newItem, ...prev]);
//       setItemDescription("");
//       setItemCost(0);
//       setShowAddItem(false);
//     } catch (err) {
//       console.error("Failed to add item:", err);
//       alert("Failed to add item");
//     }
//   }

//   async function handleDeleteItem(itemId: string) {
//     if (!serviceOrder) return;

//     try {
//       const res = await fetch(`/api/orders/${serviceOrder.id}/items/${itemId}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) throw new Error("Failed to delete item");
//       setItems((prev) => prev.filter((item) => item.id !== itemId));
//     } catch (err) {
//       console.error("Failed to delete item:", err);
//       alert("Failed to delete item");
//     }
//   }

//   async function handleProcessPayment(e: React.FormEvent) {
//     e.preventDefault();
//     if (!serviceOrder || fullTotal <= 0) return;

//     setIsProcessing(true);
//     try {
//       // Simulate payment by updating order metadata; backend ignores these fields but keeps parity with old behavior
//       await new Promise((resolve) => setTimeout(resolve, 1200));
//       await fetch(`/api/orders/${serviceOrder.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           paymentStatus: "PAID",
//           paymentMethod,
//           paidAt: new Date().toISOString(),
//         }),
//       });

//       setShowPaymentDialog(false);
//       setPaymentMethod("CARD");
//       setCardNumber("");
//       setCardExpiry("");
//       setCardCvv("");
//       setCardName("");

//       alert("Payment processed successfully!");
//     } catch (err) {
//       console.error("Payment error:", err);
//       alert("Payment failed. Please try again.");
//     } finally {
//       setIsProcessing(false);
//     }
//   }

//   async function handleGenerateInvoice() {
//     if (!serviceOrder) return;

//     try {
//       alert("Invoice generation is not implemented yet.");
//     } catch (err) {
//       console.error("Failed to generate invoice:", err);
//       alert("Failed to generate invoice");
//     }
//   }

//   return (
//     <>
//       <Card className="customers-list-card">
//         <div className="customers-list-inner">
//           <div className="customers-header" style={{ marginLeft: "5px" }}>
//             <span>Payment & Transactions</span>
//             {(session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER") &&
//               !isTerminalStatus && (
//                 <div className="transaction-details-header">
//                   <div className="transaction-actions">
//                     <Button
//                       onClick={() => setShowAddItem(true)}
//                       className="edit-button_trans"
//                     >
//                       <Plus className="icon-xxx" />
//                       <span>Add Item</span>
//                     </Button>
//                   </div>
//                 </div>
//               )}
//           </div>

//           <div style={{ paddingTop: "15px" }}>
//             {loadingItems ? (
//               <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
//                 Loading items...
//               </div>
//             ) : items.length === 0 ? (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "20px",
//                   color: "#999",
//                 }}
//               >
//                 No additional items
//               </div>
//             ) : (
//               <Table
//                 data={items}
//                 columns={[
//                   {
//                     key: "description",
//                     header: "Description",
//                     render: (item: any) => item.description,
//                   },
//                   {
//                     key: "cost",
//                     header: "Cost",
//                     render: (item: any) => `$${toNumber(item.cost).toFixed(2)}`,
//                     className: "transaction-amount",
//                   },
//                   {
//                     key: "created_at",
//                     header: "Added",
//                     render: (item: any) =>
//                       new Date(item.created_at).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "short",
//                         day: "numeric",
//                       }),
//                   },
//                   {
//                     key: "action",
//                     header: "Action",
//                     render: (item: any) => (
//                       <Button
//                         onClick={() => handleDeleteItem(item.id)}
//                         className="edit-button_trans"
//                         disabled={isTerminalStatus}
//                         style={{
//                           padding: "4px 8px",
//                           fontSize: "12px",
//                         }}
//                       >
//                         Delete
//                       </Button>
//                     ),
//                   },
//                 ]}
//                 pageSize={10}
//                 getRowKey={(item) => item.id}
//               />
//             )}

//             <div
//               style={{
//                 padding: "15px",
//                 borderTop: "1px solid #ddd",
//                 textAlign: "right",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   marginBottom: "8px",
//                   paddingBottom: "8px",
//                   borderBottom: "1px solid #ddd",
//                 }}
//               >
//                 <span>Service Order Cost:</span>
//                 <span>${orderTotal.toFixed(2)}</span>
//               </div>

//               {itemsTotal > 0 && (
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px",
//                     paddingBottom: "8px",
//                     borderBottom: "1px solid #ddd",
//                   }}
//                 >
//                   <span>Additional Items:</span>
//                   <span>${itemsTotal.toFixed(2)}</span>
//                 </div>
//               )}

//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   fontSize: "16px",
//                   fontWeight: "bold",
//                   marginBottom: "15px",
//                   color: "#ff9800",
//                 }}
//               >
//                 <span>Total Amount:</span>
//                 <span>${fullTotal.toFixed(2)}</span>
//               </div>

//               <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
//                 <Button
//                   onClick={handleGenerateInvoice}
//                   className="transaction-pay-now-btn"
//                   disabled={isTerminalStatus}
//                   style={{
//                     backgroundColor: "#4CAF50",
//                   }}
//                 >
//                   Generate Invoice
//                 </Button>
//                 <Button
//                   onClick={() => setShowPaymentDialog(true)}
//                   className="transaction-pay-now-btn"
//                   disabled={isTerminalStatus || fullTotal <= 0}
//                   style={{
//                     backgroundColor: fullTotal > 0 ? "#2196F3" : "#ccc",
//                   }}
//                 >
//                   Pay Now
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>

//       <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
//         <DialogContent className="dialog-content">
//           <DialogHeader>
//             <DialogTitle className="dialog-title">Add Transaction Item</DialogTitle>
//           </DialogHeader>

//           <form
//             className="dialog-body dialog-body--form"
//             onSubmit={handleAddItem}
//           >
//             <div className="dialog-form-grid">
//               <div className="dialog-form-field dialog-field--full">
//                 <label className="dialog-field-label">Item Description *</label>
//                 <Input
//                   className="dialog-input"
//                   value={itemDescription}
//                   onChange={(e) => setItemDescription(e.target.value)}
//                   placeholder="e.g., Diagnostic Fee, Labor Cost"
//                   required
//                 />
//               </div>

//               <div className="dialog-form-field">
//                 <label className="dialog-field-label">Cost *</label>
//                 <Input
//                   className="dialog-input"
//                   type="number"
//                   value={itemCost}
//                   onChange={(e) => setItemCost(Number(e.target.value))}
//                   placeholder="0.00"
//                   min="0"
//                   step="0.01"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="dialog-actions">
//               <Button
//                 type="button"
//                 onClick={() => {
//                   setShowAddItem(false);
//                   setItemDescription("");
//                   setItemCost(0);
//                 }}
//                 className="dialog-btn dialog-btn--primary"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 className="dialog-btn dialog-btn--secondary"
//               >
//                 Add Item
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
//         <DialogContent className="dialog-content" style={{ maxWidth: "500px" }}>
//           <DialogHeader>
//             <DialogTitle className="dialog-title">Process Payment</DialogTitle>
//           </DialogHeader>

//           <form
//             className="dialog-body dialog-body--form"
//             onSubmit={handleProcessPayment}
//           >
//             <div
//               style={{
//                 padding: "12px",
//                 backgroundColor: "#f5f5f5",
//                 borderRadius: "4px",
//                 marginBottom: "15px",
//                 textAlign: "center",
//               }}
//             >
//               <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
//                 Total Amount Due
//               </div>
//               <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff9800" }}>
//                 ${fullTotal.toFixed(2)}
//               </div>
//             </div>

//             <div className="dialog-form-grid">
//               <div className="dialog-form-field dialog-field--full">
//                 <label className="dialog-field-label">Payment Method *</label>
//                 <select
//                   className="dialog-input"
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                   required
//                 >
//                   <option value="CARD">Credit Card</option>
//                   <option value="BANK_TRANSFER">Bank Transfer</option>
//                   <option value="CHECK">Check</option>
//                   <option value="CASH">Cash</option>
//                 </select>
//               </div>

//               {paymentMethod === "CARD" && (
//                 <>
//                   <div className="dialog-form-field dialog-field--full">
//                     <label className="dialog-field-label">Cardholder Name *</label>
//                     <Input
//                       className="dialog-input"
//                       value={cardName}
//                       onChange={(e) => setCardName(e.target.value)}
//                       placeholder="John Doe"
//                       required
//                     />
//                   </div>

//                   <div className="dialog-form-field dialog-field--full">
//                     <label className="dialog-field-label">Card Number *</label>
//                     <Input
//                       className="dialog-input"
//                       value={cardNumber}
//                       onChange={(e) =>
//                         setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
//                       }
//                       placeholder="1234 5678 9012 3456"
//                       required
//                     />
//                   </div>

//                   <div className="dialog-form-field">
//                     <label className="dialog-field-label">Expiry (MM/YY) *</label>
//                     <Input
//                       className="dialog-input"
//                       value={cardExpiry}
//                       onChange={(e) => {
//                         const val = e.target.value.replace(/\D/g, "");
//                         if (val.length <= 4) {
//                           setCardExpiry(val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
//                         }
//                       }}
//                       placeholder="MM/YY"
//                       minLength={5} maxLength={5}
//                       required
//                     />
//                   </div>

//                   <div className="dialog-form-field">
//                     <label className="dialog-field-label">CVV *</label>
//                     <Input
//                       className="dialog-input"
//                       value={cardCvv}
//                       onChange={(e) =>
//                         setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
//                       }
//                       placeholder="123"
//                       minLength={3} maxLength={4}
//                       required
//                     />
//                   </div>
//                 </>
//               )}

//               {paymentMethod === "BANK_TRANSFER" && (
//                 <div
//                   className="dialog-form-field dialog-field--full"
//                   style={{
//                     padding: "10px",
//                     backgroundColor: "#f0f0f0",
//                     borderRadius: "4px",
//                   }}
//                 >
//                   <strong>Bank Transfer Details:</strong>
//                   <div style={{ fontSize: "12px", marginTop: "8px" }}>
//                     <p>Account: 1234567890</p>
//                     <p>Routing: 987654321</p>
//                     <p>Bank: Business Bank</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="dialog-actions">
//               <Button
//                 type="button"
//                 onClick={() => {
//                   setShowPaymentDialog(false);
//                   setPaymentMethod("CARD");
//                   setCardNumber("");
//                   setCardExpiry("");
//                   setCardCvv("");
//                   setCardName("");
//                 }}
//                 className="dialog-btn dialog-btn--primary"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 className="dialog-btn dialog-btn--secondary"
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? "Processing..." : "Complete Payment"}
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
