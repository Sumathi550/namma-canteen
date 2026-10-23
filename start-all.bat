@echo off
echo ========================================================
echo   Starting Namma Canteen (நம்ம Canteen) Full Stack
echo   Authentic Tamil Nadu Campus Food Hub & Kitchen KDS
echo ========================================================

start "Namma Canteen - Backend API (5000)" cmd /k "cd /d %~dp0smart-canteen\backend && npm run dev"
start "Namma Canteen - Student Ordering Site (5173)" cmd /k "cd /d %~dp0smart-canteen\frontend && npm run dev"
start "Namma Canteen - Staff & Kitchen Portal (5174)" cmd /k "cd /d %~dp0smart-canteen\staff-portal && npm run dev"

echo.
echo All 3 websites/services have been launched in separate windows!
echo - Backend API:         http://localhost:5000/api/health
echo - Student Canteen Site: http://localhost:5173
echo - Staff & Kitchen KDS:  http://localhost:5174
echo ========================================================
