"use client";
import React from "react";
import {
  Settings,
  Home,
  Users,
  Package,
  ClipboardList,
  Car,
  Clock,
  FileText,
  Info,
  User,
} from "lucide-react";
import "../../styles/sidebar.css";
import Image from "next/image";
import logo_white from "../../../public/images/logo_white.png";

interface SidebarProps {
  role?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }: SidebarProps) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Image src={logo_white} alt="Logo" className="logo-img" />
      </div>

      <div className="sidebar-divider" />

      {/* Dashboard */}
      <a href={`/${role}/dashboard`} className="sidebar-btn">
        <Home className="icon" />
        <span className="sidebar-text">Dashboard</span>
      </a>

      {/* Admin-only */}
      {role === "admin" && (
        <a href={`/${role}/users`} className="sidebar-btn">
          <Users className="icon" />
          <span className="sidebar-text">Users</span>
        </a>
      )}

      {/* Admin / mechanic / warehouse */}
      {(role === "admin" || role === "mechanic" || role === "warehouse") && (
        <a href={`/${role}/warehouse`} className="sidebar-btn">
          <Package className="icon" />
          <span className="sidebar-text">Warehouse</span>
        </a>
      )}

      {/* Orders */}
      <a href={`/${role}/orders`} className="sidebar-btn">
        <ClipboardList className="icon" />
        <span className="sidebar-text">Orders</span>
      </a>

      {/* Cars */}
      {(role === "admin" || role === "client") && (
        <a href={`/${role}/cars`} className="sidebar-btn">
          <Car className="icon" />
          <span className="sidebar-text">Cars</span>
        </a>
      )}

      {/* Client history */}
      {role === "client" && (
        <a href={`/${role}/history`} className="sidebar-btn">
          <Clock className="icon" />
          <span className="sidebar-text">History</span>
        </a>
      )}

      {/* Invoices */}
      {(role === "admin" || role === "client" || role === "warehouse") && (
        <a href={`/${role}/invoices`} className="sidebar-btn">
          <FileText className="icon" />
          <span className="sidebar-text">Invoices</span>
        </a>
      )}

      {/* Info */}
      <a href={`/${role}/info`} className="sidebar-btn">
        <Info className="icon" />
        <span className="sidebar-text">Info</span>
      </a>

      <div className="sidebar-bottom">
        {/* Profile */}
        <a href={`/${role}/profile`} className="sidebar-btn">
          <User className="icon" />
          <span className="sidebar-text">Profile</span>
        </a>
        {/* Settings */}
        <a href={`/${role}/settings`} className="sidebar-btn">
          <Settings className="icon" />
          <span className="sidebar-text">Settings</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
