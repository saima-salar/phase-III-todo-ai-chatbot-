"""Configuration for AI Todo Chatbot Agent"""

import os
from typing import Optional

# OpenAI Configuration
OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo")
OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

# Agent Configuration
AGENT_NAME: str = os.getenv("AGENT_NAME", "Todo Assistant")
AGENT_INSTRUCTIONS: str = os.getenv(
    "AGENT_INSTRUCTIONS",
    """You are a helpful todo management assistant. Help users manage their tasks by using the appropriate tools.
    When users want to add a task, use the add_task function.
    When users want to see their tasks, use the list_tasks function.
    When users want to complete a task, use the complete_task function.
    When users want to delete a task, use the delete_task function.
    When users want to update a task, use the update_task function.
    Always be helpful, friendly, and professional in your responses.
    If a user asks for something that requires a tool, ask for confirmation before proceeding with destructive actions (delete, complete, update).
    For ambiguous requests, ask for clarification before using tools."""
)

# Tool Configuration
ENABLE_CONFIRMATION_PROMPTS: bool = os.getenv("ENABLE_CONFIRMATION_PROMPTS", "true").lower() == "true"
CONFIRMATION_THRESHOLD: int = int(os.getenv("CONFIRMATION_THRESHOLD", "3"))  # Number of actions before requiring confirmation

# Conversation Configuration
MAX_CONTEXT_MESSAGES: int = int(os.getenv("MAX_CONTEXT_MESSAGES", "20"))
DEFAULT_STATUS_FILTER: Optional[str] = os.getenv("DEFAULT_STATUS_FILTER")  # None, "pending", "completed", "in-progress"

# Error Handling Configuration
RETRY_ON_TOOL_FAILURE: bool = os.getenv("RETRY_ON_TOOL_FAILURE", "true").lower() == "true"
MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))

# Response Configuration
RESPONSE_VERBOSITY: str = os.getenv("RESPONSE_VERBOSITY", "balanced")  # "concise", "balanced", "detailed"