import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = ({ transactions }) => {
  const insights = useMemo(() => {
    // Group transactions by month
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { expenses: 0, income: 0 };
      }
      if (t.type === 'expense') {
        acc[month].expenses += t.amount;
      } else {
        acc[month].income += t.amount;
      }
      return acc;
    }, {});

    // Calculate category spending
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    // Calculate month-over-month change
    const months = Object.keys(monthlyData);
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];
    const monthlyChange = previousMonth
      ? ((monthlyData[currentMonth].expenses - monthlyData[previousMonth].expenses) / monthlyData[previousMonth].expenses) * 100
      : 0;

    // Calculate average spending per category
    const categoryAverages = {};
    Object.entries(categorySpending).forEach(([category, total]) => {
      const categoryTransactions = transactions.filter(
        t => t.type === 'expense' && t.category === category
      );
      categoryAverages[category] = total / categoryTransactions.length;
    });

    // Find unusual transactions (50% above category average)
    const unusualTransactions = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      return t.amount > categoryAverages[t.category] * 1.5;
    });

    return {
      monthlyData,
      categorySpending,
      monthlyChange,
      unusualTransactions,
      totalSpent: Object.values(monthlyData).reduce((sum, { expenses }) => sum + expenses, 0),
      totalIncome: Object.values(monthlyData).reduce((sum, { income }) => sum + income, 0)
    };
  }, [transactions]);

  const lineChartData = {
    labels: Object.keys(insights.monthlyData),
    datasets: [
      {
        label: 'Expenses',
        data: Object.values(insights.monthlyData).map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Income',
        data: Object.values(insights.monthlyData).map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const barChartData = {
    labels: Object.keys(insights.categorySpending),
    datasets: [
      {
        label: 'Spending by Category',
        data: Object.values(insights.categorySpending),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 108, 219, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(121, 134, 203, 0.8)',
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Spending Analytics</h2>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            {insights.monthlyChange > 0 ? (
              <TrendingUp className="text-destructive" size={24} />
            ) : (
              <TrendingDown className="text-green-500" size={24} />
            )}
            <h3 className="font-semibold">Monthly Change</h3>
          </div>
          <p className={`text-2xl font-bold ${
            insights.monthlyChange > 0 ? 'text-destructive' : 'text-green-500'
          }`}>
            {insights.monthlyChange.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            compared to last month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary" size={24} />
            <h3 className="font-semibold">Total Spending</h3>
          </div>
          <p className="text-2xl font-bold">
            ${insights.totalSpent.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            across all categories
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-yellow-500" size={24} />
            <h3 className="font-semibold">Unusual Spending</h3>
          </div>
          <p className="text-2xl font-bold">
            {insights.unusualTransactions.length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            transactions above average
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="font-semibold mb-4">Monthly Spending Trend</h3>
          <div className="h-[300px]">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="font-semibold mb-4">Category Breakdown</h3>
          <div className="h-[300px]">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Unusual Transactions */}
      {insights.unusualTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-lg bg-card border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <h3 className="font-semibold mb-4">Unusual Transactions</h3>
          <div className="space-y-3">
            {insights.unusualTransactions.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-md bg-accent/50"
              >
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.category} • {new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-medium text-destructive">
                  ${t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;