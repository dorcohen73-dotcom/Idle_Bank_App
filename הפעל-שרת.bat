@echo off
chcp 65001 >nul
cd /d %~dp0
echo.
echo   The game server is starting...
echo   Leave this window OPEN and tell Claude it is running.
echo.
npx --yes http-server . -p 8080 -c-1
pause
