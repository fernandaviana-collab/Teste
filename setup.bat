@echo off
echo ==============================
echo  FastTeam - Configuracao Inicial
echo ==============================
echo.

REM Verificar Node.js
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js encontrado

REM Verificar pnpm
pnpm --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [INFO] Instalando pnpm...
    npm install -g pnpm
)
echo [OK] pnpm encontrado

REM Verificar psql
psql --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERRO] PostgreSQL nao encontrado!
    echo Baixe em: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
echo [OK] PostgreSQL encontrado

echo.
echo [INFO] Instalando dependencias...
call pnpm install

echo.
echo [INFO] Configurando banco de dados...
psql -U postgres -c "CREATE USER fastteam WITH PASSWORD 'password' CREATEDB;" 2>nul
psql -U postgres -c "CREATE DATABASE fastteam OWNER fastteam;" 2>nul
echo [OK] Banco criado (ou ja existia)

echo.
echo [INFO] Rodando migrations...
cd apps\api
call pnpm prisma migrate deploy
cd ..\..

echo.
echo ==============================
echo  Configuracao concluida!
echo  Agora execute: start.bat
echo ==============================
pause
