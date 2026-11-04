@echo off
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo Waiting for Docker Desktop API to become available...

:loop
:: Attempt to call docker ps. Redirect output and errors to null.
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    goto loop
)

echo Docker is ready! Starting containers...
docker compose up -d
