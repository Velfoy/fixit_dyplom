import React from "react";
import { authorizePage } from "@/lib/authorize";

export default async function Warehouse() {
  await authorizePage(["warehouse", "mechanic", "admin"]);

  return <div>Warehouse</div>;
}
