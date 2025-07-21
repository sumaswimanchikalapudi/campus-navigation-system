
# schemas.py
from typing import List, Optional
from pydantic import BaseModel, Field
from geojson_pydantic import Point

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"

class User(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        orm_mode = True

# Location schemas
class LocationBase(BaseModel):
    name: str
    description: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    room_number: Optional[str] = None
    category: str

class LocationCreate(LocationBase):
    coordinates: Point
    connected_to: Optional[List[int]] = []

class LocationUpdate(LocationBase):
    name: Optional[str] = None
    coordinates: Optional[Point] = None
    connected_to: Optional[List[int]] = []

class Location(LocationBase):
    id: int
    coordinates: Point
    
    class Config:
        orm_mode = True
        
# POI schemas
class POIBase(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    is_available: Optional[bool] = True
    capacity: Optional[int] = None
    current_occupancy: Optional[int] = None

class POICreate(POIBase):
    location_id: int

class POI(POIBase):
    id: int
    location_id: int
    
    class Config:
        orm_mode = True

# Emergency service schemas
class EmergencyServiceBase(BaseModel):
    type: str
    description: Optional[str] = None

class EmergencyServiceCreate(EmergencyServiceBase):
    location_id: int

class EmergencyService(EmergencyServiceBase):
    id: int
    location_id: int
    
    class Config:
        orm_mode = True

# Pathfinding schemas
class PathSegment(BaseModel):
    location_id: int
    name: str
    coordinates: Point

class Path(BaseModel):
    segments: List[PathSegment]
    total_distance: float
    estimated_time: float  # in minutes