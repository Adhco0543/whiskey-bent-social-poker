@echo off
REM Quick setup script for Windows
REM This script validates your setup and starts the application

cls
echo ============================================
echo Whiskey Bent Social Poker - Quick Start
echo ============================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file first. Run: copy .env.example .env
    echo Then update DATABASE_URL with your cloud database connection.
    exit /b 1
)

echo ✓ .env file found
echo.

REM Check Node version
echo Checking environment...
node --version
npm --version
echo.

REM Check if dist folders exist
if not exist "apps\api\dist" (
    echo ⚠ API not built yet. Building now...
    npm run build:prod
)

if not exist "apps\realtime\dist" (
    echo ⚠ Realtime not built yet. Building now...
    npm run build:prod
)

echo ✓ Build artifacts ready
echo.

REM Show DATABASE_URL status (without revealing the full secret)
for /f "tokens=2 delims==" %%a in ('findstr "DATABASE_URL" .env') do set DB_URL=%%a
if defined DB_URL (
    echo ✓ DATABASE_URL configured
    echo   Connection: %DB_URL:~0,50%...
) else (
    echo ERROR: DATABASE_URL not set in .env
    exit /b 1
)

echo.
echo ============================================
echo Starting API on http://localhost:3000
echo ============================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the API
node apps\api\dist\main.js
