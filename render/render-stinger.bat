@echo off
cd /d "%~dp0"
if not exist node_modules\puppeteer-core call npm install puppeteer-core --no-audit --no-fund
node render-stinger.mjs %*
pause
