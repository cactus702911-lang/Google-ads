@echo off
echo Starting DigitalGrowth24 CMS Server...
start "" http://localhost:3000/admin
node server.cjs
pause
