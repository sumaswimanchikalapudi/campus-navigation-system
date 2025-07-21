# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:1234@localhost/srm_navigation"

# In database.py, try adding:
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
    print("Database connection successful")
except Exception as e:
    print(f"Database connection failed: {str(e)}")
    raise
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()