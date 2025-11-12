import React from "react";
import { authorizePage } from "@/lib/authorize";
const Invoices = async () => {
  await authorizePage(["warehouse", "client", "mechanic", "admin"]);
  return <div>Invoices</div>;
};

export default Invoices;
