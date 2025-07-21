from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import models, schemas, crud
from database import engine, get_db
import jwt
from passlib.context import CryptContext
from schemas import UserCreate  # make sure you have this Pydantic schema
from models import User  # assuming you have a User model
from sqlalchemy.orm import Session


# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Authentication setup
SECRET_KEY = "your-secret-key"  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication endpoints
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password, pwd_context)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Location endpoints
@app.get("/locations/", response_model=List[schemas.Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = crud.get_locations(db, skip=skip, limit=limit)
    return locations

@app.get("/locations/{location_id}", response_model=schemas.Location)
def read_location(location_id: int, db: Session = Depends(get_db)):
    db_location = crud.get_location(db, location_id=location_id)
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_location

@app.post("/locations/", response_model=schemas.Location)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    return crud.create_location(db=db, location=location)

@app.put("/locations/{location_id}", response_model=schemas.Location)
def update_location(location_id: int, location: schemas.LocationUpdate, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    db_location = crud.get_location(db, location_id=location_id)
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return crud.update_location(db=db, location_id=location_id, location=location)

@app.delete("/locations/{location_id}")
def delete_location(location_id: int, db: Session = Depends(get_db), current_user = Depends(get_admin_user)):
    db_location = crud.get_location(db, location_id=location_id)
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    crud.delete_location(db=db, location_id=location_id)
    return {"message": "Location deleted successfully"}

# Pathfinding endpoint
@app.get("/path/", response_model=schemas.Path)
def find_path(start_id: int, end_id: int, db: Session = Depends(get_db)):
    path = crud.calculate_path(db, start_id=start_id, end_id=end_id)
    if not path:
        raise HTTPException(status_code=404, detail="Path could not be calculated")
    return path

# POI endpoints
@app.get("/poi/", response_model=List[schemas.POI])
def read_pois(type: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_pois(db, type=type, skip=skip, limit=limit)

# Emergency services endpoints
@app.get("/emergency/", response_model=List[schemas.EmergencyService])
def read_emergency_services(type: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_emergency_services(db, type=type, skip=skip, limit=limit)

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Validate email format
        if not user.email or '@' not in user.email:
            raise HTTPException(status_code=400, detail="Invalid email format")
            
        db_user = crud.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        db_user = crud.get_user_by_username(db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Hash the password here before passing to create_user
        hashed_password = pwd_context.hash(user.password)
        
        # Modified to NOT pass pwd_context
        return crud.create_user(db=db, user=user, hashed_password=hashed_password)
    except Exception as e:
        # Log the actual error
        print(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)