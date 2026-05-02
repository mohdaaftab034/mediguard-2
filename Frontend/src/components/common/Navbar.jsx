import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, AlertCircle, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext.jsx';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeAlerts } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const publicNavLinks = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard' },
    { path: ROUTES.BATCH_VERIFY, label: 'Database' },
  ];

  const roleNavLinks = publicNavLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'chemist') return '/dashboard/chemist';
    return '/dashboard/user';
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-bg-secondary border-b border-border-color transition-smooth shadow-sm">
        <div className="w-full px-2 py-1">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center group">
              <div className="flex items-center">
                <img src={theme.name === 'dark' ? '/logo.png' : '/logo-light.png'} alt="MediGuard Logo" className="h-14 object-contain" />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {roleNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-bold transition-colors relative group py-2 ${
                    isActive(link.path) ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                  </span>
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-bg-primary text-text-secondary hover:text-primary transition-all shadow-sm border border-border-color"
                title={theme.name === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme.name === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-smooth"
              >
                {theme.name === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-smooth"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isOpen && (
            <div className="lg:hidden fixed inset-0 z-[60]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                className="absolute top-0 right-0 h-full w-[86%] max-w-sm bg-bg-secondary border-l border-border-color p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-lg font-bold text-text-primary">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-bg-primary transition-smooth"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-2 overflow-y-auto">
                  {roleNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.path)
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'text-text-secondary hover:bg-bg-primary font-bold text-lg'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-text-primary bg-danger rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-border-color space-y-2">
                  {/* Removed authentication buttons for minimalist Agent UI */}
                </div>
              </motion.aside>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
