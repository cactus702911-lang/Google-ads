@echo off
echo Starting DigitalGrowth CMS Server...
start "" http://localhost:3000/admin
node server.cjs
pause
