// File: src/components/admin/LocationManager.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "../../services/api";
import "./AdminStyles.css";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map clicks and marker placement
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const LocationManager = () => {
  const srmCoordinates = [16.5563, 80.4982]; // SRM University AP coordinates

  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    building: "",
    floor: "",
    room_number: "",
    category: "",
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [connectedLocations, setConnectedLocations] = useState([]);
  const [availableConnections, setAvailableConnections] = useState([]);

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Update available connections when editing a location
  useEffect(() => {
    if (editingId) {
      // All locations except the one being edited
      setAvailableConnections(locations.filter((loc) => loc.id !== editingId));
    } else {
      setAvailableConnections(locations);
    }
  }, [editingId, locations]);

  // Fetch all locations from the API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/locations/");
      setLocations(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Failed to load locations. Please try again.");
      setLoading(false);
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

    if (!formData.name || !formData.category || !markerPosition) {
      setError(
        "Please fill in all required fields and place a marker on the map."
      );
      return;
    }

    const locationData = {
      ...formData,
      coordinates: {
        type: "Point",
        coordinates: [markerPosition[1], markerPosition[0]], // [longitude, latitude]
      },
      connected_to: connectedLocations,
    };

    try {
      setLoading(true);

      if (editingId) {
        // Update existing location
        await api.put(`/locations/${editingId}`, locationData);
        setSuccessMessage("Location updated successfully!");
      } else {
        // Create new location
        await api.post("/locations/", locationData);
        setSuccessMessage("Location created successfully!");
      }

      // Reset form and state
      resetForm();
      fetchLocations();
      setLoading(false);
    } catch (err) {
      console.error("Error saving location:", err);
      setError("Failed to save location. Please try again.");
      setLoading(false);
    }
  };

  // Handle editing a location
  const handleEdit = (location) => {
    setEditingId(location.id);

    setFormData({
      name: location.name,
      description: location.description || "",
      building: location.building || "",
      floor: location.floor || "",
      room_number: location.room_number || "",
      category: location.category,
    });

    // Set marker position [lat, lng]
    setMarkerPosition([
      location.coordinates.coordinates[1],
      location.coordinates.coordinates[0],
    ]);

    // Set connected locations
    // This would need to be fetched from the API if not included in the location data
    setConnectedLocations(location.connected_to || []);
  };

  // Handle deleting a location
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/locations/${id}`);
      setSuccessMessage("Location deleted successfully!");
      fetchLocations();
      setLoading(false);
    } catch (err) {
      console.error("Error deleting location:", err);
      setError("Failed to delete location. Please try again.");
      setLoading(false);
    }
  };

  // Reset form and state
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      building: "",
      floor: "",
      room_number: "",
      category: "",
    });
    setMarkerPosition(null);
    setEditingId(null);
    setConnectedLocations([]);
    setError(null);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle connected locations selection
  const handleConnectionChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setConnectedLocations(selectedOptions);
  };

  return (
    <div className="location-manager">
      <h2>{editingId ? "Edit Location" : "Add New Location"}</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="form-map-container">
        <form onSubmit={handleSubmit} className="location-form">
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="building">Building</label>
              <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="floor">Floor</label>
              <input
                type="number"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="room_number">Room Number</label>
              <input
                type="text"
                id="room_number"
                name="room_number"
                value={formData.room_number}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="classroom">Classroom</option>
                <option value="office">Office</option>
                <option value="lab">Laboratory</option>
                <option value="library">Library</option>
                <option value="canteen">Canteen</option>
                <option value="sports">Sports Facility</option>
                <option value="admin">Administrative</option>
                <option value="hostel">Hostel</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="connected_locations">Connected Locations</label>
            <select
              id="connected_locations"
              multiple
              value={connectedLocations}
              onChange={handleConnectionChange}
              size="5"
            >
              {availableConnections.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.building ? `(${loc.building})` : ""}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple locations</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                ? "Update Location"
                : "Add Location"}
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

        <div className="map-container">
          <p>Click on the map to place the location marker *</p>
          <MapContainer
            center={srmCoordinates}
            zoom={17}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              position={markerPosition}
              setPosition={setMarkerPosition}
            />
          </MapContainer>
        </div>
      </div>

      <div className="locations-list">
        <h3>Existing Locations</h3>

        {loading ? (
          <p>Loading locations...</p>
        ) : locations.length === 0 ? (
          <p>No locations found. Add your first location above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Building</th>
                <th>Room</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.name}</td>
                  <td>{location.building || "-"}</td>
                  <td>{location.room_number || "-"}</td>
                  <td>{location.category}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(location)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(location.id)}
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

export default LocationManager;
