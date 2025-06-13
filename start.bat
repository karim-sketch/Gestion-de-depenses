@echo off
echo 🚀 Gestionnaire de Dépenses Intelligent - Démarrage
echo ==================================================

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

echo ✅ Prérequis vérifiés

REM Démarrer le backend
echo 🔧 Démarrage du backend Flask...
cd expense-tracker-api

REM Créer l'environnement virtuel s'il n'existe pas
if not exist "venv" (
    echo 📦 Création de l'environnement virtuel Python...
    python -m venv venv
)

REM Activer l'environnement virtuel
call venv\Scripts\activate.bat

REM Installer les dépendances
echo 📦 Installation des dépendances Python...
pip install -r requirements.txt

REM Démarrer le serveur Flask en arrière-plan
echo 🚀 Démarrage du serveur Flask...
start /B python src\main.py

REM Attendre que Flask démarre
timeout /t 3 /nobreak >nul

REM Démarrer le frontend
echo 🎨 Démarrage du frontend React...
cd ..\expense-tracker

REM Installer les dépendances Node.js si nécessaire
if not exist "node_modules" (
    echo 📦 Installation des dépendances Node.js...
    npm install
)

REM Démarrer le serveur de développement
echo 🚀 Démarrage du serveur React...
start /B npm run dev

echo.
echo 🎉 Application démarrée avec succès !
echo 📱 Frontend : http://localhost:5173
echo 🔧 Backend API : http://localhost:5000
echo.
echo Appuyez sur une touche pour arrêter l'application
pause >nul

REM Arrêter les processus
echo 🛑 Arrêt de l'application...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ Application arrêtée

