@echo off
echo Starting Autism Support Project...

echo Starting Backend Server...
start "Backend Server" cmd /k "cd autism-backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Application...
start "Frontend Application" cmd /k "cd autism-dashboard && npm start"

echo Both services are starting...
echo Backend will be available at: http://localhost:4000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
