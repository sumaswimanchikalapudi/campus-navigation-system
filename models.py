from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Text, Table
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from database import Base

# Association table for path segments
path_edges = Table('path_edges', Base.metadata,
    Column('from_id', Integer, ForeignKey('locations.id'), primary_key=True),
    Column('to_id', Integer, ForeignKey('locations.id'), primary_key=True),
    Column('distance', Float)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100))
    role = Column(String(20), default="user")  # user or admin
    is_active = Column(Boolean, default=True)

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(Text, nullable=True)
    building = Column(String(100), nullable=True, index=True)
    floor = Column(Integer, nullable=True)
    room_number = Column(String(20), nullable=True)
    category = Column(String(50), index=True)
    
    # Change this line to specify SRID 4326 explicitly
    coordinates = Column(Geometry("POINT", srid=4326))
    
    # Relationships
    connected_to = relationship(
        "Location",
        secondary=path_edges,
        primaryjoin=(id == path_edges.c.from_id),
        secondaryjoin=(id == path_edges.c.to_id),
        backref="connected_from"
    )
    
    pois = relationship("POI", back_populates="location")
    emergency_services = relationship("EmergencyService", back_populates="location")

class POI(Base):
    __tablename__ = "points_of_interest"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    type = Column(String(50), index=True)  # cafe, restroom, parking, elevator
    description = Column(Text, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    
    # For real-time data
    is_available = Column(Boolean, default=True)  # For parking areas
    capacity = Column(Integer, nullable=True)  # For cafes, parking
    current_occupancy = Column(Integer, nullable=True)  # For cafes, parking
    
    # Relationship
    location = relationship("Location", back_populates="pois")

class EmergencyService(Base):
    __tablename__ = "emergency_services"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), index=True)  # fire_extinguisher, first_aid, emergency_exit
    description = Column(Text, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    
    # Relationship
    location = relationship("Location", back_populates="emergency_services")


    class Config:
        orm_mode = True