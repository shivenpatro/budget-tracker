import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './components/layouts/Dashboard'
import BudgetOverview from './components/budget/BudgetOverview'
import Analytics from './components/budget/Analytics'
import Goals from './components/budget/Goals'
import Login from './components/auth/Login'
import { exportToPdf, exportToCSV } from './utils/exportToPdf'
import { ThemeProvider, useTheme } from './context/ThemeContext'

const AppContent = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions')
    return saved ? JSON.parse(saved) : []
  });
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget')
    return saved ? parseFloat(saved) : 5000
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('monthlyBudget', monthlyBudget.toString())
  }, [monthlyBudget]);

  const handleAddTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev])
  };

  const handleDeleteTransaction = (transactionId) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  };

  const handleExport = (format) => {
    if (format === 'pdf') {
      exportToPdf(transactions, monthlyBudget)
    } else {
      exportToCSV(transactions)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/overview" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/overview" replace />
              ) : (
                <Login onLoginSuccess={() => setIsAuthenticated(true)} />
              )
            } 
          />
          <Route
            path="/overview"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : (
                <Dashboard 
                  theme={darkMode ? 'dark' : 'light'} 
                  toggleTheme={toggleDarkMode}
                  onExport={handleExport}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BudgetOverview 
                      transactions={transactions}
                      monthlyBudget={monthlyBudget}
                      onBudgetChange={setMonthlyBudget}
                      onAddTransaction={handleAddTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                    />
                  </motion.div>
                </Dashboard>
              )
            }
          />
          <Route
            path="/analytics"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : (
                <Dashboard 
                  theme={darkMode ? 'dark' : 'light'} 
                  toggleTheme={toggleDarkMode}
                  onExport={handleExport}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Analytics transactions={transactions} />
                  </motion.div>
                </Dashboard>
              )
            }
          />
          <Route
            path="/goals"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : (
                <Dashboard 
                  theme={darkMode ? 'dark' : 'light'} 
                  toggleTheme={toggleDarkMode}
                  onExport={handleExport}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Goals transactions={transactions} />
                  </motion.div>
                </Dashboard>
              )
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;