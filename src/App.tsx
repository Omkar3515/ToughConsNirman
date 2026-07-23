/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PortfolioView from './components/PortfolioView';
import ApprovalsView from './components/ApprovalsView';
import MeetingsView from './components/MeetingsView';
import SiteView from './components/SiteView';
import DocumentsView from './components/DocumentsView';
import SettingsView from './components/SettingsView';
import RisksView from './components/RisksView';
import ReportsView from './components/ReportsView';
import SocietiesView from './components/SocietiesView';
import DevelopersView from './components/DevelopersView';
import SecretaryView from './components/SecretaryView';
import { Project, Alert, Meeting, FollowUp, Clearance, Snag, ProgressFeedItem, DocumentFile, DirectorProfile, MOMItem, UserRole, AuditLog } from './types';
import { X, Check, Bell, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- INITAL SEED DATA ---
const INITIAL_PROJECTS: Project[] = [
  {
    id: "BDD-04",
    name: "Worli BDD 04 Redevelopment",
    location: "Worli, Mumbai South",
    status: 'active',
    budget: "$142.5M",
    stage: "Planning & Permitting",
    manager: "Sarah Chen",
    deadline: "2025-11-05",
    progress: 65,
    priority: "Priority 1",
    description: "Enterprise-grade urban redevelopment and high-rise tenant housing integration blocks. High density civil coordination.",
    incidents: 0,
    staffCount: 185,
    temperature: 28,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfTDfL0_jkpT1f1tWjvfZoc3TI_Qbfyb7WLI5ou7rZZ99fUi56fJEncmWVqMJv6QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
    planningProgress: 100,
    groundworkProgress: 90,
    verticalProgress: 45,
    finalProgress: 0,
    riskScore: 28,
    approvalStatus: "MHADA Approved",
    scheduleDelay: "On-Schedule",
    financialHealth: "Good",
    nextMilestone: "Slab Pour block A1"
  },
  {
    id: "HBR-II",
    name: "Harbor Ridge Phase II",
    location: "Sewri Seafront, Mumbai",
    status: 'delayed',
    budget: "$95.0M",
    stage: "Groundwork & Infrastructure",
    manager: "Mark Thorne",
    deadline: "2025-06-18",
    progress: 42,
    priority: "Priority 2",
    description: "Coastal residential high-rise complex. Currently experiencing pile-loading resistance and machinery delays.",
    incidents: 1,
    staffCount: 110,
    temperature: 30,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w",
    planningProgress: 80,
    groundworkProgress: 60,
    verticalProgress: 10,
    finalProgress: 0,
    riskScore: 65,
    approvalStatus: "MCZMA Pending",
    scheduleDelay: "45 Days Overdue",
    financialHealth: "Fair",
    nextMilestone: "Piling Load Test"
  },
  {
    id: "BDD-NG",
    name: "BDD Naigaon Cluster C",
    location: "Naigaon, Dadar East",
    status: 'at-risk',
    budget: "$210.0M",
    stage: "Vertical Construction",
    manager: "Elena Rodriguez",
    deadline: "2026-02-12",
    progress: 18,
    priority: "Priority 1",
    description: "Multi-sector structural steel assembly blocks. Regulatory height approval pending tree-authority board response.",
    incidents: 0,
    staffCount: 230,
    temperature: 29,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
    planningProgress: 100,
    groundworkProgress: 35,
    verticalProgress: 0,
    finalProgress: 0,
    riskScore: 84,
    approvalStatus: "High-Rise Committee Approved",
    scheduleDelay: "3 Months Behind",
    financialHealth: "Poor",
    nextMilestone: "Tree clearance resolution"
  },
  {
    id: "PRL-CH",
    name: "Parel Commercial Hub",
    location: "Parel Junction, Mumbai",
    status: 'completed',
    budget: "$64.2M",
    stage: "Final Inspection & Handover",
    manager: "Sarah Chen",
    deadline: "2023-09-01",
    progress: 100,
    priority: "None",
    description: "Grade-A logistics and commercial office corporate park built over rehabilitated industrial land parcel.",
    incidents: 0,
    staffCount: 0,
    temperature: 25,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w",
    planningProgress: 100,
    groundworkProgress: 100,
    verticalProgress: 100,
    finalProgress: 100,
    riskScore: 10,
    approvalStatus: "Full OC Obtained",
    scheduleDelay: "None",
    financialHealth: "Good",
    nextMilestone: "Handover Ceremony"
  }
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: "alert-1",
    projectName: "BDD Naigaon Cluster C",
    reason: "Height permission delayed by tree board regulatory clearance query.",
    category: "PERMIT",
    impact: "Critical",
    status: "OPEN"
  },
  {
    id: "alert-2",
    projectName: "Harbor Ridge Phase II",
    reason: "Ready-Mix Concrete delivery convoy blocked at Freeway toll gate.",
    category: "SUPPLY",
    impact: "High",
    status: "OPEN"
  },
  {
    id: "alert-3",
    projectName: "Worli BDD 04 Redevelopment",
    reason: "Daily structural slab reinforcement test variance flagged.",
    category: "LABOR",
    impact: "Medium",
    status: "UNDER_REVIEW"
  }
];

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: "meet-1",
    title: "Slab Pour Quality & Zoning Align",
    date: "2023-10-11",
    time: "10:00 AM - 11:30 AM",
    location: "Site Office A-12",
    project: "Worli BDD 04 Redevelopment",
    status: "Ongoing",
    agenda: [
      "Ready-Mix concrete slump test parameters validation",
      "Steel rebar spacing inspection review",
      "Logistics coordination for tomorrow's vertical block pour"
    ],
    agendaCompleted: [true, false, false],
    participants: [
      { name: "Arthur Vance", role: "Lead Site Engineer", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf1Q9m3fxQRGuyKuiCHEk-c8OFPvq0Cf3PZzdQ83ElGCIYsh_vk98PPznAnDuj6dCiD4Qgj4zYTlKiOCCu3pG7umAqxdh2wcaxeCZEN-3GYTuuC27FUt-yHBzV1efkmBvVcxbskHdQ79VC0vqYFpkyPb_trwJQqbZ-FGpK4toamlR9b7-quCdgsvWKeaZ4N4q1YucGALRDSjd_mUwAgRl5kHNtdSHu4njFSk56rbvmjFCb3p1J-quoBg", verified: true },
      { name: "Sarah Connor", role: "Safety Compliance Director", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCt9xGNRC9kXG8NYwqcXCaaOf32QAvL2PI0MF5a30z_xG6Ojh1S8hOwheZzepiqo132aquSd5NQTIAk85W9d6W7IepsvQG20vWXC-mdPX4VrY6H20Im-TvDHo0tpc1RHYmEgDy3zv73kaQ3ItV0Kl0i63pUiIexmbk6RYrKk83cJsTNyJh6jmM396NnbHgIR-Nfzolyk39O9-eYdRi3pqchx62H5sOJE3IM1OTksDiZP8YKmv4oLw-16g", verified: true },
      { name: "Rajiv Kumar", role: "BMC Liaison Officer", avatarUrl: "", verified: false }
    ],
    mom: [
      { id: "1", discussionPoint: "Slab pouring slump test must adhere strictly to 120mm limits.", assignee: "Arthur Vance", dueDate: "2023-10-12", status: "Action Item" },
      { id: "2", discussionPoint: "Draft NOC layout files transferred to Sarah Connor.", assignee: "Sarah Connor", dueDate: "2023-10-15", status: "Convert" }
    ]
  },
  {
    id: "meet-2",
    title: "Zoning & Tenant Lease Alignment",
    date: "2023-10-12",
    time: "02:00 PM - 03:30 PM",
    location: "MHADA Central Boardroom",
    project: "BDD Naigaon Cluster C",
    status: "Upcoming",
    agenda: [
      "MHADA Dadar parcel allocation verification",
      "Rebabilitated tenant deed registration schedule review"
    ],
    agendaCompleted: [false, false],
    participants: [
      { name: "Elena Rodriguez", role: "Senior Project Manager", avatarUrl: "", verified: true },
      { name: "Amit Kulkarni", role: "Legal Council Lead", avatarUrl: "", verified: false }
    ],
    mom: []
  }
];

const INITIAL_FOLLOWUPS: FollowUp[] = [
  {
    id: "fu-1",
    description: "Verify Tenant Registry List with BMC Ward Officer",
    owner: "Sarah Connor",
    ownerInitial: "SC",
    ownerColor: "bg-red-100 text-[#ba1a1a]",
    dueDate: "2023-10-12",
    status: "DUE TODAY",
    priority: 3
  },
  {
    id: "fu-2",
    description: "Escalate height permission layout dossier to Tree Board Authority",
    owner: "Amit Kulkarni",
    ownerInitial: "AK",
    ownerColor: "bg-amber-100 text-amber-800",
    dueDate: "2023-10-09",
    status: "OVERDUE",
    priority: 3
  },
  {
    id: "fu-3",
    description: "Submit CFO fire pump layout sprinkler verification test specs",
    owner: "Arthur Vance",
    ownerInitial: "AV",
    ownerColor: "bg-blue-100 text-blue-800",
    dueDate: "2023-10-18",
    status: "SCHEDULED",
    priority: 2
  }
];

const INITIAL_CLEARANCES: Clearance[] = [
  {
    id: "cl-1",
    authority: "BMC Plinth Level Certificate",
    submissionDate: "2023-08-14",
    status: "Approved",
    responsible: "Sarah Chen",
    expectedApproval: "Approved",
    progress: 100,
    type: "Regulatory",
    description: "Structural plinth load-bearing verification certificate issued and recorded."
  },
  {
    id: "cl-2",
    authority: "CFO Fire NOC (Worli BDD Area)",
    submissionDate: "2023-09-02",
    status: "Query Raised",
    responsible: "Sarah Connor",
    expectedApproval: "2023-10-25",
    progress: 25,
    type: "Critical",
    description: "Sprinkler head layout water flow capacity audit query raised."
  },
  {
    id: "cl-3",
    authority: "MHADA Lease Deed Allocation Execution",
    submissionDate: "2023-09-18",
    status: "Pending",
    responsible: "Elena Rodriguez",
    expectedApproval: "2023-11-05",
    progress: 80,
    type: "Housing",
    description: "Tenant rehabilitation allotment deed registry pending deputy collector sign-off."
  }
];

const INITIAL_SNAGS: Snag[] = [
  {
    id: "snag-1",
    issueDescription: "Hairline plaster cracks detected on exterior columns facade",
    unit: "Flat 402, Bldg C",
    contractor: "Glaze Masters",
    dueDate: "2023-11-15",
    status: "OPEN",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
    photoAlt: "Exterior plastering snag"
  },
  {
    id: "snag-2",
    issueDescription: "Steel spacing alignment variance exceeds 10mm limit tolerances",
    unit: "Podium B Block, Grid 4",
    contractor: "Structural Steel Corp",
    dueDate: "2023-10-20",
    status: "OPEN",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w",
    photoAlt: "Slab steel alignment"
  },
  {
    id: "snag-3",
    issueDescription: "Basement panel room junction conduits humidity ingress",
    unit: "Electrical Panel 2B, Basement",
    contractor: "M&E Contractors",
    dueDate: "2023-10-05",
    status: "CLOSED",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfTDfL0_jkpT1f1tWjvfZoc3TI_Qbfyb7WLI5ou7rZZ99fUi56fJEncmWVqMJv6QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
    photoAlt: "Electrical conduit snag"
  }
];

const INITIAL_PROGRESS_FEED: ProgressFeedItem[] = [
  {
    id: "feed-1",
    title: "Vertical concrete slab pour 완료: Block A4",
    location: "Worli BDD 04 Redevelopment",
    timeAgo: "2 Hours Ago",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w",
    type: "Photo"
  },
  {
    id: "feed-2",
    title: "Naigaon North Block demolition progress snapshot",
    location: "BDD Naigaon Cluster C",
    timeAgo: "1 Day Ago",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpYjKk_L-7gZ-fS2T53eZq86oFjA_bXm7E6wX26tP_UvWn43d-0vYV8QFS_sFO_J7gBUFD1hYnMwXWJpvQCCei1i2VJwMQkWLmy4RV32-myGYwWqYPWdx1eu73QKT-3X4fjtp9-PsBE1teyOv8uaR76OrufB0z2ksbRO53nDcpMq8YDEJ_nmcnrVF94Oy5fNW1v7aR5eGdqDAQXwbKizo0-i1_FYJFbT7M3B-_B8Iqg9JYWw",
    type: "Time-lapse"
  },
  {
    id: "feed-3",
    title: "Structural piling installation status",
    location: "Harbor Ridge Phase II",
    timeAgo: "3 Days Ago",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2eKFRilgP_RRzCDd-pj3P23xo0eLFMAUSgF7RZ2Bbvv8ByxxSSYLBFGjglE8mVmsh5dL-mIQbsWDXr_OVEdwz4YLyMgx0CaqZ51rrd5PBCGd9-E_urhuw91ZMOteO7mXCXnV58p1Hq2wxKClPKhl6_v8i21dcbAt8x6ig3JVJMTjid0rwdV6AMyaORNI8ZY8C9G5XhzRVTGi8eq3v-2fqD3Lr2aIkpz0jBo3e9IgRvFYS9UQ1Kv-l7w",
    type: "Photo"
  }
];

const INITIAL_DOCUMENTS: DocumentFile[] = [
  {
    id: "doc-1",
    name: "Worli_BDD04_SlabPour_StructuralCalculation_V2.pdf",
    folder: "Drawings",
    size: "2.4 MB",
    uploadedBy: "Sarah Chen",
    uploadedAt: "Oct 01, 2023",
    status: "Approved",
    version: "v2.1.0",
    expiryDate: "2025-10-01",
    tags: ["structural", "calculations", "slab-pour"],
    linkedProject: "Worli BDD 04 Redevelopment",
    linkedMember: "Arthur Vance"
  },
  {
    id: "doc-2",
    name: "BMC_HeightPermit_Naigaon_ZoningPlan.dwg",
    folder: "Drawings",
    size: "14.8 MB",
    uploadedBy: "Elena Rodriguez",
    uploadedAt: "Sep 28, 2023",
    status: "In Review",
    version: "v1.0.1",
    expiryDate: "2024-09-28",
    tags: ["zoning", "bmc", "permit-plan"],
    linkedProject: "BDD Naigaon Cluster C",
    linkedMember: "Amit Kulkarni"
  },
  {
    id: "doc-3",
    name: "CFO_FireNOC_QueryResponseDraft.pdf",
    folder: "Permits",
    size: "850 KB",
    uploadedBy: "Sarah Connor",
    uploadedAt: "Oct 10, 2023",
    status: "Draft",
    version: "v0.9.0",
    expiryDate: "2024-12-10",
    tags: ["fire-safety", "query", "draft-noc"],
    linkedProject: "Worli BDD 04 Redevelopment",
    linkedMember: "Sarah Connor"
  },
  {
    id: "doc-4",
    name: "MOM_TenantRehabilitation_LeaseAgreements.zip",
    folder: "Contracts",
    size: "8.2 MB",
    uploadedBy: "Director Desk",
    uploadedAt: "Oct 05, 2023",
    status: "Approved",
    version: "v3.0.0",
    expiryDate: "2026-10-05",
    tags: ["contracts", "leases", "rehabilitation"],
    linkedProject: "BDD Naigaon Cluster C",
    linkedMember: "Elena Rodriguez"
  }
];

const INITIAL_PROFILE: DirectorProfile = {
  name: "Director J. Miller",
  role: "Redevelopment Director",
  department: "MHADA Urban Revitalization",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf1Q9m3fxQRGuyKuiCHEk-c8OFPvq0Cf3PZzdQ83ElGCIYsh_vk98PPznAnDuj6dCiD4Qgj4zYTlKiOCCu3pG7umAqxdh2wcaxeCZEN-3GYTuuC27FUt-yHBzV1efkmBvVcxbskHdQ79VC0vqYFpkyPb_trwJQqbZ-FGpK4toamlR9b7-quCdgsvWKeaZ4N4q1YucGALRDSjd_mUwAgRl5kHNtdSHu4njFSk56rbvmjFCb3p1J-quoBg",
  sessionTime: "12 Hours"
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('toughcons_role');
    return (saved as UserRole) || 'Director';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('toughcons_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('toughcons_role', role);
    showToast(`Role switched to: ${role}`, 'info');
  };

  const handleLogAudit = (
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    reason: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Math.random().toString(36).substring(2, 9)}`,
      user: profile ? profile.name : 'Director Desk',
      role: currentRole,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityName: activeProject ? activeProject.name : 'System',
      oldValue,
      newValue,
      reason
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('toughcons_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // --- LOCAL PERSISTENCE LOADER ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('toughcons_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('toughcons_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('toughcons_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem('toughcons_followups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
  });

  const [clearances, setClearances] = useState<Clearance[]>(() => {
    const saved = localStorage.getItem('toughcons_clearances');
    return saved ? JSON.parse(saved) : INITIAL_CLEARANCES;
  });

  const [snags, setSnags] = useState<Snag[]>(() => {
    const saved = localStorage.getItem('toughcons_snags');
    return saved ? JSON.parse(saved) : INITIAL_SNAGS;
  });

  const [progressFeed, setProgressFeed] = useState<ProgressFeedItem[]>(() => {
    const saved = localStorage.getItem('toughcons_progress_feed');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_FEED;
  });

  const [documents, setDocuments] = useState<DocumentFile[]>(() => {
    const saved = localStorage.getItem('toughcons_documents');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0 && !parsed[0].version) {
        return INITIAL_DOCUMENTS;
      }
      return parsed;
    }
    return INITIAL_DOCUMENTS;
  });

  const [profile, setProfile] = useState<DirectorProfile>(() => {
    const saved = localStorage.getItem('toughcons_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    return projects[0] || null;
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(() => {
    return meetings[0]?.id || null;
  });

  // Alert review popup drawer state
  const [selectedReviewAlert, setSelectedReviewAlert] = useState<Alert | null>(null);
  const [reviewAlertComment, setReviewAlertComment] = useState('');
  
  // Custom interactive notification center overlay state
  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [showAIChat, setShowAIChat] = React.useState(false);

  // --- TOAST NOTIFICATION SYSTEM ---
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Write state changes to localStorage
  useEffect(() => {
    localStorage.setItem('toughcons_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('toughcons_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('toughcons_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('toughcons_followups', JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem('toughcons_clearances', JSON.stringify(clearances));
  }, [clearances]);

  useEffect(() => {
    localStorage.setItem('toughcons_snags', JSON.stringify(snags));
  }, [snags]);

  useEffect(() => {
    localStorage.setItem('toughcons_progress_feed', JSON.stringify(progressFeed));
  }, [progressFeed]);

  useEffect(() => {
    localStorage.setItem('toughcons_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('toughcons_profile', JSON.stringify(profile));
  }, [profile]);

  // --- ACTIONS HANDLERS ---
  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    showToast(`Active Context updated: Now viewing workspace logs for "${project.name}"`, 'info');
  };

  const handleAddProject = (newProj: Omit<Project, 'id'>) => {
    const fresh: Project = {
      ...newProj,
      id: `BDD-${Math.floor(10 + Math.random() * 89)}`
    };
    setProjects(prev => [fresh, ...prev]);
    setActiveProject(fresh);
    showToast(`"${fresh.name}" registered successfully to project portfolio stage database!`, 'success');
  };

  const handleReviewAlert = (alertId: string) => {
    const target = alerts.find(a => a.id === alertId);
    if (target) {
      setSelectedReviewAlert(target);
      setReviewAlertComment('');
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'RESOLVED' };
      }
      return a;
    }));
    setSelectedReviewAlert(null);
    showToast('Regulatory warning constraint marked as RESOLVED.', 'success');
  };

  const handleUpdateAlertStatus = (alertId: string, status: Alert['status']) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status };
      }
      return a;
    }));
    if (selectedReviewAlert && selectedReviewAlert.id === alertId) {
      setSelectedReviewAlert(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleAddFollowUp = (newFu: Omit<FollowUp, 'id'>) => {
    const fresh: FollowUp = {
      ...newFu,
      id: `fu-${followUps.length + 1}`
    };
    setFollowUps(prev => [fresh, ...prev]);
    showToast(`Logged following task: "${newFu.description}"`, 'success');
  };

  const handleAddClearance = (newCl: Omit<Clearance, 'id'>) => {
    const fresh: Clearance = {
      ...newCl,
      id: `cl-${clearances.length + 1}`
    };
    setClearances(prev => [fresh, ...prev]);
    showToast(`Submission to "${newCl.authority}" logged in clearances timeline.`, 'success');
  };

  const handleToggleFollowUpStatus = (id: string) => {
    setFollowUps(prev => prev.map(f => {
      if (f.id === id) {
        const nextStatus = f.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED';
        return { ...f, status: nextStatus };
      }
      return f;
    }));
  };

  const handleResolveClearance = (id: string) => {
    setClearances(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: 'Approved', progress: 100 };
      }
      return c;
    }));
    showToast('Clearance approved and resolved in general ledger!', 'success');
  };

  const handleAddSnag = (newSn: Omit<Snag, 'id'>) => {
    const fresh: Snag = {
      ...newSn,
      id: `snag-${snags.length + 1}`
    };
    setSnags(prev => [fresh, ...prev]);
    
    // Auto post snag to Site progress feed
    const freshFeed: ProgressFeedItem = {
      id: `feed-${progressFeed.length + 1}`,
      title: `Snag logged: ${newSn.issueDescription}`,
      location: activeProject?.name || newSn.unit,
      timeAgo: "Just Now",
      imageUrl: newSn.imageUrl,
      type: "Photo"
    };
    setProgressFeed(prev => [freshFeed, ...prev]);
    showToast(`Logged Snag constraint for ${newSn.unit} under ${newSn.contractor}.`, 'success');
  };

  const handleToggleSnagStatus = (id: string) => {
    setSnags(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'OPEN' ? 'CLOSED' : 'OPEN';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleAddDocument = (newDoc: Omit<DocumentFile, 'id'>) => {
    const fresh: DocumentFile = {
      ...newDoc,
      id: `doc-${documents.length + 1}`
    };
    setDocuments(prev => [fresh, ...prev]);
    showToast(`Uploaded Securely: "${newDoc.name}" categorised in folder "${newDoc.folder}".`, 'success');
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this construction document? This cannot be undone.")) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      showToast('Construction document removed successfully.', 'info');
    }
  };

  const handleAddMeeting = (newMeet: Omit<Meeting, 'id'>) => {
    const fresh: Meeting = {
      ...newMeet,
      id: `meet-${meetings.length + 1}`
    };
    setMeetings(prev => [fresh, ...prev]);
    setSelectedMeetingId(fresh.id);
    showToast(`Scheduled: "${newMeet.title}" logged on timeline ${newMeet.date}.`, 'success');
  };

  const handleUpdateMeetingMOM = (id: string, mom: MOMItem[]) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, mom };
      }
      return m;
    }));
  };

  const handleUpdateMeetingAgenda = (id: string, agendaCompleted: boolean[]) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, agendaCompleted };
      }
      return m;
    }));
  };

  const handleExportReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ projects, alerts, meetings, followUps, clearances, snags }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Toughcons_Core_Operations_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Operations Report formatted successfully. Initiating download package.', 'success');
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Project Name,Location,Status,Budget,Stage,Manager,Overall Progress\n";
    projects.forEach(p => {
      csvContent += `"${p.name}","${p.location}","${p.status}","${p.budget}","${p.stage}","${p.manager}",${p.progress}\n`;
    });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", "Toughcons_Portfolio_Inventory.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Spreadsheet Inventory exported successfully as CSV.', 'success');
  };

  return (
    <div className="flex bg-slate-50 text-slate-900 min-h-screen font-sans">
      
      {/* Dynamic Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        approvalsCount={followUps.filter(f => f.status === 'OVERDUE').length} 
        profile={profile}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top App Bar */}
        <Header 
          activeProject={activeProject} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          notificationsCount={alerts.filter(a => a.status === 'OPEN').length}
          onOpenNotifications={() => setShowNotificationOverlay(true)}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />

        {/* View Router */}
        <main className="flex-grow overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              projects={projects}
              alerts={alerts}
              meetings={meetings}
              onReviewAlert={handleReviewAlert}
              onOpenNewProjectModal={() => {
                setActiveTab('portfolio');
                showToast('Launch the "New Project" wizard using the action button.', 'info');
              }}
              onNavigateToTab={setActiveTab}
              onSelectMeeting={setSelectedMeetingId}
              onExportReport={handleExportReport}
              showToast={showToast}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioView 
              projects={projects}
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
              onAddProject={handleAddProject}
              onExportCSV={handleExportCSV}
              showToast={showToast}
              currentRole={currentRole}
              onLogAudit={handleLogAudit}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView 
              followUps={followUps}
              clearances={clearances}
              onAddFollowUp={handleAddFollowUp}
              onAddClearance={handleAddClearance}
              onToggleFollowUpStatus={handleToggleFollowUpStatus}
              onResolveClearance={handleResolveClearance}
              showToast={showToast}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsView 
              meetings={meetings}
              selectedMeetingId={selectedMeetingId}
              onSelectMeeting={setSelectedMeetingId}
              onAddMeeting={handleAddMeeting}
              onUpdateMeetingMOM={handleUpdateMeetingMOM}
              onUpdateMeetingAgenda={handleUpdateMeetingAgenda}
              showToast={showToast}
            />
          )}

          {activeTab === 'site' && (
            <SiteView 
              activeProject={activeProject}
              snags={snags}
              progressFeed={progressFeed}
              onAddSnag={handleAddSnag}
              onToggleSnagStatus={handleToggleSnagStatus}
              showToast={showToast}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView 
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              showToast={showToast}
            />
          )}

          {activeTab === 'risks' && (
            <RisksView 
              projects={projects}
              activeProject={activeProject}
              showToast={showToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              projects={projects}
              auditLogs={auditLogs}
              showToast={showToast}
            />
          )}

          {activeTab === 'societies' && (
            <SocietiesView 
              projects={projects}
              activeProject={activeProject}
              showToast={showToast}
            />
          )}

          {activeTab === 'secretary' && (
            <SecretaryView 
              onAddDocument={handleAddDocument}
              activeProject={activeProject}
              showToast={showToast}
            />
          )}

          {activeTab === 'developers' && (
            <DevelopersView showToast={showToast} />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              profile={profile}
              onUpdateProfile={setProfile}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* --- ALERT REVIEW DRAWER MODAL --- */}
      {selectedReviewAlert && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full border-l border-slate-100 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Review Risk Constraint</h3>
              </div>
              <button 
                onClick={() => setSelectedReviewAlert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PROJECT LOCATION ZONE</span>
                <span className="font-sans text-sm font-extrabold text-slate-900 block">{selectedReviewAlert.projectName}</span>
              </div>

              <div className="p-5 bg-red-50/30 border border-red-100 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full uppercase">
                    {selectedReviewAlert.category}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedReviewAlert.impact === 'Critical' ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    Impact Rank: {selectedReviewAlert.impact}
                  </span>
                </div>
                <p className="font-sans text-xs font-semibold text-slate-800 leading-relaxed">
                  {selectedReviewAlert.reason}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coordinate Response Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['OPEN', 'UNDER_REVIEW', 'RESOLVED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateAlertStatus(selectedReviewAlert.id, st)}
                      className={`py-2 text-[10px] font-bold rounded-xl border cursor-pointer transition-all ${
                        selectedReviewAlert.status === st
                          ? 'bg-slate-900 text-white border-transparent shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observations &amp; Directives</label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Note response guidelines, team emails dispatched, or concrete timelines assigned..."
                  value={reviewAlertComment}
                  onChange={(e) => setReviewAlertComment(e.target.value)}
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 space-y-1">
                <p className="font-bold uppercase text-slate-800 text-[9px] tracking-wider">Operations Log Auditing</p>
                <p className="font-medium">This warning will remain visible in Dashboard KPIs until explicitly marked as RESOLVED.</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReviewAlert(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-sans text-xs font-bold hover:bg-slate-200 cursor-pointer rounded-xl transition-colors"
              >
                Close Panel
              </button>
              {selectedReviewAlert.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolveAlert(selectedReviewAlert.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold cursor-pointer rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-colors"
                >
                  <Check className="w-4 h-4" /> Resolve Risk
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION CENTER OVERLAY OVERLAY --- */}
      {showNotificationOverlay && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-slate-700" />
                <h3 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Toughcons Dispatcher</h3>
              </div>
              <button 
                onClick={() => setShowNotificationOverlay(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[350px] overflow-y-auto divide-y divide-slate-100">
              {alerts.filter(a => a.status === 'OPEN').length > 0 ? (
                alerts.filter(a => a.status === 'OPEN').map((alert) => (
                  <div key={alert.id} className="py-4.5 flex gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-sans text-xs font-bold text-slate-900">{alert.projectName}</p>
                      <p className="font-sans text-[11px] text-slate-500 mt-1 leading-relaxed">{alert.reason}</p>
                      <span className="text-[8px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold uppercase inline-block mt-3 tracking-wider">
                        {alert.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  All clearances and supply lines nominal. No warnings pending.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
              <button
                onClick={() => setShowNotificationOverlay(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                Acknowledge All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI TOGGLE --- */}
{/* --- AI ASSISTANT BUTTON --- */}
<div className="fixed bottom-24 right-6 z-[101]">
  <button
    onClick={() => setShowAIChat(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2 transition-all"
  >
    <span>🤖</span>
    <span className="text-sm font-semibold">AI Assistant</span>
  </button>
</div>

{showAIChat && (
  <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[102] flex flex-col overflow-hidden">

    {/* Header */}
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h3 className="font-bold">🤖 Toughcons AI Assistant</h3>

      <button
        onClick={() => setShowAIChat(false)}
        className="text-white"
      >
        ✕
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-xl p-3 text-sm">
        Hello! How can I help today?
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs">
          Generate MOM
        </button>

        <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs">
          Create Notice
        </button>

        <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs">
          Project Summary
        </button>
      </div>
    </div>

    {/* Input */}
    <div className="border-t p-3">
      <input
        type="text"
        placeholder="Ask something..."
        className="w-full border rounded-xl px-3 py-2 text-sm"
      />
    </div>
  </div>
)}

      {/* --- FLOATING TOAST NOTIFICATION CORNER --- */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            let bgClass = 'bg-slate-900 border-slate-800 text-white';
            let icon = <Info className="w-4 h-4 text-slate-400" />;
            if (toast.type === 'success') {
              bgClass = 'bg-white border-emerald-100 text-slate-900 shadow-xl shadow-emerald-500/5';
              icon = <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-50 p-1 rounded-lg" />;
            } else if (toast.type === 'error') {
              bgClass = 'bg-white border-red-100 text-slate-900 shadow-xl shadow-red-500/5';
              icon = <X className="w-4.5 h-4.5 text-red-600 bg-red-50 p-1 rounded-lg" />;
            } else if (toast.type === 'warning') {
              bgClass = 'bg-white border-amber-100 text-slate-900 shadow-xl shadow-amber-500/5';
              icon = <AlertTriangle className="w-4.5 h-4.5 text-amber-600 bg-amber-50 p-1 rounded-lg" />;
            } else if (toast.type === 'info') {
              bgClass = 'bg-white border-blue-100 text-slate-900 shadow-xl shadow-blue-500/5';
              icon = <Info className="w-4.5 h-4.5 text-blue-600 bg-blue-50 p-1 rounded-lg" />;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-4 rounded-2xl border flex items-start gap-3 pointer-events-auto shadow-lg ${bgClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 text-xs font-semibold leading-relaxed text-slate-800">{toast.message}</div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
