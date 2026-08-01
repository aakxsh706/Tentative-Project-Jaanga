import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, HeartPulse, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/assessment', label: 'Assessment' },
    { to: '/therapy', label: 'Sound Therapy' },
    { to: '/logs', label: 'Daily Tracking' },
    { to: '/chat', label: 'AI Counseling' },
  ];

  const doctorLinks = [
    { to: '/doctor-dashboard', label: 'Patient Caseload' },
  ];

  const links = user.role === 'doctor' ? doctorLinks : patientLinks;

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 border-b border-slate-100 dark:border-slate-900 backdrop-blur-md px-6 py-4 flex items-center justify-between md:hidden">
      {/* Brand logo on mobile */}
      <div className="flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
          <HeartPulse className="w-4 h-4" />
        </span>
        <span className="font-extrabold text-md text-slate-800 dark:text-slate-100 tracking-tight">
          TinniCare
        </span>
      </div>

      {/* Hamburger icon */}
      <button 
        onClick={toggleMobile} 
        className="p-1 text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 rounded-lg focus:outline-none"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-150/80 dark:border-slate-900 shadow-lg px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-150">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === link.to
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-slate-100 dark:border-slate-900" />
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">
              Logged as: {user.fullName}
            </span>
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="flex items-center gap-1.5 text-sm font-bold text-rose-650"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
