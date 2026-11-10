@echo off
title HRMS Manager Desk Server
echo ========================================================
echo   Starting HRMS Manager Desk (Monsoon Glass)
echo   URL: http://localhost:3000/
echo ========================================================
start "" http://localhost:3000/
node server.js
pause

