@echo off
REM Database Connection Tester
REM Tests if PostgreSQL connection is working

setlocal enabledelayedexpansion

echo ============================================
echo Database Connection Tester
echo ============================================
echo.

REM Read DATABASE_URL from .env
for /f "tokens=2 delims==" %%a in ('findstr /i "^DATABASE_URL" .env') do set DB_URL=%%a

if not defined DB_URL (
    echo ERROR: DATABASE_URL not set in .env
    exit /b 1
)

echo Extracted connection string (first 60 chars):
echo !DB_URL:~0,60!...
echo.

REM Try to connect using node and pg library
if not exist node_modules\pg (
    echo Installing PostgreSQL client library...
    npm install pg
)

REM Create a test script
(
    echo const { Client } = require('pg');
    echo const connectionString = process.env.DATABASE_URL;
    echo if (!connectionString) {
    echo   console.error('ERROR: DATABASE_URL not set');
    echo   process.exit(1);
    echo }
    echo const client = new Client({ connectionString });
    echo client.connect()
    echo   .then(^)^) =^> {
    echo     console.log('✓ Successfully connected to database');
    echo     return client.query('SELECT NOW()');
    echo   }
    echo   .then((result) =^> {
    echo     console.log('✓ Database query successful');
    echo     console.log('  Current time:', result.rows[0].now);
    echo     return client.end();
    echo   }
    echo   .catch((err) =^> {
    echo     console.error('✗ Connection failed:', err.message);
    echo     if (err.message.includes('ECONNREFUSED')) {
    echo       console.error('  → PostgreSQL is not running on localhost:5432');
    echo       console.error('  → Check if DATABASE_URL is pointing to the right database');
    echo     }
    echo     process.exit(1);
    echo   });
) > test-db.js

echo Testing database connection...
echo.

node test-db.js

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================
    echo ✓ Database is ready to use!
    echo ============================================
    echo.
    echo You can now run: npm run start
) else (
    echo.
    echo ============================================
    echo ✗ Database connection failed
    echo ============================================
    echo.
    echo Steps to fix:
    echo 1. Check your DATABASE_URL in .env
    echo 2. If using Neon or Railway, verify the connection string is correct
    echo 3. If using local PostgreSQL, make sure it's running
    echo 4. Test the connection string directly
)

del test-db.js
exit /b %ERRORLEVEL%
