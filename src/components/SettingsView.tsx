/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Settings, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';
import { DirectorProfile } from '../types';
import { motion } from 'motion/react';

interface SettingsViewProps {
  profile: DirectorProfile;
  onUpdateProfile: (newProfile: DirectorProfile) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function SettingsView({ profile, onUpdateProfile, showToast }: SettingsViewProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [department, setDepartment] = useState(profile.department);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  
  // System states
  const [sessionTime, setSessionTime] = useState('12 Hours');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [riskAlertEmail, setRiskAlertEmail] = useState(true);
  const [autoMOM, setAutoMOM] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      role,
      department,
      avatarUrl,
      sessionTime
    });

    setSavedSuccess(true);
    if (showToast) {
      showToast('Profile and settings updated successfully!', 'success');
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="approvals-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
        >
    <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-slate-500 text-xs mt-1">Configure Director Profile credentials and Toughcons system parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card Form (8 cols) */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-8 bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Director Profile Card</h3>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Director Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Role Title</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Authority Department</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avatar Image URL</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste direct HTTPS image link"
                />
              </div>
            </div>

            {/* Profile Avatar Quick Previews */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avatar Quick Presets</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAvatarUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuBf1Q9m3fxQRGuyKuiCHEk-c8OFPvq0Cf3PZzdQ83ElGCIYsh_vk98PPznAnDuj6dCiD4Qgj4zYTlKiOCCu3pG7umAqxdh2wcaxeCZEN-3GYTuuC27FUt-yHBzV1efkmBvVcxbskHdQ79VC0vqYFpkyPb_trwJQqbZ-FGpK4toamlR9b7-quCdgsvWKeaZ4N4q1YucGALRDSjd_mUwAgRl5kHNtdSHu4njFSk56rbvmjFCb3p1J-quoBg")}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:border-blue-600 overflow-hidden cursor-pointer"
                >
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf1Q9m3fxQRGuyKuiCHEk-c8OFPvq0Cf3PZzdQ83ElGCIYsh_vk98PPznAnDuj6dCiD4Qgj4zYTlKiOCCu3pG7umAqxdh2wcaxeCZEN-3GYTuuC27FUt-yHBzV1efkmBvVcxbskHdQ79VC0vqYFpkyPb_trwJQqbZ-FGpK4toamlR9b7-quCdgsvWKeaZ4N4q1YucGALRDSjd_mUwAgRl5kHNtdSHu4njFSk56rbvmjFCb3p1J-quoBg" alt="Arthur" className="w-full h-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuCt9xGNRC9kXG8NYwqcXCaaOf32QAvL2PI0MF5a30z_xG6Ojh1S8hOwheZzepiqo132aquSd5NQTIAk85W9d6W7IepsvQG20vWXC-mdPX4VrY6H20Im-TvDHo0tpc1RHYmEgDy3zv73kaQ3ItV0Kl0i63pUiIexmbk6RYrKk83cJsTNyJh6jmM396NnbHgIR-Nfzolyk39O9-eYdRi3pqchx62H5sOJE3IM1OTksDiZP8YKmv4oLw-16g")}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:border-blue-600 overflow-hidden cursor-pointer"
                >
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt9xGNRC9kXG8NYwqcXCaaOf32QAvL2PI0MF5a30z_xG6Ojh1S8hOwheZzepiqo132aquSd5NQTIAk85W9d6W7IepsvQG20vWXC-mdPX4VrY6H20Im-TvDHo0tpc1RHYmEgDy3zv73kaQ3ItV0Kl0i63pUiIexmbk6RYrKk83cJsTNyJh6jmM396NnbHgIR-Nfzolyk39O9-eYdRi3pqchx62H5sOJE3IM1OTksDiZP8YKmv4oLw-16g" alt="Sarah" className="w-full h-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuC79kO8vRizgQ1r4W8Nf_f_gP9K5Y8YhO7wN-56b-y_c9YfS3WjFSk6bZ-vR1X9yH_V0b_V2y_r7g9X_r-vR_k8J_gP7yW9X-f_c-6y_g-vR_y-vR")}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:border-blue-600 overflow-hidden cursor-pointer bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700"
                >
                  R
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            {savedSuccess ? (
              <span className="text-emerald-700 font-sans text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated securely!
              </span>
            ) : (
              <span></span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white font-sans text-xs font-semibold px-5 py-2.5 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>

        {/* System parameters settings (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Preferences</h3>
          </div>

          <div className="p-6 space-y-6 flex-grow">
            {/* Session Timeout */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Session Timeout</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
              >
                <option value="4 Hours">4 Hours</option>
                <option value="8 Hours">8 Hours</option>
                <option value="12 Hours">12 Hours</option>
                <option value="24 Hours">24 Hours</option>
              </select>
            </div>

            {/* General Toggles */}
            <div className="space-y-4 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-800">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">In-app Notifications</p>
                  <p className="text-[10px] text-slate-400 font-medium">Enable badge alerts and push flashes</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer w-4 h-4"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Critical Email Alerts</p>
                  <p className="text-[10px] text-slate-400 font-medium">Dispatch supply &amp; permit risk emails</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer w-4 h-4"
                  checked={riskAlertEmail}
                  onChange={(e) => setRiskAlertEmail(e.target.checked)}
                />
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Auto-Commit MOM Entries</p>
                  <p className="text-[10px] text-slate-400 font-medium">Convert discussions automatically</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer w-4 h-4"
                  checked={autoMOM}
                  onChange={(e) => setAutoMOM(e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center font-extrabold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-slate-500" /> System Security Rules Active
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
}
