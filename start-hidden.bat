@echo off
cd /d "C:\Validador\validacionApp"
powershell -WindowStyle Hidden -ExecutionPolicy Bypass -Command "& {Start-Process 'npx' -ArgumentList 'expo start --host lan --port 8081 --clear' -WindowStyle Hidden -NoNewWindow}"
