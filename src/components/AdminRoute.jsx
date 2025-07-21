// File: src/components/AdminRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useContext(AuthContext);

  return currentUser && isAdmin() ? children : <Navigate to="/login" />;
};

export default AdminRoute;
