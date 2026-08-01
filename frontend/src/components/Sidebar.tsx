import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    LayoutDashboard, 
  ClipboardCheck, 
  Music, 
  CalendarDays, 
  MessageSquare, 
  Users, 
  LogOut, 
  Activity,
  HeartPulse,
  Waves,
  BookOpen,
  ClipboardList
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assessment', label: 'Assessment Wizard', icon: ClipboardCheck },
    { to: '/assessment-studio', label: 'AI Assessment Studio', icon: ClipboardList },
    { to: '/therapy', label: 'Sound Therapy', icon: Music },
    { to: '/masker', label: 'Ambient Masker', icon: Waves },
    { to: '/logs', label: 'Daily Tracking', icon: CalendarDays },
    { to: '/chat', label: 'AI Counseling Chat', icon: MessageSquare },
    { to: '/knowledge', label: 'Knowledge Hub', icon: BookOpen },
  ];

  const doctorLinks = [
    { to: '/doctor-dashboard', label: 'Patient Caseload', icon: Users },
  ];

  const activeLink = (path: string) => {
    return location.pathname === path
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold'
      : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100';
  };

  const links = user.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 border-r border-slate-100 bg-white/70 dark:bg-slate-950/70 dark:border-slate-900 backdrop-blur-md hidden md:flex flex-col h-screen sticky top-0">
      {/* Branding */}
      <div className="p-6 border-b border-slate-150/40 dark:border-slate-900 flex items-center gap-2">
        <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-150 dark:shadow-none">
          <HeartPulse className="w-5 h-5" />
        </span>
        <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
          TinniCare <span className="text-indigo-600 font-medium">AI</span>
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150 ${activeLink(
                link.to
              )}`}
            >
              <Icon className="w-4.5 h-4.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Information Profile & Signout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 uppercase">
            {user.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user.fullName}
            </h4>
            <p className="text-[10px] text-slate-400 capitalize font-medium tracking-wide">
              {user.role} Account
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
