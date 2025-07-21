// File: src/components/admin/EmergencyServicesManager.js
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./AdminStyles.css";

const EmergencyServicesManager = () => {
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    location_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch emergency services and locations on component mount
  useEffect(() => {
    fetchEmergencyServices();
    fetchLocations();
  }, []);

  // Fetch all emergency services from the API
  const fetchEmergencyServices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/emergency/");
      setEmergencyServices(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching emergency services:", err);
      setError("Failed to load emergency services. Please try again.");
      setLoading(false);
    }
  };

  // Fetch all locations for the location dropdown
  const fetchLocations = async () => {
    try {
      const response = await api.get("/locations/");
      setLocations(response.data);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Failed to load locations. Please try again.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.location_id) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing emergency service
        await api.put(`/emergency/${editingId}`, formData);
        setSuccessMessage("Emergency service updated successfully!");
      } else {
        // Create new emergency service
        await api.post("/emergency/", formData);
        setSuccessMessage("Emergency service created successfully!");
      }

      // Reset form and state
      resetForm();
      fetchEmergencyServices();
      setLoading(false);
    } catch (err) {
      console.error("Error saving emergency service:", err);
      setError("Failed to save emergency service. Please try again.");
      setLoading(false);
    }
  };

  // Handle editing an emergency service
  const handleEdit = (service) => {
    setEditingId(service.id);

    setFormData({
      type: service.type,
      description: service.description || "",
      location_id: service.location_id,
    });
  };

  // Handle deleting an emergency service
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this emergency service?")
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/emergency/${id}`);
      setSuccessMessage("Emergency service deleted successfully!");
      fetchEmergencyServices();
      setLoading(false);
    } catch (err) {
      console.error("Error deleting emergency service:", err);
      setError("Failed to delete emergency service. Please try again.");
      setLoading(false);
    }
  };

  // Reset form and state
  const resetForm = () => {
    setFormData({
      type: "",
      description: "",
      location_id: "",
    });
    setEditingId(null);
    setError(null);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Find location name by ID
  const getLocationName = (locationId) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : "Unknown";
  };

  return (
    <div className="emergency-manager">
      <h2>
        {editingId ? "Edit Emergency Service" : "Add New Emergency Service"}
      </h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="emergency-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Type</option>
              <option value="fire_extinguisher">Fire Extinguisher</option>
              <option value="first_aid">First Aid Kit</option>
              <option value="emergency_exit">Emergency Exit</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location_id">Location *</label>
            <select
              id="location_id"
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}{" "}
                  {location.building ? `(${location.building})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
              ? "Update Service"
              : "Add Service"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="items-list">
        <h3>Existing Emergency Services</h3>

        {loading ? (
          <p>Loading emergency services...</p>
        ) : emergencyServices.length === 0 ? (
          <p>No emergency services found. Add your first service above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Location</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emergencyServices.map((service) => (
                <tr key={service.id}>
                  <td>{service.type.replace("_", " ")}</td>
                  <td>{getLocationName(service.location_id)}</td>
                  <td>{service.description || "-"}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(service)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(service.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmergencyServicesManager;
