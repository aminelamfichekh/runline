@echo off
echo ========================================
echo   Starting Emrun Backend + Frontend
echo ========================================
echo.

echo [1/4] Starting Laravel Backend Server...
start "Emrun Backend" cmd /k "cd /d C:\Users\dell\emrun-backend && php artisan serve"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Queue Worker...
start "Emrun Queue Worker" cmd /k "cd /d C:\Users\dell\emrun-backend && php artisan queue:work"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Expo Frontend...
start "Emrun Frontend" cmd /k "cd /d C:\Users\dell\emrun-mobile && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All services starting...
echo ========================================
echo.
echo Backend:    http://localhost:8000
echo Frontend:   Expo DevTools will open
echo.
echo Press any key to exit this window...
pause >nul

