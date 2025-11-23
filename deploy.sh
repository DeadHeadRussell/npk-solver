#!/bin/bash

# --- Configuration ---
IMAGE_NAME="npk-solver"
CONTAINER_NAME="npk-solver-app"
HOST_PORT="8010"
CONTAINER_PORT="80"

echo "--- Deploying NPK Solver ---"

# --- 1. Build the Docker image FIRST to minimize downtime ---
echo "1. Building Docker image: ${IMAGE_NAME}..."
docker build -t ${IMAGE_NAME} .

if [ $? -ne 0 ]; then
  echo "Error: Docker image build failed. Keeping old container running (if any)."
  exit 1
fi
echo "   Docker image built successfully."

# --- 2. Stop and remove any existing container with the same name (only if build succeeded) ---
echo "2. Stopping and removing existing container (if any)..."
docker stop ${CONTAINER_NAME} > /dev/null 2>&1 || true # Add || true to prevent script from exiting if container doesn't exist
docker rm ${CONTAINER_NAME} > /dev/null 2>&1 || true # Add || true
echo "   Previous container removed (if it existed)."

# --- 3. Run the new Docker container ---
echo "3. Running Docker container: ${CONTAINER_NAME} on port ${HOST_PORT}..."
docker run -d \
  -p ${HOST_PORT}:${CONTAINER_PORT} \
  --restart unless-stopped \
  --name ${CONTAINER_NAME} \
  ${IMAGE_NAME}

if [ $? -ne 0 ]; then
  echo "Error: Docker container failed to start."
  exit 1
fi
echo "   Container started successfully. Access it at http://localhost:${HOST_PORT}"
echo "--- Deployment Complete ---"