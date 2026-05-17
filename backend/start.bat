@echo off
chcp 65001 >nul
cd /d %~dp0

echo ========================================
echo   StreamVibe 项目启动脚本
echo ========================================
echo.

:: 检查是否配置了数据库密码
findstr /C:"password: $" src\main\resources\application.yml >nul
if %errorlevel%==0 (
    echo [警告] 请先配置数据库密码！
    echo 编辑 src\main\resources\application.yml
    echo 将 password: 改为你的 MySQL 密码
    echo.
    pause
    exit /b 1
)

:: 检查 Maven 是否可用
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [Maven 未找到，正在下载...]
    
    :: 检查是否已有本地Maven
    if exist "apache-maven-3.9.6\bin\mvn.cmd" (
        echo [找到本地Maven]
        set PATH=%CD%\apache-maven-3.9.6\bin;%PATH%
        goto :start_backend
    )
    
    :: 下载Maven
    echo 正在下载 Apache Maven 3.9.6...
    powershell -Command "Invoke-WebRequest -Uri 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip' -OutFile 'apache-maven-3.9.6-bin.zip' -UseBasicParsing"
    
    if exist "apache-maven-3.9.6-bin.zip" (
        echo 正在解压...
        powershell -Command "Expand-Archive -Path 'apache-maven-3.9.6-bin.zip' -DestinationPath '.' -Force"
        del apache-maven-3.9.6-bin.zip
        echo Maven 下载完成！
    ) else (
        echo [错误] Maven 下载失败
        echo 请手动下载 Maven: https://maven.apache.org/download.cgi
        echo 并解压到当前目录
        pause
        exit /b 1
    )
    
    set PATH=%CD%\apache-maven-3.9.6\bin;%PATH%
)

:start_backend
echo [1/2] 启动 Spring Boot 后端...
echo 后端地址: http://localhost:8080
echo.
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo.
echo ========================================
echo   后端启动中，请等待...
echo   启动完成后启动前端
echo ========================================
pause
