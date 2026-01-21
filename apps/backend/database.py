from sqlmodel import create_engine, Session
from typing import Generator
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")  # Using SQLite for simplicity
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})


def get_session() -> Generator[Session, None, None]:
    """Dependency to get a database session."""
    with Session(engine) as session:
        yield session