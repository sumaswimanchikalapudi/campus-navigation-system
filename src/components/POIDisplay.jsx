import React, { useState, useEffect } from "react";

// POI Display component to show POI list for a selected location
const POIDisplay = ({
  selectedLocation,
  pois,
  selectedPOI,
  onSelectPOI,
  onClose,
}) => {
  const [filteredPOIs, setFilteredPOIs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter POIs for the selected location
  useEffect(() => {
    if (!selectedLocation) return;

    let locationPOIs = pois.filter(
      (poi) => poi.location_id === selectedLocation.id
    );

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      locationPOIs = locationPOIs.filter(
        (poi) =>
          poi.name.toLowerCase().includes(term) ||
          poi.description.toLowerCase().includes(term) ||
          poi.type.toLowerCase().includes(term)
      );
    }

    // Filter by tab
    if (activeTab !== "all") {
      locationPOIs = locationPOIs.filter((poi) => poi.type === activeTab);
    }

    setFilteredPOIs(locationPOIs);
  }, [selectedLocation, pois, activeTab, searchTerm]);

  // Early return if no location is selected
  if (!selectedLocation) return null;

  // Helper function to get status label and styling based on availability
  const getAvailabilityStatus = (isAvailable) => {
    return {
      label: isAvailable ? "Available" : "Unavailable",
      className: `status-indicator ${
        isAvailable ? "available" : "unavailable"
      }`,
    };
  };

  // Helper function to get appropriate icon for POI type
  const getPoiTypeIcon = (type) => {
    const icons = {
      cafe: "☕",
      restroom: "🚻",
      study: "📚",
      elevator: "🔼",
      laundry: "👕",
      parking: "🅿️",
      default: "📍",
    };

    return icons[type] || icons.default;
  };

  // Get all unique POI types for this location
  const getUniqueTypes = () => {
    const types = new Set();
    pois.forEach((poi) => {
      if (poi.location_id === selectedLocation.id) {
        types.add(poi.type);
      }
    });
    return Array.from(types);
  };

  const uniqueTypes = getUniqueTypes();

  return (
    <div className="poi-display">
      <div className="poi-header">
        <div className="poi-header-top">
          <h3>{selectedLocation.name} - Points of Interest</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {filteredPOIs.length > 0 ? (
        <div className="poi-list">
          {filteredPOIs.map((poi) => (
            <div
              key={poi.id}
              className={`poi-item ${
                selectedPOI && selectedPOI.id === poi.id ? "selected" : ""
              }`}
              onClick={() => onSelectPOI(poi)}
            >
              <div className="poi-icon">{getPoiTypeIcon(poi.type)}</div>
              <div className="poi-details">
                <h4>{poi.name}</h4>
                <p className="poi-description">{poi.description}</p>
                <div className="poi-meta">
                  <span
                    className={
                      getAvailabilityStatus(poi.is_available).className
                    }
                  >
                    {getAvailabilityStatus(poi.is_available).label}
                  </span>
                  {poi.capacity && (
                    <span className="capacity-info">
                      {poi.current_occupancy !== null
                        ? `${poi.current_occupancy}/${poi.capacity}`
                        : `Capacity: ${poi.capacity}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-poi-message"></div>
      )}
    </div>
  );
};

export default POIDisplay;
