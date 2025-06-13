from flask import Blueprint, request, jsonify
from src.models.expense import db, Expense, Category, Budget
from datetime import datetime, date
from sqlalchemy import func, extract

expense_bp = Blueprint('expense', __name__)

# Routes pour les catégories
@expense_bp.route('/categories', methods=['GET'])
def get_categories():
    """Récupérer toutes les catégories"""
    categories = Category.query.all()
    return jsonify([cat.to_dict() for cat in categories])

@expense_bp.route('/categories', methods=['POST'])
def create_category():
    """Créer une nouvelle catégorie"""
    data = request.get_json()
    
    category = Category(
        id=data['id'],
        name=data['name'],
        color=data['color'],
        icon=data['icon']
    )
    
    try:
        db.session.add(category)
        db.session.commit()
        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Routes pour les dépenses
@expense_bp.route('/expenses', methods=['GET'])
def get_expenses():
    """Récupérer toutes les dépenses avec filtres optionnels"""
    category_filter = request.args.get('category')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Expense.query
    
    if category_filter and category_filter != 'all':
        query = query.filter(Expense.category_id == category_filter)
    
    if start_date:
        query = query.filter(Expense.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(Expense.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    expenses = query.order_by(Expense.timestamp.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses])

@expense_bp.route('/expenses', methods=['POST'])
def create_expense():
    """Créer une nouvelle dépense"""
    data = request.get_json()
    
    expense = Expense(
        amount=float(data['amount']),
        description=data['description'],
        category_id=data['category'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date()
    )
    
    try:
        db.session.add(expense)
        db.session.commit()
        return jsonify(expense.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@expense_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Supprimer une dépense"""
    expense = Expense.query.get_or_404(expense_id)
    
    try:
        db.session.delete(expense)
        db.session.commit()
        return jsonify({'message': 'Dépense supprimée'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Routes pour les statistiques
@expense_bp.route('/stats/by-category', methods=['GET'])
def get_stats_by_category():
    """Statistiques des dépenses par catégorie"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = db.session.query(
        Expense.category_id,
        func.sum(Expense.amount).label('total')
    ).group_by(Expense.category_id)
    
    if start_date:
        query = query.filter(Expense.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(Expense.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    results = query.all()
    
    stats = []
    for category_id, total in results:
        category = Category.query.get(category_id)
        if category:
            stats.append({
                'category_id': category_id,
                'category_name': category.name,
                'category_icon': category.icon,
                'category_color': category.color,
                'total': float(total)
            })
    
    return jsonify(stats)

@expense_bp.route('/stats/monthly-trend', methods=['GET'])
def get_monthly_trend():
    """Tendance mensuelle des dépenses"""
    results = db.session.query(
        extract('year', Expense.date).label('year'),
        extract('month', Expense.date).label('month'),
        func.sum(Expense.amount).label('total')
    ).group_by(
        extract('year', Expense.date),
        extract('month', Expense.date)
    ).order_by(
        extract('year', Expense.date),
        extract('month', Expense.date)
    ).all()
    
    trend = []
    for year, month, total in results:
        month_names = ['', 'jan', 'fév', 'mar', 'avr', 'mai', 'jun',
                      'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
        trend.append({
            'month': f"{month_names[int(month)]} {int(year)}",
            'amount': float(total)
        })
    
    return jsonify(trend[-6:])  # Derniers 6 mois

# Routes pour les budgets
@expense_bp.route('/budgets', methods=['GET'])
def get_budgets():
    """Récupérer tous les budgets"""
    month = request.args.get('month', datetime.now().month)
    year = request.args.get('year', datetime.now().year)
    
    budgets = Budget.query.filter_by(month=month, year=year).all()
    return jsonify([budget.to_dict() for budget in budgets])

@expense_bp.route('/budgets', methods=['POST'])
def create_or_update_budget():
    """Créer ou mettre à jour un budget"""
    data = request.get_json()
    
    month = data.get('month', datetime.now().month)
    year = data.get('year', datetime.now().year)
    
    # Vérifier si le budget existe déjà
    existing_budget = Budget.query.filter_by(
        category_id=data['category_id'],
        month=month,
        year=year
    ).first()
    
    if existing_budget:
        existing_budget.amount = float(data['amount'])
        budget = existing_budget
    else:
        budget = Budget(
            category_id=data['category_id'],
            amount=float(data['amount']),
            month=month,
            year=year
        )
        db.session.add(budget)
    
    try:
        db.session.commit()
        return jsonify(budget.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@expense_bp.route('/budgets/status', methods=['GET'])
def get_budget_status():
    """Statut des budgets avec dépenses actuelles"""
    month = request.args.get('month', datetime.now().month)
    year = request.args.get('year', datetime.now().year)
    
    budgets = Budget.query.filter_by(month=month, year=year).all()
    
    status = []
    for budget in budgets:
        # Calculer les dépenses pour cette catégorie ce mois
        spent = db.session.query(func.sum(Expense.amount)).filter(
            Expense.category_id == budget.category_id,
            extract('month', Expense.date) == month,
            extract('year', Expense.date) == year
        ).scalar() or 0
        
        category = Category.query.get(budget.category_id)
        
        status.append({
            'category_id': budget.category_id,
            'category_name': category.name if category else 'Unknown',
            'category_icon': category.icon if category else '📦',
            'budget': budget.amount,
            'spent': float(spent),
            'percentage': (float(spent) / budget.amount * 100) if budget.amount > 0 else 0
        })
    
    return jsonify(status)

