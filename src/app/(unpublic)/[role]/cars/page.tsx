import React from "react";
import { authorizePage } from "@/lib/authorize";
import CarsView from "@/components/pages/CarsView";
import type { Car } from "@/types/car";
import { headers } from "next/headers";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const Cars = async () => {
  const session = await authorizePage(["admin", "client"]);
  if (session?.user?.role === "ADMIN") {
    try {
      const carsRes = await fetch(`${process.env.NEXTAUTH_URL}/api/cars`, {
        cache: "no-store",
      });
      const cars: Car[] = carsRes.ok ? await carsRes.json() : [];

      const branchesRes = await fetch(
        `${process.env.NEXTAUTH_URL}/api/branches?minimal=true`,
        { cache: "no-store" }
      );
      const branches = branchesRes.ok ? await branchesRes.json() : [];

      const customersRes = await fetch(
        `${process.env.NEXTAUTH_URL}/api/customers?minimal=true`,
        { cache: "no-store" }
      );
      const customers: Customer[] = customersRes.ok
        ? await customersRes.json()
        : [];

      return (
        <CarsView
          dataCars={cars}
          session={session}
          branches={branches}
          customers={customers}
        />
      );
    } catch (error) {
      console.error(error);
      return (
        <CarsView
          dataCars={[]}
          session={session}
          branches={[]}
          customers={[]}
        />
      );
    }
  } else if (session?.user?.role === "CLIENT") {
    try {
      const h = await headers();
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const url = new URL("/api/cars/user", baseUrl).toString();
      const carsRes = await fetch(url, {
        cache: "no-store",
        headers: Object.fromEntries(h.entries()),
      });
      const cars: Car[] = carsRes.ok ? await carsRes.json() : [];

      return (
        <CarsView
          dataCars={cars}
          session={session}
          branches={[]}
          customers={[]}
        />
      );
    } catch (error) {
      console.error(error);
      return (
        <CarsView
          dataCars={[]}
          session={session}
          branches={[]}
          customers={[]}
        />
      );
    }
  } else {
    return (
      <CarsView dataCars={[]} session={session} branches={[]} customers={[]} />
    );
  }
};

export default Cars;
