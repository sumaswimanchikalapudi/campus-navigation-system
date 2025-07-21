# crud.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.sql.expression import cast
from geoalchemy2.functions import ST_AsGeoJSON
from geoalchemy2.shape import to_shape
from shapely.geometry import Point as ShapelyPoint
import json
import models, schemas
import heapq
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
import models, schemas
from security import pwd_context

from passlib.context import CryptContext  # Import where used

# User operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# In your crud.py file:
def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    # Now accepts hashed_password instead of pwd_context
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,  # Use the pre-hashed password
        role=user.role if hasattr(user, 'role') else "user"  # Default to "user" if role not provided
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
# Option 2: Import pwd_context inside the function (if it's defined elsewhere)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def authenticate_user(db: Session, username: str, password: str, pwd_context: CryptContext):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user


# Location operations
def get_location(db: Session, location_id: int):
    location = db.query(models.Location).filter(models.Location.id == location_id).first()
    return location

from sqlalchemy import func
from geoalchemy2.functions import ST_AsGeoJSON
import json

def get_locations(db: Session, skip: int = 0, limit: int = 100):
    # Query locations with coordinates converted to GeoJSON
    locations = db.query(
        models.Location.id,
        models.Location.name,
        models.Location.description,
        models.Location.building,
        models.Location.floor,
        models.Location.room_number,
        models.Location.category,
        func.ST_AsGeoJSON(models.Location.coordinates).label('coordinates_geojson')
    ).offset(skip).limit(limit).all()
    
    # Convert the result to a list of dictionaries with properly formatted coordinates
    result = []
    for loc in locations:
        # Convert to dict
        loc_dict = {
            'id': loc.id,
            'name': loc.name,
            'description': loc.description,
            'building': loc.building,
            'floor': loc.floor,
            'room_number': loc.room_number,
            'category': loc.category,
            'coordinates': json.loads(loc.coordinates_geojson)  # Parse GeoJSON string to dict
        }
        result.append(loc_dict)
    
    return result
def create_location(db: Session, location: schemas.LocationCreate):
    point = ShapelyPoint(location.coordinates.coordinates[0], location.coordinates.coordinates[1])
    db_location = models.Location(
        name=location.name,
        description=location.description,
        building=location.building,
        floor=location.floor,
        room_number=location.room_number,
        category=location.category,
        coordinates=f'SRID=4326;{point.wkt}'
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    
    # Add connections if any
    if location.connected_to:
        for connected_id in location.connected_to:
            connected_location = get_location(db, connected_id)
            if connected_location:
                # Calculate Euclidean distance between points
                loc1_point = to_shape(db_location.coordinates)
                loc2_point = to_shape(connected_location.coordinates)
                distance = loc1_point.distance(loc2_point)
                
                # Add edge in both directions
                stmt = models.path_edges.insert().values(
                    from_id=db_location.id,
                    to_id=connected_id,
                    distance=distance
                )
                db.execute(stmt)
                
                stmt = models.path_edges.insert().values(
                    from_id=connected_id,
                    to_id=db_location.id,
                    distance=distance
                )
                db.execute(stmt)
                
        db.commit()
    
    return db_location

def update_location(db: Session, location_id: int, location: schemas.LocationUpdate):
    db_location = get_location(db, location_id)
    
    # Update basic fields
    update_data = location.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key != "coordinates" and key != "connected_to" and value is not None:
            setattr(db_location, key, value)
    
    # Update coordinates if provided
    if location.coordinates:
        point = ShapelyPoint(location.coordinates.coordinates[0], location.coordinates.coordinates[1])
        db_location.coordinates = f'SRID=4326;{point.wkt}'
    
    # Update connections if provided
    if location.connected_to is not None:
        # Remove existing connections
        db.execute(models.path_edges.delete().where(models.path_edges.c.from_id == location_id))
        db.execute(models.path_edges.delete().where(models.path_edges.c.to_id == location_id))
        
        # Add new connections
        for connected_id in location.connected_to:
            connected_location = get_location(db, connected_id)
            if connected_location:
                # Calculate Euclidean distance between points
                loc1_point = to_shape(db_location.coordinates)
                loc2_point = to_shape(connected_location.coordinates)
                distance = loc1_point.distance(loc2_point)
                
                # Add edge in both directions
                stmt = models.path_edges.insert().values(
                    from_id=db_location.id,
                    to_id=connected_id,
                    distance=distance
                )
                db.execute(stmt)
                
                stmt = models.path_edges.insert().values(
                    from_id=connected_id,
                    to_id=db_location.id,
                    distance=distance
                )
                db.execute(stmt)
    
    db.commit()
    db.refresh(db_location)
    return db_location

def delete_location(db: Session, location_id: int):
    # Delete connections
    db.execute(models.path_edges.delete().where(models.path_edges.c.from_id == location_id))
    db.execute(models.path_edges.delete().where(models.path_edges.c.to_id == location_id))
    
    # Delete POIs and emergency services related to this location
    db.query(models.POI).filter(models.POI.location_id == location_id).delete()
    db.query(models.EmergencyService).filter(models.EmergencyService.location_id == location_id).delete()
    
    # Delete location
    db_location = get_location(db, location_id)
    db.delete(db_location)
    db.commit()
    return True

# POI operations
def get_poi(db: Session, poi_id: int):
    return db.query(models.POI).filter(models.POI.id == poi_id).first()

def get_pois(db: Session, type: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.POI)
    if type:
        query = query.filter(models.POI.type == type)
    return query.offset(skip).limit(limit).all()

def create_poi(db: Session, poi: schemas.POICreate):
    db_poi = models.POI(**poi.dict())
    db.add(db_poi)
    db.commit()
    db.refresh(db_poi)
    return db_poi

def update_poi(db: Session, poi_id: int, poi: schemas.POICreate):
    db_poi = get_poi(db, poi_id)
    for key, value in poi.dict().items():
        setattr(db_poi, key, value)
    db.commit()
    db.refresh(db_poi)
    return db_poi

def delete_poi(db: Session, poi_id: int):
    db_poi = get_poi(db, poi_id)
    db.delete(db_poi)
    db.commit()
    return True

# Emergency Service operations
def get_emergency_service(db: Session, service_id: int):
    return db.query(models.EmergencyService).filter(models.EmergencyService.id == service_id).first()

def get_emergency_services(db: Session, type: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.EmergencyService)
    if type:
        query = query.filter(models.EmergencyService.type == type)
    return query.offset(skip).limit(limit).all()

def create_emergency_service(db: Session, service: schemas.EmergencyServiceCreate):
    db_service = models.EmergencyService(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_emergency_service(db: Session, service_id: int, service: schemas.EmergencyServiceCreate):
    db_service = get_emergency_service(db, service_id)
    for key, value in service.dict().items():
        setattr(db_service, key, value)
    db.commit()
    db.refresh(db_service)
    return db_service

def delete_emergency_service(db: Session, service_id: int):
    db_service = get_emergency_service(db, service_id)
    db.delete(db_service)
    db.commit()
    return True

# Pathfinding
def calculate_path(db: Session, start_id: int, end_id: int):
    """
    Implements Dijkstra's algorithm to find the shortest path between two locations
    """
    # Get all locations and build the graph
    locations = {loc.id: loc for loc in db.query(models.Location).all()}
    
    # Dictionary to store the distance from start to each node
    distances = {loc_id: float('infinity') for loc_id in locations}
    distances[start_id] = 0
    
    # Dictionary to store the previous node in optimal path
    previous = {loc_id: None for loc_id in locations}
    
    # Priority queue to store vertices that need to be processed
    # Format: (distance, location_id)
    pq = [(0, start_id)]
    
    # Set to keep track of processed vertices
    processed = set()
    
    while pq:
        # Get the vertex with the smallest distance
        current_distance, current_id = heapq.heappop(pq)
        
        # If we've already processed this vertex, skip
        if current_id in processed:
            continue
            
        # Mark as processed
        processed.add(current_id)
        
        # If we've reached the destination, break
        if current_id == end_id:
            break
            
        # Get all connections for the current location
        connections = db.query(models.path_edges).filter(models.path_edges.c.from_id == current_id).all()
        
        for conn in connections:
            neighbor_id = conn.to_id
            weight = conn.distance
            
            # If we've already processed this neighbor, skip
            if neighbor_id in processed:
                continue
                
            # Calculate new distance
            distance = current_distance + weight
            
            # If this path is better than any previous path
            if distance < distances[neighbor_id]:
                distances[neighbor_id] = distance
                previous[neighbor_id] = current_id
                heapq.heappush(pq, (distance, neighbor_id))
    
    # Reconstruct path
    path = []
    current_id = end_id
    
    # If end_id is not reachable
    if previous[end_id] is None and end_id != start_id:
        return None
        
    while current_id is not None:
        location = locations[current_id]
        coordinates_geojson = json.loads(db.scalar(ST_AsGeoJSON(location.coordinates)))
        path.append(schemas.PathSegment(
            location_id=location.id,
            name=location.name,
            coordinates=schemas.Point(type="Point", coordinates=[
                coordinates_geojson["coordinates"][0],
                coordinates_geojson["coordinates"][1]
            ])
        ))
        current_id = previous[current_id]
        
    # Reverse path to get start to end
    path.reverse()
    
    # Calculate total distance and estimated time
    # Assume average walking speed of 1.4 m/s
    total_distance = distances[end_id]
    walking_speed = 1.4  # m/s
    estimated_time = total_distance / walking_speed / 60  # convert to minutes
    
    return schemas.Path(
        segments=path,
        total_distance=total_distance,
        estimated_time=estimated_time
    )