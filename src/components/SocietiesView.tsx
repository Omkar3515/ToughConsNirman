/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Search, 
  Plus, 
  CheckCircle, 
  X, 
  Check, 
  Activity,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { Project } from '../types';
import { motion } from 'motion/react';

export interface ConsentRecord {
  id: string;
  projectId: string;
  projectName: string;
  unitNo: string;
  memberName: string;
  status: 'Consent Submitted' | 'Pending Review' | 'Withheld / Disputed';
  verificationDate?: string;
}

interface SocietiesViewProps {
  projects: Project[];
  activeProject: Project | null;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const INITIAL_CONSENTS: ConsentRecord[] = [
  {
    id: "con-1",
    projectId: "BDD-04",
    projectName: "Worli BDD 04 Redevelopment",
    unitNo: "Flat 101, Chawl 4B",
    memberName: "Rajendra Prasad",
    status: "Consent Submitted",
    verificationDate: "2023-09-12"
  },
  {
    id: "con-2",
    projectId: "BDD-04",
    projectName: "Worli BDD 04 Redevelopment",
    unitNo: "Flat 102, Chawl 4B",
    memberName: "Anand Deshmukh",
    status: "Consent Submitted",
    verificationDate: "2023-09-14"
  },
  {
    id: "con-3",
    projectId: "BDD-04",
    projectName: "Worli BDD 04 Redevelopment",
    unitNo: "Flat 201, Chawl 4B",
    memberName: "Meera Nair",
    status: "Pending Review",
    verificationDate: "2023-10-01"
  },
  {
    id: "con-4",
    projectId: "BDD-NG",
    projectName: "BDD Naigaon Cluster C",
    unitNo: "Flat 401, Chawl 2A",
    memberName: "Sanjay Sawant",
    status: "Withheld / Disputed",
    verificationDate: "2023-08-20"
  },
  {
    id: "con-5",
    projectId: "BDD-NG",
    projectName: "BDD Naigaon Cluster C",
    unitNo: "Flat 402, Chawl 2A",
    memberName: "Sunita Gawde",
    status: "Consent Submitted",
    verificationDate: "2023-09-10"
  },
  {
    id: "con-6",
    projectId: "HBR-II",
    projectName: "Harbor Ridge Phase II",
    unitNo: "Penthouse A, Tower 2",
    memberName: "Vikram Malhotra",
    status: "Consent Submitted",
    verificationDate: "2023-09-18"
  }
];

export default function SocietiesView({ projects, activeProject, showToast }: SocietiesViewProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>(() => {
    const saved = localStorage.getItem('toughcons_consents_v1');
    return saved ? JSON.parse(saved) : INITIAL_CONSENTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Consent Submitted' | 'Pending Review' | 'Withheld / Disputed'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Consent Form State
  const [newMember, setNewMember] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newProjectId, setNewProjectId] = useState(activeProject?.id || projects[0]?.id || '');
  const [newStatus, setNewStatus] = useState<'Consent Submitted' | 'Pending Review' | 'Withheld / Disputed'>('Consent Submitted');

  const saveConsents = (updated: ConsentRecord[]) => {
    setConsents(updated);
    localStorage.setItem('toughcons_consents_v1', JSON.stringify(updated));
  };

  const handleCreateConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember || !newUnit) {
      if (showToast) {
        showToast('Please fill out Member Name and Unit/Chawl Number.', 'error');
      }
      return;
    }

    const matchedProj = projects.find(p => p.id === newProjectId);
    const fresh: ConsentRecord = {
      id: `con-${Date.now()}`,
      projectId: newProjectId,
      projectName: matchedProj ? matchedProj.name : "Portfolio Project",
      unitNo: newUnit,
      memberName: newMember,
      status: newStatus,
      verificationDate: new Date().toISOString().split('T')[0]
    };

    const nextConsents = [fresh, ...consents];
    saveConsents(nextConsents);

    if (showToast) {
      showToast(`Consent Record logged successfully for ${fresh.memberName}.`, 'success');
    }

    // Reset Form
    setNewMember('');
    setNewUnit('');
    setShowAddModal(false);
  };

  const handleUpdateStatus = (id: string, status: ConsentRecord['status']) => {
    const nextConsents = consents.map(c => c.id === id ? { ...c, status } : c);
    saveConsents(nextConsents);
  };

  const filteredConsents = consents.filter(c => {
    const matchSearch = c.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.unitNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchProj = projectFilter === 'ALL' || c.projectId === projectFilter;
    return matchSearch && matchStatus && matchProj;
  });

  // Calculate stats
  const totalRoster = consents.length;
  const submittedCount = consents.filter(c => c.status === 'Consent Submitted').length;
  const pendingCount = consents.filter(c => c.status === 'Pending Review').length;
  const disputedCount = consents.filter(c => c.status === 'Withheld / Disputed').length;

  return (
    <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="approvals-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
        >
    <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">REDEVELOPMENT CRM &amp; ROSTERS</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Tenant Consent Databases</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/15 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Unit Consent
        </button>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Registry Roster</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-slate-900">{totalRoster}</span>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-full">Units Logged</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Consent Approved</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-emerald-600">{submittedCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {Math.round((submittedCount / Math.max(1, totalRoster)) * 100)}% Consent
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Awaiting Sign-off</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-blue-600">{pendingCount}</span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">In Review</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Disputed / Withheld</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-red-600">{disputedCount}</span>
            <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">Liaison Required</span>
          </div>
        </div>
      </div>

      {/* Main filterable list & data table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Housing Society Member List</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                placeholder="Search tenant name or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Societies</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/20 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Consent Filter:</span>
          {(['ALL', 'Consent Submitted', 'Pending Review', 'Withheld / Disputed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-blue-600 border-transparent text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.replace('Consent Submitted', 'Submitted').replace('Withheld / Disputed', 'Disputed')}
            </button>
          ))}
        </div>

        {/* Consents table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Housing Society Project</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit / Chawl ID</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Name</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consent Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConsents.length > 0 ? (
                filteredConsents.map((con) => (
                  <tr key={con.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-800 block">{con.projectName}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{con.projectId}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-bold text-slate-900">
                      {con.unitNo}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-bold text-slate-700">
                      {con.memberName}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-sans text-xs text-slate-500 font-medium">
                      {con.verificationDate || "Awaiting submission"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <select
                        value={con.status}
                        onChange={(e) => handleUpdateStatus(con.id, e.target.value as ConsentRecord['status'])}
                        className={`text-[10px] font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${
                          con.status === 'Consent Submitted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          con.status === 'Pending Review' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-red-50 border-red-200 text-red-600'
                        }`}
                      >
                        <option value="Consent Submitted">Consent Submitted</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Withheld / Disputed">Withheld / Disputed</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-semibold">
                    No society residents matching parameters located in directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW RESIDENT REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Log Tenant Consent Entry</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsent} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resident Member Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Anand Deshmukh"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit / Chawl Block Number</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  placeholder="e.g. Room 42, Chawl block 3A"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Society Project Context</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sign-off Status</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                >
                  <option value="Consent Submitted">Consent Submitted</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Withheld / Disputed">Withheld / Disputed</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                <strong className="text-slate-800 uppercase text-[9px] tracking-wider block">MHADA Regulatory Roster</strong>
                Each logged consent form is legally cross-referenced with MHADA-certified tenant directories before plinth-level layout clearance is issued.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 rounded-xl cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Register Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </motion.div>
  );
}
