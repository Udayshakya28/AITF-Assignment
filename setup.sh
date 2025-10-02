#!/bin/bash

# AI Weather Chatbot Setup Script
echo "🌟 Setting up AI Weather Chatbot..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm run install-all

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Create environment files
echo -e "${BLUE}⚙️  Setting up environment files...${NC}"

# Backend environment
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    echo -e "${YELLOW}📝 Created server/.env from template${NC}"
else
    echo -e "${YELLOW}📝 server/.env already exists${NC}"
fi

# Frontend environment
if [ ! -f "client/.env" ]; then
    cp client/env.example client/.env
    echo -e "${YELLOW}📝 Created client/.env from template${NC}"
else
    echo -e "${YELLOW}📝 client/.env already exists${NC}"
fi

# Docker environment
if [ ! -f ".env" ]; then
    cp env.example .env
    echo -e "${YELLOW}📝 Created .env from template${NC}"
else
    echo -e "${YELLOW}📝 .env already exists${NC}"
fi

# Create logs directory
mkdir -p server/logs
echo -e "${GREEN}✅ Created logs directory${NC}"

# Display setup completion
echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. ${YELLOW}Configure your API keys in the .env files:${NC}"
echo -e "   - Get OpenWeatherMap API key: https://openweathermap.org/api"
echo -e "   - Get OpenAI API key: https://platform.openai.com/"
echo ""
echo -e "2. ${YELLOW}Choose your deployment method:${NC}"
echo ""
echo -e "   ${BLUE}Option A - Docker (Recommended):${NC}"
echo -e "   npm run docker:up"
echo ""
echo -e "   ${BLUE}Option B - Development Mode:${NC}"
echo -e "   npm run dev"
echo ""
echo -e "3. ${YELLOW}Access the application:${NC}"
echo -e "   Frontend: http://localhost:3000"
echo -e "   Backend API: http://localhost:5000"
echo ""
echo -e "${GREEN}🚀 Happy coding!${NC}"

