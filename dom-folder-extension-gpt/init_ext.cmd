@echo off
set ROOT=extension

echo Создаю структуру проекта: %ROOT%
mkdir %ROOT%
mkdir %ROOT%\popup
mkdir %ROOT%\scripts
mkdir %ROOT%\content
mkdir %ROOT%\styles
mkdir %ROOT%\assets

echo Пишу минимальный manifest.json
(
echo {
echo   "manifest_version": 3,
echo   "name": "FlexGrid Viewer",
echo   "version": "0.1",
echo   "description": "Инструмент для сворачивания DOM как в FlexGrid.",
echo   "permissions": [ "scripting", "activeTab" ],
echo   "action": {
echo     "default_popup": "popup/popup.html"
echo   },
echo   "content_scripts": [
echo     {
echo       "matches": [ "http://*/*", "https://*/*" ],
echo       "js": [ "content/content.js" ],
echo       "css": [ "styles/content.css" ]
echo     }
echo   ]
echo }
)>%ROOT%\manifest.json

echo Пишу пустые файлы
echo // popup JS > %ROOT%\popup\popup.js
echo // popup HTML > %ROOT%\popup\popup.html
echo // menu actions > %ROOT%\scripts\actions.js
echo // main content script > %ROOT%\content\content.js
echo /* content styles */ > %ROOT%\styles\content.css

echo Готово!
