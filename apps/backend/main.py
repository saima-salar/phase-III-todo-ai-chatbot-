from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Union
import os
from sqlmodel import SQLModel, Field, select, Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from pydantic import BaseModel, field_validator
from enum import Enum
from jose import jwt
from passlib.context import CryptContext
import json

# Import models and auth
from models import Task, User, Conversation, Message
from middleware import JWTBearer, get_current_user_id, jwt_middleware
from database import engine, get_session
from api.chat_endpoints import router as chat_router

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("BETTER_AUTH_JWT_SECRET", "fallback-secret-for-dev")
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        return user

def create_user(email: str, password: str, first_name: Optional[str] = None, last_name: Optional[str] = None):
    hashed_password = hash_password(password)
    with Session(engine) as session:
        db_user = User(
            email=email,
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

# Create FastAPI app
app = FastAPI(title="Todo API", version="1.0.0")

# Add JWT middleware
app.middleware("http")(jwt_middleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include chat API routes
app.include_router(chat_router, prefix="/api", tags=["chat"])

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(bind=engine)

# Pydantic models for request/response
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: str = "medium"  # low, medium, high
    tags: Optional[list[str]] = None  # list of tags
    due_date: Optional[Union[datetime, str]] = None
    # Advanced features
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None  # daily, weekly, monthly, yearly
    parent_task_id: Optional[int] = None  # For task dependencies
    estimated_duration: Optional[int] = None  # Estimated time in minutes
    reminder_enabled: bool = False
    reminder_time: Optional[Union[datetime, str]] = None
    shared_with: Optional[list[int]] = None  # List of user IDs to share with

    @field_validator('due_date', 'reminder_time', mode='before')
    @classmethod
    def validate_datetime(cls, v):
        if v is None or v == "" or v == "null":
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try parsing other common formats
                    return datetime.strptime(v, '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    try:
                        return datetime.strptime(v, '%Y-%m-%d')
                    except ValueError:
                        raise ValueError(f"Invalid datetime format: {v}")
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None  # low, medium, high
    tags: Optional[list[str]] = None  # list of tags
    due_date: Optional[Union[datetime, str]] = None
    # Advanced features
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None  # daily, weekly, monthly, yearly
    parent_task_id: Optional[int] = None  # For task dependencies
    estimated_duration: Optional[int] = None  # Estimated time in minutes
    actual_duration: Optional[int] = None  # Actual time spent in minutes
    reminder_enabled: Optional[bool] = None
    reminder_time: Optional[Union[datetime, str]] = None
    shared_with: Optional[list[int]] = None  # List of user IDs to share with

    @field_validator('due_date', 'reminder_time', mode='before')
    @classmethod
    def validate_datetime(cls, v):
        if v is None or v == "" or v == "null":
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            try:
                # Try ISO format first
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try parsing other common formats
                    return datetime.strptime(v, '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    try:
                        return datetime.strptime(v, '%Y-%m-%d')
                    except ValueError:
                        raise ValueError(f"Invalid datetime format: {v}")
        return v

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Authentication Endpoints
@app.post("/auth/register", response_model=User)
def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        user = create_user(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/auth/login", response_model=Token)
def login_user(login_data: UserLogin):
    """Login user and return access token"""
    user = authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Todo API"}

@app.get("/api/{user_id}/tasks")
def get_tasks(request: Request,
             user_id: int,
             completed: Optional[bool] = None,
             priority: Optional[str] = None,
             tags: Optional[str] = None,
             search: Optional[str] = None,
             sort_by: Optional[str] = "created_at",
             sort_order: Optional[str] = "desc"):
    """
    Get all tasks for a specific user with optional filtering and sorting
    """
    # Verify that the authenticated user is the same as the requested user
    current_user_id = getattr(request.state, 'user_id', None)
    # Convert to string for comparison since Better Auth user IDs might be strings
    if str(current_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these tasks"
        )

    with Session(engine) as session:
        statement = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if completed is not None:
            statement = statement.where(Task.completed == completed)

        if priority is not None:
            statement = statement.where(Task.priority == priority)

        if tags is not None:
            # Search for tasks that contain any of the specified tags
            # Tags are stored as a JSON string, so we use LIKE for partial matching
            tag_list = tags.split(',')
            for tag in tag_list:
                statement = statement.where(Task.tags.like(f'%{tag.strip()}%'))

        if search is not None:
            # Search in title and description
            statement = statement.where(
                (Task.title.contains(search)) |
                (Task.description.contains(search) if Task.description is not None else False)
            )

        # Apply sorting
        if sort_by == "title":
            if sort_order == "desc":
                statement = statement.order_by(Task.title.desc())
            else:
                statement = statement.order_by(Task.title.asc())
        elif sort_by == "completed":
            if sort_order == "desc":
                statement = statement.order_by(Task.completed.desc())
            else:
                statement = statement.order_by(Task.completed.asc())
        elif sort_by == "priority":
            if sort_order == "desc":
                statement = statement.order_by(Task.priority.desc())
            else:
                statement = statement.order_by(Task.priority.asc())
        elif sort_by == "due_date":
            if sort_order == "desc":
                statement = statement.order_by(Task.due_date.desc())
            else:
                statement = statement.order_by(Task.due_date.asc())
        else:  # default to created_at
            if sort_order == "desc":
                statement = statement.order_by(Task.created_at.desc())
            else:
                statement = statement.order_by(Task.created_at.asc())

        tasks = session.exec(statement).all()
        return tasks

@app.post("/api/{user_id}/tasks")
def create_task(request: Request,
               user_id: int,
               task_data: TaskCreate):
    """
    Create a new task for a specific user
    """
    # Verify that the authenticated user is the same as the requested user
    current_user_id = getattr(request.state, 'user_id', None)
    # Convert to string for comparison since Better Auth user IDs might be strings
    if str(current_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user"
        )

    # Convert tags list to JSON string
    tags_str = None
    if task_data.tags:
        import json
        tags_str = json.dumps(task_data.tags)

    # Convert shared_with list to JSON string
    shared_with_str = None
    if task_data.shared_with:
        import json
        shared_with_str = json.dumps(task_data.shared_with)

    # Handle datetime conversion if needed
    due_date = task_data.due_date
    if isinstance(due_date, str):
        # The validator should have already converted this, but just in case
        due_date = None if due_date in (None, "", "null") else datetime.fromisoformat(due_date.replace('Z', '+00:00'))

    reminder_time = task_data.reminder_time
    if isinstance(reminder_time, str):
        # The validator should have already converted this, but just in case
        reminder_time = None if reminder_time in (None, "", "null") else datetime.fromisoformat(reminder_time.replace('Z', '+00:00'))

    with Session(engine) as session:
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            completed=task_data.completed,
            priority=task_data.priority,
            tags=tags_str,
            due_date=due_date,
            # Advanced features
            is_recurring=task_data.is_recurring,
            recurrence_pattern=task_data.recurrence_pattern,
            parent_task_id=task_data.parent_task_id,
            estimated_duration=task_data.estimated_duration,
            reminder_enabled=task_data.reminder_enabled,
            reminder_time=reminder_time,
            shared_with=shared_with_str
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

@app.get("/api/{user_id}/tasks/{task_id}")
def get_task(request: Request, user_id: int, task_id: int):
    """
    Get a specific task by ID for a specific user
    """
    # Verify that the authenticated user is the same as the requested user
    current_user_id = getattr(request.state, 'user_id', None)
    # Convert to string for comparison since Better Auth user IDs might be strings
    if str(current_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

@app.put("/api/{user_id}/tasks/{task_id}")
def update_task(request: Request,
               user_id: int,
               task_id: int,
               task_data: TaskUpdate):
    """
    Update a specific task by ID for a specific user
    """
    # Verify that the authenticated user is the same as the requested user
    current_user_id = getattr(request.state, 'user_id', None)
    # Convert to string for comparison since Better Auth user IDs might be strings
    if str(current_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found")

        # Update fields if provided
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.completed is not None:
            task.completed = task_data.completed
        if task_data.priority is not None:
            task.priority = task_data.priority
        if task_data.tags is not None:
            import json
            task.tags = json.dumps(task_data.tags)
        if task_data.due_date is not None:
            # Handle datetime conversion for due_date
            due_date = task_data.due_date
            if isinstance(due_date, str):
                due_date = None if due_date in (None, "", "null") else datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            else:
                due_date = due_date
            task.due_date = due_date
        # Advanced features
        if task_data.is_recurring is not None:
            task.is_recurring = task_data.is_recurring
        if task_data.recurrence_pattern is not None:
            task.recurrence_pattern = task_data.recurrence_pattern
        if task_data.parent_task_id is not None:
            task.parent_task_id = task_data.parent_task_id
        if task_data.estimated_duration is not None:
            task.estimated_duration = task_data.estimated_duration
        if task_data.actual_duration is not None:
            task.actual_duration = task_data.actual_duration
        if task_data.reminder_enabled is not None:
            task.reminder_enabled = task_data.reminder_enabled
        if task_data.reminder_time is not None:
            # Handle datetime conversion for reminder_time
            reminder_time = task_data.reminder_time
            if isinstance(reminder_time, str):
                reminder_time = None if reminder_time in (None, "", "null") else datetime.fromisoformat(reminder_time.replace('Z', '+00:00'))
            else:
                reminder_time = reminder_time
            task.reminder_time = reminder_time
        if task_data.shared_with is not None:
            import json
            task.shared_with = json.dumps(task_data.shared_with)

        session.add(task)
        session.commit()
        session.refresh(task)
        return task

@app.delete("/api/{user_id}/tasks/{task_id}")
def delete_task(request: Request,
               user_id: int,
               task_id: int):
    """
    Delete a specific task by ID for a specific user
    """
    # Verify that the authenticated user is the same as the requested user
    current_user_id = getattr(request.state, 'user_id', None)
    # Convert to string for comparison since Better Auth user IDs might be strings
    if str(current_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found")

        session.delete(task)
        session.commit()
        return {"message": "Task deleted successfully"}

@app.patch("/api/{user_id}/tasks/{task_id}/complete")
def toggle_task_completion(request: Request,
                         user_id: int,
                         task_id: int):
    """
    Toggle completion status of a specific task for a specific user
    """
    # Verify that the authenticated user is the same as the requested user
    current_user_id = getattr(request.state, 'user_id', None)
    # Convert to string for comparison since Better Auth user IDs might be strings
    if str(current_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=404, detail="Task not found")

        task.completed = not task.completed
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

# User profile endpoints
@app.get("/api/user")
def get_current_user_profile(request: Request):
    """
    Get the profile of the currently authenticated user
    """
    # Get user ID from the JWT token
    current_user_id = getattr(request.state, 'user_id', None)

    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Fetch user data from the database
    with Session(engine) as session:
        # Handle the case where current_user_id might be a string but the DB expects an integer
        try:
            user_id_int = int(current_user_id)
            user = session.get(User, user_id_int)
        except (ValueError, TypeError):
            # If conversion fails, try to find user by email (assuming current_user_id is an email)
            statement = select(User).where(User.email == current_user_id)
            user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Return user data without sensitive information
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }