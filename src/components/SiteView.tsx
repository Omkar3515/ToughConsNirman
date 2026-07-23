/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Wrench, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Play,
  Filter,
  Calendar,
  Layers,
  CheckCircle
} from 'lucide-react';
import { Snag, ProgressFeedItem, Project } from '../types';
import { motion } from 'motion/react';

interface SiteViewProps {
  activeProject: Project | null;
  snags: Snag[];
  progressFeed: ProgressFeedItem[];
  onAddSnag: (snag: Omit<Snag, 'id'>) => void;
  onToggleSnagStatus: (id: string) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function SiteView({
  activeProject,
  snags,
  progressFeed,
  onAddSnag,
  onToggleSnagStatus,
  showToast,
}: SiteViewProps) {
  const [snagFilter, setSnagFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [contractorFilter, setContractorFilter] = useState<string>('All Contractors');
  const [snagSearch, setSnagSearch] = useState<string>('');
  
  // Modals state
  const [showSnagModal, setShowSnagModal] = useState(false);
  const [activeMedia, setActiveMedia] = useState<ProgressFeedItem | null>(null);
  const [activeSnagImage, setActiveSnagImage] = useState<Snag | null>(null);

  // New snag form state
  const [newIssue, setNewIssue] = useState('');
  const [newUnit, setNewUnit] = useState('Flat 402, Bldg C');
  const [newContractor, setNewContractor] = useState('Structural Steel Corp');
  const [newDueDate, setNewDueDate] = useState('2023-11-15');

  // Sub-tab navigation and photo log filtering states
  const [activeSubTab, setActiveSubTab] = useState<'kpi_snags' | 'photo_logs'>('kpi_snags');
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoContractorFilter, setPhotoContractorFilter] = useState('All Contractors');
  const [photoIssueTypeFilter, setPhotoIssueTypeFilter] = useState('All Types');
  const [photoStatusFilter, setPhotoStatusFilter] = useState('All Statuses');

  // Photo logs modal form state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDate, setPhotoDate] = useState('2023-10-11');
  const [photoLoc, setPhotoLoc] = useState('');
  const [photoContractor, setPhotoContractor] = useState('Structural Steel Corp');
  const [photoIssueType, setPhotoIssueType] = useState('Structural Integrity');
  const [photoStatus, setPhotoStatus] = useState('Verified Pass');

  // Load and persist comprehensive site photo logs
  const [photoLogs, setPhotoLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('toughcons_local_photo_logs_v2');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw',
        title: 'Slab reinforcement steel bar inspection',
        date: '2023-10-11',
        location: 'Slab B-12, Wing 2',
        contractor: 'Structural Steel Corp',
        issueType: 'Structural Integrity',
        status: 'Verified Pass'
      },
      {
        id: '2',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w',
        title: 'Plaster leakage detection on south facade',
        date: '2023-10-10',
        location: 'Flat 302 Bathroom Wall',
        contractor: 'Standard Concrete Inc',
        issueType: 'Waterproofing',
        status: 'Needs Remediation'
      },
      {
        id: '3',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw',
        title: 'Underground conduit duct path compliance',
        date: '2023-10-09',
        location: 'Basement Parking Slot 14',
        contractor: 'M&E Contractors',
        issueType: 'Electrical Safety',
        status: 'Pending Review'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('toughcons_local_photo_logs_v2', JSON.stringify(photoLogs));
  }, [photoLogs]);

  // Calculated KPI stats
  const laborCount = activeProject?.staffCount || 185;
  const openSnagsCount = snags.filter(s => s.status === 'OPEN').length;
  
  // List unique contractors
  const contractors = ['All Contractors', ...Array.from(new Set(snags.map(s => s.contractor)))];

  // Filtering snags
  const filteredSnags = snags.filter(snag => {
    const matchStatus = snagFilter === 'ALL' || snag.status === snagFilter;
    const matchContractor = contractorFilter === 'All Contractors' || snag.contractor === contractorFilter;
    const matchSearch = snagSearch.trim() === '' || 
      snag.issueDescription.toLowerCase().includes(snagSearch.toLowerCase()) ||
      snag.unit.toLowerCase().includes(snagSearch.toLowerCase());
    return matchStatus && matchContractor && matchSearch;
  });

  const handleCreateSnag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssue) return;

    // Default snag preset images to keep it high visual
    const fallbackImages = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w"
    ];
    const snagImg = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    onAddSnag({
      issueDescription: newIssue,
      unit: newUnit,
      contractor: newContractor,
      dueDate: newDueDate,
      status: 'OPEN',
      imageUrl: snagImg,
      photoAlt: `Snag issue at ${newUnit}`
    });

    setNewIssue('');
    setShowSnagModal(false);
  };

  const handleCreatePhotoLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle || !photoLoc) return;

    const fallbackImages = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w"
    ];
    const pickedImg = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    const newLog = {
      id: String(photoLogs.length + 1),
      title: photoTitle,
      date: photoDate,
      location: photoLoc,
      contractor: photoContractor,
      issueType: photoIssueType,
      status: photoStatus,
      imageUrl: pickedImg
    };

    setPhotoLogs(prev => [newLog, ...prev]);
    setPhotoTitle('');
    setPhotoLoc('');
    setShowPhotoModal(false);
    if (showToast) {
      showToast('Site Photo Log entry registered successfully.', 'success');
    }
  };

  // Filter photo logs
  const filteredPhotoLogs = photoLogs.filter(log => {
    const matchSearch = photoSearch.trim() === '' || 
      log.title.toLowerCase().includes(photoSearch.toLowerCase()) ||
      log.location.toLowerCase().includes(photoSearch.toLowerCase());
    const matchContractor = photoContractorFilter === 'All Contractors' || log.contractor === photoContractorFilter;
    const matchType = photoIssueTypeFilter === 'All Types' || log.issueType === photoIssueTypeFilter;
    const matchStatus = photoStatusFilter === 'All Statuses' || log.status === photoStatusFilter;
    return matchSearch && matchContractor && matchType && matchStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="site-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
    >
      {/* Page Header */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/70 shadow-sm">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Field operations</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Site Progress &amp; Snags</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-2">Live field reporting, quality observations, and issue resolution for {activeProject?.name || 'the active project'}.</p>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Daily Labor Count */}
        <div className="site-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)] rounded-2xl transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 tracking-wider uppercase">DAILY LABOR COUNT</span>
            <span className="block font-sans text-3xl font-extrabold text-slate-900 mt-2">{laborCount}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-3.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Shift Attendance
          </span>
        </div>

        {/* Stat 2: Material Status */}
        <div className="site-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)] rounded-2xl transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 tracking-wider uppercase">MATERIAL STATUS</span>
            <span className="block font-sans text-3xl font-extrabold text-slate-900 mt-2">Optimal</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-3.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Supply chains normal
          </span>
        </div>

        {/* Stat 3: Open Snags */}
        <div className="site-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)] rounded-2xl border-l-4 border-l-amber-500 transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 tracking-wider uppercase">OPEN SNAGS</span>
            <span className="block font-sans text-3xl font-extrabold text-amber-600 mt-2">{openSnagsCount}</span>
          </div>
          <span className="text-[11px] font-semibold text-red-600 mt-3.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Action required
          </span>
        </div>

        {/* Stat 4: Schedule Variance */}
        <div className="site-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)] rounded-2xl transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 tracking-wider uppercase">SCHEDULE VARIANCE</span>
            <span className="block font-sans text-3xl font-extrabold text-emerald-600 mt-2">+3 Days</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-3.5">Ahead of critical path</span>
        </div>
      </div>

      {/* Tab Segment Controller */}
      <div className="flex w-full sm:w-auto border border-slate-200 bg-slate-100 p-1 rounded-xl shadow-sm gap-1 max-w-md">
        <button
          onClick={() => setActiveSubTab('kpi_snags')}
          className={`flex-1 py-2 px-4 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer text-center ${
            activeSubTab === 'kpi_snags'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Progress &amp; Snags
        </button>
        <button
          onClick={() => setActiveSubTab('photo_logs')}
          className={`flex-1 py-2 px-4 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'photo_logs'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Camera className="w-4 h-4" /> Photo Logs ({photoLogs.length})
        </button>
      </div>

      {activeSubTab === 'kpi_snags' ? (
        /* Main double column split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Left Column: Progress Feed (5 cols) */}
          <div className="site-panel lg:col-span-5 bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-800">Progress Feed</h3>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[500px] overflow-y-auto">
              {progressFeed.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveMedia(item)}
                  className="bg-slate-50 border border-slate-200/60 group overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-all relative flex flex-col"
                >
                  <div className="h-28 relative bg-slate-950 flex items-center justify-center">
                    <img 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-500" 
                      src={item.imageUrl} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                    />
                    {item.type === 'Time-lapse' && (
                      <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white px-2 py-0.5 text-[8px] font-bold rounded">
                        TIME-LAPSE
                      </span>
                    )}
                    {item.type === 'Video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h4>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                      <span className="font-medium truncate max-w-[100px]">{item.location}</span>
                      <span className="font-semibold">{item.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Snag List (7 cols) */}
          <div className="site-panel lg:col-span-7 bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-800">Snag List</h3>
              </div>
              
              <button
                onClick={() => setShowSnagModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/15"
              >
                <Plus className="w-4 h-4 text-white" /> LOG SNAG
              </button>
            </div>

            {/* Snag filters controls */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto] gap-3 items-center">
              {/* Search Snags */}
              <div className="relative flex-grow min-w-[160px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search snags..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-9 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={snagSearch}
                  onChange={(e) => setSnagSearch(e.target.value)}
                />
              </div>

              {/* Contractor selector */}
              <select
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[150px]"
                value={contractorFilter}
                onChange={(e) => setContractorFilter(e.target.value)}
              >
                {contractors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status pills toggle */}
              <div className="flex border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
                {(['ALL', 'OPEN', 'CLOSED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setSnagFilter(st)}
                    className={`px-3.5 py-1.5 font-sans text-xs font-bold cursor-pointer transition-colors ${
                      snagFilter === st ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Snags Table list */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Snag Details</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Contractor</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-center">Due Date</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-right">Photo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSnags.length > 0 ? (
                    filteredSnags.map((snag) => (
                      <tr key={snag.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{snag.issueDescription}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{snag.unit}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {snag.contractor}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 font-bold">
                          {snag.dueDate}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => onToggleSnagStatus(snag.id)}
                            className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border cursor-pointer uppercase ${
                              snag.status === 'OPEN' 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}
                          >
                            {snag.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div 
                            onClick={() => setActiveSnagImage(snag)}
                            className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden inline-flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                          >
                            <img className="w-full h-full object-cover" src={snag.imageUrl} alt={snag.photoAlt} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                        No matching snags logged in system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer of Table */}
            <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-semibold rounded-b-2xl">
              <span>Showing {filteredSnags.length} Snags</span>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer text-slate-400 hover:text-slate-700 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer text-slate-400 hover:text-slate-700 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Photo Logs Hub */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Comprehensive Site Photo Logs Archive</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Annotated with Date, Location, Contractor, Issue Type &amp; Status</p>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/10"
            >
              <Plus className="w-4 h-4" /> LOG SITE PHOTO
            </button>
          </div>

          {/* Filters Panel */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description or location..."
                className="w-full bg-white border border-slate-200 rounded-xl px-9 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={photoSearch}
                onChange={(e) => setPhotoSearch(e.target.value)}
              />
            </div>

            {/* Contractor Filter */}
            <select
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={photoContractorFilter}
              onChange={(e) => setPhotoContractorFilter(e.target.value)}
            >
              <option value="All Contractors">All Contractors</option>
              <option value="Structural Steel Corp">Structural Steel Corp</option>
              <option value="Standard Concrete Inc">Standard Concrete Inc</option>
              <option value="M&amp;E Contractors">M&amp;E Contractors</option>
              <option value="Glaze Masters">Glaze Masters</option>
            </select>

            {/* Issue Type Filter */}
            <select
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={photoIssueTypeFilter}
              onChange={(e) => setPhotoIssueTypeFilter(e.target.value)}
            >
              <option value="All Types">All Issue Types</option>
              <option value="Structural Integrity">Structural Integrity</option>
              <option value="Waterproofing">Waterproofing</option>
              <option value="Electrical Safety">Electrical Safety</option>
              <option value="General Construction">General Construction</option>
            </select>

            {/* Status Filter */}
            <select
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={photoStatusFilter}
              onChange={(e) => setPhotoStatusFilter(e.target.value)}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Verified Pass">Verified Pass</option>
              <option value="Needs Remediation">Needs Remediation</option>
              <option value="Pending Review">Pending Review</option>
            </select>
          </div>

          {/* Photo Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotoLogs.length > 0 ? (
              filteredPhotoLogs.map(log => (
                <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img className="w-full h-full object-cover" src={log.imageUrl} alt={log.title} />
                    <span className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-1 rounded">
                      {log.issueType}
                    </span>
                    <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded shadow-sm ${
                      log.status === 'Verified Pass' ? 'bg-emerald-600 text-white' :
                      log.status === 'Needs Remediation' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{log.title}</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-slate-500 mt-3 border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">DATE</span>
                          <span className="font-semibold text-slate-700">{log.date}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">LOCATION</span>
                          <span className="font-semibold text-slate-700 truncate block">{log.location}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">CONTRACTOR</span>
                          <span className="font-semibold text-slate-700 truncate block">{log.contractor}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSnagImage({
                        id: log.id,
                        issueDescription: log.title,
                        unit: log.location,
                        contractor: log.contractor,
                        dueDate: log.date,
                        status: log.status === 'Needs Remediation' ? 'OPEN' : 'CLOSED',
                        imageUrl: log.imageUrl,
                        photoAlt: log.title
                      })}
                      className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 rounded-xl transition-colors cursor-pointer mt-2"
                    >
                      Enlarge &amp; Inspect Detail
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-400 italic">
                No photo logs matching selected filters found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEDIA DETAILS MODAL */}
      {activeMedia && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Live Site Media Overlay</h3>
              <button 
                onClick={() => setActiveMedia(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <img className="w-full h-full object-contain" src={activeMedia.imageUrl} alt={activeMedia.title} />
            </div>
            <div className="p-5 space-y-2 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-900">{activeMedia.title}</h4>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Location: <strong>{activeMedia.location}</strong></span>
                <span>Captured: <strong>{activeMedia.timeAgo}</strong></span>
                <span>Type: <strong>{activeMedia.type}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SNAG PHOTO PREVIEW MODAL */}
      {activeSnagImage && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Snag Inspection Snapshot</h3>
              <button 
                onClick={() => setActiveSnagImage(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-square bg-black flex items-center justify-center">
              <img className="w-full h-full object-contain" src={activeSnagImage.imageUrl} alt={activeSnagImage.photoAlt} />
            </div>
            <div className="p-5 space-y-2 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-900">{activeSnagImage.issueDescription}</h4>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Unit: <strong>{activeSnagImage.unit}</strong></span>
                <span>Contractor: <strong>{activeSnagImage.contractor}</strong></span>
                <span>Due Date: <strong className="text-red-500">{activeSnagImage.dueDate}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW SNAG MODAL */}
      {showSnagModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Log Site Snag Issue</h3>
              <button 
                onClick={() => setShowSnagModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSnag} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Issue Description *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Minor hairline cracks in slab plastering"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Unit / Location Room *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Unit 402, Bldg C"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contractor Partner</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={newContractor}
                  onChange={(e) => setNewContractor(e.target.value)}
                >
                  <option value="Structural Steel Corp">Structural Steel Corp</option>
                  <option value="Standard Concrete Inc">Standard Concrete Inc</option>
                  <option value="Glaze Masters">Glaze Masters</option>
                  <option value="M&amp;E Contractors">M&amp;E Contractors</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Resolution Due Date *</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSnagModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Log Snag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PHOTO LOG MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Log Site Photo Entry</h3>
              <button 
                onClick={() => setShowPhotoModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePhotoLog} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Photo Title / Action Description *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Concrete foundation slab pouring"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location / Zone *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Wing A Floor 3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={photoLoc}
                    onChange={(e) => setPhotoLoc(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contractor Partner</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={photoContractor}
                  onChange={(e) => setPhotoContractor(e.target.value)}
                >
                  <option value="Structural Steel Corp">Structural Steel Corp</option>
                  <option value="Standard Concrete Inc">Standard Concrete Inc</option>
                  <option value="M&amp;E Contractors">M&amp;E Contractors</option>
                  <option value="Glaze Masters">Glaze Masters</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Issue / Audit Type</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={photoIssueType}
                    onChange={(e) => setPhotoIssueType(e.target.value)}
                  >
                    <option value="Structural Integrity">Structural Integrity</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="Electrical Safety">Electrical Safety</option>
                    <option value="General Construction">General Construction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Audit Status Pass</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={photoStatus}
                    onChange={(e) => setPhotoStatus(e.target.value)}
                  >
                    <option value="Verified Pass">Verified Pass</option>
                    <option value="Needs Remediation">Needs Remediation</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Log Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
