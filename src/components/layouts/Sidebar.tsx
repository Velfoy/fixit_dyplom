import React from "react";
interface SidebarProps {
  role?: string;
}
const Sidebar: React.FC<SidebarProps> = ({ role }: SidebarProps) => {
  return (
    <div id="sidebar">
      <nav>
        <ul>
          <li>
            <a href={`/${role}/dashboard`}>Dashboard</a>
          </li>
          {role === "admin" && (
            <li>
              <a href={`/${role}/users`}>Users</a>
            </li>
          )}
          {(role === "admin" || role === "mechanic") && (
            <li>
              <a href={`/${role}/warehouse`}>Warehouse</a>
            </li>
          )}
          <li>
            <a href={`/${role}/orders`}>Orders</a>
          </li>
          {(role === "admin" || role === "client") && (
            <li>
              <a href={`/${role}/cars`}>Cars</a>
            </li>
          )}
          {role === "client" && (
            <li>
              <a href={`/${role}/history`}>History</a>
            </li>
          )}
          {(role === "admin" || role === "client" || role === "warehouse") && (
            <li>
              <a href={`/${role}/invoices`}>Invoices</a>
            </li>
          )}

          <li>
            <a href={`/${role}/info`}>Info</a>
          </li>
          <li>
            <a href={`/${role}/settings`}>Settings</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
