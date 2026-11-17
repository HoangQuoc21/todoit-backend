#!/bin/bash
# This script is used to deploy or update the repository using Docker Compose.
# Workflow:
# 1. Pulls the latest code and configuration from the remote git repository.
# 2. Verifies environment prerequisites (compose.yml, docker compose, docker daemon permissions).
# 3. Builds and restarts containers with the latest image pulls (--pull always).
# 4. Cleans up dangling/unused Docker images.
#
# Requirements & Notes:
# - Ensure your .env file is properly configured with all required variables before running.
# - Grant execute permissions before running: chmod +x deploy.sh
# - Run from the repository root where compose.yml is located: ./deploy.sh 

# Exit immediately if a command exits with a non-zero status, if an undefined variable is used, or if any command in a pipeline fails
set -Eeuo pipefail

log_error() {
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Command failed at line $1: $2" >&2
}

trap 'log_error "$LINENO" "$BASH_COMMAND"' ERR

# Actual update process
echo "Starting deployment process..."

# 1. Pull latest code first (so compose.yml, scripts, and code are up to date before checks)
echo "Pulling latest changes from repository..."
git pull || echo "Notice: 'git pull' was skipped or failed. Proceeding with current local files..."

# 2. Check if the docker compose file exists
if [ ! -f "compose.yml" ]; then
    echo "compose.yml file not found in the current directory. Please navigate to the correct directory and try again." >&2
    exit 1
fi

# 3. Check if docker compose is available
if ! docker compose version > /dev/null 2>&1; then
    echo "Docker Compose plugin is not available. Please install/enable it and try again." >&2
    exit 1
fi

# 4. Check if the user has permission to run docker commands
if ! docker info > /dev/null 2>&1; then
    echo "You do not have permission to run docker commands. Please ensure you have the necessary permissions and try again." >&2
    exit 1
fi

# 5. Rebuild and restart containers
echo "Rebuilding and restarting docker service..."
docker compose up -d --build --pull always

# 6. Cleanup
echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment process completed successfully."
