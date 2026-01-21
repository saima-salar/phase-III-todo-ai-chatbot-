"""Chat API Endpoints for AI Todo Chatbot"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, Optional
import logging
from datetime import datetime

from models import User
from middleware import get_current_user_id
from .conversation_manager import get_or_create_conversation, add_message_to_conversation
from agents.todo_agent import TodoAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Initialize the TodoAgent
todo_agent = TodoAgent()


@router.post("/{user_id}/chat")
async def chat_endpoint(
    user_id: str,
    request_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Chat endpoint that processes user messages and returns AI responses with tool calls

    Expected request body:
    {
        "message": "string",           // Required: User's input message
        "conversation_id": "string"    // Optional: Existing conversation ID
    }

    Returns:
    {
        "response": "string",          // AI-generated response text
        "conversation_id": "string",   // ID of the conversation
        "message_id": "string",        // ID of the response message
        "timestamp": "string",         // ISO 8601 timestamp
        "tool_calls": [...],           // Optional: Array of tools called
        "status": "success"|"error"    // Status of the request
    }
    """
    try:
        # Verify that the authenticated user is the same as the requested user
        if str(current_user_id) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this chat"
            )

        # Validate request data
        message = request_data.get("message")
        if not message or not message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required and cannot be empty"
            )

        conversation_id = request_data.get("conversation_id")

        # Get or create conversation
        conversation = get_or_create_conversation(user_id, conversation_id)

        # Add user message to conversation
        user_message = add_message_to_conversation(
            conversation_id=str(conversation.id),
            user_id=user_id,
            role="user",
            content=message
        )

        # Process the message with the Todo Agent
        agent_response = todo_agent.process_message(
            user_id=user_id,
            message=message,
            conversation_id=str(conversation.id)
        )

        # Add assistant response to conversation
        if agent_response.get("response"):
            assistant_message = add_message_to_conversation(
                conversation_id=str(conversation.id),
                user_id=user_id,
                role="assistant",
                content=agent_response["response"],
                tool_calls=agent_response.get("tool_calls")
            )

        # Prepare the response
        response = {
            "response": agent_response.get("response", ""),
            "conversation_id": str(conversation.id),
            "message_id": str(assistant_message.id) if 'assistant_message' in locals() else None,
            "timestamp": datetime.utcnow().isoformat(),
            "status": agent_response.get("status", "success")
        }

        # Include tool_calls if they exist in the agent response
        if "tool_calls" in agent_response:
            response["tool_calls"] = agent_response["tool_calls"]

        return response

    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except ValueError as ve:
        # Handle validation errors from the agent
        logger.error(f"Validation error in chat endpoint: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(ve)}"
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while processing your request"
        )


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint for the chat API"""
    return {"status": "healthy", "service": "chat-api"}