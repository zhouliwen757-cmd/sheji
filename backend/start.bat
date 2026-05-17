@echo off
chcp 65001 >nul
echo ========================================
echo   StreamVibe Spring Boot 启动器
echo ========================================
echo.

cd /d "%~dp0"

:: 检查Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Java环境，请先安装 JDK 17+
    pause
    exit /b 1
)

echo [1/3] 正在编译项目...
call mvnw clean compile -q

if errorlevel 1 (
    echo [错误] 编译失败！
    pause
    exit /b 1
)

echo [2/3] 正在启动服务...
echo.
echo 访问地址: http://localhost:8080/api
echo.

call mvnw spring-boot:run

pause
