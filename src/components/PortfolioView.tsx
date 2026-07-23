/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  Plus, 
  MapPin, 
  Download, 
  MoreHorizontal, 
  X,
  AlertTriangle,
  Minus
} from 'lucide-react';
import { Project, UserRole, AuditLog } from '../types';
import ProjectDetailView from './ProjectDetailView';
import { motion } from 'motion/react';

interface PortfolioViewProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onExportCSV: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  currentRole: UserRole;
  onLogAudit: (action: AuditLog['action'], entity: AuditLog['entity'], reason: string, oldVal?: string, newVal?: string) => void;
}

export default function PortfolioView({
  projects,
  activeProject,
  onSelectProject,
  onAddProject,
  onExportCSV,
  showToast,
  currentRole,
  onLogAudit,
}: PortfolioViewProps) {
  const [selectedDetailProject, setSelectedDetailProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [managerFilter, setManagerFilter] = useState('All Managers');
  
  // New Project Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'delayed' | 'at-risk' | 'completed'>('active');
  const [newBudget, setNewBudget] = useState('$50M');
  const [newStage, setNewStage] = useState('Planning & Permitting');
  const [newManager, setNewManager] = useState('Sarah Chen');
  const [newDeadline, setNewDeadline] = useState('2025-12-31');
  const [newProgress, setNewProgress] = useState(10);
  const [newPriority, setNewPriority] = useState<'Priority 1' | 'Priority 2' | 'Priority 3' | 'None'>('None');
  const [newDescription, setNewDescription] = useState('');

  const clearFilters = () => {
    setStatusFilter('All Statuses');
    setStageFilter('All Stages');
    setManagerFilter('All Managers');
  };

  // Unique managers and stages for the filters
  const managers = ['All Managers', ...Array.from(new Set(projects.map(p => p.manager)))];
  const stages = [
    'All Stages',
    'Planning & Permitting',
    'Groundwork & Infrastructure',
    'Vertical Construction',
    'Final Inspection & Handover',
    'Approval Stage',
    'Demolition',
    'Structural',
    'Finishing',
    'Excavation'
  ];

  // Filtering projects
  const filteredProjects = projects.filter(p => {
    const matchStatus = statusFilter === 'All Statuses' || p.status.toLowerCase() === statusFilter.toLowerCase();
    
    // stage matching is prefix/substring based
    const matchStage = stageFilter === 'All Stages' || p.stage.toLowerCase().includes(stageFilter.split(' ')[0].toLowerCase());
    
    const matchManager = managerFilter === 'All Managers' || p.manager === managerFilter;
    
    return matchStatus && matchStage && matchManager;
  });

  const portfolioSummary = [
    { label: 'Total projects', value: projects.length, detail: 'Across all delivery stages', tone: 'text-slate-900', dot: 'bg-slate-700' },
    { label: 'On track', value: projects.filter(p => p.status === 'active').length, detail: 'Currently progressing', tone: 'text-blue-700', dot: 'bg-blue-600' },
    { label: 'Delayed', value: projects.filter(p => p.status === 'delayed').length, detail: 'Require schedule review', tone: 'text-amber-700', dot: 'bg-amber-500' },
    { label: 'At risk', value: projects.filter(p => p.status === 'at-risk').length, detail: 'Need immediate attention', tone: 'text-red-700', dot: 'bg-red-500' },
  ];

  const handleSubmitNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation) {
      if (showToast) {
        showToast('Please fill out Project Name and Location.', 'error');
      }
      return;
    }

    onAddProject({
      name: newName,
      location: newLocation,
      status: newStatus,
      budget: newBudget,
      stage: newStage,
      manager: newManager,
      deadline: newDeadline,
      progress: Number(newProgress),
      priority: newPriority,
      description: newDescription || `${newName} under supervision in ${newLocation}.`,
      incidents: 0,
      staffCount: 120,
      temperature: 24,
      planningProgress: newStage.includes('Plan') ? 100 : 30,
      groundworkProgress: newStage.includes('Ground') ? 80 : 0,
      verticalProgress: newStage.includes('Vert') ? 40 : 0,
      finalProgress: newStage.includes('Final') ? 10 : 0,
    });

    if (showToast) {
      showToast(`Project "${newName}" logged successfully!`, 'success');
    }

    // Reset Form
    setNewName('');
    setNewLocation('');
    setNewStatus('active');
    setNewBudget('$50M');
    setNewStage('Planning & Permitting');
    setNewManager('Sarah Chen');
    setNewDeadline('2025-12-31');
    setNewProgress(10);
    setNewPriority('None');
    setNewDescription('');
    setShowModal(false);
  };

  // Helpers for progress segment styles
  const getProgressSegments = (progress: number, status: string) => {
    const totalSegments = 10;
    const activeSegments = Math.round((progress / 100) * totalSegments);
    const segments = [];

    for (let i = 0; i < totalSegments; i++) {
      const isActive = i < activeSegments;
      let colorClass = 'bg-slate-100';
      if (isActive) {
        if (status === 'at-risk') colorClass = 'bg-red-500';
        else if (status === 'delayed') colorClass = 'bg-amber-500';
        else colorClass = 'bg-blue-600';
      }
      segments.push(colorClass);
    }
    return segments;
  };

  if (selectedDetailProject) {
    return (
      <ProjectDetailView
        project={selectedDetailProject}
        onBack={() => setSelectedDetailProject(null)}
        currentRole={currentRole}
        showToast={showToast || (() => {})}
        onLogAudit={onLogAudit}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="portfolio-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/70 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Delivery portfolio</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Project Portfolio</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">Monitor every redevelopment initiative, team owner, milestone, and delivery risk.</p>
        </div>
        <div className="flex flex-col min-[430px]:flex-row items-stretch min-[430px]:items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Grid / List view toggle */}
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex self-start min-[430px]:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="justify-center flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 text-white" />
            New Project
          </button>
        </div>
      </div>

      <section className="portfolio-panel grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-x divide-y lg:divide-y-0 divide-slate-100">
        {portfolioSummary.map((item) => (
          <div key={item.label} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className={`h-2 w-2 rounded-full ${item.dot}`} /> {item.label}
            </div>
            <p className={`mt-2 text-2xl sm:text-3xl font-extrabold ${item.tone}`}>{item.value}</p>
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500">{item.detail}</p>
          </div>
        ))}
      </section>

      {/* Filters Bar */}
      <div className="portfolio-panel bg-white border border-slate-200/80 p-4 sm:p-5 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option>All Statuses</option>
            <option value="active">Active</option>
            <option value="delayed">Delayed</option>
            <option value="at-risk">At-Risk</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Stage</label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {stages.map(stg => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manager</label>
          <select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {managers.map(mgr => (
              <option key={mgr} value={mgr}>{mgr}</option>
            ))}
          </select>
        </div>

        <div className="flex min-[480px]:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-end items-center justify-between gap-3 py-1.5">
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredProjects.length} of {projects.length} Projects
          </span>
          {(statusFilter !== 'All Statuses' || stageFilter !== 'All Stages' || managerFilter !== 'All Managers') && (
            <button
              onClick={clearFilters}
              className="text-blue-600 font-sans text-xs font-bold hover:text-blue-700 cursor-pointer transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Project Inventory */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 ">
          {filteredProjects.map((project) => {
            const isFeatured = project.priority === 'Priority 1';
            const isActiveWorkspace = activeProject?.id === project.id;
            
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`portfolio-panel bg-white border transition-all duration-200 rounded-2xl shadow-[6px_6px_5px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col group overflow-hidden ${
                  isActiveWorkspace 
                    ? 'border-2 border-blue-500 ring-4 ring-blue-500/10' 
                    : project.status === 'at-risk' 
                      ? 'border-red-300 hover:border-red-400' 
                      : 'border-slate-200/80 hover:border-slate-300'
                } ${isFeatured ? 'md:col-span-2' : ''}`}
              >
                {/* Card Header Media (Featured only or fallback) */}
                {isFeatured && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                    <img 
                      className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
                      src={project.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDfTDfL0_jkpT1f1tWjvfZoc3TI_Qbfyb7WLI5ou7rZZ99fUi56fJEncmWVqMJv6QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw"} 
                      alt={project.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-blue-600 text-white px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                        ACTIVE
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-slate-800 px-2.5 py-1 text-[9px] font-bold rounded-lg border border-slate-200">
                        Priority 1
                      </span>
                    </div>
                    {isActiveWorkspace && (
                      <span className="absolute top-4 right-4 bg-emerald-500 text-white px-2.5 py-1 text-[9px] font-bold rounded-lg shadow-sm">
                        ACTIVE WORKSPACE
                      </span>
                    )}
                  </div>
                )}

                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  {/* Status & Options Row (For Non-Featured) */}
                  {!isFeatured && (
                    <div className="flex justify-between items-center mb-3.5">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase ${
                        project.status === 'at-risk' ? 'bg-red-50 text-red-600 border-red-100' :
                        project.status === 'delayed' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {project.status === 'at-risk' ? 'AT-RISK' : project.status.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isActiveWorkspace && (
                          <span className="bg-emerald-500 text-white px-2 py-0.5 text-[8px] font-bold rounded">
                            ACTIVE
                          </span>
                        )}
                        <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  )}

                  {/* Title & Location */}
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="grid grid-cols-2 gap-4 mb-3 border-t border-slate-100 pt-4 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Stage</span>
                      <span className="font-semibold text-slate-700 block truncate mt-0.5">{project.stage}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Budget</span>
                      <span className="font-semibold text-slate-700 block truncate mt-0.5">{project.budget}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Manager</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-700">
                          {project.manager[0]}
                        </div>
                        <span className="text-slate-700 truncate">{project.manager}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deadline</span>
                      <span className={`block truncate mt-0.5 font-medium ${project.status === 'at-risk' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                        {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Executive KPI Metadata */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 text-[11px] grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Risk Score</span>
                      <span className={`font-extrabold ${
                        (project.riskScore ?? 0) >= 75 ? 'text-red-600' :
                        (project.riskScore ?? 0) >= 45 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {project.riskScore ?? 35}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Fin Health</span>
                      <span className={`font-extrabold ${
                        project.financialHealth === 'Good' ? 'text-emerald-600' :
                        project.financialHealth === 'Fair' ? 'text-blue-600' :
                        project.financialHealth === 'Poor' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {project.financialHealth ?? 'Good'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Approvals</span>
                      <span className="font-bold text-slate-700 truncate block text-[10px]" title={project.approvalStatus}>
                        {project.approvalStatus ?? 'MHADA Approved'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Schedule Delay</span>
                      <span className={`font-bold truncate block text-[10px] ${project.scheduleDelay !== 'On-Schedule' && project.scheduleDelay !== 'None' ? 'text-amber-600' : 'text-slate-600'}`} title={project.scheduleDelay}>
                        {project.scheduleDelay ?? 'On-Schedule'}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-slate-200/60">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Next Milestone</span>
                      <span className="font-extrabold text-blue-600 truncate block text-[10px]" title={project.nextMilestone}>
                        <span className="mr-1" aria-hidden="true">•</span>{project.nextMilestone ?? 'Plinth stage clearance'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">Overall Progress</span>
                      <span className="text-slate-800">{project.progress}%</span>
                    </div>
                    <div className="flex h-1.5 w-full gap-0.5">
                      {getProgressSegments(project.progress, project.status).map((col, idx) => (
                        <div key={idx} className={`h-full flex-1 rounded-sm ${col}`}></div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onSelectProject(project); 
                      setSelectedDetailProject(project); 
                    }} 
                    className="w-full mt-4 py-2 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                  >
                    Open Redevelopment Single-View
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 portfolio-panel rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <AlertTriangle className="mx-auto h-7 w-7 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-800">No matching projects</h3>
              <p className="mt-1 text-xs text-slate-500">Try changing or clearing your portfolio filters.</p>
              <button onClick={clearFilters} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Clear filters</button>
            </div>
          )}
        </div>
      ) : (
        /* List Layout representation of matching projects */
        <div className="portfolio-panel bg-white border border-slate-200/80 overflow-x-auto rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Approvals Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule Delay</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fin Health</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Next Milestone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  onClick={() => onSelectProject(project)}
                  className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${
                    activeProject?.id === project.id ? 'bg-blue-50/30 font-semibold' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      {project.name}
                      {activeProject?.id === project.id && (
                        <span className="bg-emerald-500 text-white px-1.5 py-0.5 text-[8px] rounded font-bold">ACTIVE</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{project.location}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    <span className={`px-2 py-0.5 rounded-md ${
                      (project.riskScore ?? 0) >= 75 ? 'bg-red-50 text-red-700' :
                      (project.riskScore ?? 0) >= 45 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {project.riskScore ?? 35}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-semibold">
                    {project.approvalStatus ?? 'MHADA Approved'}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className={`font-semibold ${project.scheduleDelay !== 'On-Schedule' && project.scheduleDelay !== 'None' ? 'text-amber-600' : 'text-slate-500'}`}>
                      {project.scheduleDelay ?? 'On-Schedule'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-extrabold">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase ${
                      project.financialHealth === 'Good' ? 'bg-emerald-50 text-emerald-700' :
                      project.financialHealth === 'Fair' ? 'bg-blue-50 text-blue-700' :
                      project.financialHealth === 'Poor' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {project.financialHealth ?? 'Good'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-blue-600 font-bold">
                    <span className="mr-1" aria-hidden="true">•</span>{project.nextMilestone ?? 'Plinth stage clearance'}
                  </td>
                  <td className="px-6 py-4 text-xs font-extrabold text-slate-900">
                    {project.progress}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                        setSelectedDetailProject(project);
                      }}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-extrabold uppercase tracking-wider text-[9px] rounded-lg transition-all cursor-pointer"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Projects Inventory Table at the bottom */}
      <div className="space-y-4 pt-5 sm:pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800">All Projects Inventory</h3>
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-blue-500" />
            Export CSV
          </button>
        </div>

        <div className="portfolio-panel bg-white border border-slate-200/80 overflow-x-auto rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => (
                <tr 
                  key={project.id} 
                  onClick={() => onSelectProject(project)}
                  className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${
                    activeProject?.id === project.id ? 'bg-blue-50/20 font-medium' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-xs font-bold text-slate-900">{project.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{project.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      project.status === 'at-risk' ? 'text-red-600' :
                      project.status === 'delayed' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        project.status === 'at-risk' ? 'bg-red-500' :
                        project.status === 'delayed' ? 'bg-amber-500' : 'bg-blue-600'
                      }`}></span>
                      {project.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700 font-medium">{project.manager}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{project.stage}</td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-900">{project.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW PROJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">Add New Redevelopment Project</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewProject} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Skyline Redevelopment Phase II"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Downtown Metro Center"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <option value="active">Active</option>
                    <option value="delayed">Delayed</option>
                    <option value="at-risk">At-Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Budget</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $142.5M"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stage</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                  >
                    <option value="Planning & Permitting">Planning & Permitting</option>
                    <option value="Groundwork & Infrastructure">Groundwork & Infrastructure</option>
                    <option value="Vertical Construction">Vertical Construction</option>
                    <option value="Final Inspection & Handover">Final Inspection & Handover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Manager</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newManager}
                    onChange={(e) => setNewManager(e.target.value)}
                  >
                    <option value="Sarah Chen">Sarah Chen</option>
                    <option value="Mark Thorne">Mark Thorne</option>
                    <option value="Elena Rodriguez">Elena Rodriguez</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deadline Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Overall Progress (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority Rank</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                  >
                    <option value="None">None (Standard)</option>
                    <option value="Priority 1">Priority 1 (Featured)</option>
                    <option value="Priority 2">Priority 2</option>
                    <option value="Priority 3">Priority 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Description</label>
                <textarea 
                  rows={3}
                  placeholder="Provide scope, constraints, and operational guidelines..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
