/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  X, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { Project } from '../types';
import { motion } from 'motion/react';

export interface RiskItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: 'Rare' | 'Possible' | 'Likely' | 'Almost Certain';
  mitigation: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  dueDate?: string;
  likelihoodScore?: number;       // 1 (Rare) to 4 (Almost Certain)
  impactScore?: number;           // 1 (Low) to 4 (Critical)
  mitigationOwner?: string;       // Owner of mitigation
  residualRisk?: 'Low' | 'Medium' | 'High';
  escalationPath?: string;        // Path to escalate
}

interface RisksViewProps {
  projects: Project[];
  activeProject: Project | null;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const INITIAL_RISKS: RiskItem[] = [
  {
    id: "risk-1",
    projectId: "BDD-NG",
    projectName: "BDD Naigaon Cluster C",
    title: "Regulatory Height Permission Delay",
    severity: "CRITICAL",
    likelihood: "Almost Certain",
    mitigation: "Escalate tree authority board layout dossier directly to Deputy Municipal Commissioner level.",
    status: "OPEN",
    dueDate: "2023-10-25",
    likelihoodScore: 4,
    impactScore: 4,
    mitigationOwner: "Elena Rodriguez",
    residualRisk: "Medium",
    escalationPath: "Municipal Commissioner & Tree Board Chairman"
  },
  {
    id: "risk-2",
    projectId: "HBR-II",
    projectName: "Harbor Ridge Phase II",
    title: "Freeway Convoy Blockage",
    severity: "HIGH",
    likelihood: "Possible",
    mitigation: "Pre-clear material transportation times with Traffic Police Commissioner and leverage off-peak window routes.",
    status: "UNDER_REVIEW",
    dueDate: "2023-11-05",
    likelihoodScore: 2,
    impactScore: 3,
    mitigationOwner: "Amit Kulkarni",
    residualRisk: "Low",
    escalationPath: "State Traffic Regulatory Authority"
  },
  {
    id: "risk-3",
    projectId: "BDD-04",
    projectName: "Worli BDD 04 Redevelopment",
    title: "Structural Slab Concrete Strength Variance",
    severity: "MEDIUM",
    likelihood: "Possible",
    mitigation: "On-site core slump testing for every truck load, plus 28-day concrete cube compression validation.",
    status: "RESOLVED",
    dueDate: "2023-09-18",
    likelihoodScore: 2,
    impactScore: 2,
    mitigationOwner: "Arthur Vance",
    residualRisk: "Low",
    escalationPath: "Lead Structural Audit Bureau"
  },
  {
    id: "risk-4",
    projectId: "BDD-04",
    projectName: "Worli BDD 04 Redevelopment",
    title: "Tenant Rehabilitation Resistance",
    severity: "CRITICAL",
    likelihood: "Likely",
    mitigation: "Conduct weekly bimonthly townhalls and expedite legal agreement execution with standard MHADA sign-off guarantees.",
    status: "OPEN",
    dueDate: "2023-11-12",
    likelihoodScore: 3,
    impactScore: 4,
    mitigationOwner: "Sarah Connor",
    residualRisk: "Medium",
    escalationPath: "MHADA Joint CEO & Legal Counselor"
  },
  {
    id: "risk-5",
    projectId: "HBR-II",
    projectName: "Harbor Ridge Phase II",
    title: "Coastal Tide Ingress in Basement Pile Cap",
    severity: "HIGH",
    likelihood: "Likely",
    mitigation: "Employ advanced bentonite-slurry continuous piling drills and install dynamic sub-slab dewatering pumps.",
    status: "OPEN",
    dueDate: "2023-10-30",
    likelihoodScore: 3,
    impactScore: 3,
    mitigationOwner: "Arthur Vance",
    residualRisk: "Medium",
    escalationPath: "Port Trust Hydro-Engineering Advisory Board"
  }
];

export default function RisksView({ projects, activeProject, showToast }: RisksViewProps) {
  // Persistence with localStorage
  const [risks, setRisks] = useState<RiskItem[]>(() => {
    const saved = localStorage.getItem('toughcons_risks_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0 && !parsed[0].mitigationOwner) {
        return INITIAL_RISKS;
      }
      return parsed;
    }
    return INITIAL_RISKS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Risk Form State
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState(activeProject?.id || projects[0]?.id || '');
  const [newSeverity, setNewSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newLikelihood, setNewLikelihood] = useState<'Rare' | 'Possible' | 'Likely' | 'Almost Certain'>('Possible');
  const [newMitigation, setNewMitigation] = useState('');
  const [newDueDate, setNewDueDate] = useState('2023-12-31');
  
  // Custom scoring, owner, residual risk, and escalation states
  const [newLikelihoodScore, setNewLikelihoodScore] = useState<number>(2);
  const [newImpactScore, setNewImpactScore] = useState<number>(2);
  const [newMitigationOwner, setNewMitigationOwner] = useState<string>('Arthur Vance');
  const [newResidualRisk, setNewResidualRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [newEscalationPath, setNewEscalationPath] = useState<string>('Standard Engineering Escalation Path');

  // Sync to local storage
  const saveRisks = (updatedRisks: RiskItem[]) => {
    setRisks(updatedRisks);
    localStorage.setItem('toughcons_risks_v1', JSON.stringify(updatedRisks));
  };

  const handleAddRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMitigation) {
      if (showToast) {
        showToast('Please fill out risk title and mitigation strategy.', 'error');
      }
      return;
    }

    const matchedProj = projects.find(p => p.id === newProject);
    const fresh: RiskItem = {
      id: `risk-${Date.now()}`,
      projectId: newProject,
      projectName: matchedProj ? matchedProj.name : "Portfolio Project",
      title: newTitle,
      severity: newSeverity,
      likelihood: newLikelihood,
      mitigation: newMitigation,
      status: "OPEN",
      dueDate: newDueDate,
      likelihoodScore: Number(newLikelihoodScore),
      impactScore: Number(newImpactScore),
      mitigationOwner: newMitigationOwner,
      residualRisk: newResidualRisk,
      escalationPath: newEscalationPath
    };

    const nextRisks = [fresh, ...risks];
    saveRisks(nextRisks);

    if (showToast) {
      showToast(`Risk "${fresh.title}" logged successfully.`, 'success');
    }

    // Reset Form
    setNewTitle('');
    setNewMitigation('');
    setNewMitigationOwner('Arthur Vance');
    setNewResidualRisk('Low');
    setNewEscalationPath('Standard Engineering Escalation Path');
    setNewLikelihoodScore(2);
    setNewImpactScore(2);
    setShowAddModal(false);
  };

  const handleUpdateStatus = (id: string, status: RiskItem['status']) => {
    const nextRisks = risks.map(r => r.id === id ? { ...r, status } : r);
    saveRisks(nextRisks);
  };

  // Filtered risks
  const filteredRisks = risks.filter(risk => {
    const matchSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      risk.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.mitigation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSeverity = severityFilter === 'ALL' || risk.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || risk.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  // Calculate severity stats
  const criticalCount = risks.filter(r => r.severity === 'CRITICAL' && r.status !== 'RESOLVED').length;
  const highCount = risks.filter(r => r.severity === 'HIGH' && r.status !== 'RESOLVED').length;
  const mediumCount = risks.filter(r => r.severity === 'MEDIUM' && r.status !== 'RESOLVED').length;
  const lowCount = risks.filter(r => r.severity === 'LOW' && r.status !== 'RESOLVED').length;

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
          <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">REGULATORY &amp; CONSTRUTION RISK</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Risk Register Matrix</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/15 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Project Risk
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)]">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Critical Risks Active</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-red-600">{criticalCount}</span>
            <span className="text-[10px] text-red-500 font-bold uppercase bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Immediate Action</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)]">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">High Risks Active</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-amber-600">{highCount}</span>
            <span className="text-[10px] text-amber-600 font-bold uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Monitoring</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)]">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Medium Risks Active</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-slate-700">{mediumCount}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Controlled</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-[6px_6px_5px_rgba(0,0,0,0.15)]">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Low Risks Active</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-3xl font-black text-emerald-600">{lowCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Resolved</span>
          </div>
        </div>
      </div>

      {/* Interactive Risk Matrix Grid Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Risk Register Table Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Operational Risk Register</h3>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                placeholder="Search risk registers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table Controls (Filters) */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/20 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
            <div className="flex gap-1">
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    severityFilter === sev 
                      ? 'bg-slate-900 border-transparent text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-auto">Status:</span>
            <div className="flex gap-1">
              {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-blue-600 border-transparent text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[18%]">Project Context</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[22%]">Risk / Factor</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center w-[18%]">Scoring Matrix (L x I)</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[28%]">Mitigation Safeguards</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[14%]">Response status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRisks.length > 0 ? (
                  filteredRisks.map((risk) => {
                    // Compute dynamic scores
                    const lScore = risk.likelihoodScore || (risk.likelihood === 'Almost Certain' ? 4 : risk.likelihood === 'Likely' ? 3 : risk.likelihood === 'Possible' ? 2 : 1);
                    const iScore = risk.impactScore || (risk.severity === 'CRITICAL' ? 4 : risk.severity === 'HIGH' ? 3 : risk.severity === 'MEDIUM' ? 2 : 1);
                    const totalScore = lScore * iScore;

                    // Compute score badges
                    let scoreClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    let scoreLabel = 'Low Risk';
                    if (totalScore >= 13) {
                      scoreClass = 'bg-red-50 text-red-600 border-red-100 animate-pulse';
                      scoreLabel = 'Critical Risk';
                    } else if (totalScore >= 10) {
                      scoreClass = 'bg-orange-50 text-orange-700 border-orange-100';
                      scoreLabel = 'High Risk';
                    } else if (totalScore >= 5) {
                      scoreClass = 'bg-amber-50 text-amber-700 border-amber-100';
                      scoreLabel = 'Medium Risk';
                    }

                    return (
                      <tr key={risk.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">{risk.projectName}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">{risk.projectId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-900 leading-tight block">{risk.title}</span>
                          {risk.dueDate && (
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 font-mono">📅 Due: {risk.dueDate}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="text-[11px] font-mono font-bold text-slate-700">
                              {lScore} <span className="text-slate-400">×</span> {iScore} <span className="text-slate-400">=</span> <span className="text-slate-900 underline decoration-dotted font-black">{totalScore}</span>
                            </span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${scoreClass}`}>
                              {scoreLabel}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">L: {risk.likelihood}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 space-y-2">
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">{risk.mitigation}</p>
                          
                          {/* Owner, Residual Risk & Escalation Meta block */}
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] space-y-1 text-slate-500 font-semibold">
                            <div className="flex justify-between">
                              <span>Mitigation Owner: <strong className="text-slate-700">{risk.mitigationOwner || 'Arthur Vance'}</strong></span>
                              <span>Residual Risk: <span className={`px-1.5 py-0.1 rounded-md text-[9px] font-bold border ${
                                risk.residualRisk === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                risk.residualRisk === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>{risk.residualRisk || 'Low'}</span></span>
                            </div>
                            {risk.escalationPath && (
                              <div className="text-slate-400 font-medium pt-1 border-t border-slate-200/60 truncate" title={risk.escalationPath}>
                                📢 Escalation Path: <strong className="text-blue-600 font-bold">{risk.escalationPath}</strong>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <select
                            value={risk.status}
                            onChange={(e) => handleUpdateStatus(risk.id, e.target.value as RiskItem['status'])}
                            className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer transition-all ${
                              risk.status === 'RESOLVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              risk.status === 'UNDER_REVIEW' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              'bg-red-50 border-red-200 text-red-600'
                            }`}
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-medium">
                      No matching risk factors located in portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5x5 Heat Map Visualizer (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Risk Matrix Heat Map</h4>
            <span title="Impact vs. Likelihood"><HelpCircle className="w-4 h-4 text-slate-400 cursor-help" /></span>          </div>

          {/* Simple 3x3 Heat Matrix representation */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Top labels */}
              <div className="text-[9px] font-bold text-slate-400 uppercase pt-2">L / I</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase pt-2 bg-slate-50 rounded-lg">Low</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase pt-2 bg-slate-50 rounded-lg">Med</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase pt-2 bg-slate-50 rounded-lg">High</div>

              {/* Row 1 */}
              <div className="text-[9px] font-bold text-slate-400 uppercase text-left flex items-center bg-slate-50 px-1 rounded-lg">Certain</div>
              <div className="h-10 bg-amber-200/80 rounded-xl border border-amber-300 flex items-center justify-center font-bold text-xs text-amber-800">M</div>
              <div className="h-10 bg-orange-400/80 rounded-xl border border-orange-500 flex items-center justify-center font-bold text-xs text-white">H</div>
              <div className="h-10 bg-red-600 rounded-xl border border-red-700 flex items-center justify-center font-bold text-xs text-white">CRIT</div>

              {/* Row 2 */}
              <div className="text-[9px] font-bold text-slate-400 uppercase text-left flex items-center bg-slate-50 px-1 rounded-lg">Possible</div>
              <div className="h-10 bg-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-800">L</div>
              <div className="h-10 bg-amber-200/80 rounded-xl border border-amber-300 flex items-center justify-center font-bold text-xs text-amber-800">M</div>
              <div className="h-10 bg-orange-400/80 rounded-xl border border-orange-500 flex items-center justify-center font-bold text-xs text-white">H</div>

              {/* Row 3 */}
              <div className="text-[9px] font-bold text-slate-400 uppercase text-left flex items-center bg-slate-50 px-1 rounded-lg">Rare</div>
              <div className="h-10 bg-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-800">L</div>
              <div className="h-10 bg-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-800">L</div>
              <div className="h-10 bg-amber-200/80 rounded-xl border border-amber-300 flex items-center justify-center font-bold text-xs text-amber-800">M</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
              <span className="font-bold uppercase text-slate-700 text-[9px] tracking-wider block">Operational Safeguard Matrix</span>
              <p className="leading-relaxed">Any threat landing in the <strong className="text-red-600">CRIT (Critical Red Zone)</strong> triggers an automatic email alert dispatch sequence to the Redevelopment Director desk.</p>
            </div>
          </div>
        </div>

      </div>

      {/* NEW RISK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Log Project Risk Factor</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRiskSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk / Threat Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Tree Authority Clearance Delayed"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Scope</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Resolution Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity / Impact Class</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    value={newSeverity}
                    onChange={(e) => {
                      setNewSeverity(e.target.value as any);
                      const scores: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
                      setNewImpactScore(scores[e.target.value] || 2);
                    }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Likelihood of Occurrence</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    value={newLikelihood}
                    onChange={(e) => {
                      setNewLikelihood(e.target.value as any);
                      const scores: Record<string, number> = { Rare: 1, Possible: 2, Likely: 3, 'Almost Certain': 4 };
                      setNewLikelihoodScore(scores[e.target.value] || 2);
                    }}
                  >
                    <option value="Rare">Rare</option>
                    <option value="Possible">Possible</option>
                    <option value="Likely">Likely</option>
                    <option value="Almost Certain">Almost Certain</option>
                  </select>
                </div>
              </div>

              {/* Advanced Numerical Score Mapping & Mitigation Owner */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score Multipliers (L × I)</label>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none w-1/2"
                      value={newLikelihoodScore}
                      onChange={(e) => setNewLikelihoodScore(Number(e.target.value))}
                      title="Likelihood Score (1-4)"
                    >
                      <option value={1}>1 (Rare)</option>
                      <option value={2}>2 (Possible)</option>
                      <option value={3}>3 (Likely)</option>
                      <option value={4}>4 (Certain)</option>
                    </select>
                    <span className="text-slate-400 font-bold">×</span>
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none w-1/2"
                      value={newImpactScore}
                      onChange={(e) => setNewImpactScore(Number(e.target.value))}
                      title="Impact Score (1-4)"
                    >
                      <option value={1}>1 (Low)</option>
                      <option value={2}>2 (Medium)</option>
                      <option value={3}>3 (High)</option>
                      <option value={4}>4 (Critical)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mitigation Owner *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Arthur Vance"
                    value={newMitigationOwner}
                    onChange={(e) => setNewMitigationOwner(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residual Risk Level</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    value={newResidualRisk}
                    onChange={(e) => setNewResidualRisk(e.target.value as any)}
                  >
                    <option value="Low">Low Residual Risk</option>
                    <option value="Medium">Medium Residual Risk</option>
                    <option value="High">High Residual Risk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escalation Path / Contact</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. MHADA Executive Architect Desk"
                    value={newEscalationPath}
                    onChange={(e) => setNewEscalationPath(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mitigation Safeguards / Strategy *</label>
                <textarea
                  rows={2}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Detail explicit containment workflows or alternative procurement steps..."
                  value={newMitigation}
                  onChange={(e) => setNewMitigation(e.target.value)}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-relaxed font-semibold">
                <span className="text-slate-700 uppercase tracking-wider block mb-0.5">⚠️ Auto-Calculated Risk Index Warning</span>
                Score values above <strong className="text-red-600">10 (Likelihood × Impact)</strong> automatically escalate the notification sequence status.
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
                  Add Risk Factor
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
