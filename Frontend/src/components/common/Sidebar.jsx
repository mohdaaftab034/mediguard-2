import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Database, MapPin, Bell, MessageSquare, LogOut } from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext.jsx';

const Sidebar = () => {
  const links = [
    { path: ROUTES.HOME, icon: MessageSquare, label: 'Agent Chat' },
    { path: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
    { path: ROUTES.BATCH_VERIFY, icon: Database, label: 'Database' },
    { path: ROUTES.NEARBY_CHEMIST, icon: MapPin, label: 'Find Chemist' },
    { path: ROUTES.ALERTS, icon: Bell, label: 'Alerts' },
  ];

  const location = useLocation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme.name === 'dark';

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`w-64 border-r flex flex-col h-[calc(100vh-64px)] sticky top-[64px] transition-smooth ${
      isDark 
        ? 'bg-bg-secondary/40 backdrop-blur-xl border-white/5 shadow-2xl' 
        : 'bg-gradient-to-b from-cyan-600 to-emerald-600 border-white/10 shadow-lg'
    }`}>
      <div className="p-4 flex-1 space-y-2 overflow-y-auto mt-4">
        <div className={`text-xs font-bold uppercase tracking-wider mb-4 px-3 ${isDark ? 'text-text-secondary' : 'text-white/50'}`}>
          Features
        </div>
        
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive(link.path)
                  ? isDark 
                    ? 'bg-primary/20 text-primary font-bold border border-primary/20 shadow-lg' 
                    : 'bg-white/20 text-white font-bold shadow-lg'
                  : isDark
                    ? 'text-text-secondary hover:bg-bg-primary/50 hover:text-text-primary'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive(link.path) ? (isDark ? 'text-primary' : 'text-white') : (isDark ? 'text-text-secondary' : 'text-white/50')} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className={`p-4 border-t ${isDark ? 'border-border-color' : 'border-white/10'}`}>
        <button className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all ${
          isDark 
            ? 'text-text-secondary hover:bg-danger/10 hover:text-danger' 
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}>
          <LogOut size={18} />
          Exit Agent
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
