export const routeAccessMatrix: Record<string, string[]> = {
  admin: [
    "dashboard",
    "users",
    "warehouse",
    "orders",
    "cars",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
  mechanic: [
    "dashboard",
    "warehouse",
    "orders",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
  client: [
    "dashboard",
    "orders",
    "cars",
    "history",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
  warehouse: [
    "dashboard",
    "warehouse",
    "invoices",
    "info",
    "settings",
    "profile",
  ],
};

export function isRouteAllowed(role: string, pageName?: string) {
  if (!pageName) return true; // no specific page requested
  const allowed = routeAccessMatrix[role];
  if (!allowed) return false;
  return allowed.includes(pageName);
}
