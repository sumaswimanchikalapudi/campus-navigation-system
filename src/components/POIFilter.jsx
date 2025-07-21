import React, { useState, useEffect } from "react";
import "./POIFilter.css";

const POIFilter = ({ pois, onFilterChange }) => {
  // Group POIs by type
  const [poiTypes, setPoiTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (pois && pois.length > 0) {
      // Extract unique POI types
      const uniqueTypes = [...new Set(pois.map((poi) => poi.type))];
      setPoiTypes(uniqueTypes);
    }
  }, [pois]);

  const handleTypeToggle = (type) => {
    const updatedSelection = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(updatedSelection);

    // Call the parent component's callback with the updated selection
    onFilterChange(updatedSelection);
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
    onFilterChange([]);
  };

  const handleSelectAll = () => {
    setSelectedTypes([...poiTypes]);
    onFilterChange([...poiTypes]);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Map POI types to human-readable names and emojis
  const poiTypeLabels = {
    cafe: { name: "Cafes & Restaurants", emoji: "🍽️" },
    restroom: { name: "Restrooms", emoji: "🚻" },
    parking: { name: "Parking", emoji: "🅿️" },
    elevator: { name: "Elevators", emoji: "🔼" },
    // Add more POI types as needed
  };

  return (
    <div className="poi-filter">
      <div className="poi-filter-header" onClick={toggleExpand}>
        <h3>Points of Interest</h3>
        <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>▼</span>
      </div>

      {isExpanded && (
        <>
          <div className="poi-filter-actions">
            <button
              type="button"
              className="poi-action-btn"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button
              type="button"
              className="poi-action-btn"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>

          <div className="poi-filter-options">
            {poiTypes.map((type) => (
              <label key={type} className="poi-filter-option">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                />
                <span className="poi-type-name">
                  {poiTypeLabels[type]?.emoji || "📍"}{" "}
                  {poiTypeLabels[type]?.name || type}
                </span>
                {/* Display count of this POI type */}
                <span className="poi-type-count">
                  ({pois.filter((poi) => poi.type === type).length})
                </span>
              </label>
            ))}
            {poiTypes.length === 0 && (
              <p className="no-poi-message">No POIs available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default POIFilter;
