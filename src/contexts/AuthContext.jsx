// File: src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const userInfo = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({
        username: userInfo.sub,
        role: userInfo.role,
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post(
        "/token",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token } = response.data;
      localStorage.setItem("accessToken", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      const userInfo = JSON.parse(atob(access_token.split(".")[1]));
      setCurrentUser({
        username: userInfo.sub,
        role: userInfo.role,
      });

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const register = async (username, email, password) => {
    try {
      console.log("Sending registration data:", { username, email, password });
      await api.post("/users/", {
        username,
        email,
        password,
      });
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error);
      return false;
    }
  };

  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
