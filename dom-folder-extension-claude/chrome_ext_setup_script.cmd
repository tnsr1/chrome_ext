@echo off
chcp 65001 >nul
echo ================================================
echo Создание структуры расширения Chrome
echo ================================================
echo.

REM Создание основных папок
echo [1/4] Создание папок...
mkdir popup
mkdir functions
mkdir utils
mkdir icons

echo ✓ Папки созданы
echo.

REM Создание файлов в popup
echo [2/4] Создание файлов popup...
type nul > popup\popup.html
type nul > popup\popup.css
type nul > popup\popup.js

echo ✓ Файлы popup созданы
echo.

REM Создание файлов функций
echo [3/4] Создание файлов функций...
type nul > functions\function1.js
type nul > functions\function2.js
type nul > functions\function3.js

echo ✓ Файлы функций созданы
echo.

REM Создание файлов utils
echo [4/4] Создание файлов utils...
type nul > utils\helpers.js

echo ✓ Файлы utils созданы
echo.

REM Создание manifest.json
type nul > manifest.json

echo ================================================
echo Структура проекта создана успешно!
echo ================================================
echo.
echo Созданы папки:
echo   - popup\
echo   - functions\
echo   - utils\
echo   - icons\
echo.
echo Созданы файлы:
echo   - manifest.json
echo   - popup\popup.html
echo   - popup\popup.css
echo   - popup\popup.js
echo   - functions\function1.js
echo   - functions\function2.js
echo   - functions\function3.js
echo   - utils\helpers.js
echo.
echo Теперь скопируйте содержимое файлов из артефактов!
echo.
pause