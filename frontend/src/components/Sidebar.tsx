import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  CalendarCheck,
  BrainCircuit,
  Lightbulb,
  FileText,
  User as UserIcon,
  Users,
  PenTool,
  AlertTriangle,
  Building,
  UploadCloud,
  Settings,
  LogOut,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentTab, onSelectTab, onLogout }) => {
  const getNavItems = () => {
    switch (role) {
      case 'Student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'performance', label: 'My Performance', icon: TrendingUp },
          { id: 'subjects', label: 'Subjects', icon: BookOpen },
          { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
          { id: 'prediction', label: 'Prediction', icon: BrainCircuit, badge: 'AI Prototype' },
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'profile', label: 'Profile', icon: UserIcon }
        ];

      case 'Faculty':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'marks_entry', label: 'Marks Entry', icon: PenTool },
          { id: 'attendance_entry', label: 'Attendance', icon: CalendarCheck },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'at_risk', label: 'At-Risk Students', icon: AlertTriangle, badge: 'Alerts' },
          { id: 'reports', label: 'Reports', icon: FileText }
        ];

      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'faculty', label: 'Faculty', icon: Users },
          { id: 'departments', label: 'Departments', icon: Building },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'data_import', label: 'Data Import', icon: UploadCloud },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 transition-all select-none">
      <div className="p-4 space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            {role} Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-blue-400 border border-blue-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom section with logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
