"""MCP Tools Implementation for AI Todo Chatbot"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import Session, select
from models import Task, User
from database import engine
import uuid
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def add_task(user_id: str, title: str, description: Optional[str] = None) -> Dict[str, Any]:
    """
    Creates a new task for a specific user.

    Args:
        user_id: Unique identifier of the user who owns the task
        title: Title of the task (required)
        description: Detailed description of the task (optional)

    Returns:
        Task object containing id, user_id, title, description, status, created_at, updated_at

    Raises:
        ValidationError: When required parameters are missing or invalid
        UnauthorizedError: When user_id doesn't match an existing user
        RateLimitError: When user exceeds daily task creation limits
    """
    try:
        # Validate inputs
        if not title or not title.strip():
            raise ValueError("ValidationError: Title is required and cannot be empty")

        # Convert user_id to int if it's numeric, otherwise treat as string
        try:
            user_id_int = int(user_id)
        except ValueError:
            user_id_int = user_id

        # Create session and check if user exists
        with Session(engine) as session:
            # Check if user exists
            user_check_stmt = select(User).where(User.id == user_id_int if isinstance(user_id_int, int) else User.email == user_id)
            user = session.exec(user_check_stmt).first()

            # If user_id is numeric, check by ID; otherwise, assume it's an email
            if isinstance(user_id_int, int):
                user_check_stmt = select(User).where(User.id == user_id_int)
            else:
                user_check_stmt = select(User).where(User.email == user_id_int)

            user = session.exec(user_check_stmt).first()

            if not user:
                raise ValueError("UnauthorizedError: User does not exist")

            # Create new task
            task = Task(
                user_id=user.id,
                title=title.strip(),
                description=description.strip() if description else None,
                completed=False,  # Default to pending
                priority="medium",  # Default priority
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            session.add(task)
            session.commit()
            session.refresh(task)

            # Return the created task in the expected format
            return {
                "id": task.id,
                "user_id": str(task.user_id),
                "title": task.title,
                "description": task.description,
                "status": "pending" if not task.completed else "completed",
                "created_at": task.created_at.isoformat() if task.created_at else None,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
    except ValueError as ve:
        if "ValidationError" in str(ve) or "UnauthorizedError" in str(ve) or "RateLimitError" in str(ve):
            raise ve
        else:
            raise ValueError(f"ValidationError: Invalid input - {str(ve)}")
    except Exception as e:
        logger.error(f"Error in add_task: {str(e)}")
        raise ValueError(f"InternalServerError: Failed to add task - {str(e)}")


def list_tasks(user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieves a list of tasks for a specific user, optionally filtered by status.

    Args:
        user_id: Unique identifier of the user whose tasks to retrieve
        status: Filter tasks by status ('pending', 'in-progress', 'completed') (optional)

    Returns:
        Array of Task objects as defined in add_task

    Raises:
        ValidationError: When user_id is invalid
        UnauthorizedError: When user_id doesn't match an existing user
    """
    try:
        # Convert user_id to int if it's numeric, otherwise treat as string
        try:
            user_id_int = int(user_id)
        except ValueError:
            user_id_int = user_id

        with Session(engine) as session:
            # Check if user exists
            if isinstance(user_id_int, int):
                user_check_stmt = select(User).where(User.id == user_id_int)
            else:
                user_check_stmt = select(User).where(User.email == user_id_int)

            user = session.exec(user_check_stmt).first()

            if not user:
                raise ValueError("UnauthorizedError: User does not exist")

            # Build query for tasks
            stmt = select(Task).where(Task.user_id == user.id)

            # Apply status filter if provided
            if status:
                if status.lower() == 'pending':
                    stmt = stmt.where(Task.completed == False)
                elif status.lower() == 'completed':
                    stmt = stmt.where(Task.completed == True)
                elif status.lower() == 'in-progress':
                    # For now, treating in-progress as tasks that are not completed
                    stmt = stmt.where(Task.completed == False)
                else:
                    raise ValueError("ValidationError: Invalid status value. Use 'pending', 'in-progress', or 'completed'")

            tasks = session.exec(stmt).all()

            # Format tasks to match expected structure
            result = []
            for task in tasks:
                result.append({
                    "id": task.id,
                    "user_id": str(task.user_id),
                    "title": task.title,
                    "description": task.description,
                    "status": "completed" if task.completed else "pending",
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None
                })

            return result
    except ValueError as ve:
        if "ValidationError" in str(ve) or "UnauthorizedError" in str(ve):
            raise ve
        else:
            raise ValueError(f"ValidationError: Invalid input - {str(ve)}")
    except Exception as e:
        logger.error(f"Error in list_tasks: {str(e)}")
        raise ValueError(f"InternalServerError: Failed to list tasks - {str(e)}")


def complete_task(user_id: str, task_id: str) -> Dict[str, Any]:
    """
    Marks a specific task as completed.

    Args:
        user_id: Unique identifier of the user who owns the task
        task_id: Unique identifier of the task to complete

    Returns:
        Updated Task object with status changed to 'completed'

    Raises:
        ValidationError: When user_id or task_id is invalid
        NotFoundError: When task_id doesn't exist for the given user
        UnauthorizedError: When task doesn't belong to the specified user
    """
    try:
        # Validate inputs
        try:
            user_id_int = int(user_id)
        except ValueError:
            user_id_int = user_id

        try:
            task_id_int = int(task_id)
        except ValueError:
            raise ValueError("ValidationError: task_id must be a valid integer")

        with Session(engine) as session:
            # Check if user exists
            if isinstance(user_id_int, int):
                user_check_stmt = select(User).where(User.id == user_id_int)
            else:
                user_check_stmt = select(User).where(User.email == user_id_int)

            user = session.exec(user_check_stmt).first()

            if not user:
                raise ValueError("UnauthorizedError: User does not exist")

            # Find the task that belongs to the user
            task = session.get(Task, task_id_int)

            if not task or task.user_id != user.id:
                raise ValueError("NotFoundError: Task not found for the given user")

            # Update task status to completed
            task.completed = True
            task.updated_at = datetime.utcnow()

            session.add(task)
            session.commit()
            session.refresh(task)

            # Return updated task
            return {
                "id": task.id,
                "user_id": str(task.user_id),
                "title": task.title,
                "description": task.description,
                "status": "completed",
                "created_at": task.created_at.isoformat() if task.created_at else None,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
    except ValueError as ve:
        if "ValidationError" in str(ve) or "NotFoundError" in str(ve) or "UnauthorizedError" in str(ve):
            raise ve
        else:
            raise ValueError(f"ValidationError: Invalid input - {str(ve)}")
    except Exception as e:
        logger.error(f"Error in complete_task: {str(e)}")
        raise ValueError(f"InternalServerError: Failed to complete task - {str(e)}")


def delete_task(user_id: str, task_id: str) -> bool:
    """
    Permanently removes a task from the user's list.

    Args:
        user_id: Unique identifier of the user who owns the task
        task_id: Unique identifier of the task to delete

    Returns:
        True if deletion was successful, false otherwise

    Raises:
        ValidationError: When user_id or task_id is invalid
        NotFoundError: When task_id doesn't exist for the given user
        UnauthorizedError: When task doesn't belong to the specified user
    """
    try:
        # Validate inputs
        try:
            user_id_int = int(user_id)
        except ValueError:
            user_id_int = user_id

        try:
            task_id_int = int(task_id)
        except ValueError:
            raise ValueError("ValidationError: task_id must be a valid integer")

        with Session(engine) as session:
            # Check if user exists
            if isinstance(user_id_int, int):
                user_check_stmt = select(User).where(User.id == user_id_int)
            else:
                user_check_stmt = select(User).where(User.email == user_id_int)

            user = session.exec(user_check_stmt).first()

            if not user:
                raise ValueError("UnauthorizedError: User does not exist")

            # Find the task that belongs to the user
            task = session.get(Task, task_id_int)

            if not task or task.user_id != user.id:
                raise ValueError("NotFoundError: Task not found for the given user")

            # Delete the task
            session.delete(task)
            session.commit()

            return True
    except ValueError as ve:
        if "ValidationError" in str(ve) or "NotFoundError" in str(ve) or "UnauthorizedError" in str(ve):
            raise ve
        else:
            raise ValueError(f"ValidationError: Invalid input - {str(ve)}")
    except Exception as e:
        logger.error(f"Error in delete_task: {str(e)}")
        raise ValueError(f"InternalServerError: Failed to delete task - {str(e)}")


def update_task(user_id: str, task_id: str, title: Optional[str] = None, description: Optional[str] = None) -> Dict[str, Any]:
    """
    Updates properties of an existing task.

    Args:
        user_id: Unique identifier of the user who owns the task
        task_id: Unique identifier of the task to update
        title: New title for the task (optional)
        description: New description for the task (optional)

    Returns:
        Updated Task object with modified properties

    Raises:
        ValidationError: When user_id or task_id is invalid
        NotFoundError: When task_id doesn't exist for the given user
        UnauthorizedError: When task doesn't belong to the specified user
    """
    try:
        # Validate inputs
        try:
            user_id_int = int(user_id)
        except ValueError:
            user_id_int = user_id

        try:
            task_id_int = int(task_id)
        except ValueError:
            raise ValueError("ValidationError: task_id must be a valid integer")

        with Session(engine) as session:
            # Check if user exists
            if isinstance(user_id_int, int):
                user_check_stmt = select(User).where(User.id == user_id_int)
            else:
                user_check_stmt = select(User).where(User.email == user_id_int)

            user = session.exec(user_check_stmt).first()

            if not user:
                raise ValueError("UnauthorizedError: User does not exist")

            # Find the task that belongs to the user
            task = session.get(Task, task_id_int)

            if not task or task.user_id != user.id:
                raise ValueError("NotFoundError: Task not found for the given user")

            # Update fields if provided
            if title is not None:
                if not title or not title.strip():
                    raise ValueError("ValidationError: Title cannot be empty")
                task.title = title.strip()

            if description is not None:
                task.description = description.strip() if description else None

            task.updated_at = datetime.utcnow()

            session.add(task)
            session.commit()
            session.refresh(task)

            # Return updated task
            return {
                "id": task.id,
                "user_id": str(task.user_id),
                "title": task.title,
                "description": task.description,
                "status": "completed" if task.completed else "pending",
                "created_at": task.created_at.isoformat() if task.created_at else None,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None
            }
    except ValueError as ve:
        if "ValidationError" in str(ve) or "NotFoundError" in str(ve) or "UnauthorizedError" in str(ve):
            raise ve
        else:
            raise ValueError(f"ValidationError: Invalid input - {str(ve)}")
    except Exception as e:
        logger.error(f"Error in update_task: {str(e)}")
        raise ValueError(f"InternalServerError: Failed to update task - {str(e)}")