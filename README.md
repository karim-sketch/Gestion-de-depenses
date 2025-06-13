# Gestionnaire de Dépenses Intelligent

Une application web moderne et intuitive pour gérer vos finances personnelles sans Excel ni applications complexes.

## 🚀 Fonctionnalités

### Interface Utilisateur
- **Design moderne** : Interface responsive avec thème sombre/clair
- **Tableau de bord** : Vue d'ensemble avec statistiques en temps réel
- **Navigation intuitive** : Onglets organisés (Tableau de bord, Dépenses, Budgets, Analyses)

### Gestion des Dépenses
- **Ajout facile** : Formulaire simple avec catégories prédéfinies
- **Catégories intelligentes** : 8 catégories avec icônes (Alimentation, Transport, Logement, etc.)
- **Filtrage avancé** : Par période (7 jours, 30 jours, 1 an) et par catégorie
- **Suppression rapide** : Gestion des erreurs de saisie

### Visualisations
- **Graphiques en secteurs** : Répartition des dépenses par catégorie
- **Graphiques en barres** : Comparaison des montants par catégorie
- **Tendances mensuelles** : Évolution des dépenses dans le temps
- **Statistiques en temps réel** : Total, moyenne quotidienne, nombre de transactions

### Budgets Intelligents
- **Définition de budgets** : Par catégorie et par mois
- **Suivi visuel** : Barres de progression colorées
- **Alertes automatiques** : Notifications de dépassement
- **Pourcentages d'utilisation** : Suivi précis des dépenses vs budget

### Analyses Intelligentes
- **Insights automatiques** : Analyse de vos habitudes de dépenses
- **Catégorie principale** : Identification des postes de dépenses majeurs
- **Tendances mensuelles** : Évolution et comparaisons automatiques
- **Conseils personnalisés** : Suggestions d'économies basées sur vos données
- **Analyse des habitudes** : Identification des jours de forte dépense

### Persistance des Données
- **Base de données SQLite** : Stockage local sécurisé
- **API RESTful** : Architecture moderne et extensible
- **Sauvegarde automatique** : Aucune perte de données
- **Performance optimisée** : Chargement rapide et fluide

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** : Framework moderne avec hooks
- **Tailwind CSS** : Design system responsive
- **Shadcn/UI** : Composants UI professionnels
- **Recharts** : Graphiques interactifs
- **Lucide Icons** : Icônes modernes

### Backend
- **Flask** : Framework web Python léger
- **SQLAlchemy** : ORM pour la base de données
- **SQLite** : Base de données embarquée
- **Flask-CORS** : Support des requêtes cross-origin

## 📦 Installation

### Prérequis
- Python 3.8+ installé
- Node.js 16+ installé
- Git installé

### Installation Rapide

1. **Décompresser l'archive** dans un dossier de votre choix

2. **Démarrer le backend** :
```bash
cd expense-tracker-api
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

3. **Démarrer le frontend** (dans un nouveau terminal) :
```bash
cd expense-tracker
npm install  # ou pnpm install
npm run dev  # ou pnpm run dev
```

4. **Accéder à l'application** :
   - Frontend : http://localhost:5173
   - API Backend : http://localhost:5000

### Installation Production (Optionnel)

Pour une installation en production avec un seul serveur :

1. **Construire le frontend** :
```bash
cd expense-tracker
npm run build
cp -r dist/* ../expense-tracker-api/src/static/
```

2. **Démarrer uniquement le backend** :
```bash
cd expense-tracker-api
source venv/bin/activate
python src/main.py
```

3. **Accéder à l'application** : http://localhost:5000

## 🎯 Utilisation

### Premier Démarrage
1. L'application initialise automatiquement les 8 catégories de base
2. Commencez par ajouter quelques dépenses via le bouton "Nouvelle dépense"
3. Définissez vos budgets mensuels dans l'onglet "Budgets"
4. Consultez vos analyses dans l'onglet "Analyses"

### Conseils d'Utilisation
- **Soyez régulier** : Ajoutez vos dépenses quotidiennement pour de meilleures analyses
- **Utilisez les catégories** : Respectez les catégories pour des statistiques cohérentes
- **Définissez des budgets** : Fixez des limites réalistes pour un meilleur contrôle
- **Consultez les analyses** : Les insights vous aideront à optimiser vos finances

## 🔧 Personnalisation

### Ajouter des Catégories
Modifiez le fichier `expense-tracker-api/src/main.py` dans la fonction `init_categories()`.

### Modifier les Couleurs
Les couleurs sont définies dans les constantes des composants React.

### Adapter les Analyses
Les algorithmes d'analyse sont dans `expense-tracker/src/App.jsx` dans la fonction `getIntelligentInsights()`.

## 📊 Structure des Données

### Dépenses
- Montant (décimal)
- Description (texte)
- Catégorie (référence)
- Date (date)
- Timestamp (datetime)

### Catégories
- ID unique (texte)
- Nom (texte)
- Couleur (hex)
- Icône (emoji)

### Budgets
- Catégorie (référence)
- Montant (décimal)
- Mois/Année (entiers)

## 🚀 Évolutions Possibles

### Fonctionnalités Avancées
- Import/Export CSV
- Synchronisation cloud
- Notifications push
- Mode multi-utilisateurs
- Rapports PDF
- Prévisions IA

### Intégrations
- Banques (Open Banking)
- Applications de paiement
- Systèmes comptables
- APIs financières

## 🐛 Dépannage

### Problèmes Courants

**Le frontend ne se connecte pas au backend :**
- Vérifiez que le backend tourne sur le port 5000
- Vérifiez les paramètres CORS dans `main.py`

**Erreur de base de données :**
- Supprimez le fichier `src/database/app.db` pour réinitialiser
- Redémarrez le backend

**Problèmes d'installation :**
- Vérifiez les versions de Python et Node.js
- Utilisez un environnement virtuel Python

## 📝 Support

Pour toute question ou suggestion d'amélioration, n'hésitez pas à me contacter.

## 📄 Licence

Application développée pour usage personnel et professionnel.

---

**Gestionnaire de Dépenses Intelligent** - Une solution moderne pour maîtriser vos finances personnelles ! 💰📊

