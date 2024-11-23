import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  PieChart,
  Download,
  Moon,
  Sun,
  Target
} from 'lucide-react';

const Dashboard = ({ children, theme, toggleTheme, onExport }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      if (isLarge) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: Home, label: 'Overview', path: '/' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
    { icon: Target, label: 'Goals', path: '/goals' },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const handleExport = () => {
    onExport?.('pdf');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground">Budget Tracker</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 5 }}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center w-full px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
                    location.pathname === item.path ? 'bg-accent text-foreground' : ''
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && !isLargeScreen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-foreground">Budget Tracker</h1>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
                      location.pathname === item.path ? 'bg-accent text-foreground' : ''
                    }`}
                  >
                    <item.icon size={20} className="mr-3" />
                    {item.label}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="block lg:hidden text-foreground hover:text-foreground/80 transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download size={20} />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleTheme}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;