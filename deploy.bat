@echo off
REM Whiskey Bent Social Poker - Quick Deploy Script for Windows
REM This script prepares the application for deployment

echo.
echo ====================================
echo Whiskey Bent Social Poker Deployment
echo ====================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org
    exit /b 1
)

REM Check npm
echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Please reinstall Node.js
    exit /b 1
)

REM Install dependencies
echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

REM Build packages
echo.
echo Building database package...
cd packages\database
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build database package
    cd ..\..
    exit /b 1
)
cd ..\..

REM Build types
echo.
echo Building types package...
cd packages\types
npm run build
if %errorlevel% neq 0 (
    echo WARNING: Types package build failed, continuing...
)
cd ..\..

REM Build API
echo.
echo Building API...
cd apps\api
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build API
    cd ..\..
    exit /b 1
)
cd ..\..

REM Build realtime
echo.
echo Building realtime service...
cd apps\realtime
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build realtime service
    cd ..\..
    exit /b 1
)
cd ..\..

echo.
echo ====================================
echo Build Complete!
echo ====================================
echo.
echo Next Steps:
echo 1. Ensure PostgreSQL is running
echo 2. Verify DATABASE_URL in .env
echo 3. Run: npm run db:migrate
echo 4. Run: npm run start (for API on port 3000)
echo 5. Run: npm run start:realtime (for realtime on port 3001)
echo.
echo Or use Docker:
echo docker-compose up -d
echo.
