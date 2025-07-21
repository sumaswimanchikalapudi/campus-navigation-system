import React, { useState, useEffect } from "react";
import "./POISidebar.css";

const POISidebar = ({ pois, locations, onSelectPOI, onClose }) => {
  const [filteredPois, setFilteredPois] = useState(pois);
  const [activeTypes, setActiveTypes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [groupByLocation, setGroupByLocation] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Extract all unique POI types on component mount
  useEffect(() => {
    const types = {};
    pois.forEach((poi) => {
      types[poi.type] = true;
    });
    setActiveTypes(types);
  }, [pois]);

  // Filter POIs based on active types, search term, and emergency mode
  useEffect(() => {
    let filtered = pois;

    // Emergency mode filter
    if (emergencyMode) {
      filtered = filtered.filter(
        (poi) =>
          poi.type === "emergency" ||
          poi.is_emergency_related === true ||
          poi.name.toLowerCase().includes("emergency") ||
          poi.description.toLowerCase().includes("emergency") ||
          poi.type.toLowerCase().includes("emergency")
      );
    } else {
      // Regular type filtering
      filtered = filtered.filter((poi) => activeTypes[poi.type]);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (poi) =>
          poi.name.toLowerCase().includes(term) ||
          poi.description.toLowerCase().includes(term) ||
          getLocationName(poi.location_id).toLowerCase().includes(term)
      );
    }

    setFilteredPois(filtered);
  }, [pois, activeTypes, searchTerm, emergencyMode]);

  // Toggle a POI type filter
  const toggleType = (type) => {
    // Disable type toggling in emergency mode
    if (emergencyMode) return;

    setActiveTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Toggle emergency mode
  const toggleEmergencyMode = () => {
    setEmergencyMode(!emergencyMode);

    // Reset search when toggling emergency mode
    if (!emergencyMode) {
      setSearchTerm("");
    }
  };

  // Find location name by ID
  const getLocationName = (locationId) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : "Unknown Location";
  };

  // Get all unique POI types
  const poiTypes = [...new Set(pois.map((poi) => poi.type))];

  // Toggle expanded location
  const toggleLocationExpand = (locationId) => {
    if (expandedLocation === locationId) {
      setExpandedLocation(null);
    } else {
      setExpandedLocation(locationId);
    }
  };

  // Get POI type icon
  const getPoiTypeIcon = (type) => {
    const icons = {
      cafe: "☕",
      restroom: "🚻",
      study: "📚",
      elevator: "🔼",
      laundry: "👕",
      parking: "🅿️",
      emergency: "🚨",
      first_aid: "🩺",
      security: "👮",
      fire_exit: "🚪",
      default: "📍",
    };

    return icons[type] || icons.default;
  };

  // Group POIs by location for grouped view
  const groupedPOIs = () => {
    const grouped = {};

    // Create location groups
    locations.forEach((location) => {
      grouped[location.id] = {
        location: location,
        pois: [],
      };
    });

    // Add POIs to their location groups
    filteredPois.forEach((poi) => {
      if (grouped[poi.location_id]) {
        grouped[poi.location_id].pois.push(poi);
      }
    });

    // Filter out locations with no POIs
    return Object.values(grouped).filter((group) => group.pois.length > 0);
  };

  // Get availability status display info
  const getAvailabilityStatus = (isAvailable) => {
    return {
      label: isAvailable ? "Available" : "Unavailable",
      className: `status-badge ${isAvailable ? "available" : "unavailable"}`,
    };
  };

  return (
    <div className={`poi-sidebar ${emergencyMode ? "emergency-mode" : ""}`}>
      <div className="poi-sidebar-header">
        <div className="header-top">
          <h3>{emergencyMode ? "EMERGENCY SERVICES" : "Points of Interest"}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Emergency button */}
        <button
          className={`emergency-btn ${emergencyMode ? "active" : ""}`}
          onClick={toggleEmergencyMode}
        >
          {emergencyMode ? "Exit Emergency Mode" : "🚨 EMERGENCY"}
        </button>

        {/* Search input - hidden in emergency mode */}
        {!emergencyMode && (
          <div className="poi-search">
            <input
              type="text"
              placeholder="Search POIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="poi-search-input"
            />
          </div>
        )}
      </div>

      {/* View toggle - hidden in emergency mode */}
      {!emergencyMode && (
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${!groupByLocation ? "active" : ""}`}
            onClick={() => setGroupByLocation(false)}
          >
            List View
          </button>
          <button
            className={`view-toggle-btn ${groupByLocation ? "active" : ""}`}
            onClick={() => setGroupByLocation(true)}
          >
            Group by Location
          </button>
        </div>
      )}

      {/* Type filters - hidden in emergency mode */}
      {!emergencyMode && (
        <div className="poi-type-filter">
          {poiTypes.map((type) => (
            <div
              key={type}
              className={`poi-type-chip ${activeTypes[type] ? "active" : ""}`}
              onClick={() => toggleType(type)}
            >
              <span className="poi-type-icon">{getPoiTypeIcon(type)}</span>
              {type}
            </div>
          ))}
        </div>
      )}

      {/* Emergency mode header - only shown in emergency mode */}
      {emergencyMode && (
        <div className="emergency-header">
          <div className="emergency-icon">🚨</div>
          <h4>Campus Emergency Services</h4>
          <p>Showing all emergency-related points of interest</p>
        </div>
      )}

      <div className="poi-sidebar-content">
        {filteredPois.length > 0 ? (
          groupByLocation && !emergencyMode ? (
            // Grouped by location view (not available in emergency mode)
            groupedPOIs().map((group) => (
              <div key={group.location.id} className="poi-location-group">
                <div
                  className="location-group-header"
                  onClick={() => toggleLocationExpand(group.location.id)}
                >
                  <h4>
                    <span className="location-icon">
                      {group.location.category &&
                        group.location.category[0].toUpperCase()}
                    </span>
                    {group.location.name}
                  </h4>
                  <span className="poi-count">{group.pois.length} POIs</span>
                  <span className="expand-icon">
                    {expandedLocation === group.location.id ? "▼" : "▶"}
                  </span>
                </div>

                {expandedLocation === group.location.id && (
                  <div className="location-pois">
                    {group.pois.map((poi) => (
                      <div
                        key={poi.id}
                        className="poi-list-item"
                        onClick={() => onSelectPOI(poi)}
                      >
                        <div className="poi-icon">
                          {getPoiTypeIcon(poi.type)}
                        </div>
                        <div className="poi-details">
                          <h5>{poi.name}</h5>
                          <p className="poi-description">{poi.description}</p>
                          <div className="poi-meta">
                            <span
                              className={
                                getAvailabilityStatus(poi.is_available)
                                  .className
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
                )}
              </div>
            ))
          ) : (
            // List view (default for emergency mode)
            filteredPois.map((poi) => (
              <div
                key={poi.id}
                className={`poi-list-item ${
                  emergencyMode ? "emergency-item" : ""
                }`}
                onClick={() => onSelectPOI(poi)}
              >
                <div className="poi-header">
                  <span className="poi-type-icon">
                    {getPoiTypeIcon(poi.type)}
                  </span>
                  <h4>{poi.name}</h4>
                  <span
                    className={
                      getAvailabilityStatus(poi.is_available).className
                    }
                  >
                    {getAvailabilityStatus(poi.is_available).label}
                  </span>
                </div>
                <p className="poi-description">{poi.description}</p>
                <div className="poi-footer">
                  <p className="poi-location">
                    {getLocationName(poi.location_id)}
                  </p>
                  {/* Emergency contact shown only in emergency mode */}
                  {emergencyMode && poi.emergency_contact && (
                    <a
                      href={`tel:${poi.emergency_contact}`}
                      className="emergency-contact"
                    >
                      📞 {poi.emergency_contact}
                    </a>
                  )}
                  {!emergencyMode && poi.capacity && (
                    <span className="capacity-info">
                      {poi.current_occupancy !== null
                        ? `${poi.current_occupancy}/${poi.capacity}`
                        : `Capacity: ${poi.capacity}`}
                    </span>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="no-poi-message">
            {emergencyMode
              ? "No emergency services found in this area."
              : searchTerm.trim()
              ? "No POIs match your search."
              : "No POIs available with current filters."}
          </div>
        )}
      </div>
    </div>
  );
};

export default POISidebar;
