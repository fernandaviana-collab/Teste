@echo off
echo ==============================
echo  FastTeam - Iniciando...
echo ==============================
echo.

REM Salva o diretorio atual
set ROOT=%~dp0

echo [INFO] Iniciando API (porta 3001)...
start "FastTeam API" cmd /k "cd /d %ROOT%apps\api && pnpm dev"

echo [INFO] Aguardando API iniciar...
timeout /t 5 /nobreak >nul

echo [INFO] Iniciando Frontend (porta 5173)...
start "FastTeam Frontend" cmd /k "cd /d %ROOT%apps\web && pnpm dev"

echo.
echo ==============================
echo  Servicos iniciados!
echo  API:      http://localhost:3001
echo  Frontend: http://localhost:5173
echo  Swagger:  http://localhost:3001/api/docs
echo.
echo  Login: admin@fastteam.com
echo  Senha: admin123
echo ==============================
echo.
echo Aguarde alguns segundos e acesse http://localhost:5173
pause
