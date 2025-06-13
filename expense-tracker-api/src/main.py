import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.expense import db, Category
from src.routes.expense import expense_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Activer CORS pour toutes les routes
CORS(app)

app.register_blueprint(expense_bp, url_prefix='/api')

# Configuration de la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def init_categories():
    """Initialiser les catégories par défaut"""
    categories = [
        {'id': 'alimentation', 'name': 'Alimentation', 'color': '#FF6B6B', 'icon': '🍽️'},
        {'id': 'transport', 'name': 'Transport', 'color': '#4ECDC4', 'icon': '🚗'},
        {'id': 'logement', 'name': 'Logement', 'color': '#45B7D1', 'icon': '🏠'},
        {'id': 'sante', 'name': 'Santé', 'color': '#96CEB4', 'icon': '⚕️'},
        {'id': 'loisirs', 'name': 'Loisirs', 'color': '#FFEAA7', 'icon': '🎯'},
        {'id': 'shopping', 'name': 'Shopping', 'color': '#DDA0DD', 'icon': '🛍️'},
        {'id': 'education', 'name': 'Éducation', 'color': '#98D8C8', 'icon': '📚'},
        {'id': 'autres', 'name': 'Autres', 'color': '#F7DC6F', 'icon': '📦'}
    ]
    
    for cat_data in categories:
        existing = Category.query.get(cat_data['id'])
        if not existing:
            category = Category(**cat_data)
            db.session.add(category)
    
    db.session.commit()

with app.app_context():
    db.create_all()
    init_categories()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
