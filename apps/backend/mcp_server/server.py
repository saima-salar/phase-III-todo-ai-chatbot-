"""MCP Server for AI Todo Chatbot"""

import asyncio
from typing import Dict, Any, Callable
from functools import wraps
import json
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse

from .tools import add_task, list_tasks, complete_task, delete_task, update_task
from .config import MCP_SERVER_HOST, MCP_SERVER_PORT, MCP_SERVER_DEBUG

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tool registry - maps tool names to their functions
TOOLS_REGISTRY: Dict[str, Callable] = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task
}


def handle_errors(func):
    """Decorator to handle errors in tool functions"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValueError as ve:
            # Already formatted errors from tools
            if "ValidationError" in str(ve) or "NotFoundError" in str(ve) or "UnauthorizedError" in str(ve) or "RateLimitError" in str(ve):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": {
                            "type": str(ve).split(":")[0],
                            "message": str(ve).split(":", 1)[1].strip() if ":" in str(ve) else str(ve)
                        }
                    }
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": {
                            "type": "ValidationError",
                            "message": str(ve)
                        }
                    }
                )
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": {
                        "type": "InternalServerError",
                        "message": f"An unexpected error occurred in {func.__name__}"
                    }
                }
            )
    return wrapper


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan manager for the application"""
    logger.info("Starting MCP Server...")
    yield
    logger.info("Shutting down MCP Server...")


# Create FastAPI app for the MCP server
app = FastAPI(
    title="Todo Chatbot MCP Server",
    description="Model Context Protocol server for AI Todo Chatbot",
    version="1.0.0",
    lifespan=lifespan,
    debug=MCP_SERVER_DEBUG
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Todo Chatbot MCP Server is running", "status": "healthy"}


@app.post("/mcp/tool/{tool_name}")
async def execute_tool(tool_name: str, request: Request):
    """
    Execute an MCP tool based on the tool name

    Expected payload format:
    {
        "params": {
            "user_id": "...",
            "task_id": "...",  # for relevant tools
            "title": "...",    # for relevant tools
            "description": "...", # for relevant tools
            "status": "..."    # for relevant tools
        }
    }
    """
    if tool_name not in TOOLS_REGISTRY:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "type": "NotFoundError",
                    "message": f"Tool '{tool_name}' not found"
                }
            }
        )

    try:
        # Parse the incoming request
        payload = await request.json()
        params = payload.get("params", {})

        # Validate that params is a dictionary
        if not isinstance(params, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "type": "ValidationError",
                        "message": "Params must be a dictionary"
                    }
                }
            )

        # Get the tool function
        tool_func = TOOLS_REGISTRY[tool_name]

        # Execute the tool with the provided parameters
        result = handle_errors(tool_func)(**params)

        # Return the result
        return {
            "result": result,
            "status": "success"
        }

    except HTTPException:
        # Re-raise HTTP exceptions as they are already formatted
        raise
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "type": "ValidationError",
                    "message": "Invalid JSON in request body"
                }
            }
        )
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "type": "InternalServerError",
                    "message": f"Failed to execute tool {tool_name}"
                }
            }
        )


@app.get("/mcp/tools")
async def list_available_tools():
    """Return a list of available tools"""
    return {
        "tools": list(TOOLS_REGISTRY.keys()),
        "count": len(TOOLS_REGISTRY)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host=MCP_SERVER_HOST,
        port=MCP_SERVER_PORT,
        reload=MCP_SERVER_DEBUG
    )