@echo off
echo Starting digitalgrowth24 CMS Server...
start "" http://localhost:3000/admin
node server.cjs
pause
