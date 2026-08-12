#!/bin/bash
# This script is used to deploy/update the docker service hosted with docker compose
# Note: 
# - You must grant execute permissions to this script before running it (chmod +x deploy.sh)
# - You must run this script from the directory where your compose.yml file is located
# - Running script command: ./deploy.sh 

# Exit immediately if a command exits with a non-zero status, if an undefined variable is used, or if any command in a pipeline fails
set -Eeuo pipefail

log_error() {
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Command failed at line $1: $2" >&2
}

trap 'log_error "$LINENO" "$BASH_COMMAND"' ERR

# Check if docker compose is available
if ! docker compose version > /dev/null 2>&1; then
    echo "Docker Compose plugin is not available. Please install/enable it and try again." >&2
    exit 1
fi

# Check if the docker compose file exists
if [ ! -f "compose.yml" ]; then
    echo "compose.yml file not found in the current directory. Please navigate to the correct directory and try again." >&2
    exit 1
fi

# Check if the user has permission to run docker commands
if ! docker info > /dev/null 2>&1; then
    echo "You do not have permission to run docker commands. Please ensure you have the necessary permissions and try again." >&2
    exit 1
fi

echo "Starting deployment process..."

# Actual update process
echo "Pulling latest changes from repository..."
git pull || echo "Notice: 'git pull' was skipped or failed. Proceeding with current local files..."

echo "Rebuilding and restarting docker service..."
docker compose up -d --build

echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment process completed successfully."
