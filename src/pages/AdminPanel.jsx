// File: src/pages/AdminPanel.js
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import LocationManager from "../components/admin/LocationManager";
import POIManager from "../components/admin/POIManager";
import EmergencyServicesManager from "../components/admin/EmergencyServicesManager";
import "./AdminPanel.css";

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <h1>Campus Navigation Admin</h1>

      <div className="admin-nav">
        <NavLink
          to="/admin/locations"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Locations
        </NavLink>
        <NavLink
          to="/admin/pois"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Points of Interest
        </NavLink>
        <NavLink
          to="/admin/emergency"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Emergency Services
        </NavLink>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<LocationManager />} />
          <Route path="/locations" element={<LocationManager />} />
          <Route path="/pois" element={<POIManager />} />
          <Route path="/emergency" element={<EmergencyServicesManager />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
