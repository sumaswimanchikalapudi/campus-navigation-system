// File: src/components/admin/POIManager.js
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./AdminStyles.css";

const POIManager = () => {
  const [pois, setPois] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    location_id: "",
    is_available: true,
    capacity: "",
    current_occupancy: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch POIs and locations on component mount
  useEffect(() => {
    fetchPOIs();
    fetchLocations();
  }, []);

  // Fetch all POIs from the API
  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/poi/");
      setPois(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching POIs:", err);
      setError("Failed to load points of interest. Please try again.");
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
    const { name, value, type, checked } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.location_id) {
      setError("Please fill in all required fields.");
      return;
    }

    // Prepare data - convert empty strings to null for numeric fields
    const poiData = {
      ...formData,
      capacity: formData.capacity || null,
      current_occupancy: formData.current_occupancy || null,
    };

    try {
      setLoading(true);

      if (editingId) {
        // Update existing POI
        await api.put(`/poi/${editingId}`, poiData);
        setSuccessMessage("Point of interest updated successfully!");
      } else {
        // Create new POI
        await api.post("/poi/", poiData);
        setSuccessMessage("Point of interest created successfully!");
      }

      // Reset form and state
      resetForm();
      fetchPOIs();
      setLoading(false);
    } catch (err) {
      console.error("Error saving POI:", err);
      setError("Failed to save point of interest. Please try again.");
      setLoading(false);
    }
  };

  // Handle editing a POI
  const handleEdit = (poi) => {
    setEditingId(poi.id);

    setFormData({
      name: poi.name,
      type: poi.type,
      description: poi.description || "",
      location_id: poi.location_id,
      is_available: poi.is_available,
      capacity: poi.capacity || "",
      current_occupancy: poi.current_occupancy || "",
    });
  };

  // Handle deleting a POI
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this point of interest?")
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/poi/${id}`);
      setSuccessMessage("Point of interest deleted successfully!");
      fetchPOIs();
      setLoading(false);
    } catch (err) {
      console.error("Error deleting POI:", err);
      setError("Failed to delete point of interest. Please try again.");
      setLoading(false);
    }
  };

  // Reset form and state
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      location_id: "",
      is_available: true,
      capacity: "",
      current_occupancy: "",
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

  // Show/hide capacity and occupancy fields based on POI type
  const showCapacityFields =
    formData.type === "cafe" || formData.type === "parking";

  return (
    <div className="poi-manager">
      <h2>
        {editingId ? "Edit Point of Interest" : "Add New Point of Interest"}
      </h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="poi-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

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
              <option value="cafe">Cafe</option>
              <option value="restroom">Restroom</option>
              <option value="parking">Parking</option>
              <option value="elevator">Elevator</option>
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

        <div className="form-row">
          <div className="form-group checkbox-group">
            <label htmlFor="is_available" className="checkbox-label">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={formData.is_available}
                onChange={handleInputChange}
              />
              Available
            </label>
          </div>

          {showCapacityFields && (
            <>
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="current_occupancy">Current Occupancy</label>
                <input
                  type="number"
                  id="current_occupancy"
                  name="current_occupancy"
                  value={formData.current_occupancy}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update POI" : "Add POI"}
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
        <h3>Existing Points of Interest</h3>

        {loading ? (
          <p>Loading points of interest...</p>
        ) : pois.length === 0 ? (
          <p>No points of interest found. Add your first POI above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Available</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pois.map((poi) => (
                <tr key={poi.id}>
                  <td>{poi.name}</td>
                  <td>{poi.type}</td>
                  <td>{getLocationName(poi.location_id)}</td>
                  <td>{poi.is_available ? "Yes" : "No"}</td>
                  <td>
                    {poi.capacity
                      ? `${poi.current_occupancy || 0}/${poi.capacity}`
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(poi)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(poi.id)}
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

export default POIManager;
