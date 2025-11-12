import React from "react";
import { authorizePage } from "@/lib/authorize";
const Cars = async () => {
  await authorizePage(["admin", "client"]);
  return <div>Cars page</div>;
};

export default Cars;
