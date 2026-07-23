/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  MoreVertical, 
  Building, 
  X,
  Inbox,
  Filter,
  Send,
  UploadCloud,
  MessageSquare,
  Paperclip,
  UserCheck
} from 'lucide-react';
import { FollowUp, Clearance } from '../types';
import { motion } from 'motion/react';

interface ApprovalsViewProps {
  followUps: FollowUp[];
  clearances: Clearance[];
  onAddFollowUp: (followUp: Omit<FollowUp, 'id'>) => void;
  onAddClearance: (clearance: Omit<Clearance, 'id'>) => void;
  onToggleFollowUpStatus: (id: string) => void;
  onResolveClearance: (id: string) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function ApprovalsView({
  followUps,
  clearances,
  onAddFollowUp,
  onAddClearance,
  onToggleFollowUpStatus,
  onResolveClearance,
  showToast,
}: ApprovalsViewProps) {
  const [activeTab, setActiveTab] = useState<'follow-ups' | 'approvals'>('follow-ups');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);

  // Expanded details drawer state
  const [selectedClearanceId, setSelectedClearanceId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize and persist rich local clearance state
  const [localClearances, setLocalClearances] = useState<any[]>(() => {
    const saved = localStorage.getItem('toughcons_local_clearances_v2');
    if (saved) return JSON.parse(saved);
    return clearances.map(c => ({
      ...c,
      comments: [
        { id: 'c1', author: 'Director J. Miller', text: 'Initial checklist completed. Checking concrete slump ready-mix reports.', timestamp: 'Oct 11, 2023, 11:15 AM' }
      ],
      escalated: false,
      escalationPath: '',
      proofFile: null as any,
      reassignedTo: c.responsible,
      closureStatus: c.status
    }));
  });

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('toughcons_local_clearances_v2', JSON.stringify(localClearances));
  }, [localClearances]);

  // Sync new clearances from parent props
  useEffect(() => {
    if (clearances.length > 0) {
      setLocalClearances(prev => {
        const existingIds = prev.map(p => p.id);
        const newItems = clearances.filter(c => !existingIds.includes(c.id)).map(c => ({
          ...c,
          comments: [],
          escalated: false,
          escalationPath: '',
          proofFile: null,
          reassignedTo: c.responsible,
          closureStatus: c.status
        }));
        if (newItems.length > 0) {
          return [...prev, ...newItems];
        }
        return prev;
      });
    }
  }, [clearances]);

  // Find currently selected clearance
  const activeClearanceDetail = localClearances.find(c => c.id === selectedClearanceId);

  // Rich handlers for interactive approvals
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedClearanceId) return;

    setLocalClearances(prev => prev.map(c => {
      if (c.id === selectedClearanceId) {
        return {
          ...c,
          comments: [
            ...(c.comments || []),
            {
              id: `cmt-${Date.now()}`,
              author: 'Director J. Miller',
              text: newCommentText,
              timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return c;
    }));
    setNewCommentText('');
  };

  const handleReassign = (person: string) => {
    if (!selectedClearanceId) return;
    setLocalClearances(prev => prev.map(c => {
      if (c.id === selectedClearanceId) {
        return { ...c, reassignedTo: person, responsible: person };
      }
      return c;
    }));
    if (showToast) {
      showToast(`Reassigned: ${person} is now the primary owner for this clearance line.`, 'success');
    }
  };

  const handleEscalateClearance = (path: string) => {
    if (!selectedClearanceId) return;
    setLocalClearances(prev => prev.map(c => {
      if (c.id === selectedClearanceId) {
        return {
          ...c,
          escalated: true,
          escalationPath: path,
          status: 'Query Raised'
        };
      }
      return c;
    }));
    if (showToast) {
      showToast(`Escalated: Filed official dispute escalation path with: ${path}`, 'warning');
    }
  };

  const handleStatusChange = (status: string) => {
    if (!selectedClearanceId) return;
    setLocalClearances(prev => prev.map(c => {
      if (c.id === selectedClearanceId) {
        return { ...c, closureStatus: status, status: status };
      }
      return c;
    }));
    if (showToast) {
      showToast(`Status Updated: Clearance marked as "${status}"`, 'success');
    }
  };

  const handleSimulatedUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setLocalClearances(curr => curr.map(c => {
            if (c.id === selectedClearanceId) {
              return {
                ...c,
                proofFile: {
                  name: `NOC_CLEARANCE_STAMPED_${c.authority.replace(/\s+/g, '_')}.pdf`,
                  uploadedAt: 'Just Now',
                  size: '1.4 MB'
                }
              };
            }
            return c;
          }));
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // New follow-up state
  const [fuDesc, setFuDesc] = useState('');
  const [fuOwner, setFuOwner] = useState('Amit Kulkarni');
  const [fuDueDate, setFuDueDate] = useState('');
  const [fuPriority, setFuPriority] = useState<1 | 2 | 3>(3);

  // New clearance state
  const [clAuthority, setClAuthority] = useState('BMC (Building Proposals)');
  const [clSubmission, setClSubmission] = useState('');
  const [clResponsible, setClResponsible] = useState('Prashant Mehta');
  const [clExpected, setClExpected] = useState('');
  const [clType, setClType] = useState<'Regulatory' | 'Critical' | 'Housing' | 'General'>('Regulatory');
  const [clDesc, setClDesc] = useState('');

  // Calculate dynamic stats
  const criticalApprovalsCount = clearances.filter(c => c.status === 'Query Raised' || c.type === 'Critical').length;
  const overdueFollowUpsCount = followUps.filter(f => f.status === 'OVERDUE').length;
  const pendingClearancesCount = localClearances.filter(c => c.status === 'Pending' || c.status === 'Query Raised').length;
  const resolvedClearancesCount = localClearances.filter(c => c.status === 'Approved' || c.status === 'Closed & Archived').length;
  const approvalSummary = [
    { label: 'Approval risk', value: criticalApprovalsCount, note: 'Critical or query raised', tone: 'text-red-700', dot: 'bg-red-500' },
    { label: 'Overdue follow-ups', value: overdueFollowUpsCount, note: 'Need an owner response', tone: 'text-amber-700', dot: 'bg-amber-500' },
    { label: 'Pending clearances', value: pendingClearancesCount, note: 'In the approval pipeline', tone: 'text-blue-700', dot: 'bg-blue-600' },
    { label: 'Resolved clearances', value: resolvedClearancesCount, note: 'Approved or archived', tone: 'text-emerald-700', dot: 'bg-emerald-500' },
  ];

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuDesc || !fuDueDate) return;

    const initial = fuOwner.split(' ').map(n => n[0]).join('');
    const colors = [
      'bg-orange-50 text-orange-700 border border-orange-100', 
      'bg-blue-50 text-blue-700 border border-blue-100', 
      'bg-emerald-50 text-emerald-700 border border-emerald-100', 
      'bg-purple-50 text-purple-700 border border-purple-100'
    ];
    const ownerColor = colors[Math.floor(Math.random() * colors.length)];

    onAddFollowUp({
      description: fuDesc,
      owner: fuOwner,
      ownerInitial: initial,
      ownerColor,
      dueDate: fuDueDate,
      status: new Date(fuDueDate) < new Date() ? 'OVERDUE' : 'SCHEDULED',
      priority: fuPriority,
    });

    if (showToast) {
      showToast(`Follow-up task created successfully for ${fuOwner}.`, 'success');
    }

    setFuDesc('');
    setFuDueDate('');
    setFuPriority(3);
    setShowFollowUpModal(false);
  };

  const handleCreateClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clSubmission) return;

    onAddClearance({
      authority: clAuthority,
      submissionDate: clSubmission,
      status: 'Pending',
      responsible: clResponsible,
      expectedApproval: clExpected || 'Pending Vetting',
      progress: 10,
      type: clType,
      description: clDesc || `${clAuthority} draft submitted.`,
    });

    if (showToast) {
      showToast(`MHADA redevelopment permit NOC for ${clAuthority} logged successfully.`, 'success');
    }

    setClSubmission('');
    setClExpected('');
    setClDesc('');
    setShowClearanceModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="approvals-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
    >
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/70 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Regulatory control desk</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Follow-ups &amp; Approvals</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">Coordinate ownership, monitor clearance progress, and resolve regulatory blockers.</p>
        </div>
      </div>

      <section className="approvals-panel grid grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm divide-x divide-y lg:divide-y-0 divide-slate-100">
        {approvalSummary.map((item) => (
          <div key={item.label} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
            <p className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400"><span className={`w-2 h-2 rounded-full ${item.dot}`} />{item.label}</p>
            <p className={`mt-2 text-2xl sm:text-3xl font-extrabold ${item.tone}`}>{item.value}</p>
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500">{item.note}</p>
          </div>
        ))}
      </section>

      {/* Navigation Tabs */}
      <div className="inline-flex w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
        <button
          id="tab-follow-ups"
          onClick={() => setActiveTab('follow-ups')}
          className={`flex-1 sm:flex-none px-4 py-2 font-sans text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'follow-ups' 
              ? 'bg-white shadow-sm text-blue-700' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Follow-ups
        </button>
        <button
          id="tab-approvals"
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 sm:flex-none px-4 py-2 font-sans text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'approvals' 
              ? 'bg-white shadow-sm text-blue-700' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Approvals
        </button>
      </div>

      {/* Tab Content: Follow-ups */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-5">
          <div className="approvals-panel bg-white border border-slate-200/80 shadow-sm overflow-hidden rounded-2xl">
            {/* Header section of list */}
            <div className="bg-slate-50/50 px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col min-[430px]:flex-row justify-between min-[430px]:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Active task queue</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{followUps.length} follow-ups tracked across the portfolio.</span>
              </div>
              <button
                id="btn-trigger-follow-up"
                onClick={() => setShowFollowUpModal(true)}
                className="justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/15"
              >
                <Plus className="w-4 h-4 text-white" /> NEW FOLLOW-UP
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {followUps.length > 0 ? followUps.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={item.status === 'COMPLETED'}
                            onChange={() => onToggleFollowUpStatus(item.id)}
                            className="rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer w-4 h-4"
                          />
                          <span className={item.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}>
                            {item.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold ${item.ownerColor}`}>
                            {item.ownerInitial}
                          </div>
                          <span className="text-slate-800 font-semibold">{item.owner}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-xs font-semibold ${item.status === 'OVERDUE' ? 'text-red-500' : 'text-slate-500'}`}>
                        {item.status === 'COMPLETED' ? 'Completed' : item.dueDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border ${
                          item.status === 'OVERDUE' ? 'bg-red-50 text-red-600 border-red-100' :
                          item.status === 'DUE TODAY' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((bar) => (
                            <div 
                              key={bar} 
                              className={`w-4 h-1 rounded-full ${
                                bar <= item.priority 
                                  ? item.priority === 3 ? 'bg-red-500' : 'bg-blue-600'
                                  : 'bg-slate-100'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center">
                        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700">No follow-ups in the queue</p>
                        <p className="text-xs text-slate-400 mt-1">Create one to start tracking the next owner action.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-5">
          {/* Active Clearance Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {localClearances.filter(c => c.type !== 'General').slice(0, 3).map((cl) => {
              const isCritical = cl.type === 'Critical';
              const barColor = isCritical ? 'bg-red-500' : 'bg-blue-600';
              return (
                <div 
                  key={cl.id} 
                  onClick={() => setSelectedClearanceId(cl.id)}
                  className={`approvals-panel bg-white border p-5 sm:p-6 rounded-2xl shadow-[6px_6px_5px_rgba(0,0,0,0.15)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer ${
                    selectedClearanceId === cl.id ? 'border-2 border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <Building className="w-5 h-5 text-slate-700" />
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        cl.type === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                        cl.type === 'Housing' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {cl.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{cl.authority}</h4>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">{cl.description}</p>
                  </div>
                  <div className="mt-6">
                    <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${cl.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                        {cl.progress}% Pipeline Clearance
                      </p>
                      <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider hover:underline">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clearance Registry Table */}
          <div className="approvals-panel bg-white border border-slate-200/80 shadow-sm overflow-hidden rounded-2xl">
            <div className="bg-slate-50/50 px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Clearance Registry</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Click any row to manage Comments, Escalation, Reassignment and Proof Certificates.</span>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => alert('Filtering tools initialized.')}
                  className="justify-center bg-white border border-slate-200 px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer text-slate-700"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-500" /> FILTER
                </button>
                <button
                  onClick={() => setShowClearanceModal(true)}
                  className="justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/15"
                >
                  <Plus className="w-4 h-4 text-white" /> SUBMIT NEW
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authority</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responsible</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Expected Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localClearances.length > 0 ? localClearances.map((cl) => (
                    <tr 
                      key={cl.id} 
                      onClick={() => setSelectedClearanceId(cl.id)}
                      className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                        selectedClearanceId === cl.id ? 'bg-blue-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                        <div className="flex flex-col">
                          <span>{cl.authority}</span>
                          {cl.proofFile && (
                            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                              <Paperclip className="w-3 h-3" /> Certificate Attached
                            </span>
                          )}
                          {cl.escalated && (
                            <span className="text-[9px] text-red-600 font-bold flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3" /> Escalated: {cl.escalationPath}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {cl.submissionDate}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          {cl.status === 'Approved' && (
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Approved
                            </span>
                          )}
                          {cl.status === 'Pending' && (
                            <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Pending
                            </span>
                          )}
                          {cl.status === 'Query Raised' && (
                            <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Query Raised
                            </span>
                          )}
                          {cl.status === 'Not Started' && (
                            <span className="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-bold">
                              Not Started
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-semibold">
                        {cl.responsible}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-900 font-bold text-right">
                        {cl.status === 'Approved' ? (
                          <span className="text-emerald-600">Completed</span>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <span>{cl.expectedApproval}</span>
                            {cl.status === 'Query Raised' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onResolveClearance(cl.id);
                                }}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 font-bold rounded-lg transition-all cursor-pointer"
                              >
                                RESOLVE
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center">
                        <Building className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700">No clearances submitted</p>
                        <p className="text-xs text-slate-400 mt-1">Submit a clearance to begin tracking its approval journey.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW FOLLOW-UP MODAL */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Log New Follow-Up Task</h3>
              <button 
                onClick={() => setShowFollowUpModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Task Description *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Verify Tenant List with BMC Ward Officer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={fuDesc}
                  onChange={(e) => setFuDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Owner Name</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={fuOwner}
                  onChange={(e) => setFuOwner(e.target.value)}
                >
                  <option value="Amit Kulkarni">Amit Kulkarni</option>
                  <option value="S. Deshmukh">S. Deshmukh</option>
                  <option value="R. Varma">R. Varma</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Due Date *</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={fuDueDate}
                  onChange={(e) => setFuDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority Level</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={fuPriority}
                  onChange={(e) => setFuPriority(Number(e.target.value) as any)}
                >
                  <option value={3}>Critical (3 bars)</option>
                  <option value={2}>Medium (2 bars)</option>
                  <option value={1}>Scheduled (1 bar)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CLEARANCE MODAL */}
      {showClearanceModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Submit Regulatory Clearance</h3>
              <button 
                onClick={() => setShowClearanceModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClearance} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Authority Board *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={clAuthority}
                  onChange={(e) => setClAuthority(e.target.value)}
                >
                  <option value="BMC (Building Proposals)">BMC (Building Proposals)</option>
                  <option value="CFO (Fire NOC)">CFO (Fire NOC)</option>
                  <option value="MHADA (EE-City)">MHADA (EE-City)</option>
                  <option value="Tree Authority">Tree Authority</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Submission Date *</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={clSubmission}
                  onChange={(e) => setClSubmission(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Responsible Engineer</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prashant Mehta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={clResponsible}
                  onChange={(e) => setClResponsible(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expected Approval Date</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nov 05, 2023"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={clExpected}
                  onChange={(e) => setClExpected(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clearance Type</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={clType}
                  onChange={(e) => setClType(e.target.value as any)}
                >
                  <option value="Regulatory">Regulatory</option>
                  <option value="Critical">Critical</option>
                  <option value="Housing">Housing</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clearance Stage Description</label>
                <textarea 
                  rows={2}
                  placeholder="Briefly detail Plinth levels, Draft contracts, Sprinkler tests..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  value={clDesc}
                  onChange={(e) => setClDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClearanceModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Submit Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLEARANCE DETAILS DRAWER */}
      {selectedClearanceId && activeClearanceDetail && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex justify-end z-50 p-0">
          <div className="bg-white border-l border-slate-200 w-full max-w-lg shadow-2xl flex flex-col h-full animate-slide-left">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-wider">
                  Clearance Pipeline Details
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2">{activeClearanceDetail.authority}</h3>
              </div>
              <button 
                onClick={() => setSelectedClearanceId(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Status & Closure Control */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Closure / Pipeline Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={activeClearanceDetail.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Query Raised">Query Raised</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Closed & Archived">Closed & Archived</option>
                  </select>
                  <div className="flex items-center px-3 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500 font-semibold bg-slate-50/50">
                    Expected: {activeClearanceDetail.expectedApproval}
                  </div>
                </div>
              </div>

              {/* Responsible Engineer & Reassignment */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Responsible Engineer (Reassign)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={activeClearanceDetail.responsible}
                    onChange={(e) => handleReassign(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Prashant Mehta">Prashant Mehta (Regulatory Liaison)</option>
                    <option value="Sarah Chen">Sarah Chen (Project Director)</option>
                    <option value="Amit Kulkarni">Amit Kulkarni (Liaison Head)</option>
                    <option value="Rajesh Malhotra">Rajesh Malhotra (Accounts Auditor)</option>
                  </select>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Escalation Control Desk */}
              <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Escalation Control Desk
                  </span>
                  {activeClearanceDetail.escalated && (
                    <span className="bg-red-100 text-red-800 text-[8px] font-bold px-2 py-0.5 rounded uppercase">
                      Escalated
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Trigger an official escalation with the Municipal Commissioner or High-Rise Committee if the NOC is excessively delayed.
                </p>
                {!activeClearanceDetail.escalated ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEscalateClearance('Mumbai High-Rise Committee')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 text-center"
                    >
                      Escalate to High-Rise Board
                    </button>
                    <button
                      onClick={() => handleEscalateClearance('MHADA Executive Desk')}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex-1 text-center"
                    >
                      Escalate to MHADA Chief
                    </button>
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-800 text-[11px] p-2.5 rounded-lg font-bold border border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Current Escalation Path: {activeClearanceDetail.escalationPath}
                  </div>
                )}
              </div>

              {/* Proof Document Upload Desk */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Clearance Certificate / Proof Upload
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500/50 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-6 text-center transition-all">
                  {activeClearanceDetail.proofFile ? (
                    <div className="space-y-2">
                      <div className="inline-flex p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate">{activeClearanceDetail.proofFile.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{activeClearanceDetail.proofFile.size} &middot; Uploaded stamped copy</p>
                      </div>
                      <div className="flex justify-center gap-2 pt-2">
                        <button 
                          onClick={() => alert(`Downloading: ${activeClearanceDetail.proofFile.name}`)}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                        >
                          View Document
                        </button>
                        <button 
                          onClick={() => {
                            setLocalClearances(curr => curr.map(c => {
                              if (c.id === selectedClearanceId) {
                                return { ...c, proofFile: null };
                              }
                              return c;
                            }));
                          }}
                          className="text-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <UploadCloud className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">Drag &amp; drop signed NOC here</p>
                        <p className="text-[10px] text-slate-400 mt-1">Accepts PDF, ZIP, PNG up to 15MB</p>
                      </div>
                      {isUploading ? (
                        <div className="space-y-1.5 max-w-xs mx-auto">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                            <span>Uploading signed seal...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSimulatedUpload}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Select Certificate File
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments & Timeline Desk */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Auditor Comments &amp; Timeline Feed
                </label>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type an official compliance comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Comment Feed */}
                <div className="space-y-3 pt-2">
                  {(activeClearanceDetail.comments && activeClearanceDetail.comments.length > 0) ? (
                    activeClearanceDetail.comments.map((cmt: any) => (
                      <div key={cmt.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className="text-slate-800 uppercase">{cmt.author}</span>
                          <span className="text-slate-400">{cmt.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{cmt.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[11px] text-slate-400 py-4">No liaison comments posted yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedClearanceId(null)}
                className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl cursor-pointer"
              >
                Close Drawer Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
