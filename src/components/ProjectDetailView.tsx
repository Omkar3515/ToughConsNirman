/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, FileText, CheckCircle, AlertOctagon, 
  Clock, Coins, Users, Image, ShieldCheck, Download, Plus, 
  Upload, Sparkles, Building, Trash2, Check, AlertTriangle, AlertCircle
} from 'lucide-react';
import { Project, UserRole, AuditLog, DocumentFile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  currentRole: UserRole;
  showToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onLogAudit: (action: AuditLog['action'], entity: AuditLog['entity'], reason: string, oldVal?: string, newVal?: string) => void;
}

export default function ProjectDetailView({
  project,
  onBack,
  currentRole,
  showToast,
  onLogAudit,
}: ProjectDetailViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'approvals' | 'risks' | 'documents' | 'meetings' | 'site' | 'payments' | 'consent'>('timeline');

  // Interactive local states for prototype data
  const [localProject, setLocalProject] = useState<Project>(project);
  const [consentList, setConsentList] = useState([
    { id: 'c-1', name: 'Shridhar Kulkarni', unit: 'Chawl 2 / Room 14', status: 'Signed', area: '180 sq ft', hardshipRent: 'Disbursed' },
    { id: 'c-2', name: 'Mangala Dhuri', unit: 'Chawl 2 / Room 15', status: 'Signed', area: '180 sq ft', hardshipRent: 'Disbursed' },
    { id: 'c-3', name: 'Anant Sawant', unit: 'Chawl 2 / Room 16', status: 'Signed', area: '180 sq ft', hardshipRent: 'Disbursed' },
    { id: 'c-4', name: 'Suhas Parab', unit: 'Chawl 3 / Room 02', status: 'Pending', area: '210 sq ft', hardshipRent: 'Withheld' },
    { id: 'c-5', name: 'Vilash Patil', unit: 'Chawl 3 / Room 04', status: 'Refused', area: '180 sq ft', hardshipRent: 'N/A' },
  ]);

  const [auditComment, setAuditComment] = useState('');
  const [showAuditPrompt, setShowAuditPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Gantt Milestones list
  const milestones = [
    { name: 'Feasibility Report & PMC Appointment', date: '2025-01-15', progress: 100, status: 'Completed', block: 'Planning' },
    { name: 'Tenant Consent Mobilization (70%+ requirement)', date: '2025-03-31', progress: localProject.tenantConsentPct || 85, status: (localProject.tenantConsentPct || 0) >= 70 ? 'Completed' : 'Active', block: 'Planning' },
    { name: 'Joint Development Agreement (DA) Execution', date: '2025-06-30', progress: 100, status: 'Completed', block: 'Planning' },
    { name: 'MHADA NOC & BMC Intimation of Disapproval (IOD)', date: '2025-09-15', progress: localProject.mhadaStatus === 'Approved' ? 100 : 70, status: localProject.mhadaStatus === 'Approved' ? 'Completed' : 'Active', block: 'Permitting' },
    { name: 'PAAA Individual Tenant Execution', date: '2025-11-01', progress: 50, status: 'Active', block: 'Permitting' },
    { name: 'Commencement Certificate (Plinth CC)', date: '2026-01-20', progress: 0, status: 'Upcoming', block: 'Excavation' },
    { name: 'Vertical Structural RCC framing', date: '2026-08-30', progress: 0, status: 'Upcoming', block: 'RCC Frame' },
    { name: 'Occupancy Certificate (OC) Filing & Handover', date: '2027-02-15', progress: 0, status: 'Upcoming', block: 'Handover' },
  ];

  // Approvals State
  const [approvalsList, setApprovalsList] = useState([
    { id: 'app-1', stage: 'MHADA Redevelopment NOC', status: localProject.mhadaStatus || 'Approved', date: '2025-04-12', docRef: 'MHD-REDEV-2025-492' },
    { id: 'app-2', stage: 'BMC Building Intimation (IOD)', status: localProject.iodStatus === 'Issued' ? 'Approved' : 'In Review', date: '2025-09-02', docRef: 'IOD-BMC-WS-2309' },
    { id: 'app-3', stage: 'Plinth Commencement Certificate (CC)', status: localProject.ccStatus === 'Plinth CC Issued' ? 'Approved' : 'Pending', date: '2026-01-10', docRef: 'CC-BMC-Z-IV-912' },
    { id: 'app-4', stage: 'PAAA Tenant Registrations', status: 'In Review', date: '2025-11-20', docRef: 'PAAA-REG-WORLI' },
    { id: 'app-5', stage: 'MahaRERA Registration Certificate', status: 'Approved', date: '2025-10-05', docRef: 'RERA-P51800099812' },
    { id: 'app-6', stage: 'Occupancy Certificate (OC)', status: 'Not Started', date: '2027-02-15', docRef: 'Pending Completion' },
  ]);

  // Document Vault State
  const [docsList, setDocsList] = useState<DocumentFile[]>([
    { id: 'pd-1', name: 'MHADA Tripartite Development Agreement.pdf', folder: 'Contracts', size: '14.2 MB', uploadedBy: 'Sarah Chen (PM)', uploadedAt: '2025-06-12', status: 'Approved', version: 'v2.1.0', expiryDate: '2030-06-12' },
    { id: 'pd-2', name: 'Worli Block A1 Pile Loading Layout drawing.dwg', folder: 'Drawings', size: '8.4 MB', uploadedBy: 'Pranav Shah (Eng)', uploadedAt: '2025-09-01', status: 'Approved', version: 'v1.4', tags: ['Structural', 'Drawings'] },
    { id: 'pd-3', name: 'Corpus Fund Escrow Bank Guarantee Letter.pdf', folder: 'Permits', size: '3.1 MB', uploadedBy: 'Elena Rodriguez', uploadedAt: '2025-10-14', status: 'Approved', version: 'v1.0', expiryDate: localProject.bankGuaranteeExpiry || '2027-03-31', tags: ['Finance', 'Guarantee'] },
    { id: 'pd-4', name: 'BMC IOD Approval Notice & Annexure II.pdf', folder: 'Permits', size: '11.8 MB', uploadedBy: 'Sarah Chen (PM)', uploadedAt: '2025-09-02', status: 'Approved', version: 'v1.0', tags: ['BMC', 'IOD'] },
  ]);

  // Invoice State
  const [invoices, setInvoices] = useState([
    { id: 'inv-101', num: 'INV-2025-081', desc: 'PMC Milestone 2 Architectural Feasibility', amount: '₹18,50,000', status: 'Paid', date: '2025-04-10' },
    { id: 'inv-102', num: 'INV-2025-114', desc: 'MHADA NOC Application Liaison Fee', amount: '₹8,40,000', status: 'Paid', date: '2025-07-22' },
    { id: 'inv-103', num: 'INV-2025-204', desc: 'Slab structural audit fee block B', amount: '₹12,00,000', status: 'Unpaid', date: '2025-10-15' },
    { id: 'inv-104', num: 'INV-2025-298', desc: 'Soil load bearing pile loading test invoice', amount: '₹4,50,000', status: 'Overdue', date: '2025-11-10' },
  ]);

  // Site photos log state
  const [sitePhotos, setSitePhotos] = useState([
    { id: 'sp-1', title: 'Piling machine calibration check', loc: 'Southwest Gate piling point', date: '2026-07-10', user: 'Pranav Patel (Engineer)', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80' },
    { id: 'sp-2', title: 'Excavation depth validation Block A', loc: 'Central cluster A2', date: '2026-07-08', user: 'Pranav Patel (Engineer)', url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80' },
  ]);

  // Security Verification Guard (RBAC Verification - Task 2)
  const verifyRBAC = (allowedRoles: UserRole[], actionDescription: string, onSuccess: () => void) => {
    if (!allowedRoles.includes(currentRole)) {
      showToast(`Access Denied: Your current role '${currentRole}' is not authorized to ${actionDescription}.`, 'error');
      return;
    }
    
    // Require a mandatory change reason for critical actions (Task 4 constraint)
    setPendingAction(() => onSuccess);
    setShowAuditPrompt(true);
  };

  const handleExecutePendingAction = () => {
    if (!auditComment.trim()) {
      showToast('A mandatory audit comment/reason is required to execute state changes.', 'warning');
      return;
    }
    
    if (pendingAction) {
      pendingAction();
    }
    
    setShowAuditPrompt(false);
    setAuditComment('');
    setPendingAction(null);
  };

  // 1. Interactive tenant consent change (Task 2 & 7)
  const toggleConsent = (id: string) => {
    verifyRBAC(['Director', 'Project Manager', 'Admin'], 'toggle tenant consent status', () => {
      const target = consentList.find(c => c.id === id);
      const oldStatus = target?.status;
      let nextStatus: 'Signed' | 'Pending' | 'Refused' = 'Signed';
      if (oldStatus === 'Signed') nextStatus = 'Pending';
      else if (oldStatus === 'Pending') nextStatus = 'Refused';
      
      setConsentList(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, status: nextStatus, hardshipRent: nextStatus === 'Signed' ? 'Disbursed' : 'Withheld' };
        }
        return c;
      }));

      // Re-calculate local project percentage dynamically!
      const signedCount = consentList.filter(c => c.id === id ? nextStatus === 'Signed' : c.status === 'Signed').length;
      const pct = Math.round((signedCount / consentList.length) * 100);
      setLocalProject(p => ({ ...p, tenantConsentPct: pct }));

      onLogAudit(
        'UPDATE', 
        'Consent', 
        auditComment, 
        `Member ${target?.name} status: ${oldStatus}`, 
        `Member ${target?.name} status: ${nextStatus}`
      );
      showToast(`Tenant consent status for ${target?.name} updated to ${nextStatus}!`, 'success');
    });
  };

  // 2. Interactive approval status change (Task 2 & 7)
  const toggleApprovalStatus = (id: string) => {
    verifyRBAC(['Director', 'Project Manager', 'Admin'], 'update MHADA/BMC clearance status', () => {
      const target = approvalsList.find(a => a.id === id);
      const oldStatus = target?.status;
      const nextStatus = oldStatus === 'Approved' ? 'In Review' : oldStatus === 'In Review' ? 'Pending' : 'Approved';

      setApprovalsList(prev => prev.map(a => {
        if (a.id === id) return { ...a, status: nextStatus };
        return a;
      }));

      // Update mapped status on project fields dynamically!
      if (id === 'app-1') setLocalProject(p => ({ ...p, mhadaStatus: nextStatus as any }));
      if (id === 'app-2') setLocalProject(p => ({ ...p, iodStatus: nextStatus === 'Approved' ? 'Issued' : 'In Review' }));
      if (id === 'app-3') setLocalProject(p => ({ ...p, ccStatus: nextStatus === 'Approved' ? 'Plinth CC Issued' : 'Pending Plinth' }));

      onLogAudit(
        'APPROVE',
        'Approval',
        auditComment,
        `${target?.stage} status: ${oldStatus}`,
        `${target?.stage} status: ${nextStatus}`
      );
      showToast(`Clearance: "${target?.stage}" updated successfully.`, 'success');
    });
  };

  // 3. Mark invoice as paid (Task 2 Roles: Accountant, Director, Admin)
  const toggleInvoicePayment = (id: string) => {
    verifyRBAC(['Accountant', 'Director', 'Admin'], 'change invoice payment status', () => {
      const target = invoices.find(inv => inv.id === id);
      const oldStatus = target?.status;
      const nextStatus = oldStatus === 'Paid' ? 'Unpaid' : 'Paid';

      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) return { ...inv, status: nextStatus };
        return inv;
      }));

      onLogAudit(
        'UPDATE',
        'Invoice',
        auditComment,
        `Invoice ${target?.num} payment: ${oldStatus}`,
        `Invoice ${target?.num} payment: ${nextStatus}`
      );
      showToast(`Invoice ${target?.num} marked as ${nextStatus}!`, 'success');
    });
  };

  // 4. File upload (Task 2 Roles: Site Engineer, PM, Admin)
  const [simulatedDocName, setSimulatedDocName] = useState('');
  const [simulatedFolder, setSimulatedFolder] = useState<'Drawings' | 'Permits' | 'Contracts' | 'Reports'>('Drawings');

  const handleSimulatedDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedDocName) {
      showToast('Please specify a filename to register document.', 'warning');
      return;
    }

    verifyRBAC(['Site Engineer', 'Project Manager', 'Admin'], 'upload document to secure registry', () => {
      const freshDoc: DocumentFile = {
        id: `pd-${Math.random().toString(36).substring(2, 6)}`,
        name: simulatedDocName.endsWith('.pdf') ? simulatedDocName : `${simulatedDocName}.pdf`,
        folder: simulatedFolder,
        size: '1.2 MB',
        uploadedBy: `Simulated User (${currentRole})`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'In Review',
        version: 'v1.0.0',
        tags: [simulatedFolder, 'Uploaded']
      };

      setDocsList(prev => [freshDoc, ...prev]);
      onLogAudit(
        'CREATE',
        'Document',
        auditComment,
        'None',
        `File added: ${freshDoc.name} in category ${simulatedFolder}`
      );
      setSimulatedDocName('');
      showToast(`Document "${freshDoc.name}" uploaded. Sent to Director for validation approval.`, 'success');
    });
  };

  // 5. Site Photo logging (Task 2 Roles: Site Engineer, Admin)
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoLoc, setNewPhotoLoc] = useState('');

  const handleAddSitePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle || !newPhotoLoc) {
      showToast('Please fill out site photo title and camera coordinates location.', 'warning');
      return;
    }

    verifyRBAC(['Site Engineer', 'Admin'], 'submit site engineer daily progress photograph', () => {
      const freshPhoto = {
        id: `sp-${Math.random().toString(36).substring(2, 6)}`,
        title: newPhotoTitle,
        loc: newPhotoLoc,
        date: new Date().toISOString().split('T')[0],
        user: `Site Engineer (${currentRole})`,
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
      };

      setSitePhotos(prev => [freshPhoto, ...prev]);
      
      // Also update vertical completion progress slightly!
      setLocalProject(p => ({ ...p, verticalProgress: Math.min(p.verticalProgress + 5, 100) }));

      onLogAudit(
        'CREATE',
        'Site Log',
        auditComment,
        'None',
        `Site photo logged: ${newPhotoTitle} at ${newPhotoLoc}`
      );

      setNewPhotoTitle('');
      setNewPhotoLoc('');
      showToast(`Site Photo recorded. PMC Progress Feed synchronized.`, 'success');
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans animate-fade-in relative">
      
      {/* Back to Portfolio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer bg-white px-3.5 py-2 border border-slate-200/80 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio List
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-100 rounded-xl shadow-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>PMC Authorization context: <strong>{currentRole}</strong> permissions active</span>
        </div>
      </div>

      {/* Primary Project Hero Info Panel */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-8 flex flex-col lg:flex-row gap-6">
        {localProject.imageUrl && (
          <img 
            src={localProject.imageUrl} 
            alt={localProject.name} 
            referrerPolicy="no-referrer"
            className="w-full lg:w-48 h-40 object-cover rounded-2xl bg-slate-100 shrink-0 border border-slate-100"
          />
        )}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              localProject.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              localProject.status === 'delayed' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
              'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {localProject.status} status
            </span>
            <span className="text-[9px] font-extrabold bg-slate-100 text-slate-700 uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200/40">
              {localProject.stage}
            </span>
            <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-100/40 font-mono">
              RERA: {localProject.reraNumber || 'P51800099142'}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-2 leading-tight">
            {localProject.name}
          </h1>
          <p className="text-slate-500 text-xs mb-4 max-w-3xl leading-relaxed">{localProject.description}</p>

          {/* Key Redevelopment Metadata Badges (Task 7) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MHADA Status</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{localProject.mhadaStatus || 'Approved'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BMC Intimation</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{localProject.iodStatus === 'Issued' ? 'IOD Issued' : 'In Review'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CC Permit</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{localProject.ccStatus || 'Pending Plinth'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Litigation</p>
              <p className={`text-xs font-bold mt-0.5 ${localProject.litigationStatus !== 'None' ? 'text-red-600' : 'text-slate-800'}`}>
                {localProject.litigationStatus || 'None'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RERA Certificate</p>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">{localProject.reraStatus || 'Registered'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timeline Deadline</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">{localProject.deadline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PMC Redevelopment Financial & Tenant Consent Ledger Banners (Task 7 & 8) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Tenant Consent Dial */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/40 border border-blue-100/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tenant Consent</p>
            <p className="text-lg font-bold text-blue-900 mt-0.5">{localProject.tenantConsentPct || 85}% Obtained</p>
            <span className="text-[9px] text-blue-600 font-semibold">Requirement: 70% threshold</span>
          </div>
        </div>

        {/* Corpus Fund Balance */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/40 border border-emerald-100/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Corpus Fund Balance</p>
            <p className="text-lg font-bold text-emerald-900 mt-0.5">{localProject.corpusFundBalance || '₹2.45 Crore'}</p>
            <span className="text-[9px] text-emerald-600 font-semibold">Held securely in PMC Escrow</span>
          </div>
        </div>

        {/* Bank Guarantee Amount */}
        <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/40 border border-purple-100/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bank Guarantee</p>
            <p className="text-lg font-bold text-purple-900 mt-0.5">{localProject.bankGuaranteeAmount || '₹5.00 Crore'}</p>
            <span className="text-[9px] text-purple-600 font-semibold font-mono">Expires: {localProject.bankGuaranteeExpiry || '2027-03-31'}</span>
          </div>
        </div>

        {/* Hardship Rent Status */}
        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/40 border border-amber-100/80 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hardship Rent Status</p>
            <p className="text-lg font-bold text-amber-900 mt-0.5">{localProject.hardshipRentStatus || 'Disbursed Up-to-date'}</p>
            <span className="text-[9px] text-amber-600 font-semibold">Compensating project-affected area</span>
          </div>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-0.5 mb-6 gap-2 shrink-0 scrollbar-none">
        {[
          { id: 'timeline', label: 'Milestone Gantt', icon: Calendar },
          { id: 'approvals', label: 'Clearance Status', icon: CheckCircle },
          { id: 'risks', label: 'Risk Mitigation', icon: AlertOctagon },
          { id: 'documents', label: 'Document Vault', icon: FileText },
          { id: 'consent', label: 'Society & Consent', icon: Users },
          { id: 'site', label: 'Site Progress Logs', icon: Image },
          { id: 'payments', label: 'Finance & Invoices', icon: Coins },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 font-sans text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Rendering Framework */}
      <div className="min-h-[300px]">
        
        {/* TAB 1: MILESTONE GANTT TIMELINE (Task 3 & 7) */}
        {activeSubTab === 'timeline' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Redevelopment Milestone Schedule</h3>
                <p className="text-xs text-slate-400 mt-0.5">Visual PMC critical-path monitoring & regulatory progression timelines.</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 bg-blue-500 rounded-xs"></span> Planning</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs"></span> Permitting</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span> Engineering</span>
              </div>
            </div>

            {/* Gantt List Visual Container */}
            <div className="space-y-4">
              {milestones.map((ms, index) => {
                let colorClass = 'bg-blue-500';
                if (ms.block === 'Permitting') colorClass = 'bg-indigo-500';
                if (ms.block === 'Excavation' || ms.block === 'RCC Frame' || ms.block === 'Handover') colorClass = 'bg-emerald-500';

                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="md:col-span-4 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{ms.name}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">{ms.block} block</span>
                    </div>
                    
                    {/* Gantt Bar Simulation */}
                    <div className="md:col-span-5">
                      <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                          style={{ width: `${ms.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-left md:text-right">
                      <span className="text-[11px] font-mono font-bold text-slate-500">{ms.date}</span>
                    </div>

                    <div className="md:col-span-1 text-right">
                      <span className={`text-[10px] font-bold ${
                        ms.status === 'Completed' ? 'text-emerald-600' :
                        ms.status === 'Active' ? 'text-blue-600' :
                        'text-slate-400'
                      }`}>
                        {ms.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CLEARANCE STATUS CHECKLIST (Task 3 & 7) */}
        {activeSubTab === 'approvals' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Mumbai Regulatory Clearances Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Checklist of active redevelopment permissions from MHADA, BMC, and RERA boards.</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded border border-slate-100">
                Liaison Action Required
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvalsList.map(app => (
                <div key={app.id} className="p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-all flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{app.stage}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Reference ID: {app.docRef}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Board target deadline: <strong className="font-mono">{app.date}</strong></p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      app.status === 'Approved' || app.status === 'NOC Obtained' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      app.status === 'In Review' || app.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {app.status}
                    </span>

                    {/* Toggle Button for roles with clearance authority */}
                    <button
                      onClick={() => toggleApprovalStatus(app.id)}
                      className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 hover:underline cursor-pointer"
                    >
                      Cycle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RISK MITIGATION (Task 3) */}
        {activeSubTab === 'risks' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Active Risk & Mitigation Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5">Strict PM risk-score indexing (Probability x Impact) with assignees.</p>
              </div>
              <button
                onClick={() => verifyRBAC(['Project Manager', 'Director', 'Admin'], 'log a new risk', () => {
                  showToast('Add Risk wizard opened. Simulated successfully.', 'info');
                })}
                className="flex items-center gap-1 bg-slate-900 text-white font-sans text-[11px] font-bold px-3.5 py-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Log Risk
              </button>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Tree Authority Clearance Query', category: 'PERMIT', prob: 4, imp: 5, mitigation: 'Appoint local liaison counsel to file Tree Board compliance statement. Submit compensatory plantation deposit at Thane office.', owner: 'Sarah Chen' },
                { title: 'Plinth CC Liaison delay at BMC Ward G/S', category: 'PERMIT', prob: 3, imp: 4, mitigation: 'Liaise directly with Assistant Municipal Commissioner. Verify BMC auto-DCR telemetry portal checks.', owner: 'Pranav Shah' },
                { title: 'High Hardship Rent Escrow Demands', category: 'FINANCIAL', prob: 2, imp: 3, mitigation: 'Negotiate bulk escrow deposit with Central Bank of India for bulk BG leverage rates.', owner: 'Elena Rodriguez' }
              ].map((risk, idx) => {
                const score = risk.prob * risk.imp;
                return (
                  <div key={idx} className="p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[9px] font-extrabold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Risk Score: {score}
                        </span>
                        <span className="text-[9px] font-extrabold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                          {risk.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Assigned: {risk.owner}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{risk.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed"><strong className="text-slate-700">Mitigation:</strong> {risk.mitigation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENT VAULT (Task 3) */}
        {activeSubTab === 'documents' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Repository Grid */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Secure Project Documentation Vault</h3>
                
                <div className="space-y-3">
                  {docsList.map(doc => (
                    <div key={doc.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.5 rounded">
                            {doc.folder}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{doc.version}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => showToast(`Initiated download for secure file "${doc.name}"`, 'success')}
                          className="p-1.5 hover:bg-slate-50 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Simulated Upload Portal */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Upload Document Portal
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  Site Engineers can submit contractor drawings or permits. Action will require audit reason.
                </p>

                <form onSubmit={handleSimulatedDocUpload} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Document Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Block A Pile Loading Test" 
                      value={simulatedDocName}
                      onChange={(e) => setSimulatedDocName(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Vault Folder</label>
                    <select
                      value={simulatedFolder}
                      onChange={(e) => setSimulatedFolder(e.target.value as any)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="Drawings">Drawings & Blueprints</option>
                      <option value="Permits">Permits & Approvals</option>
                      <option value="Contracts">Contracts & JDA</option>
                      <option value="Reports">PMC Reports</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Register Document File
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SOCIETY & TENANT CONSENT (Task 3 & 7) */}
        {activeSubTab === 'consent' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Society Redevelopment Tenant Consent Registry</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track individual unit sign-offs and hardship rent disbursement status.</p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl">
                Real-Time Sync active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Unit / Chawl No.</th>
                    <th className="py-3 px-4">Carpet Area</th>
                    <th className="py-3 px-4">Hardship Rent</th>
                    <th className="py-3 px-4">Consent Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consentList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{item.unit}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{item.area}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          item.hardshipRent === 'Disbursed' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.hardshipRent === 'Disbursed' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {item.hardshipRent}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          item.status === 'Signed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleConsent(item.id)}
                          className="text-[10px] font-extrabold uppercase text-blue-600 hover:underline cursor-pointer"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SITE PROGRESS LOGS (Task 3 & 5) */}
        {activeSubTab === 'site' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Progress Photos Log */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Site Engineering Photo Logs</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sitePhotos.map(photo => (
                    <div key={photo.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-200 transition-all">
                      <img 
                        src={photo.url} 
                        alt={photo.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-32 object-cover bg-slate-50 border-b border-slate-100"
                      />
                      <div className="p-3.5">
                        <p className="text-xs font-bold text-slate-800">{photo.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{photo.loc}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 text-[10px] text-slate-500">
                          <span>By: {photo.user}</span>
                          <span className="font-mono">{photo.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Site Log Submit Form */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-blue-600" />
                  Submit Daily Log & Photo
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  Site Engineers must upload verification photos from tablet/mobile for visual audit logs.
                </p>

                <form onSubmit={handleAddSitePhoto} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Progress Title / Activity</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Concrete slab casting A1" 
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Camera Location Coordinates</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Block A, 3rd Floor Slab" 
                      value={newPhotoLoc}
                      onChange={(e) => setNewPhotoLoc(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Submit Site Photo Entry
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: FINANCE & INVOICES (Task 3 & 8) */}
        {activeSubTab === 'payments' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Financial Ledger & Invoices Tracking</h3>
                <p className="text-xs text-slate-400 mt-0.5">Approved PMC milestone invoices, vendor payouts, and escrow allocations.</p>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Total Overdue Invoices: <strong className="text-red-600 text-sm">₹4,50,000</strong>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Milestone Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">{inv.num}</td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.desc}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{inv.amount}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          inv.status === 'Unpaid' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleInvoicePayment(inv.id)}
                          className="text-[10px] font-extrabold uppercase text-blue-600 hover:underline cursor-pointer"
                        >
                          Change Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- AUDIT TRAIL REASON POPUP MODAL (Task 4 Validation Constraint) --- */}
      <AnimatePresence>
        {showAuditPrompt && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl p-6"
            >
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">MANDATORY AUDIT TRAIL COMMENT</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Strict PMC compliance regulations mandate logging a reason/comment for modifying development agreements, consent forms, clearances, or files.
              </p>

              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for change</label>
                <textarea
                  required
                  placeholder="e.g. Member submitted physically witnessed sign-off form in PMC office."
                  value={auditComment}
                  onChange={(e) => setAuditComment(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl h-20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuditPrompt(false);
                    setAuditComment('');
                    setPendingAction(null);
                    showToast('Action aborted by user constraint.', 'info');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecutePendingAction}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Confirm & Audit Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
