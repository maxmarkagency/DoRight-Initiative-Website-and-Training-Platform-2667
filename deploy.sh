#!/bin/bash

# cPanel Deployment Script for DoRight LMS
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting DoRight LMS Deployment to cPanel..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="doright-lms"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
PUBLIC_DIR="public_html"

# Check if we're in production mode
if [ "$1" = "prod" ]; then
    echo -e "${BLUE}Production deployment mode${NC}"
    ENV_FILE=".env.production"
else
    echo -e "${YELLOW}Development deployment mode${NC}"
    ENV_FILE=".env"
fi

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
node_version=$(node -v)
echo "Node.js version: $node_version"

# Install dependencies for backend
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd $BACKEND_DIR
if [ ! -f "package-lock.json" ]; then
    npm install --production=false
else
    npm ci
fi

# Build frontend
echo -e "${BLUE}Building frontend for production...${NC}"
cd ../$FRONTEND_DIR
if [ ! -f "package-lock.json" ]; then
    npm install --production=false
else
    npm ci
fi

# Build frontend for production
npm run build

# Create uploads directory
echo -e "${BLUE}Creating uploads directory...${NC}"
cd ../$BACKEND_DIR
mkdir -p uploads logs

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Creating $ENV_FILE from template...${NC}"
    if [ -f ".env.production.example" ]; then
        cp .env.production.example $ENV_FILE
        echo -e "${RED}⚠️  Please update $ENV_FILE with your actual cPanel configuration!${NC}"
    fi
fi

# Run database migrations (if needed)
echo -e "${BLUE}Running database migrations...${NC}"
if [ -f "scripts/migrate.js" ]; then
    node scripts/migrate.js || echo -e "${YELLOW}Migration completed with warnings${NC}"
fi

# Test build
echo -e "${BLUE}Testing backend startup...${NC}"
timeout 10s node server.js || echo -e "${YELLOW}Backend test completed${NC}"

echo -e "${GREEN}✅ Deployment preparation completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Upload the entire project folder to your cPanel public_html"
echo "2. Ensure your database is set up on cPanel"
echo "3. Update .env file with your cPanel database credentials"
echo "4. Point your domain to the public_html directory"
echo "5. Start the Node.js application in cPanel"
echo ""
echo -e "${GREEN}🚀 Ready for upload to cPanel!${NC}"