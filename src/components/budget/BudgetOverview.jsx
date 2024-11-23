import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Plus, Trash2, TrendingUp, PiggyBank } from 'lucide-react';
import AddTransaction from './AddTransaction';

const BudgetOverview = ({ transactions, monthlyBudget, onBudgetChange, onAddTransaction, onDeleteTransaction }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = monthlyBudget - totalSpent;
  const spentPercentage = (totalSpent / monthlyBudget) * 100;

  const handleBudgetChange = () => {
    const newBudget = prompt('Enter new monthly budget:', monthlyBudget);
    if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
      onBudgetChange(parseFloat(newBudget));
    }
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDeleteTransaction(transactionToDelete.id);
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    }
    if (sortBy === 'amount') {
      return sortOrder === 'desc'
        ? b.amount - a.amount
        : a.amount - b.amount;
    }
    return 0;
  });

  const filteredTransactions = filterCategory === 'all'
    ? sortedTransactions
    : sortedTransactions.filter(t => t.category === filterCategory);

  return (
    <div className="space-y-6 px-4">
      {/* Animated Header */}
      <div className="flex items-center justify-between mb-12 mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-16"
        >
          <TrendingUp size={64} className="text-primary" />
        </motion.div>

        <div className="text-center flex-1">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent"
          >
            Efficient Budget Tracker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-muted-foreground"
          >
            Track, analyze, and optimize your spending habits
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-16 flex justify-end"
        >
          <PiggyBank size={64} className="text-primary" />
        </motion.div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleBudgetChange}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Edit2 size={20} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-card border border-border"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Budget</h3>
          </div>
          <p className="text-2xl font-bold">${monthlyBudget.toLocaleString()}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Click Edit to change budget
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-card border border-border"
        >
          <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
          <p className="text-2xl font-bold text-destructive">
            ${totalSpent.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {spentPercentage.toFixed(1)}% of monthly budget
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-lg bg-card border border-border"
        >
          <h3 className="text-sm font-medium text-muted-foreground">Remaining</h3>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
            ${remaining.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {((remaining / monthlyBudget) * 100).toFixed(1)}% remaining
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            <option value="all">All Categories</option>
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Transaction
        </motion.button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="p-4 bg-card border-b border-border">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 text-center text-muted-foreground"
              >
                No transactions yet. Add your first transaction to get started!
              </motion.div>
            ) : (
              filteredTransactions.map(transaction => (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.description}</span>
                    <span className="text-sm text-muted-foreground">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium ${
                      transaction.type === 'expense' ? 'text-destructive' : 'text-green-600'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteClick(transaction)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              className="bg-card p-6 rounded-lg shadow-lg border border-border w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Delete Transaction</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTransaction
            onAddTransaction={(transaction) => {
              onAddTransaction(transaction);
              setShowAddModal(false);
            }}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetOverview;