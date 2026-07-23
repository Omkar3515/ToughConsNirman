/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'delayed' | 'at-risk' | 'completed';
  budget: string;
  stage: string;
  manager: string;
  deadline: string;
  progress: number;
  priority: 'Priority 1' | 'Priority 2' | 'Priority 3' | 'None';
  imageUrl?: string;
  description: string;
  incidents: number;
  staffCount: number;
  temperature: number;
  lastCaptured?: string;
  planningProgress: number; // 0-100
  groundworkProgress: number; // 0-100
  verticalProgress: number; // 0-100
  finalProgress: number; // 0-100
  riskScore?: number;
  approvalStatus?: string;
  scheduleDelay?: string;
  financialHealth?: 'Good' | 'Fair' | 'Poor' | 'Critical';
  nextMilestone?: string;

  // --- Mumbai Redevelopment PMC Specific Fields (Task 7) ---
  mhadaStatus?: 'Approved' | 'Under Review' | 'Pending Submission' | 'NOC Obtained';
  bmcStatus?: 'Approved' | 'Under Review' | 'Queries Raised' | 'NOC Pending';
  iodStatus?: 'Issued' | 'Pending NOC' | 'In Review' | 'Draft Stage';
  iodDate?: string;
  ccStatus?: 'Plinth CC Issued' | 'Full CC Issued' | 'Pending Plinth' | 'Applied';
  ocStatus?: 'Not Started' | 'Applied' | 'Obtained' | 'Partial Obtained';
  tenantConsentPct?: number; // 0 - 100
  daDetails?: string; // Development Agreement Details
  paaaStatus?: 'Draft Circulated' | 'Signing In Progress' | '100% Executed' | 'Pending draft';
  hardshipRentStatus?: 'Disbursed Up-to-date' | 'Delayed' | 'Partially Disbursed' | 'Escrow Funded';
  corpusFundBalance?: string; // e.g. "₹2.45 Cr" or "₹1.50 Cr"
  bankGuaranteeAmount?: string; // e.g. "₹5.00 Cr"
  bankGuaranteeExpiry?: string; // YYYY-MM-DD
  reraNumber?: string;
  reraStatus?: 'Registered' | 'Applied' | 'Pending Board' | 'Exempt';
  litigationStatus?: 'None' | 'Pending High Court' | 'Resolved' | 'Arbitration';
}

export type UserRole = 'Director' | 'Project Manager' | 'Site Engineer' | 'Accountant' | 'Society Member' | 'Developer' | 'Admin';

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESOLVE' | 'APPROVE' | 'ESCALATE' | 'REASSIGN';
  entity: 'Project' | 'Risk' | 'Approval' | 'Document' | 'Invoice' | 'Meeting' | 'Consent' | 'Profile' | 'Partner' | 'Site Log';
  entityName: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
}

export interface Alert {
  id: string;
  projectName: string;
  reason: string;
  category: 'SUPPLY' | 'PERMIT' | 'LABOR' | 'SAFETY';
  impact: 'High' | 'Medium' | 'Critical' | 'Low';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
}

export interface Participant {
  name: string;
  role: string;
  avatarUrl: string;
  verified: boolean;
}

export interface MOMItem {
  id: string;
  discussionPoint: string;
  assignee?: string;
  dueDate?: string;
  status: 'Action Item' | 'Convert' | 'Completed';
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  project: string;
  status: 'Ongoing' | 'Upcoming' | 'Completed';
  agenda: string[];
  agendaCompleted: boolean[];
  participants: Participant[];
  mom: MOMItem[];
}

export interface FollowUp {
  id: string;
  description: string;
  owner: string;
  ownerInitial: string;
  ownerColor: string; // Tailwind class e.g., 'bg-secondary-container'
  dueDate: string;
  status: 'OVERDUE' | 'DUE TODAY' | 'SCHEDULED' | 'COMPLETED';
  priority: 1 | 2 | 3;
}

export interface Clearance {
  id: string;
  authority: string;
  submissionDate: string;
  status: 'Query Raised' | 'Pending' | 'Approved' | 'Not Started';
  responsible: string;
  expectedApproval: string;
  progress: number;
  type: 'Regulatory' | 'Critical' | 'Housing' | 'General';
  description: string;
}

export interface Snag {
  id: string;
  issueDescription: string;
  unit: string;
  contractor: string;
  dueDate: string;
  status: 'OPEN' | 'CLOSED';
  imageUrl: string;
  photoAlt: string;
}

export interface ProgressFeedItem {
  id: string;
  title: string;
  location: string;
  timeAgo: string;
  imageUrl: string;
  type: 'Time-lapse' | 'Photo' | 'Video';
}

export interface DocumentFile {
  id: string;
  name: string;
  folder: 'Drawings' | 'Permits' | 'Contracts' | 'Reports';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Approved' | 'In Review' | 'Draft' | 'Expired';
  version?: string;          // Version Control (e.g. "v1.2.0")
  expiryDate?: string;       // Expiry Date (e.g. "2024-12-31")
  tags?: string[];           // Tags (e.g. ["legal", "slab-drawings"])
  linkedProject?: string;    // Linked Project name
  linkedMember?: string;     // Linked Member name
}

export interface DirectorProfile {
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  sessionTime?: string;
}
