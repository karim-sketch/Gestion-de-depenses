#!/bin/bash

echo "🚀 Gestionnaire de Dépenses Intelligent - Démarrage"
echo "=================================================="

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Prérequis vérifiés"

# Démarrer le backend
echo "🔧 Démarrage du backend Flask..."
cd expense-tracker-api

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
echo "📦 Installation des dépendances Python..."
pip install -r requirements.txt

# Démarrer le serveur Flask en arrière-plan
echo "🚀 Démarrage du serveur Flask..."
python src/main.py &
FLASK_PID=$!

# Attendre que Flask démarre
sleep 3

# Démarrer le frontend
echo "🎨 Démarrage du frontend React..."
cd ../expense-tracker

# Installer les dépendances Node.js si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances Node.js..."
    npm install
fi

# Démarrer le serveur de développement
echo "🚀 Démarrage du serveur React..."
npm run dev &
REACT_PID=$!

echo ""
echo "🎉 Application démarrée avec succès !"
echo "📱 Frontend : http://localhost:5173"
echo "🔧 Backend API : http://localhost:5000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter l'application"

# Fonction pour nettoyer les processus à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    kill $FLASK_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "✅ Application arrêtée"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
wait

