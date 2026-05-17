@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

::: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装
    pause
    exit /b 1
)

::: 检查 Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Java 环境，请先安装 JDK 17+
    pause
    exit /b 1
)

::: 显示主菜单
:menu
cls
echo ========================================
echo       StreamVibe 完整启动器 v3.0
echo ========================================
echo.
echo  1. 完整启动（Java后端 + Node服务 + 前端）
echo  2. 仅启动 Java 后端（端口8080）
echo  3. 仅启动 Node 服务（端口3000）
echo  4. 仅启动前端（端口5173）
echo  5. 停止所有服务
echo  0. 退出
echo.
set /p choice=请选择操作 [1-5, 0退出]:
echo.

if "%choice%"=="1" goto full_start
if "%choice%"=="2" goto java_backend
if "%choice%"=="3" goto node_server
if "%choice%"=="4" goto frontend_only
if "%choice%"=="5" goto stop_all
if "%choice%"=="0" goto end
goto menu

::: 完整启动
:full_start
echo [启动模式] 完整启动（Java后端 + Node服务 + 前端）
echo.

::: 设置 AI 环境变量
set AI_ENABLED=true
set AI_PROVIDER=volcengine
set AI_CUSTOM_API_URL=https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
set AI_CUSTOM_API_KEY=ark-ae010a11-d2eb-4f1b-abf5-0787e8f4f1d9-89124
set AI_MODEL_ID=doubao-seedance-1-5-pro-251215

echo [AI配置] 提供商: 火山引擎
echo [AI配置] 模型: %AI_MODEL_ID%
echo.

::: 停止所有相关进程
echo [步骤1] 停止所有相关进程...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM vite.exe 2>nul
taskkill /F /IM java.exe 2>nul
timeout /t 2 >nul

::: 启动 Java 后端
echo [步骤2] 启动 Java 后端服务（端口8080）...
cd /d f:\sheji\backend
start "StreamVibe-Java后端" cmd /k "title StreamVibe-Java后端 && call mvnw spring-boot:run"

::: 等待 Java 启动
echo     等待 Java 后端启动...
timeout /t 10 >nul

::: 启动 Node 服务
echo [步骤3] 启动 Node 服务（端口3000）...
cd /d f:\sheji
start "StreamVibe-Node服务" cmd /k "title StreamVibe-Node服务 && node server.js"

::: 等待 Node 启动
echo     等待 Node 服务启动...
timeout /t 3 >nul

::: 启动前端
echo [步骤4] 启动前端服务（端口5173）...
cd /d f:\sheji\frontend
start "StreamVibe-前端" cmd /k "title StreamVibe-前端 && npm run dev"

echo.
echo ========================================
echo     完整启动完成！
echo.
echo     Java后端: http://localhost:8080
echo     Node服务: http://localhost:3000
echo     前端:     http://localhost:5173
echo ========================================
pause
goto end

::: 仅启动 Java 后端
:java_backend
echo [启动模式] 仅启动 Java 后端
echo.

cd /d f:\sheji\backend
call mvnw spring-boot:run
goto end

::: 仅启动 Node 服务
:node_server
echo [启动模式] 仅启动 Node 服务
echo.

::: 设置 AI 环境变量
set AI_ENABLED=true
set AI_PROVIDER=volcengine
set AI_CUSTOM_API_URL=https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks
set AI_CUSTOM_API_KEY=ark-ae010a11-d2eb-4f1b-abf5-0787e8f4f1d9-89124
set AI_MODEL_ID=doubao-seedance-1-5-pro-251215

cd /d f:\sheji
node server.js
goto end

::: 只启动前端
:frontend_only
echo [启动模式] 只启动前端
echo.

::: 停止前端相关进程
echo [步骤1] 停止前端服务...
taskkill /F /IM vite.exe 2>nul
timeout /t 2 >nul

::: 启动前端
echo [步骤2] 启动前端服务...
cd /d f:\sheji\frontend
start "StreamVibe-前端" cmd /k "title StreamVibe-前端 && npm run dev"

echo.
echo ========================================
echo     前端启动完成！
echo.
echo     前端: http://localhost:5173
echo ========================================
pause
goto end

::: 停止所有服务
:stop_all
echo [操作] 停止所有服务...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM vite.exe 2>nul
taskkill /F /IM java.exe 2>nul
echo [完成] 所有服务已停止
echo.
pause
goto menu

:end
endlocal
