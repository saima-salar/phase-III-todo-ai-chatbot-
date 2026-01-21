"""Backend server entry point for the Todo application."""

import os
import sys
from pathlib import Path

# Add the backend directory to the Python path to resolve imports
backend_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(backend_dir))

# Now import the main app
from main import app

if __name__ == "__main__":
    import uvicorn

    # Use environment variable for port, default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    print(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)