import React from 'react';
import { User } from '../types';
import { GraduationCap, LogOut, Bell, Shield, BookOpen, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeRole: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, activeRole }) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <Shield className="w-3.5 h-3.5 mr-1 text-purple-600" />
        };
      case 'Faculty':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-600" />
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
        };
    }
  };

  const badge = getRoleBadge(activeRole);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
            EduAnalytics
          </h1>
          <p className="text-xs text-slate-500 font-medium hidden sm:block mt-0.5">
            Student Academic Performance Analyzer
          </p>
        </div>
      </div>

      {/* User Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Academic term indicator */}
        <div className="hidden md:flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          Academic Year 2026-27 • Semester 4
        </div>

        {/* Role Badge */}
        <div className={`flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.bg}`}>
          {badge.icon}
          <span>{activeRole}</span>
        </div>

        {/* User Info & Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
            {user?.profile?.avatar ? (
              <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.email?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.profile?.name || user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-slate-500">{user?.email}</p>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
