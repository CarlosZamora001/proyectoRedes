@echo off
title Portal de Simulaciones UPTC (OpenStack)
cd /d "%~dp0"
echo Iniciando servidor local en el puerto 8000...
start "" "http://localhost:8000"
python server.py
pause

