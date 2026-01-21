"""Configuration for MCP Server"""

import os
from typing import Optional

# Configuration settings for the MCP server
MCP_SERVER_HOST: str = os.getenv("MCP_SERVER_HOST", "localhost")
MCP_SERVER_PORT: int = int(os.getenv("MCP_SERVER_PORT", "8001"))
MCP_SERVER_DEBUG: bool = os.getenv("MCP_SERVER_DEBUG", "false").lower() == "true"

# Database configuration
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./todo.db")

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "60"))
RATE_LIMIT_DAILY_MESSAGES: int = int(os.getenv("RATE_LIMIT_DAILY_MESSAGES", "10000"))

# Task limits
MAX_TASKS_PER_CONVERSATION: int = int(os.getenv("MAX_TASKS_PER_CONVERSATION", "1000"))