import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import SearchBar from "../components/SearchBar";
import LocationInfo from "../components/LocationInfo";
import POIFilter from "../components/POIFilter";
import POIDisplay from "../components/POIDisplay";
import POISidebar from "../components/POISidebar";
import "./Map.css";

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

// Custom icons for markers
const customIcons = {
  startMarker: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/9356/9356230.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  endMarker: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/9356/9356286.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  // Category-based icons
  hostel: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2270/2270345.png",
    iconSize: [38, 38],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  canteen: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2795/2795550.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  sports: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5144/5144735.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  admin: new Icon({
    iconUrl: "https://cdn-icons-png.freepik.com/256/15188/15188100.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  library: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/9043/9043296.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  classroom: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/8074/8074788.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  // Emergency related icons
  emergency: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1012/1012394.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  first_aid: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  security: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1642/1642068.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  fire_exit: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2118/2118247.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  // Default icon for unknown categories
  default: new Icon({
    iconUrl: "/icons/default_marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

// POI type icons
const poiTypeIcons = {
  cafe: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2555/2555073.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  restroom: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4266/4266898.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  study: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1903/1903162.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  elevator: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5830/5830884.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  laundry: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2037/2037437.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  parking: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2543/2543070.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
  // Emergency POI icons
  emergency: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991174.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  first_aid: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2869/2869442.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  fire_exit: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2764/2764562.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  security: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1644/1644090.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  default: new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),
};

// Component to update map view when path changes
function SetViewOnPath({ path }) {
  const map = useMap();

  useEffect(() => {
    if (path && path.coordinates && path.coordinates.length > 0) {
      const bounds = L.latLngBounds(path.coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, path]);

  return null;
}

// Component to center the map on a selected POI
function CenterOnPOI({ poi, location, isActive }) {
  const map = useMap();

  useEffect(() => {
    if (isActive && location && location.coordinates) {
      const coords = location.coordinates.coordinates;
      map.setView([coords[0], coords[1]], 19);
    }
  }, [map, poi, location, isActive]);

  return null;
}

// Component to handle direct map clicks for routing
function DirectClickHandler({ onPointSelected, routingMode }) {
  const map = useMapEvents({
    click: (e) => {
      if (routingMode !== "none") {
        onPointSelected(e.latlng, routingMode);

        // Add a visual feedback for click (optional)
        const pulseIcon = L.divIcon({
          className: "pulse-icon",
          iconSize: [20, 20],
        });

        const pulseMarker = L.marker(e.latlng, { icon: pulseIcon }).addTo(map);
        setTimeout(() => map.removeLayer(pulseMarker), 1000);
      }
    },
  });

  return null;
}

// Generate a divIcon for a category if image icon isn't available
function createFallbackIcon(category) {
  const color = categoryColors[category] || categoryColors.default;
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color:${color}; width:24px; height:24px; border-radius:50%; border:2px solid white; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold; font-size:12px;">${category[0].toUpperCase()}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// Create fallback POI type icon
function createPOIFallbackIcon(type) {
  const colors = {
    cafe: "#FF9800",
    restroom: "#03A9F4",
    study: "#9C27B0",
    elevator: "#607D8B",
    laundry: "#00BCD4",
    parking: "#3F51B5",
    emergency: "#F44336",
    first_aid: "#E91E63",
    fire_exit: "#FF5722",
    security: "#795548",
    default: "#795548",
  };
  const color = colors[type] || colors.default;

  return L.divIcon({
    className: "poi-div-icon",
    html: `<div style="background-color:${color}; width:20px; height:20px; border-radius:50%; border:2px solid white; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold; font-size:10px;">${type[0].toUpperCase()}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

// Get appropriate icon for a location category
function getIconForCategory(category) {
  try {
    // Try to use custom icon
    return customIcons[category] || customIcons.default;
  } catch (error) {
    // Fallback to div icon if custom icon fails
    return createFallbackIcon(category);
  }
}

// Get appropriate icon for a POI type
function getIconForPOIType(type) {
  try {
    return poiTypeIcons[type] || poiTypeIcons.default;
  } catch (error) {
    return createPOIFallbackIcon(type);
  }
}

// Fallback icon colors for categories (in case custom icon files aren't available)
const categoryColors = {
  hostel: "#8A2BE2", // BlueViolet
  canteen: "#FF8C00", // DarkOrange
  sports: "#32CD32", // LimeGreen
  admin: "#4169E1", // RoyalBlue
  library: "#8B4513", // SaddleBrown
  classroom: "#DC143C", // Crimson
  emergency: "#F44336", // Red
  first_aid: "#E91E63", // Pink
  security: "#795548", // Brown
  fire_exit: "#FF5722", // Deep Orange
  default: "#808080", // Gray
};

function Map() {
  // SRM University AP coordinates (approximate)
  const srmCoordinates = [16.462823771511143, 80.5066252507085];

  // Basic states for locations and UI
  const [locations, setLocations] = useState([]);
  const [pois, setPois] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Filter state for categories
  const [visibleCategories, setVisibleCategories] = useState({
    hostel: true,
    canteen: true,
    sports: true,
    admin: true,
    library: true,
    classroom: true,
    emergency: true,
    first_aid: true,
    security: true,
    fire_exit: true,
  });

  // Filter state for POI types
  const [visiblePOITypes, setVisiblePOITypes] = useState({});

  // Direct click routing states
  const [routingMode, setRoutingMode] = useState("none"); // 'none', 'start', or 'end'
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [pathStats, setPathStats] = useState(null);

  // POI display states
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showPoiSidebar, setShowPoiSidebar] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [showPOIMarkers, setShowPOIMarkers] = useState(false);
  const [poiTooltipOpen, setPoiTooltipOpen] = useState(null);

  // Emergency mode state
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Fetch location data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [locationsRes, poisRes, emergencyRes] = await Promise.all([
          api.get("/locations/"),
          api.get("/poi/"),
          api.get("/emergency/"),
        ]);
        setLocations(locationsRes.data);

        const poiData = poisRes.data;
        setPois(poiData);

        // Initialize visible POI types
        const types = {};
        poiData.forEach((poi) => {
          types[poi.type] = true;
        });
        setVisiblePOITypes(types);

        setEmergencyServices(emergencyRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load map data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Listen for emergency mode changes from POI sidebar
  const handleEmergencyModeChange = (isActive) => {
    setEmergencyMode(isActive);

    // Automatically show emergency POI markers in emergency mode
    if (isActive) {
      setShowPOIMarkers(true);
    }
  };

  // Handle map click to set start/end points
  const handlePointSelection = (latlng, mode) => {
    // Disable routing in emergency mode
    if (emergencyMode) return;

    // Create a point object from the click
    const point = {
      lat: latlng.lat,
      lng: latlng.lng,
      // Generate a name for the point
      name: mode === "start" ? "Starting Point" : "Destination",
    };

    if (mode === "start") {
      setStartPoint(point);
      // Switch to end mode after selecting start
      setRoutingMode("end");
    } else if (mode === "end") {
      setEndPoint(point);
      // Reset mode after selecting end
      setRoutingMode("none");

      // Calculate route if both points are set
      if (startPoint) {
        calculateRoute(startPoint, point);
      }
    }
  };

  // Calculate route between two points using OSRM
  const calculateRoute = async (start, end) => {
    try {
      setLoading(true);

      // Format coordinates for OSRM API [longitude, latitude]
      const startCoord = `${start.lng},${start.lat}`;
      const endCoord = `${end.lng},${end.lat}`;

      // Call the OSRM routing service for walking directions
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${startCoord};${endCoord}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      // Extract route information
      const route = data.routes[0];
      const geometry = route.geometry;

      // Process coordinates (flip lat/lng for Leaflet)
      const coordinates = geometry.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);

      // Set path data
      setRoutePath({
        coordinates,
        geometry: geometry,
      });

      // Set stats
      setPathStats({
        distance: route.distance, // in meters
        duration: route.duration / 60, // convert to minutes
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      setError("Failed to calculate route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clear the current route
  const handleClearRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoutePath(null);
    setPathStats(null);
    setRoutingMode("none");
  };

  // Toggle visibility of a location category
  const toggleCategory = (category) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle POI type visibility
  const togglePOIType = (type) => {
    setVisiblePOITypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Handle location selection to show POIs
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowPOIMarkers(true);

    // Clear selected POI if a different location is selected
    if (selectedPOI && selectedPOI.location_id !== location.id) {
      setSelectedPOI(null);
    }
  };

  // Handle closing POI display
  const handleClosePOIDisplay = () => {
    setSelectedLocation(null);
    setSelectedPOI(null);
    // Don't hide POI markers in emergency mode
    if (!emergencyMode) {
      setShowPOIMarkers(false);
    }
  };

  // Handle POI selection from the sidebar
  const handlePOISelect = (poi) => {
    setSelectedPOI(poi);

    // Find the related location and highlight it
    const location = locations.find((loc) => loc.id === poi.location_id);
    if (location) {
      setSelectedLocation(location);
      setShowPOIMarkers(true);
    }
  };

  // Toggle POI sidebar visibility
  const togglePoiSidebar = () => {
    setShowPoiSidebar((prev) => !prev);
  };

  // Get POIs for a specific location
  const getLocationPOIs = (locationId) => {
    return pois.filter((poi) => poi.location_id === locationId);
  };

  // Toggle showing POI markers on the map
  const togglePOIMarkers = () => {
    // In emergency mode, POI markers are always shown
    if (emergencyMode) return;

    setShowPOIMarkers((prev) => !prev);
    if (!showPOIMarkers && !showPoiSidebar) {
      setShowPoiSidebar(true);
    }
  };

  // Check if a POI is emergency-related
  const isEmergencyPOI = (poi) => {
    return (
      poi.type === "emergency" ||
      poi.type === "first_aid" ||
      poi.type === "security" ||
      poi.type === "fire_exit" ||
      poi.is_emergency_related === true ||
      poi.name.toLowerCase().includes("emergency") ||
      poi.description.toLowerCase().includes("emergency")
    );
  };

  if (loading && locations.length === 0) {
    return <div className="loading">Loading map data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className={`map-page ${emergencyMode ? "emergency-mode" : ""}`}>
      {/* Toggle button for POI sidebar */}
      <button className="poi-sidebar-toggle" onClick={togglePoiSidebar}>
        {showPoiSidebar ? "Hide POIs" : "Show POIs"}
      </button>

      {/* Toggle button for POI markers - hide in emergency mode */}
      {!emergencyMode && (
        <button className="poi-markers-toggle" onClick={togglePOIMarkers}>
          {showPOIMarkers ? "Hide POI Markers" : "Show POI Markers"}
        </button>
      )}

      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="emergency-mode-indicator">
          <div className="emergency-pulse"></div>
          <span>EMERGENCY MODE ACTIVE</span>
        </div>
      )}

      {/* POI Sidebar */}
      {showPoiSidebar && (
        <POISidebar
          pois={pois}
          locations={locations}
          onSelectPOI={handlePOISelect}
          onClose={() => setShowPoiSidebar(false)}
          onEmergencyModeChange={handleEmergencyModeChange}
        />
      )}

      <div className="controls-container">
        {/* Hide navigation controls in emergency mode */}
        {!emergencyMode && (
          <>
            <h3>Direct Click Navigation</h3>
            <div className="routing-controls">
              <button
                className={`mode-btn ${
                  routingMode === "start" ? "active" : ""
                }`}
                onClick={() =>
                  setRoutingMode(routingMode === "start" ? "none" : "start")
                }
              >
                Select Start Point
              </button>
              <button
                className={`mode-btn ${routingMode === "end" ? "active" : ""}`}
                onClick={() =>
                  setRoutingMode(routingMode === "end" ? "none" : "end")
                }
              >
                Select End Point
              </button>
              <button
                className="clear-route-btn"
                onClick={handleClearRoute}
                disabled={!startPoint && !endPoint}
              >
                Clear Route
              </button>
            </div>

            {pathStats && (
              <div className="route-info">
                <h4>Route Information</h4>
                <p>Distance: {(pathStats.distance / 1000).toFixed(2)} km</p>
                <p>
                  Est. Walking Time: {pathStats.duration.toFixed(2)} minutes
                </p>
              </div>
            )}

            <div className="instructions">
              {routingMode === "start" && (
                <div className="instruction-text">
                  Click on the map to set starting point
                </div>
              )}
              {routingMode === "end" && (
                <div className="instruction-text">
                  Click on the map to set destination
                </div>
              )}
            </div>

            {/* Category filter controls */}
            <div className="category-filters">
              <h4>Filter Locations</h4>
              <div className="filter-options">
                {Object.keys(visibleCategories).map((category) => (
                  <label key={category} className="filter-option">
                    <input
                      type="checkbox"
                      checked={visibleCategories[category]}
                      onChange={() => toggleCategory(category)}
                    />
                    <span className="category-name">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Emergency mode info and instructions */}
        {emergencyMode && (
          <div className="emergency-controls">
            <h3>Emergency Mode</h3>
            <div className="emergency-info">
              <p>Showing all emergency-related facilities on campus.</p>
              <p>Click on any marker to see details and contact information.</p>
            </div>
            <button
              className="exit-emergency-btn"
              onClick={() => handleEmergencyModeChange(false)}
            >
              Exit Emergency Mode
            </button>
          </div>
        )}

        {/* POI Type filters - Only show when POI markers are visible and not in emergency mode */}
        {showPOIMarkers && !emergencyMode && (
          <div className="poi-type-filters">
            <h4>Filter POI Types</h4>
            <div className="filter-options">
              {Object.keys(visiblePOITypes).map((type) => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={visiblePOITypes[type]}
                    onChange={() => togglePOIType(type)}
                  />
                  <span className="category-name">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={srmCoordinates}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Direct click handler - only active when not in emergency mode */}
          {!emergencyMode && (
            <DirectClickHandler
              onPointSelected={handlePointSelection}
              routingMode={routingMode}
            />
          )}

          {/* Center on selected POI */}
          {selectedPOI && selectedLocation && (
            <CenterOnPOI
              poi={selectedPOI}
              location={selectedLocation}
              isActive={!!selectedPOI}
            />
          )}

          {/* Start point marker - hidden in emergency mode */}
          {startPoint && !emergencyMode && (
            <Marker
              position={[startPoint.lat, startPoint.lng]}
              icon={customIcons.startMarker}
            >
              <Popup>
                <strong>Starting Point</strong>
              </Popup>
            </Marker>
          )}

          {/* End point marker - hidden in emergency mode */}
          {endPoint && !emergencyMode && (
            <Marker
              position={[endPoint.lat, endPoint.lng]}
              icon={customIcons.endMarker}
            >
              <Popup>
                <strong>Destination</strong>
              </Popup>
            </Marker>
          )}

          {/* Render location markers based on categories */}
          {locations.map((location) => {
            // Skip if category is filtered out and not in emergency mode
            if (!visibleCategories[location.category] && !emergencyMode) {
              return null;
            }

            // In emergency mode, only show buildings with emergency POIs
            if (emergencyMode) {
              const hasEmergencyPOIs = pois.some(
                (poi) => poi.location_id === location.id && isEmergencyPOI(poi)
              );
              if (!hasEmergencyPOIs) {
                return null;
              }
            }

            // Extract coordinates
            const coords = location.coordinates.coordinates;
            // Leaflet uses [lat, lng] while GeoJSON uses [lng, lat]
            const position = [coords[0], coords[1]];

            // Check if this is the selected location
            const isSelected =
              selectedLocation && selectedLocation.id === location.id;

            return (
              <Marker
                key={location.id}
                position={position}
                icon={getIconForCategory(location.category)}
                eventHandlers={{
                  click: () => handleLocationSelect(location),
                }}
                opacity={isSelected ? 1 : 0.8} // Highlight selected location
                zIndexOffset={isSelected ? 1000 : 0} // Bring selected location to front
              >
                <Popup>
                  <div className="location-popup">
                    <strong>{location.name}</strong>
                    <p>{location.description}</p>
                    {location.building && <p>Building: {location.building}</p>}
                    {location.floor > 0 && <p>Floor: {location.floor}</p>}
                    {location.room_number && (
                      <p>Room: {location.room_number}</p>
                    )}
                    <p className="category-tag">
                      Category: {location.category}
                    </p>
                    <button
                      className="view-poi-btn"
                      onClick={() => handleLocationSelect(location)}
                    >
                      View Points of Interest
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render POI markers when a location is selected or POI markers are enabled */}
          {showPOIMarkers &&
            pois.map((poi) => {
              // In emergency mode, only show emergency-related POIs
              if (emergencyMode && !isEmergencyPOI(poi)) {
                return null;
              }

              // Skip if POI type is filtered out and not in emergency mode
              if (!visiblePOITypes[poi.type] && !emergencyMode) {
                return null;
              }

              // Get the location for this POI
              const location = locations.find(
                (loc) => loc.id === poi.location_id
              );
              if (!location) return null;

              // Skip if location's category is filtered out and not in emergency mode
              if (!visibleCategories[location.category] && !emergencyMode) {
                return null;
              }

              // Get coordinates from the location
              const coords = location.coordinates.coordinates;
              // Add a small offset to prevent markers stacking directly on top of each other
              const poiCount = getLocationPOIs(location.id).length;
              const index = getLocationPOIs(location.id).findIndex(
                (p) => p.id === poi.id
              );
              const angle = (index / poiCount) * 2 * Math.PI;
              const offsetRadius = 0.0001; // Small offset radius

              const position = [
                coords[0] + offsetRadius * Math.cos(angle),
                coords[1] + offsetRadius * Math.sin(angle),
              ];

              // Check if this is the selected POI
              const isSelected = selectedPOI && selectedPOI.id === poi.id;

              // Use pulsing animation for emergency POIs in emergency mode
              const isEmergency = isEmergencyPOI(poi);
              const className =
                emergencyMode && isEmergency ? "emergency-pulse-marker" : "";

              return (
                <Marker
                  key={`poi-${poi.id}`}
                  position={position}
                  icon={getIconForPOIType(poi.type)}
                  eventHandlers={{
                    click: () => handlePOISelect(poi),
                    popupopen: () => setPoiTooltipOpen(poi.id),
                    popupclose: () => setPoiTooltipOpen(null),
                  }}
                  opacity={isSelected ? 1 : isEmergency ? 0.9 : 0.75}
                  zIndexOffset={isSelected ? 2000 : isEmergency ? 1500 : 100} // Put emergency POIs above regular ones
                  className={className}
                >
                  <Popup>
                    <div
                      className={`poi-popup ${
                        isEmergency ? "emergency-popup" : ""
                      }`}
                    >
                      <strong>{poi.name}</strong>
                      <p>{poi.description}</p>
                      <p className="poi-type-tag">Type: {poi.type}</p>
                      <p className="poi-location-tag">
                        Location: {location ? location.name : "Unknown"}
                      </p>
                      <div className="poi-availability">
                        <span
                          className={`status-badge ${
                            poi.is_available ? "available" : "unavailable"
                          }`}
                        >
                          {poi.is_available ? "Available" : "Unavailable"}
                        </span>
                        {poi.capacity && (
                          <span className="capacity-info">
                            {poi.current_occupancy !== null
                              ? `Occupancy: ${poi.current_occupancy}/${poi.capacity}`
                              : `Capacity: ${poi.capacity}`}
                          </span>
                        )}
                      </div>

                      {/* Show emergency contact information if available */}
                      {isEmergency && poi.emergency_contact && (
                        <a
                          href={`tel:${poi.emergency_contact}`}
                          className="emergency-contact-btn"
                        >
                          📞 Call: {poi.emergency_contact}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Render the route path - hidden in emergency mode */}
          {routePath && routePath.coordinates.length > 0 && !emergencyMode && (
            <>
              {/* Main path line */}
              <Polyline
                positions={routePath.coordinates}
                color="#3388ff"
                weight={6}
                opacity={0.8}
                lineJoin="round"
              />

              {/* Decorative line effect */}
              <Polyline
                positions={routePath.coordinates}
                color="white"
                weight={3}
                opacity={0.5}
                dashArray="10,15"
                dashOffset="0"
              />
            </>
          )}

          {/* Update map view when path changes */}
          {routePath && <SetViewOnPath path={routePath} />}
        </MapContainer>

        {/* Show POI information when a location is selected */}
        {selectedLocation && (
          <POIDisplay
            selectedLocation={selectedLocation}
            pois={pois}
            selectedPOI={selectedPOI}
            onSelectPOI={handlePOISelect}
            onClose={handleClosePOIDisplay}
            emergencyMode={emergencyMode}
          />
        )}
      </div>
    </div>
  );
}

export default Map;
