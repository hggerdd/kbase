@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "LOG_DIR=%ROOT_DIR%\kb\logs"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

for /f "tokens=2 delims=:" %%I in ('ipconfig ^| findstr /C:"IPv4-Adresse" /C:"IPv4 Address"') do (
  for /f "tokens=* delims= " %%J in ("%%I") do (
    if not defined LAN_IP set "LAN_IP=%%J"
  )
)

if not defined LAN_IP (
  echo Konnte keine lokale IPv4-Adresse ermitteln.
  exit /b 1
)

for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "$port = 8000; while ($true) { try { $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port); $listener.Start(); $listener.Stop(); Write-Output $port; break } catch { $port++ } }"`) do (
  set "API_PORT=%%P"
)

for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "$port = 5173; while ($true) { try { $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port); $listener.Start(); $listener.Stop(); Write-Output $port; break } catch { $port++ } }"`) do (
  set "WEB_PORT=%%P"
)

set "CORS_ORIGINS=http://%LAN_IP%:%WEB_PORT%,http://127.0.0.1:%WEB_PORT%,http://localhost:%WEB_PORT%"
set "API_URL=http://%LAN_IP%:%API_PORT%"
set "WEB_URL=http://%LAN_IP%:%WEB_PORT%"
set "API_LOG=%LOG_DIR%\api-lan.log"
set "WEB_LOG=%FRONTEND_DIR%\vite-lan.log"

echo.
echo LAN-IP: %LAN_IP%
echo API:    %API_URL%
echo Web:    %WEB_URL%
echo.
echo Starte Backend und Frontend in separaten PowerShell-Fenstern...
echo.

start "kbase-api-lan" powershell -NoExit -ExecutionPolicy Bypass -Command "$env:KBASE_CORS_ORIGINS='%CORS_ORIGINS%'; Set-Location '%ROOT_DIR%'; uv run uvicorn kbase.interfaces.api.main:app --host 0.0.0.0 --port %API_PORT% *>> '%API_LOG%'"

start "kbase-web-lan" powershell -NoExit -ExecutionPolicy Bypass -Command "$env:VITE_DEV_HOST='0.0.0.0'; Set-Location '%FRONTEND_DIR%'; npm run dev -- --host 0.0.0.0 --port %WEB_PORT% --strictPort --clearScreen false *>> '%WEB_LOG%'"

echo Aufruf im lokalen Netzwerk:
echo %WEB_URL%
echo.
echo Logs:
echo %API_LOG%
echo %WEB_LOG%

endlocal
