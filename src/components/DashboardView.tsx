/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// This is DashboardView.tsx
import React from 'react';
import { 
  Layers, 
  Clock, 
  AlertTriangle, 
  ClipboardCheck, 
  Download, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  ArrowUp,
  Minus,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { Project, Alert, Meeting } from '../types';
import { motion } from 'motion/react';

interface DashboardViewProps {
  projects: Project[];
  alerts: Alert[];
  meetings: Meeting[];
  onReviewAlert: (alertId: string) => void;
  onOpenNewProjectModal: () => void;
  onNavigateToTab: (tabId: string) => void;
  onSelectMeeting: (meetingId: string) => void;
  onExportReport: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function DashboardView({
  projects,
  alerts,
  meetings,
  onReviewAlert,
  onOpenNewProjectModal,
  onNavigateToTab,
  onSelectMeeting,
  onExportReport,
  showToast,
}: DashboardViewProps) {
  const [actionsToday, setActionsToday] = React.useState([
    {
      id: 'act-1',
      title: 'Approve Coastal Tide Dewatering Plan',
      owner: 'Mark Thorne',
      dueDate: 'Today, 5:00 PM',
      reason: 'Critical: Coastal tide ingress at basement piling zone requires heavy-duty pumps clearance.',
      status: 'Pending',
    },
    {
      id: 'act-2',
      title: 'Sign-off Chawl 4B Consent Deed',
      owner: 'Anand Deshmukh',
      dueDate: 'Today, 2:00 PM',
      reason: 'Regulatory: Necessary to unlock the 51% MHADA redevelopment approval threshold.',
      status: 'Pending',
    },
    {
      id: 'act-3',
      title: 'Escalate Tree Height Clearance Dispute',
      owner: 'Elena Rodriguez',
      dueDate: 'Today, 6:00 PM',
      reason: 'Urgent: Naigaon Cluster C block A4 vertical pour held up due to Tree Board limits.',
      status: 'Pending',
    }
  ]);

  const handleActionClick = (id: string, actionType: 'APPROVE' | 'RESOLVE' | 'ESCALATE' | 'REASSIGN') => {
    setActionsToday(prev => prev.map(act => {
      if (act.id === id) {
        if (actionType === 'APPROVE' || actionType === 'RESOLVE') {
          return { ...act, status: 'Completed' as const };
        } else if (actionType === 'ESCALATE') {
          return { ...act, status: 'Escalated' as const, reason: 'Escalated to Deputy Commissioner. ' + act.reason };
        }
      }
      return act;
    }));
    if (showToast) {
      showToast(`Action executed successfully: ${actionType} on "${actionsToday.find(a => a.id === id)?.title}"`, 'success');
    }
  };

  // Calculate dynamic stats
  const activeCount = projects.filter(p => p.status === 'active').length;
  const delayedCount = projects.filter(p => p.status === 'delayed').length;
  const atRiskCount = projects.filter(p => p.status === 'at-risk').length;

  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');

  // Meeting filter: Next 4 meetings this week
  const upcomingMeetings = meetings
    .filter(m => m.status !== 'Completed')
    .slice(0, 4);

  // Group projects for Portfolio Stage Distribution
  const stageStats = {
    planning: projects.filter(p => p.stage.toLowerCase().includes('plan') || p.stage.toLowerCase().includes('permit')),
    groundwork: projects.filter(p => p.stage.toLowerCase().includes('ground') || p.stage.toLowerCase().includes('infra') || p.stage.toLowerCase().includes('excav')),
    vertical: projects.filter(p => p.stage.toLowerCase().includes('vert') || p.stage.toLowerCase().includes('construct') || p.stage.toLowerCase().includes('slab') || p.stage.toLowerCase().includes('rough')),
    handover: projects.filter(p => p.stage.toLowerCase().includes('hand') || p.stage.toLowerCase().includes('inspect') || p.stage.toLowerCase().includes('finish'))
  };

  const getStageDistribution = (stageProjects: Project[]) => {
    const total = stageProjects.length;
    if (total === 0) return { onTrack: 100, delayed: 0, critical: 0, count: 0 };
    
    const onTrack = stageProjects.filter(p => p.status === 'active' || p.status === 'completed').length;
    const delayed = stageProjects.filter(p => p.status === 'delayed').length;
    const critical = stageProjects.filter(p => p.status === 'at-risk').length;

    return {
      onTrack: Math.round((onTrack / total) * 100),
      delayed: Math.round((delayed / total) * 100),
      critical: Math.round((critical / total) * 100),
      count: total
    };
  };

  const planningDist = getStageDistribution(stageStats.planning);
  const groundworkDist = getStageDistribution(stageStats.groundwork);
  const verticalDist = getStageDistribution(stageStats.vertical);
  const handoverDist = getStageDistribution(stageStats.handover);
  const stageRows = [
    { label: 'Planning & Permitting', shortLabel: 'Planning', data: planningDist, accent: 'bg-blue-600', icon: '01' },
    { label: 'Groundwork & Infrastructure', shortLabel: 'Groundwork', data: groundworkDist, accent: 'bg-violet-600', icon: '02' },
    { label: 'Vertical Construction', shortLabel: 'Vertical build', data: verticalDist, accent: 'bg-cyan-600', icon: '03' },
    { label: 'Final Inspection & Handover', shortLabel: 'Handover', data: handoverDist, accent: 'bg-emerald-600', icon: '04' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="dashboard-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
    >
      
      {/* Welcome & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/70 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 tracking-widest uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Portfolio overview</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Director Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl">A clear view of today’s priority work, operational risks, and project delivery.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full md:w-auto">
          <button
            id="btn-export-report"
            onClick={onExportReport}
            className="justify-center flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-sans text-xs font-bold hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 transition-all cursor-pointer rounded-xl shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Report
          </button>
          <button
            id="btn-new-project"
            onClick={onOpenNewProjectModal}
            className="justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 hover:-translate-y-0.5 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 text-white" />
            New Project
          </button>
        </div>
      </div>


      {/* KPI Row */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Projects */}
        <div className="dashboard-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between rounded-2xl border-l-4 border-l-emerald-500 shadow-[6px_6px_5px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Projects</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{activeCount}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +2 this month
            </span>
          </div>
        </div>

        {/* KPI 2: Delayed */}
        <div className="dashboard-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between rounded-2xl border-l-4 border-l-amber-500 shadow-[6px_6px_5px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Delayed Tasks</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-amber-600">{delayedCount}</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
        </div>

        {/* KPI 3: At-Risk */}
        <div className="dashboard-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between rounded-2xl border-l-4 border-l-red-500 shadow-[6px_6px_5px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">At-Risk Constraints</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-red-600">{atRiskCount}</span>
            <span className="text-[10px] font-extrabold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Critical
            </span>
          </div>
        </div>

        {/* KPI 4: Pending Approvals */}
        <div className="dashboard-panel bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between rounded-2xl border-l-4 border-l-blue-600 shadow-[6px_6px_5px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-2 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Pending Approvals</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <span className="text-3xl font-extrabold text-slate-900">15</span>
            <span className="text-[11px] font-bold text-slate-500">
              4 overdue
            </span>
          </div>
        </div>
      </div>

      {/* WHAT NEEDS ACTION TODAY SECTION */}
      <div className="dashboard-panel bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
            </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">What Needs Action Today</h3>
          </div>
          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {actionsToday.filter(a => a.status === 'Pending').length} Pending Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 ">
          {actionsToday.map((act) => (
            <div 
              key={act.id} 
              className={`border rounded-xl p-5 flex flex-col justify-between transition-all shadow-[6px_6px_5px_rgba(0,0,0,0.15)] ${
                act.status === 'Completed' ? 'border-emerald-200 bg-emerald-50/10 opacity-75' :
                act.status === 'Escalated' ? 'border-indigo-200 bg-indigo-50/10' :
                'border-slate-200 hover:border-slate-300 bg-white' 
              }` }
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    act.status === 'Escalated' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {act.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{act.dueDate}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{act.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-semibold">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-700">
                      {act.owner[0]}
                    </div>
                    <span>Owner: {act.owner}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100/80 p-2.5 rounded-lg leading-relaxed font-semibold">
                  <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Reason</span>
                  {act.reason}
                </p>
              </div>

              {act.status === 'Pending' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleActionClick(act.id, 'APPROVE')}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-lg transition-all cursor-pointer text-center"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleActionClick(act.id, 'ESCALATE')}
                    className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer text-center"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => handleActionClick(act.id, 'RESOLVE')}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer text-center"
                  >
                    Resolve
                  </button>
                </div>
              )}

              {act.status === 'Completed' && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mt-4 pt-3 border-t border-slate-100/50 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Action Resolved
                </div>
              )}

              {act.status === 'Escalated' && (
                <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold mt-4 pt-3 border-t border-slate-100/50 justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" /> Escalated to DC Desk
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: At-Risk Alerts & Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Card: At-Risk Alerts */}
        <div className="dashboard-panel lg:col-span-8 bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-slate-800">At-Risk Alerts</h3>
            </div>
            <button 
              id="btn-view-all-alerts"
              onClick={() => onNavigateToTab('approvals')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">Project Name</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">Reason for Risk</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">Impact</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-900">
                        {alert.projectName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            alert.category === 'SUPPLY' ? 'bg-red-50 text-red-600' :
                            alert.category === 'PERMIT' ? 'bg-amber-50 text-amber-700' :
                            alert.category === 'LABOR' ? 'bg-orange-50 text-orange-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {alert.category}
                          </span>
                          <span className="text-xs text-slate-500 truncate max-w-[180px]">
                            {alert.reason}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold flex items-center gap-1 ${
                          alert.impact === 'Critical' ? 'text-red-600' :
                          alert.impact === 'High' ? 'text-orange-600' : 'text-amber-600'
                        }`}>
                          {alert.impact === 'Critical' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {alert.impact === 'High' && <ArrowUp className="w-3.5 h-3.5" />}
                          {alert.impact === 'Medium' && <Minus className="w-3.5 h-3.5" />}
                          {alert.impact}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onReviewAlert(alert.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      All systems nominal. No active alerts reported.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Meetings This Week */}
        <div className="dashboard-panel lg:col-span-4 bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-800">Meetings This Week</h3>
            </div>
            <button 
              id="btn-view-all-meetings"
              onClick={() => onNavigateToTab('meetings')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[320px] divide-y divide-slate-100/50">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting, idx) => {
                const dateObj = new Date(meeting.date);
                const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dayNum = dateObj.getDate();
                const isFirst = idx === 0;

                return (
                  <div 
                    key={meeting.id} 
                    onClick={() => {
                      onSelectMeeting(meeting.id);
                      onNavigateToTab('meetings');
                    }}
                    className="flex gap-3 cursor-pointer pt-3 first:pt-0 group"
                  >
                    <div className="flex flex-col items-center min-w-[40px] text-center justify-center bg-slate-50 rounded-xl p-1 h-12 self-center">
                      <span className="text-[8px] font-bold text-slate-400">{dayStr}</span>
                      <span className="text-sm font-extrabold text-slate-800">{dayNum}</span>
                    </div>
                    <div className={`flex-grow p-3 border-l-2 rounded-r-xl transition-all ${
                      isFirst ? 'border-amber-500 bg-amber-50/10 hover:bg-amber-50/20' : 'border-slate-300 hover:bg-slate-50'
                    }`}>
                      <span className="text-[8px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                        {meeting.time.split('-')[0].trim()}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors">
                        {meeting.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {meeting.location}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-slate-400 py-8">No upcoming meetings scheduled.</p>
            )}
          </div>

          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/40">
            <button
              id="btn-sync-calendar"
              onClick={() => showToast && showToast('Calendar Synced: All Toughcons Core meetings have been exported to your Google Calendar context successfully!', 'success')}
              className="w-full py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer rounded-xl shadow-xs"
            >
              Sync to Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Stage Distribution */}
      <section className="dashboard-panel overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">Delivery pipeline</p>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">Portfolio stage distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Stage health across {projects.length} projects.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-bold text-slate-500 tracking-wide">
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 bg-blue-600 rounded-full" /> On track</span>
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 bg-amber-500 rounded-full" /> Delayed</span>
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 bg-red-500 rounded-full" /> Critical</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {stageRows.map((stage) => (
            <div key={stage.label} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-[9px] font-extrabold text-white ${stage.accent}`}>{stage.icon}</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-3">{stage.shortLabel}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 min-h-8">{stage.label}</p>
                </div>
                <span className="text-right"><b className="block text-xl font-extrabold text-slate-900">{stage.data.count}</b><small className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Projects</small></span>
              </div>
              <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-label={`${stage.label} status distribution`}>
                <span className="bg-blue-600 transition-all duration-500" style={{ width: `${stage.data.onTrack}%` }} />
                <span className="bg-amber-500 transition-all duration-500" style={{ width: `${stage.data.delayed}%` }} />
                <span className="bg-red-500 transition-all duration-500" style={{ width: `${stage.data.critical}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1 text-[10px]">
                <span className="text-blue-700"><b className="block text-xs">{stage.data.onTrack}%</b>On track</span>
                <span className="text-amber-700"><b className="block text-xs">{stage.data.delayed}%</b>Delayed</span>
                <span className="text-red-700"><b className="block text-xs">{stage.data.critical}%</b>Critical</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industrial Urgency Status Footer */}
      <div className="dashboard-panel bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-xl text-slate-300">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Command Center Warning Desk</p>
            <p className="text-[11px] text-slate-400 mt-1">
              There are {activeAlerts.length} active construction block constraints identified. Click &apos;Review&apos; on alerts to coordinate resolution immediately.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('site')}
          className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 text-white font-sans text-xs font-bold transition-all rounded-xl shadow-md shadow-blue-500/10 cursor-pointer shrink-0"
        >
          Open Snag Tracker
        </button>
      </div>

    </motion.div>
  );
}
