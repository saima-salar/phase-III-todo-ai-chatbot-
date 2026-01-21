"""OpenAI Agent for AI Todo Chatbot"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from sqlmodel import Session, select
import openai
from openai import OpenAI

from models import Conversation, Message
from database import engine
from .config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    AGENT_INSTRUCTIONS,
    ENABLE_CONFIRMATION_PROMPTS,
    MAX_CONTEXT_MESSAGES,
    RESPONSE_VERBOSITY
)
from mcp_server.tools import add_task, list_tasks, complete_task, delete_task, update_task

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = None
if not OPENAI_API_KEY:
    # Set a flag to indicate fallback mode
    OPENAI_AVAILABLE = False
else:
    OPENAI_AVAILABLE = True
    client = OpenAI(api_key=OPENAI_API_KEY)


class TodoAgent:
    """OpenAI Agent for managing todo tasks"""

    def __init__(self):
        self.client = client
        self.model = OPENAI_MODEL
        self.instructions = AGENT_INSTRUCTIONS
        self.openai_available = OPENAI_AVAILABLE

        # Define available functions for the agent
        self.functions = {
            "add_task": {
                "name": "add_task",
                "description": "Creates a new task for a specific user",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                        "title": {"type": "string", "description": "Title of the task"},
                        "description": {"type": "string", "description": "Detailed description of the task (optional)"}
                    },
                    "required": ["user_id", "title"]
                }
            },
            "list_tasks": {
                "name": "list_tasks",
                "description": "Retrieves a list of tasks for a specific user, optionally filtered by status",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "Unique identifier of the user whose tasks to retrieve"},
                        "status": {"type": "string", "description": "Filter tasks by status ('pending', 'in-progress', 'completed') (optional)"}
                    },
                    "required": ["user_id"]
                }
            },
            "complete_task": {
                "name": "complete_task",
                "description": "Marks a specific task as completed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                        "task_id": {"type": "string", "description": "Unique identifier of the task to complete"}
                    },
                    "required": ["user_id", "task_id"]
                }
            },
            "delete_task": {
                "name": "delete_task",
                "description": "Permanently removes a task from the user's list",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                        "task_id": {"type": "string", "description": "Unique identifier of the task to delete"}
                    },
                    "required": ["user_id", "task_id"]
                }
            },
            "update_task": {
                "name": "update_task",
                "description": "Updates properties of an existing task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "Unique identifier of the user who owns the task"},
                        "task_id": {"type": "string", "description": "Unique identifier of the task to update"},
                        "title": {"type": "string", "description": "New title for the task (optional)"},
                        "description": {"type": "string", "description": "New description for the task (optional)"}
                    },
                    "required": ["user_id", "task_id"]
                }
            }
        }

        # Map function names to actual implementations
        self.function_map = {
            "add_task": add_task,
            "list_tasks": list_tasks,
            "complete_task": complete_task,
            "delete_task": delete_task,
            "update_task": update_task
        }

    def _get_recent_messages(self, conversation_id: str, limit: int = MAX_CONTEXT_MESSAGES) -> List[Dict[str, str]]:
        """Retrieve recent messages from the conversation"""
        try:
            with Session(engine) as session:
                # Get conversation
                conversation = session.get(Conversation, conversation_id)
                if not conversation:
                    logger.warning(f"Conversation {conversation_id} not found")
                    return []

                # Get messages for this conversation ordered by creation time
                statement = select(Message).where(
                    Message.conversation_id == conversation_id
                ).order_by(Message.created_at.desc()).limit(limit)

                db_messages = session.exec(statement).all()

                # Convert to the format expected by OpenAI
                messages = []
                # Add system message first
                messages.append({
                    "role": "system",
                    "content": self.instructions
                })

                # Add messages in reverse order (oldest first)
                for msg in reversed(db_messages):
                    role = msg.role
                    if role == "system":
                        # Skip system messages from DB since we have our own
                        continue
                    elif role == "user" or role == "assistant":
                        messages.append({
                            "role": role,
                            "content": msg.content
                        })

                return messages
        except Exception as e:
            logger.error(f"Error retrieving messages for conversation {conversation_id}: {str(e)}")
            return []

    def _confirm_action(self, action_description: str) -> bool:
        """Ask user for confirmation before performing potentially destructive actions"""
        if not ENABLE_CONFIRMATION_PROMPTS:
            return True

        # For now, we'll return True to simulate confirmation
        # In a real implementation, this would ask the user for confirmation
        return True

    def _call_tool(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call the appropriate tool function with error handling"""
        try:
            if function_name not in self.function_map:
                return {
                    "error": {
                        "type": "FunctionNotFoundError",
                        "message": f"Function {function_name} not found"
                    }
                }

            # Get the function to call
            func = self.function_map[function_name]

            # Call the function with the provided arguments
            result = func(**arguments)

            return {
                "result": result,
                "status": "success"
            }
        except ValueError as ve:
            # Handle validation and other errors from the tools
            error_msg = str(ve)
            error_type = "ValidationError"
            if "UnauthorizedError" in error_msg:
                error_type = "UnauthorizedError"
            elif "NotFoundError" in error_msg:
                error_type = "NotFoundError"
            elif "RateLimitError" in error_msg:
                error_type = "RateLimitError"
            elif "InternalServerError" in error_msg:
                error_type = "InternalServerError"

            return {
                "error": {
                    "type": error_type,
                    "message": error_msg.split(":", 1)[1].strip() if ":" in error_msg else error_msg
                },
                "status": "error"
            }
        except Exception as e:
            logger.error(f"Error calling tool {function_name}: {str(e)}")
            return {
                "error": {
                    "type": "InternalServerError",
                    "message": f"Failed to execute {function_name}: {str(e)}"
                },
                "status": "error"
            }

    def process_message(self, user_id: str, message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a user message and return a response with potential tool calls

        Args:
            user_id: ID of the user sending the message
            message: The user's message
            conversation_id: Optional conversation ID (creates new if not provided)

        Returns:
            Dictionary containing response text and any tool calls
        """
        # Check if OpenAI is available
        if not self.openai_available:
            # Return fallback response
            conversation = self._get_or_create_conversation(user_id, conversation_id)

            # Save user message to database
            self._save_message(conversation.id, user_id, "user", message)

            # Create fallback response
            fallback_response = "AI service is not configured. Please set OPENAI_API_KEY to enable chat."

            # Save assistant's response message
            self._save_message(conversation.id, user_id, "assistant", fallback_response)

            # Return the fallback response
            return {
                "response": fallback_response,
                "conversation_id": str(conversation.id),
                "message_id": None,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }

        try:
            # Create or get conversation
            conversation = self._get_or_create_conversation(user_id, conversation_id)

            # Save user message to database
            self._save_message(conversation.id, user_id, "user", message)

            # Get recent conversation history
            messages = self._get_recent_messages(conversation.id)

            # Add the current user message
            messages.append({
                "role": "user",
                "content": message
            })

            # Prepare tools for OpenAI
            tools = [{"type": "function", "function": func_def} for func_def in self.functions.values()]

            # Call OpenAI API with function calling
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.7
            )

            # Extract the response
            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls

            # Save assistant's response message (without tool calls for now)
            assistant_content = response_message.content or ""
            self._save_message(conversation.id, user_id, "assistant", assistant_content, tool_calls)

            # Process tool calls if any
            tool_results = []
            if tool_calls:
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)

                    # Add user_id to arguments if not present
                    if 'user_id' not in arguments:
                        arguments['user_id'] = user_id

                    # Perform action confirmation if needed
                    if function_name in ['complete_task', 'delete_task', 'update_task']:
                        action_desc = f"{function_name} with arguments {arguments}"
                        if not self._confirm_action(action_desc):
                            continue  # Skip this action if not confirmed

                    # Call the tool
                    result = self._call_tool(function_name, arguments)
                    tool_results.append({
                        "id": tool_call.id,
                        "function": {
                            "name": function_name,
                            "arguments": tool_call.function.arguments
                        },
                        "result": result
                    })

            # Prepare the final response
            response_text = response_message.content or "I processed your request."

            # Format the response
            result = {
                "response": response_text,
                "conversation_id": str(conversation.id),
                "message_id": str(response.id) if hasattr(response, 'id') else None,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }

            if tool_results:
                result["tool_calls"] = []
                for tool_result in tool_results:
                    result["tool_calls"].append({
                        "id": tool_result["id"],
                        "function": {
                            "name": tool_result["function"]["name"],
                            "arguments": tool_result["function"]["arguments"]
                        },
                        "type": "function"
                    })

            return result

        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return {
                "response": "Sorry, I'm having trouble connecting to my services right now.",
                "conversation_id": conversation_id or "",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error",
                "error": {
                    "type": "APIError",
                    "message": str(e)
                }
            }
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {
                "response": "Sorry, an error occurred while processing your request.",
                "conversation_id": conversation_id or "",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error",
                "error": {
                    "type": "InternalServerError",
                    "message": str(e)
                }
            }

    def _get_or_create_conversation(self, user_id: str, conversation_id: Optional[str] = None):
        """Get existing conversation or create a new one"""
        with Session(engine) as session:
            if conversation_id:
                # Try to get existing conversation
                conversation = session.get(Conversation, conversation_id)
                if conversation:
                    return conversation

            # Create new conversation
            conversation = Conversation(
                user_id=user_id,
                title=f"Conversation with {user_id}",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True
            )
            session.add(conversation)
            session.commit()
            session.refresh(conversation)
            return conversation

    def _save_message(self, conversation_id: str, user_id: str, role: str, content: str, tool_calls=None):
        """Save a message to the database"""
        with Session(engine) as session:
            message = Message(
                conversation_id=conversation_id,
                user_id=user_id,
                role=role,
                content=content,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(message)
            session.commit()