@echo off
REM Enterprise Email Automation Platform - Quick Start Script for Windows
REM This script starts both frontend and backend servers

setlocal enabledelayedexpansion
title Email Automation Platform - Startup

echo.
echo ======================================
echo   Email Automation Platform Startup
echo ======================================
echo.

REM Kill any existing Node processes
echo Cleaning up old processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Start Backend Server
echo.
echo Starting Backend Server...
echo ============================================
start "Automail Backend" cmd /k "node BACKEND_server.js"
timeout /t 2 /nobreak >nul

REM Start Frontend Server
echo.
echo Starting Frontend Server...
echo ============================================
start "Automail Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Display information
echo.
echo ============================================
echo   Servers Started Successfully!
echo ============================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3001
echo.
echo Demo Credentials:
echo   Email:    admin@demo.com
echo   Password: admin123
echo.
echo ============================================
echo   Press any key to close this window
echo ============================================
echo.
pause
exit /b 0
