/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Calendar, 
  Wrench, 
  FileText, 
  ShieldAlert,
  BarChart3,
  Home,
  Building,
  Settings,
  User,
  Sparkles
} from 'lucide-react';
import { DirectorProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  approvalsCount: number;
  profile: DirectorProfile;
}

export default function Sidebar({ activeTab, setActiveTab, approvalsCount, profile }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { 
      id: 'approvals', 
      label: 'Approvals', 
      icon: CheckSquare, 
      badge: approvalsCount > 0 ? approvalsCount : undefined 
    },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'site', label: 'Site', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'risks', label: 'Risks', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'societies', label: 'Societies CRM', icon: Home },
    { id: 'secretary', label: 'AI Secretary', icon: Sparkles },
    { id: 'developers', label: 'Developers', icon: Building },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside id="sidebar" className="w-64 h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 z-50">
      {/* Branding Header */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/95 p-1.5 flex items-center justify-center shadow-lg shadow-slate-950/20">
            <img
              src="/assets/Toughcons%20Nirman%20-%20Logo.png"
              alt="Toughcons Nirman"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-white font-semibold text-base tracking-tight block">Toughcons</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Core OS</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu with rounded-xl buttons */}
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left font-sans text-xs ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium shadow-sm shadow-blue-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Health Widget from the theme */}
      <div className="p-6 mt-auto border-t border-slate-800/60">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1.5">Portfolio Health</p>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[78%]"></div>
          </div>
          <p className="text-[10px] text-slate-300 mt-1.5 font-medium">78% on Schedule</p>
        </div>
      </div>

      {/* Footer Profile Section */}
      <div className="p-4 border-t border-slate-800">
        <div 
          id="profile-trigger"
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 p-2 rounded-xl transition-all group"
        >
          {profile.avatarUrl ? (
            <img 
              className="w-8 h-8 rounded-lg object-cover border border-slate-700 group-hover:border-blue-400 transition-all"
              src={profile.avatarUrl} 
              alt={profile.name}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-sans text-xs font-bold text-white leading-tight truncate group-hover:text-blue-300 transition-all">{profile.name}</span>
            <span className="font-sans text-[10px] text-slate-400 leading-none truncate mt-0.5">{profile.role}</span>
          </div>
          <Settings className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-white transition-all" />
        </div>
      </div>
    </aside>
  );
}
