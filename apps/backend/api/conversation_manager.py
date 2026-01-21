"""Conversation Manager for AI Todo Chatbot API"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import Session, select
from uuid import UUID
import logging

from models import Conversation, Message
from database import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_conversation(conversation_id: str) -> Optional[Conversation]:
    """Get a conversation by its ID"""
    try:
        with Session(engine) as session:
            conversation = session.get(Conversation, UUID(conversation_id))
            return conversation
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id}: {str(e)}")
        return None


def create_conversation(user_id: str, title: Optional[str] = None) -> Conversation:
    """Create a new conversation"""
    try:
        with Session(engine) as session:
            if not title:
                title = f"Conversation with {user_id}"

            conversation = Conversation(
                user_id=user_id,
                title=title,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True
            )

            session.add(conversation)
            session.commit()
            session.refresh(conversation)
            return conversation
    except Exception as e:
        logger.error(f"Error creating conversation for user {user_id}: {str(e)}")
        raise


def get_conversation_messages(conversation_id: str, limit: Optional[int] = None) -> List[Message]:
    """Get messages for a conversation, ordered by creation time"""
    try:
        with Session(engine) as session:
            statement = select(Message).where(
                Message.conversation_id == UUID(conversation_id)
            ).order_by(Message.created_at.asc())

            if limit:
                statement = statement.limit(limit)

            messages = session.exec(statement).all()
            return messages
    except Exception as e:
        logger.error(f"Error getting messages for conversation {conversation_id}: {str(e)}")
        return []


def add_message_to_conversation(
    conversation_id: str,
    user_id: str,
    role: str,
    content: str,
    tool_calls: Optional[List[Dict[str, Any]]] = None
) -> Message:
    """Add a message to a conversation"""
    try:
        with Session(engine) as session:
            message = Message(
                conversation_id=UUID(conversation_id),
                user_id=user_id,
                role=role,
                content=content,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            session.add(message)
            session.commit()
            session.refresh(message)
            return message
    except Exception as e:
        logger.error(f"Error adding message to conversation {conversation_id}: {str(e)}")
        raise


def get_or_create_conversation(user_id: str, conversation_id: Optional[str] = None) -> Conversation:
    """Get an existing conversation or create a new one if ID not provided"""
    if conversation_id:
        conversation = get_conversation(conversation_id)
        if conversation:
            return conversation

    # Create a new conversation
    return create_conversation(user_id)