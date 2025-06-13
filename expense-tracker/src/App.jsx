import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Plus, Wallet, TrendingUp, TrendingDown, Calendar, Filter, Download, Settings, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState({})
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fonctions API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`)
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error)
    }
  }

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`)
      const data = await response.json()
      const budgetMap = {}
      data.forEach(budget => {
        budgetMap[budget.category_id] = budget.amount
      })
      setBudgets(budgetMap)
    } catch (error) {
      console.error('Erreur lors du chargement des budgets:', error)
    }
  }

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCategories(), fetchExpenses(), fetchBudgets()])
      setLoading(false)
    }
    loadData()
  }, [])

  const addExpense = async () => {
    if (newExpense.amount && newExpense.description && newExpense.category) {
      try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newExpense)
        })
        
        if (response.ok) {
          await fetchExpenses() // Recharger les dépenses
          setNewExpense({
            amount: '',
            description: '',
            category: '',
            date: new Date().toISOString().split('T')[0]
          })
          setDialogOpen(false)
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la dépense:', error)
      }
    }
  }

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchExpenses() // Recharger les dépenses
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const setBudgetForCategory = async (categoryId, amount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: categoryId,
          amount: parseFloat(amount)
        })
      })
      
      if (response.ok) {
        await fetchBudgets() // Recharger les budgets
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du budget:', error)
    }
  }

  const getFilteredExpenses = () => {
    let filtered = expenses
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(exp => exp.category === filterCategory)
    }

    const now = new Date()
    const startDate = new Date()
    
    switch (filterPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return filtered
    }

    return filtered.filter(exp => new Date(exp.date) >= startDate)
  }

  const getExpensesByCategory = () => {
    const filtered = getFilteredExpenses()
    const categoryTotals = {}
    
    filtered.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    return categories.map(cat => ({
      name: cat.name,
      value: categoryTotals[cat.id] || 0,
      color: cat.color,
      icon: cat.icon
    })).filter(item => item.value > 0)
  }

  const getMonthlyTrend = () => {
    const monthlyData = {}
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }))
  }

  const getTotalExpenses = () => {
    return getFilteredExpenses().reduce((total, expense) => total + expense.amount, 0)
  }

  const getAverageDaily = () => {
    const filtered = getFilteredExpenses()
    const days = filterPeriod === 'week' ? 7 : filterPeriod === 'month' ? 30 : 365
    return filtered.length > 0 ? getTotalExpenses() / days : 0
  }

  const getBudgetStatus = (categoryId) => {
    const budget = budgets[categoryId]
    if (!budget) return null

    const spent = getFilteredExpenses()
      .filter(exp => exp.category === categoryId)
      .reduce((total, exp) => total + exp.amount, 0)

    const percentage = (spent / budget) * 100
    return { budget, spent, percentage }
  }

  const getIntelligentInsights = () => {
    const categoryData = getExpensesByCategory()
    const totalSpent = getTotalExpenses()
    const insights = []

    if (categoryData.length > 0) {
      const topCategory = categoryData.reduce((max, cat) => cat.value > max.value ? cat : max)
      insights.push({
        icon: '📊',
        title: 'Catégorie principale',
        description: `${topCategory.name} représente ${((topCategory.value / totalSpent) * 100).toFixed(1)}% de vos dépenses`
      })
    }

    const monthlyTrend = getMonthlyTrend()
    if (monthlyTrend.length >= 2) {
      const lastMonth = monthlyTrend[monthlyTrend.length - 1].amount
      const previousMonth = monthlyTrend[monthlyTrend.length - 2].amount
      const change = ((lastMonth - previousMonth) / previousMonth) * 100
      
      insights.push({
        icon: change > 0 ? '📈' : '📉',
        title: 'Tendance mensuelle',
        description: `${change > 0 ? 'Augmentation' : 'Diminution'} de ${Math.abs(change).toFixed(1)}% par rapport au mois précédent`
      })
    }

    const avgDaily = getAverageDaily()
    if (avgDaily > 0) {
      insights.push({
        icon: '💡',
        title: 'Conseil',
        description: `Avec ${avgDaily.toFixed(2)}€/jour en moyenne, vous pourriez économiser ${(avgDaily * 30 * 0.1).toFixed(2)}€/mois en réduisant de 10%`
      })
    }

    // Analyse des habitudes de dépenses
    const expensesByDay = {}
    expenses.forEach(expense => {
      const day = new Date(expense.date).getDay()
      expensesByDay[day] = (expensesByDay[day] || 0) + expense.amount
    })
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const maxDay = Object.entries(expensesByDay).reduce((max, [day, amount]) => 
      amount > (expensesByDay[max] || 0) ? day : max, 0)
    
    if (Object.keys(expensesByDay).length > 0) {
      insights.push({
        icon: '📅',
        title: 'Jour de dépense',
        description: `Vous dépensez le plus le ${dayNames[maxDay]}`
      })
    }

    return insights
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-lg text-slate-600 dark:text-slate-400">Chargement de votre gestionnaire de dépenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <Wallet className="text-blue-600" />
              Gestionnaire de Dépenses
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gérez vos finances personnelles intelligemment
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle dépense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une dépense</DialogTitle>
                  <DialogDescription>
                    Enregistrez une nouvelle dépense dans votre budget
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Montant (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Description de la dépense"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              {cat.icon} {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                  <Button onClick={addExpense} className="w-full">
                    Ajouter la dépense
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <Label>Période:</Label>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 jours</SelectItem>
                <SelectItem value="month">30 jours</SelectItem>
                <SelectItem value="year">1 an</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Catégorie:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total dépensé</p>
                  <p className="text-3xl font-bold">{getTotalExpenses().toFixed(2)} €</p>
                </div>
                <Wallet className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Moyenne/jour</p>
                  <p className="text-3xl font-bold">{getAverageDaily().toFixed(2)} €</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Transactions</p>
                  <p className="text-3xl font-bold">{getFilteredExpenses().length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Catégories actives</p>
                  <p className="text-3xl font-bold">{getExpensesByCategory().length}</p>
                </div>
                <PieChartIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">📊 Tableau de bord</TabsTrigger>
            <TabsTrigger value="expenses">📝 Dépenses</TabsTrigger>
            <TabsTrigger value="budgets">💰 Budgets</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique en secteurs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Répartition par catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getExpensesByCategory()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ${value.toFixed(0)}€`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getExpensesByCategory().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, 'Montant']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Évolution mensuelle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5" />
                    Évolution mensuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getMonthlyTrend()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, 'Dépenses']} />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Dépenses récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Dépenses récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFilteredExpenses().slice(0, 5).map(expense => {
                    const category = categories.find(cat => cat.id === expense.category)
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category?.icon}</span>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {category?.name} • {new Date(expense.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{expense.amount.toFixed(2)} €</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les dépenses</CardTitle>
                <CardDescription>
                  {getFilteredExpenses().length} dépense(s) • Total: {getTotalExpenses().toFixed(2)} €
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFilteredExpenses().map(expense => {
                    const category = categories.find(cat => cat.id === expense.category)
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{category?.icon}</span>
                          <div>
                            <p className="font-medium text-lg">{expense.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" style={{backgroundColor: category?.color + '20', color: category?.color}}>
                                {category?.name}
                              </Badge>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(expense.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl">{expense.amount.toFixed(2)} €</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700 mt-1"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  {getFilteredExpenses().length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune dépense trouvée pour cette période</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => {
                const budgetStatus = getBudgetStatus(category.id)
                const spent = getFilteredExpenses()
                  .filter(exp => exp.category === category.id)
                  .reduce((total, exp) => total + exp.amount, 0)

                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`budget-${category.id}`}>Budget mensuel (€)</Label>
                        <Input
                          id={`budget-${category.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={budgets[category.id] || ''}
                          onChange={(e) => setBudgetForCategory(category.id, e.target.value)}
                        />
                      </div>
                      
                      {budgetStatus && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Dépensé: {budgetStatus.spent.toFixed(2)} €</span>
                            <span>Budget: {budgetStatus.budget.toFixed(2)} €</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                budgetStatus.percentage > 100 ? 'bg-red-500' : 
                                budgetStatus.percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{width: `${Math.min(budgetStatus.percentage, 100)}%`}}
                            ></div>
                          </div>
                          <p className={`text-sm font-medium ${
                            budgetStatus.percentage > 100 ? 'text-red-600' : 
                            budgetStatus.percentage > 80 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {budgetStatus.percentage.toFixed(1)}% utilisé
                            {budgetStatus.percentage > 100 && ` (Dépassement: ${(budgetStatus.spent - budgetStatus.budget).toFixed(2)} €)`}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Dépensé ce mois: {spent.toFixed(2)} €
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique en barres par catégorie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Dépenses par catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getExpensesByCategory()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, 'Montant']} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Insights intelligents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Insights intelligents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getIntelligentInsights().map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

