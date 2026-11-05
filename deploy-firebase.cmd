@echo off
cd /d "%~dp0"
node -r "%~dp0dns-patch.js" "%APPDATA%\npm\node_modules\firebase-tools\lib\bin\firebase.js" deploy --only hosting --project pagina-1be91
pause
