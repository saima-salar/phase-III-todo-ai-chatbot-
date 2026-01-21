#!/bin/bash
# Script to run the backend server from the monorepo root

# Change to the backend directory and run the server
cd "$(dirname "$0")/../.." || exit 1
cd apps/backend

# Run the Python server
python server.py