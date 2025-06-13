from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(7), nullable=False)  # Couleur hex
    icon = db.Column(db.String(10), nullable=False)  # Emoji
    
    # Relation avec les dépenses
    expenses = db.relationship('Expense', backref='category_ref', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'icon': self.icon
        }

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    category_id = db.Column(db.String(50), db.ForeignKey('categories.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'description': self.description,
            'category': self.category_id,
            'date': self.date.isoformat(),
            'timestamp': self.timestamp.isoformat()
        }

class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.String(50), db.ForeignKey('categories.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    month = db.Column(db.Integer, nullable=False)  # Mois (1-12)
    year = db.Column(db.Integer, nullable=False)   # Année
    
    # Contrainte unique pour éviter les doublons
    __table_args__ = (db.UniqueConstraint('category_id', 'month', 'year'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_id': self.category_id,
            'amount': self.amount,
            'month': self.month,
            'year': self.year
        }

