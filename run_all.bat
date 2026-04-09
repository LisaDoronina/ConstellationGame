@echo off
setlocal

set "ROOT=%~dp0"

echo [1/6] Docker compose reset...
cd /d "%ROOT%" || goto :error
docker compose down -v || goto :error
docker compose up -d || goto :error

echo [2/6] Building C++ core...
cd /d "%ROOT%services\cpp_core" || goto :error
if exist build rmdir /s /q build
cmake -S . -B build -G Ninja || goto :error
cmake --build build || goto :error

echo [3/6] Starting C++ game...
start "Constellation C++ Core" cmd /k "cd /d ""%ROOT%services\cpp_core\build"" && constellation_game.exe"

echo [4/6] Starting Java backend...
start "Constellation Java Backend" cmd /k "cd /d ""%ROOT%"" && mvn spring-boot:run"

echo [5/6] Starting JS frontend...
start "Constellation JS Frontend" cmd /k "cd /d ""%ROOT%js_frontend\src"" && npm install && npm run dev"

echo [6/6] Starting Python ML...
start "Constellation Python ML" cmd /k "cd /d ""%ROOT%"" && python -m python_ml.src.main"

echo.
echo All services were started in separate windows.
exit /b 0

:error
echo.
echo Failed during startup. Check the messages above.
exit /b 1

