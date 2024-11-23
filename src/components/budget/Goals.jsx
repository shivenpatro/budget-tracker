import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, Edit2, AlertTriangle } from 'lucide-react';

const Goals = ({ transactions }) => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('budgetGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    localStorage.setItem('budgetGoals', JSON.stringify(goals));
  }, [goals]);

  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      const relevantTransactions = transactions.filter(t => 
        t.type === 'expense' && 
        t.category === goal.category &&
        new Date(t.date) <= new Date(goal.deadline)
      );
      const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
      const progress = Math.min((spent / goal.targetAmount) * 100, 100);
      const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        ...goal,
        spent,
        progress,
        daysRemaining,
        isOverBudget: spent > goal.targetAmount,
        isNearDeadline: daysRemaining <= 7 && progress < 100
      };
    });
  }, [goals, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals(goals.map(g => 
        g.id === editingGoal.id ? { ...formData, id: editingGoal.id } : g
      ));
    } else {
      setGoals([...goals, { ...formData, id: Date.now() }]);
    }
    setShowAddModal(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      deadline: '',
      category: '',
      description: ''
    });
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData(goal);
    setShowAddModal(true);
  };

  const handleDelete = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Goals</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingGoal(null);
            setFormData({
              name: '',
              targetAmount: '',
              deadline: '',
              category: '',
              description: ''
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Goal
        </motion.button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {goalProgress.map(goal => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{goal.name}</h3>
                  <p className="text-sm text-muted-foreground">{goal.category}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(goal)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(goal.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>

              {goal.description && (
                <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{goal.progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        goal.isOverBudget
                          ? 'bg-destructive'
                          : goal.progress >= 100
                          ? 'bg-green-500'
                          : 'bg-primary'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Target Amount</span>
                  <span className="font-medium">${goal.targetAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span className={`font-medium ${goal.isOverBudget ? 'text-destructive' : ''}`}>
                    ${goal.spent.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Days Remaining</span>
                  <span className={`font-medium ${goal.isNearDeadline ? 'text-destructive' : ''}`}>
                    {goal.daysRemaining} days
                  </span>
                </div>

                {(goal.isOverBudget || goal.isNearDeadline) && (
                  <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                    <AlertTriangle size={16} />
                    <span>
                      {goal.isOverBudget
                        ? 'Over budget!'
                        : 'Deadline approaching!'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-primary" size={24} />
                <h3 className="text-lg font-semibold">
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Housing">Housing</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Savings">Savings</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingGoal(null);
                    }}
                    className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-accent transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {editingGoal ? 'Update Goal' : 'Add Goal'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;