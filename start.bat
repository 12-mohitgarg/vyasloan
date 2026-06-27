@echo off
echo Starting Vyas Finserv...
echo.

start "Backend" cmd /k "cd /d D:\dummy\backend && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd /d D:\dummy\frontend && npm run dev"

echo.
echo ✅ Vyas Finserv is starting!
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    Admin CRM: http://localhost:5173/admin
echo.
pause
