@echo off
echo ========================================
echo    TRADING JOURNAL - DEMARRAGE
echo ========================================
echo.
echo Demarrage du serveur...
start /B npm start
timeout /t 2 /nobreak >nul
echo.
echo Ouverture du navigateur...
start http://localhost:3000
echo.
echo ========================================
echo  Journal ouvert! Ne fermez pas cette
echo  fenetre pendant l'utilisation.
echo ========================================
echo.
echo Appuyez sur Ctrl+C pour arreter
pause >nul
