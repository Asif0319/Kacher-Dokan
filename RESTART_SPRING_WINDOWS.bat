@echo off
setlocal EnableExtensions
cd /d "%~dp0kaser-dokan-backend"
where java >nul 2>nul || (echo Java 21 is required.& pause & exit /b 1)
where mvn >nul 2>nul || (echo Apache Maven is required.& pause & exit /b 1)
for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"
if not defined PORT set PORT=3000
for /f "tokens=5" %%P in ('netstat -aon ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  echo Stopping old process on port %PORT% - PID %%P
  taskkill /PID %%P /F >nul 2>nul
)
timeout /t 2 /nobreak >nul
echo Starting CURRENT v26 Spring Boot build...
echo URL: http://localhost:%PORT%
echo MongoDB configuration loaded from kaser-dokan-backend\.env
mvn spring-boot:run
pause
