/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Bell, HelpCircle, ShieldAlert } from 'lucide-react';
import { Project, UserRole } from '../types';

interface HeaderProps {
  activeProject: Project | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
  onOpenNotifications: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Header({
  activeProject,
  searchQuery,
  setSearchQuery,
  notificationsCount,
  onOpenNotifications,
  currentRole,
  onRoleChange,
}: HeaderProps) {
  return (
    <header className="w-full h-20 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center px-8">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-grow max-w-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search"
            type="text"
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 font-sans text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none text-slate-800 placeholder:text-slate-400 transition-all duration-150"
            placeholder="Search Projects, Snags, or Tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Interactive RBAC Switcher */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Role:</span>
          <select
            id="role-switcher"
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent border-none text-[10px] font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            <option value="Director">Director</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Site Engineer">Site Engineer</option>
            <option value="Accountant">Accountant</option>
            <option value="Society Member">Society Member</option>
            <option value="Developer">Developer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Help Button */}
        <button 
          id="btn-help"
          className="text-slate-500 hover:bg-slate-100 p-2 rounded-xl transition-all active:scale-95 cursor-pointer"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative text-slate-500 hover:bg-slate-100 p-2 rounded-xl transition-all active:scale-95 cursor-pointer"
          title="Notifications Center"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-200"></div>

        {/* System Active Badge from Sleek Theme */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Systems Active</span>
        </div>

        {/* Project Context */}
        {activeProject ? (
          <div className="text-right hidden sm:block border-l border-slate-100 pl-4">
            <p className="text-xs font-bold text-slate-900 leading-none">{activeProject.name}</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
              Context: {activeProject.id}
            </p>
          </div>
        ) : (
          <div className="text-right hidden sm:block border-l border-slate-100 pl-4">
            <p className="text-xs font-bold text-slate-900 leading-none">Toughcons Hub</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
              No Active Selection
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
