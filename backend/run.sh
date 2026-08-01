#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== TinniCare AI FastAPI Backend Launcher ==="

# Navigate to the backend directory if run from workspace root
cd "$(dirname "$0")"

# Check if .venv directory exists, if not, create it
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment (.venv)..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip and install requirements
echo "Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# Run the FastAPI server using Uvicorn
echo "Starting FastAPI server on http://localhost:8000..."
# Add parent directory of backend (which is the workspace root) to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/.."
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8080 --reload
