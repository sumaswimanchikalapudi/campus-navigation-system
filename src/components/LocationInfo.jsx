// File: src/components/LocationInfo.js
import React from "react";
import "./LocationInfo.css";

const LocationInfo = ({ location, onSetAsStart, onSetAsEnd, onClose }) => {
  if (!location) return null;

  return (
    <div className="location-info-panel">
      <div className="location-info-header">
        <h2>{location.name}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="location-info-content">
        {location.description && <p>{location.description}</p>}

        <div className="location-details">
          <p>
            <strong>Category:</strong> {location.category}
          </p>
          {location.building && (
            <p>
              <strong>Building:</strong> {location.building}
            </p>
          )}
          {location.floor !== null && (
            <p>
              <strong>Floor:</strong> {location.floor}
            </p>
          )}
          {location.room_number && (
            <p>
              <strong>Room:</strong> {location.room_number}
            </p>
          )}
        </div>

        <div className="location-actions">
          <button className="start-btn" onClick={onSetAsStart}>
            Set as Starting Point
          </button>
          <button className="end-btn" onClick={onSetAsEnd}>
            Set as Destination
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
