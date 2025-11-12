import React from "react";
import { authorizeRoute } from "@/lib/authorize";

const History = async () => {
  await authorizeRoute("client");
  return <div>History</div>;
};

export default History;
