// File: src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
