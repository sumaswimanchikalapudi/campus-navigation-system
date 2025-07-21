// File: src/components/SearchBar.js
import React, { useState, useRef, useEffect } from "react";
import "./SearchBar.css";

const SearchBar = ({
  locations,
  onLocationSelect,
  placeholder = "Search locations...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const dropdownRef = useRef(null);

  // Filter locations based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLocations([]);
      return;
    }

    const filtered = locations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.building &&
          location.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.room_number && location.room_number.includes(searchTerm))
    );

    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleLocationClick = (location) => {
    onLocationSelect(location);
    setSearchTerm(location.name);
    setIsOpen(false);
  };

  return (
    <div className="search-bar" ref={dropdownRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && filteredLocations.length > 0 && (
        <div className="search-results">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="search-result-item"
              onClick={() => handleLocationClick(location)}
            >
              <div className="location-name">{location.name}</div>
              <div className="location-details">
                {location.building && <span>{location.building}</span>}
                {location.room_number && (
                  <span>Room: {location.room_number}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
