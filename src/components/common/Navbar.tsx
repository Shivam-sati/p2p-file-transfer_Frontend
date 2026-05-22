import { motion } from 'motion/react';
import { Share2, LayoutDashboard, Send, Box } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Transfer', icon: Send },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass rounded-2xl px-2 py-2 flex items-center gap-1 shadow-lg shadow-indigo-500/10">
        <div className="flex items-center gap-2 px-4 mr-4 border-r border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Box size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NEXUS P2P
          </span>
        </div>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2',
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
