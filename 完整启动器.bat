@echo off
chcp 936 >nul
setlocal EnableDelayedExpansion

::: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Node.js not found, please install first
    pause
    exit /b 1
)

::: Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [Error] Java not found, please install JDK 17+
    pause
    exit /b 1
)

::: Main Menu
:menu
cls
echo ========================================
echo       StreamVibe Launcher v3.0
echo ========================================
echo.
echo   1. Full Start (Java Backend + Node Server + Frontend)
echo   2. Java Backend Only (Port 8080)
echo   3. Node Server Only (Port 3000)
echo   4. Frontend Only (Port 5173)
echo   5. Stop All Services
echo   0. Exit
echo.
set /p choice=Select option [1-5, 0 to exit]:
echo.

if "%choice%"=="1" goto full_start
if "%choice%"=="2" goto java_backend
if "%choice%"=="3" goto node_server
if "%choice%"=="4" goto frontend_only
if "%choice%"=="5" goto stop_all
if "%choice%"=="0" goto end
goto menu

::: Full Start
:full_start
echo [Mode] Full Start (Java Backend + Node Server + Frontend)
echo.

::: Set AI Environment Variables
set AI_ENABLED=true
set AI_PROVIDER=volcengine
set AI_CUSTOM_API_URL=https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
set AI_CUSTOM_API_KEY=ark-ae010a11-d2eb-4f1b-abf5-0787e8f4f1d9-89124
set AI_MODEL_ID=doubao-seedance-1-5-pro-251215

echo [AI Config] Provider: Volcengine
echo [AI Config] Model: %AI_MODEL_ID%
echo.

::: Kill all processes
echo [Step 1] Stopping all related processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM vite.exe 2>nul
taskkill /F /IM java.exe 2>nul
timeout /t 2 >nul

::: Start Java Backend
echo [Step 2] Starting Java Backend (Port 8080)...
cd /d f:\sheji\backend
start "StreamVibe-JavaBackend" cmd /k "title StreamVibe-JavaBackend && call mvnw spring-boot:run"

::: Wait for Java
echo     Waiting for Java Backend...
timeout /t 10 >nul

::: Start Node Server
echo [Step 3] Starting Node Server (Port 3000)...
cd /d f:\sheji
start "StreamVibe-NodeServer" cmd /k "title StreamVibe-NodeServer && node server.js"

::: Wait for Node
echo     Waiting for Node Server...
timeout /t 3 >nul

::: Start Frontend
echo [Step 4] Starting Frontend (Port 5173)...
cd /d f:\sheji\frontend
start "StreamVibe-Frontend" cmd /k "title StreamVibe-Frontend && npm run dev"

echo.
echo ========================================
echo     All services started!
echo.
echo     Java Backend: http://localhost:8080
echo     Node Server:  http://localhost:3000
echo     Frontend:     http://localhost:5173
echo ========================================
pause
goto end

::: Java Backend Only
:java_backend
echo [Mode] Java Backend Only
echo.

cd /d f:\sheji\backend
call mvnw spring-boot:run
goto end

::: Node Server Only
:node_server
echo [Mode] Node Server Only
echo.

set AI_ENABLED=true
set AI_PROVIDER=volcengine
set AI_CUSTOM_API_URL=https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
set AI_CUSTOM_API_KEY=ark-ae010a11-d2eb-4f1b-abf5-0787e8f4f1d9-89124
set AI_MODEL_ID=doubao-seedance-1-5-pro-251215

cd /d f:\sheji
node server.js
goto end

::: Frontend Only
:frontend_only
echo [Mode] Frontend Only
echo.

echo [Step 1] Stopping frontend process...
taskkill /F /IM vite.exe 2>nul
timeout /t 2 >nul

echo [Step 2] Starting Frontend...
cd /d f:\sheji\frontend
start "StreamVibe-Frontend" cmd /k "title StreamVibe-Frontend && npm run dev"

echo.
echo ========================================
echo     Frontend started!
echo.
echo     Frontend: http://localhost:5173
echo ========================================
pause
goto end

::: Stop All
:stop_all
echo [Action] Stopping all services...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM vite.exe 2>nul
taskkill /F /IM java.exe 2>nul
echo [Done] All services stopped
echo.
pause
goto menu

:end
endlocal
