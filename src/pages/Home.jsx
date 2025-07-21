// File: src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>SRM University AP Campus Navigation System</h1>
        <p>
          Find your way around campus with ease using our interactive map and
          navigation system.
        </p>
        <Link to="/map" className="cta-button">
          Explore Campus Map
        </Link>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Search Locations</h3>
            <p>
              Find any building, classroom, or facility on campus quickly and
              easily.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Interactive Map</h3>
            <p>
              View an interactive map of the entire campus with detailed
              information.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧭</div>
            <h3>Navigation</h3>
            <p>Get step-by-step directions to any location on campus.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">☕</div>
            <h3>Campus Amenities</h3>
            <p>
              Locate cafes, restrooms, parking areas, and elevators across
              campus.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Emergency Services</h3>
            <p>
              Find emergency exits, fire extinguishers, and first aid kits when
              needed.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>
              Access the navigation system from any device, anywhere on campus.
            </p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>About SRM University AP</h2>
        <p>
          SRM University, Andhra Pradesh is a multi-stream research university
          with a focus on diverse fields. The campus is located in Amaravati,
          the new capital of Andhra Pradesh, India. The university campus is
          spread across a vast area with modern infrastructure and
          state-of-the-art facilities.
        </p>
        <p>
          This navigation system is designed to help students, faculty, staff,
          and visitors navigate the sprawling campus easily and efficiently.
        </p>
      </div>
    </div>
  );
};

export default Home;
