# PowerShell startup script for Namma Canteen Dual Sites + Backend
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Namma Canteen (நம்ம Canteen) System" -ForegroundColor Green
Write-Host "  Authentic Tamil Nadu Campus Food Hub & Kitchen KDS" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\backend'; Write-Host '--- Starting Backend API (Port 5000) ---' -ForegroundColor Cyan; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\frontend'; Write-Host '--- Starting Student Canteen Site (Port 5173) ---' -ForegroundColor Magenta; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir\staff-portal'; Write-Host '--- Starting Staff & Kitchen Portal (Port 5174) ---' -ForegroundColor Yellow; npm run dev"

Write-Host "`nAll 3 services have been launched in separate PowerShell windows!" -ForegroundColor Green
Write-Host "- Backend API:         http://localhost:5000/api/health" -ForegroundColor Yellow
Write-Host "- Student Canteen:     http://localhost:5173" -ForegroundColor Magenta
Write-Host "- Staff & Kitchen KDS: http://localhost:5174" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
