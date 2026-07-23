import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  FileText, 
  Check, 
  Copy, 
  Plus, 
  Download, 
  Mail, 
  MessageSquare, 
  Globe, 
  CheckSquare, 
  Users, 
  FileSignature, 
  Vote, 
  FileCheck,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertCircle,
  Mic,
  MicOff,
  Printer,
  ChevronLeft,
  BookOpen,
  Volume2
} from 'lucide-react';
import { Project, DocumentFile } from '../types';
import { motion } from 'motion/react';

interface SecretaryViewProps {
  onAddDocument: (doc: Omit<DocumentFile, 'id'>) => void;
  activeProject: Project | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

// 1. STATUTORY 11-IN-1 PACKAGE INTERFACE
interface GeneratedDocuments {
  notice: string;
  agenda: string;
  explanatoryStatement: string;
  attendanceRegister: string;
  proxyForm: string;
  resolution: string;
  votingSheet: string;
  minutesFormat: string;
  marathiVersion: string;
  email: string;
  whatsAppMessage: string;
}

// 2. MINUTES WRITER INTERFACE
interface GeneratedMinutes {
  attendance: string;
  discussions: string;
  memberQuestions: string;
  replies: string;
  decisions: string;
  resolutions: string;
  actionPoints: string;
  nextMeetingDate: string;
  speakerLogs: string;
}

// 3. NOTICE DRAFTING INTERFACE
interface GeneratedNoticeDraft {
  subject: string;
  content: string;
  marathiContent: string;
  whatsappBroadcast: string;
  keyTakeaways: string;
}

// 17 SPECIFIC NOTICE/LETTER TEMPLATES
const NOTICE_TEMPLATES = [
  "SGM Notice",
  "AGM Notice",
  "Managing Committee Meeting",
  "Developer Presentation",
  "Tender Invitation",
  "Tender Clarification",
  "Corrigendum",
  "LOI",
  "Appointment Letter",
  "Termination Notice",
  "Show Cause",
  "Reminder",
  "Rent Default Notice",
  "Delay Notice",
  "Legal Notice",
  "Handing Over Notice",
  "Possession Notice"
] as const;

type NoticeTemplateType = typeof NOTICE_TEMPLATES[number];

const TEMPLATE_QUESTIONS: Record<NoticeTemplateType, { key: string; label: string; placeholder: string; defaultValue: string }[]> = {
  "SGM Notice": [
    { key: "dateTime", label: "Meeting Date & Time", placeholder: "e.g. Sunday, 26th July 2026 at 11:00 AM", defaultValue: "Sunday, 26th July 2026 at 11:00 AM" },
    { key: "venue", label: "Meeting Venue", placeholder: "e.g. Society Clubhouse, 2nd Floor", defaultValue: "Society Clubhouse, 2nd Floor" },
    { key: "objective", label: "Main SGM Agenda/Objective", placeholder: "e.g. Appoint Project Architect & PMC for redevelopment", defaultValue: "To appoint M/s Acme Consultants as the Project Architect and Project Management Consultant (PMC) for redevelopment of the society buildings." }
  ],
  "AGM Notice": [
    { key: "dateTime", label: "Meeting Date & Time", placeholder: "e.g. Saturday, 15th August 2026 at 4:00 PM", defaultValue: "Saturday, 15th August 2026 at 4:00 PM" },
    { key: "venue", label: "Meeting Venue", placeholder: "e.g. Society Terraces", defaultValue: "Society Open Lawn & Terraces, Wing B" },
    { key: "financialYear", label: "Financial Year", placeholder: "e.g. 2025-2026", defaultValue: "2025-2026" },
    { key: "agendaItems", label: "Additional Agenda Points", placeholder: "e.g. Approval of building painting", defaultValue: "Approval of audited balance sheets, appointment of statutory auditors, and approval of building paint repairs." }
  ],
  "Managing Committee Meeting": [
    { key: "dateTime", label: "Meeting Date & Time", placeholder: "e.g. Wednesday, 22nd July 2026", defaultValue: "Wednesday, 22nd July 2026 at 7:30 PM" },
    { key: "agenda", label: "Major Subject", placeholder: "e.g. Structural repairs", defaultValue: "Review of the structural audit report and shortlisting of contractors for structural monsoon repairs." }
  ],
  "Developer Presentation": [
    { key: "developerName", label: "Developer/Builder Name", placeholder: "e.g. Skyline Realties Ltd.", defaultValue: "Skyline Realties & Developers LLP" },
    { key: "dateTime", label: "Presentation Date & Venue", placeholder: "e.g. Sunday, 19th July 2026", defaultValue: "Sunday, 19th July 2026 at 10:00 AM at the Society Common Hall" },
    { key: "offerBrief", label: "Brief offer (rent, corpus etc.)", placeholder: "e.g. ₹45,000 rent, ₹15 Lakhs corpus", defaultValue: "Offer of ₹45,000/- monthly rent, ₹15,00,000/- corpus per member, and 35% additional carpet area." }
  ],
  "Tender Invitation": [
    { key: "scope", label: "Scope of Work", placeholder: "e.g. Waterproofing & painting", defaultValue: "Comprehensive exterior structural rehabilitation, concrete crack repair, polymer-modified waterproofing, and elastomeric painting." },
    { key: "emd", label: "Tender Fee & EMD", placeholder: "e.g. Fee: ₹5,000, EMD: ₹1,00,000", defaultValue: "Tender document fee of ₹5,000/- and Earnest Money Deposit (EMD) of ₹1,00,000/-" },
    { key: "deadline", label: "Submission Deadline", placeholder: "e.g. 10th August 2026", defaultValue: "10th August 2026 before 5:00 PM" }
  ],
  "Tender Clarification": [
    { key: "query", label: "Contractor Query", placeholder: "e.g. Waterproofing brand", defaultValue: "Contractor query regarding whether BASF or Dr. Fixit is acceptable for polymer coating." },
    { key: "clarification", label: "Society Clarification", placeholder: "e.g. Both are acceptable", defaultValue: "Both BASF MasterBuilder and Dr. Fixit construction chemical ranges are acceptable subject to standard RCC engineer approval." }
  ],
  "Corrigendum": [
    { key: "refNo", label: "Original Tender Reference", placeholder: "e.g. Notice No. CHS/REPAIR/2026/01", defaultValue: "Notice Inviting Tender No. TCHS/REPAIR/2026/02 dated 1st July 2026" },
    { key: "revision", label: "Revised Clause / Extension", placeholder: "e.g. Extended to 15th Aug", defaultValue: "The deadline for submission is extended to 25th August 2026 due to extreme monsoon rains and requests from bidders." }
  ],
  "LOI": [
    { key: "developerName", label: "Selected Developer", placeholder: "e.g. Skyline Realties LLP", defaultValue: "Skyline Realties & Developers LLP" },
    { key: "redevBrief", label: "Redevelopment Brief Summary", placeholder: "e.g. Gross construction under Sec 79A", defaultValue: "Redevelopment of the society buildings under Maharashtra Cooperative Societies Act Section 79A guidelines." },
    { key: "resolutionDate", label: "SGM Resolution Date", placeholder: "e.g. 14th June 2026", defaultValue: "14th June 2026" }
  ],
  "Appointment Letter": [
    { key: "appointee", label: "Appointee Name & Title", placeholder: "e.g. Mr. Rajesh Shah, Structural Engineer", defaultValue: "Mr. Rajesh Shah (M/s R.S. Structural Consultants & Valuers)" },
    { key: "fees", label: "Professional Fees", placeholder: "e.g. ₹3,00,000 lump sum", defaultValue: "₹3,00,000/- (Rupees Three Lakhs Only) lump sum, payable in milestones." },
    { key: "scope", label: "Assigned Scope of Work", placeholder: "e.g. Structural Audit & RCC design", defaultValue: "Carrying out comprehensive structural auditing, preparation of distress map, structural repair estimates, and certifying structural stability." }
  ],
  "Termination Notice": [
    { key: "vendorName", label: "Contractor / Vendor Name", placeholder: "e.g. Apex Security Services", defaultValue: "Apex Security & Allied Services Ltd." },
    { key: "agreementDate", label: "Agreement Date", placeholder: "e.g. 1st January 2025", defaultValue: "1st January 2025" },
    { key: "breaches", label: "Primary Reason / Breaches", placeholder: "e.g. Guard sleeping, absence", defaultValue: "Repeated failure to provide designated number of night shift guards, guards found sleeping on duty on multiple occasions, and failure to reply to show cause." }
  ],
  "Show Cause": [
    { key: "recipientName", label: "Member / Vendor Name", placeholder: "e.g. Flat B-402 Sunil Varma", defaultValue: "Mr. Sunil Varma (Owner, Flat No. B-304)" },
    { key: "violation", label: "Alleged Violation details", placeholder: "e.g. Demolishing safety walls", defaultValue: "Carrying out unauthorized internal civil modifications by breaking safety load-bearing brick walls and causing active water leakages to the flat below (B-204)." },
    { key: "timeline", label: "Reply Deadline (Days)", placeholder: "e.g. 7 days", defaultValue: "7 days from receipt of this notice" }
  ],
  "Reminder": [
    { key: "recipientName", label: "Member / Vendor Name", placeholder: "e.g. Mr. Vinod Shah, Flat A-101", defaultValue: "Mr. Vinod Shah (Owner, Flat No. A-101)" },
    { key: "subject", label: "Subject Dues / Outstanding", placeholder: "e.g. Society Maintenance Dues", defaultValue: "Outstanding society maintenance and special water leakage fund dues since October 2025." },
    { key: "amount", label: "Outstanding Dues Amount", placeholder: "e.g. ₹48,500", defaultValue: "₹48,500/- (Rupees Forty-Eight Thousand Five Hundred Only)" }
  ],
  "Rent Default Notice": [
    { key: "tenantOwner", label: "Defaulter Tenant/Owner Name", placeholder: "e.g. Mr. Vinod Shah", defaultValue: "Mr. Vinod Shah (Tenant) and Owner of Flat A-101" },
    { key: "monthsDefaulted", label: "Months Defaulted & Amount", placeholder: "e.g. 3 months, ₹1,35,000", defaultValue: "Pending transit lease rent for last 3 months (April to June 2026) totaling ₹1,35,000/-" },
    { key: "clause", label: "Agreement Clause Reference", placeholder: "e.g. Clause 14(b)", defaultValue: "Clause 14(b) of the Permanent Alternate Accommodation Agreement (PAAA) dated 12th February 2025" }
  ],
  "Delay Notice": [
    { key: "recipientName", label: "Contractor Name", placeholder: "e.g. Monarch Builders", defaultValue: "M/s Monarch Builders & Developers Pvt. Ltd." },
    { key: "delayedDeliverable", label: "Delayed Item / Milestone", placeholder: "e.g. Municipal permission approval", defaultValue: "Submission of finalized RCC foundation plans and procurement of the IOD (Intimation of Disapproval) permit from municipal authorities." },
    { key: "daysDelayed", label: "Number of Days Overdue", placeholder: "e.g. 60 days", defaultValue: "60 days" }
  ],
  "Legal Notice": [
    { key: "opposingParty", label: "Opposing Party / Developer Name", placeholder: "e.g. Monarch Builders", defaultValue: "M/s Monarch Promoters & Developers Pvt. Ltd." },
    { key: "grievance", label: "Legal Breach / Grievance", placeholder: "e.g. Delay in occupation certificate", defaultValue: "Unreasonable and continuous failure to procure the final Occupation Certificate (OC) and execute the Deemed Conveyance Deed in favor of the society for over 5 years." },
    { key: "resolutionDemanded", label: "Resolution Demanded", placeholder: "e.g. Apply for OC in 15 days", defaultValue: "Procure the final OC and register the Conveyance Deed within 15 days, failing which society will initiate RERA and Consumer Court proceedings." }
  ],
  "Handing Over Notice": [
    { key: "recipientName", label: "Member / Flat Owner Name", placeholder: "e.g. Mr. Rajesh Mehta", defaultValue: "Mr. Rajesh Mehta (Owner, Flat No. 601)" },
    { key: "flatDetails", label: "Newly Allocated Flat Details", placeholder: "e.g. Flat 601, Wing A", defaultValue: "Newly reconstructed Flat No. 601, 6th Floor, Wing A, along with stack car parking slot P-4." },
    { key: "handoverDate", label: "Handover / Inspection Date", placeholder: "e.g. 1st September 2026", defaultValue: "1st September 2026 between 10:00 AM and 4:00 PM" }
  ],
  "Possession Notice": [
    { key: "recipientName", label: "Member Name", placeholder: "e.g. Mrs. Asha Patil", defaultValue: "Mrs. Asha Patil (Owner, Flat No. 1202)" },
    { key: "flatDetails", label: "Flat details", placeholder: "e.g. Flat 1202, Apex Heights", defaultValue: "Flat No. 1202, 12th Floor, 'Apex Heights' Co-operative Housing Society, Vashi" },
    { key: "dues", label: "Dues to be Cleared", placeholder: "e.g. ₹50,000 corpus adjust", defaultValue: "Corpus adjustment and building maintenance advance of ₹50,000/-" }
  ]
};

// SIMULATED Transcripts for trying out the AI Minutes Writer
const SIMULATED_TRANSCRIPTS = [
  {
    title: "Redevelopment Architect Appointment Heated Debate",
    description: "Secretary and Committee member debate on architect costs (M/s Acme vs M/s Vista Group) under Chairman's mediation.",
    transcript: `Ajay Mehta (Chairman): Welcome to the managing committee meeting. Today we must finalize the redevelopment architect selection to move forward with BMC approvals.
Neha Shah (Secretary): Yes, I propose M/s Acme Consultants. Their presentation was extremely professional, and they have successfully delivered 12 local redevelopment projects in Vashi.
Amit Patel (Member): But Neha, Acme is asking for 2.5% of total construction cost! M/s Vista Group is offering to do the work for 1.8%. We represent the members, we must save society money!
Neha Shah (Secretary): Amit, I understand. But Vista Group has never handled a Section 79A redevelopment before. They lack experience in BMC approvals under DCPR-2034. A wrong architect can delay our project by years, which would cost our members ₹40,000 per month in transit rent!
Amit Patel (Member): I agree experience is crucial. But 2.5% is too high. Can we negotiate Acme down to 2.2%?
Ajay Mehta (Chairman): Amit's point is valid. Neha, we can request Acme to compromise at 2.2%. If they agree, we appoint them. If not, we look at other options. Let's pass a resolution to appoint Acme subject to fee renegotiation down to 2.2%.
Amit Patel (Member): If we can negotiate to 2.2%, I agree. I will second the resolution.
Neha Shah (Secretary): Perfect, I will record the resolution. Next, we need to schedule a presentation from developers on 19th July 2026.
Ajay Mehta (Chairman): Great. Next meeting will be on Sunday, 19th July 2026. Meeting adjourned.`
  },
  {
    title: "Monsoon Waterproofing Repairs & Vendor Selection",
    description: "Emergency terrace water leakage discussion and finalized waterproofing quotation selection before heavy rains.",
    transcript: `Ajay Mehta (Chairman): Dear members, Wing B terrace is leaking heavily, and top-floor residents in B-1202 and B-1203 have reported severe active ceiling damage. We need immediate, reliable waterproofing before the monsoon gets worse.
Neha Shah (Secretary): I invited bids. We received quotes from Apex Waterproofers for ₹3,40,000 with a 5-year warranty, and AquaSeal for ₹2,90,000 with a 3-year warranty.
Amit Patel (Member): Apex is more reliable. They did Wing A terrace three years ago, and we have had zero issues there.
Neha Shah (Secretary): Yes, Neha from B-1202 also requested we use quality materials. Apex uses polymer-modified cementitious coatings, which is far superior to AquaSeal's standard coal-tar coating.
Amit Patel (Member): I propose we accept Apex Waterproofers' quote. It is slightly higher but 5-year warranty is much safer.
Ajay Mehta (Chairman): Excellent. Let us approve Apex Waterproofers for Wing B terrace waterproofing at ₹3,40,000. This will be funded from the Society Special Repair Fund. Neha, please issue the work order today. They must start by next Monday.
Neha Shah (Secretary): I will draft the work order immediately and notify the security guard to let Apex workers in on Monday morning.
Ajay Mehta (Chairman): Thank you. The meeting is closed.`
  },
  {
    title: "Security Agency Dues & Night Shift Guard Incidents",
    description: "Heated review regarding guards found sleeping on night shifts, and whether to renew or penalize.",
    transcript: `Ajay Mehta (Chairman): Good evening. We have had two security incidents reported where guards were found asleep on the night shift.
Neha Shah (Secretary): Yes, CCTV footage from Tuesday confirms guard Raju was sleeping from 2:00 AM to 4:00 AM. This is a severe breach of security terms.
Amit Patel (Member): Apex Security charges us ₹80,000 per month. If this is the service, we should terminate them.
Neha Shah (Secretary): Let us issue a Show Cause notice first. We have a 30-day notice clause. We can deduct ₹10,000 as penalty from this month's invoice.
Ajay Mehta (Chairman): Agreed. Issue the show cause notice and apply the ₹10,000 penalty immediately. Neha, please start inviting tenders from other agencies too.`
  }
];

export default function SecretaryView({ onAddDocument, activeProject, showToast }: SecretaryViewProps) {
  // Main Suite Tabs: notice, minutes, statutory
  const [activeSuiteTab, setActiveSuiteTab] = useState<'notice' | 'minutes' | 'statutory'>('notice');
  
  // 1. STATE FOR NOTICE DRAFTING (17 templates)
  const [selectedTemplate, setSelectedTemplate] = useState<NoticeTemplateType>("SGM Notice");
  const [templateAnswers, setTemplateAnswers] = useState<Record<string, string>>({});
  const [isNoticeLoading, setIsNoticeLoading] = useState<boolean>(false);
  const [generatedNotice, setGeneratedNotice] = useState<GeneratedNoticeDraft | null>(null);
  const [activeNoticeSubTab, setActiveNoticeSubTab] = useState<'draft' | 'marathi' | 'whatsapp' | 'compliance'>('draft');
  const [copiedKeyNotice, setCopiedKeyNotice] = useState<string | null>(null);

  // 2. STATE FOR MINUTES WRITER
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [isMinutesLoading, setIsMinutesLoading] = useState<boolean>(false);
  const [generatedMinutes, setGeneratedMinutes] = useState<GeneratedMinutes | null>(null);
  const [activeMinutesTab, setActiveMinutesTab] = useState<keyof GeneratedMinutes>('attendance');
  const [copiedKeyMinutes, setCopiedKeyMinutes] = useState<string | null>(null);
  const [showLetterheadModal, setShowLetterheadModal] = useState<boolean>(false);
  const [recordedAudioSuccess, setRecordedAudioSuccess] = useState<boolean>(false);

  // 3. STATE FOR STATUTORY 11-IN-1 PACKAGE (Original Core)
  const [prompt, setPrompt] = useState<string>('');
  const [isStatutoryLoading, setIsStatutoryLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [generatedStatutory, setGeneratedStatutory] = useState<GeneratedDocuments | null>(null);
  const [activeStatutoryTab, setActiveStatutoryTab] = useState<keyof GeneratedDocuments>('notice');
  const [copiedKeyStatutory, setCopiedKeyStatutory] = useState<string | null>(null);
  const [savedKeysStatutory, setSavedKeysStatutory] = useState<Record<string, boolean>>({});

  const recordingTimer = useRef<any>(null);
  const waveformInterval = useRef<any>(null);

  // Load default template answers on select
  useEffect(() => {
    const defaults: Record<string, string> = {};
    TEMPLATE_QUESTIONS[selectedTemplate].forEach(q => {
      defaults[q.key] = q.defaultValue;
    });
    setTemplateAnswers(defaults);
    setGeneratedNotice(null);
  }, [selectedTemplate]);

  // Handle Recording Simulator Timer
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Simulating a moving wave
      waveformInterval.current = setInterval(() => {
        setAudioWaveform(prev => {
          const next = [...prev, Math.floor(Math.random() * 40) + 10];
          if (next.length > 24) next.shift();
          return next;
        });
      }, 150);
    } else {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (waveformInterval.current) clearInterval(waveformInterval.current);
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (waveformInterval.current) clearInterval(waveformInterval.current);
    };
  }, [isRecording]);

  // Pre-fill prompt for SGBM
  const handleStatutorySuggestion = (text: string) => {
    setPrompt(text);
    handleGenerateStatutory(text);
  };

  // ----------------------------------------------------
  // ACTION 1: NOTICE GENERATOR (17 Templates)
  // ----------------------------------------------------
  const handleGenerateNotice = async () => {
    setIsNoticeLoading(true);
    setGeneratedNotice(null);
    try {
      const res = await fetch('/api/secretary/generate-notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateType: selectedTemplate,
          answers: templateAnswers,
          activeProjectName: activeProject?.name
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to draft notice");
      }

      const data = await res.json();
      setGeneratedNotice(data);
      setActiveNoticeSubTab('draft');
      showToast(`${selectedTemplate} drafted successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An error occurred during notice drafting.", "error");
    } finally {
      setIsNoticeLoading(false);
    }
  };

  const handleSaveNoticeDoc = () => {
    if (!generatedNotice) return;
    const text = generatedNotice.content;
    const newDoc = {
      name: `${activeProject?.name || "Society"}_Notice_${selectedTemplate.replace(/\s+/g, '_')}.txt`,
      folder: 'Permits' as const,
      size: `${Math.ceil(text.length / 1024)} KB`,
      uploadedBy: "AI Notice Drafter",
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Draft' as const,
      version: 'v1.0.0',
      tags: ['compliance', 'notice', selectedTemplate.toLowerCase()],
      linkedProject: activeProject?.name || undefined
    };
    onAddDocument(newDoc);
    showToast("Notice saved directly to Project Documents!", "success");
  };

  // ----------------------------------------------------
  // ACTION 2: MINUTES WRITER
  // ----------------------------------------------------
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setAudioWaveform(new Array(15).fill(20));
    setRecordedAudioSuccess(false);
    showToast("Recording started on device...", "info");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordedAudioSuccess(true);
    showToast("Recording captured! Processing voice and speaker profiles...", "success");
    // Simulate speech-to-text resolution
    setTranscriptText(`Ajay Mehta (Chairman): Let the committee meeting for Vashi Cooperative Housing Society begin. We have critical points today.
Neha Shah (Secretary): Agenda 1 is approving the monsoon structural waterproof repairs for Wing B.
Amit Patel (Member): I want to raise a complaint from residents of B-1202 regarding terrace leakage. AquaSeal gave a lower quote of ₹2,90,000, but they only offer 3 years warranty. 
Neha Shah (Secretary): True, Apex Waterproofers quoted ₹3,40,000 but they provide 5 years warranty and use top-grade elastomeric chemicals.
Ajay Mehta (Chairman): We must not compromise. I propose we appoint Apex Waterproofers at ₹3,40,000. Does everyone agree?
Amit Patel (Member): Yes, Apex is highly reliable. I second the resolution to accept their bid.
Neha Shah (Secretary): Passed. The work must start by Monday. Next meeting scheduled for 19th July 2026 for Developer Presentation.
Ajay Mehta (Chairman): Excellent, thank you all.`);
  };

  const handleProcessMinutes = async () => {
    if (!transcriptText.trim()) {
      showToast("Please record a meeting or paste transcript notes first.", "warning");
      return;
    }

    setIsMinutesLoading(true);
    setGeneratedMinutes(null);

    try {
      const res = await fetch('/api/secretary/generate-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: transcriptText,
          activeProjectName: activeProject?.name
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to write minutes");
      }

      const data = await res.json();
      setGeneratedMinutes(data);
      setActiveMinutesTab('attendance');
      showToast("Heard audio, speaker profiles resolved, and minutes drafted!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An error occurred during minutes writing.", "error");
    } finally {
      setIsMinutesLoading(false);
    }
  };

  const handleSaveMinutesDoc = () => {
    if (!generatedMinutes) return;
    const text = `MINUTES OF THE COMMITTEE MEETING\n\nATTENDANCE:\n${generatedMinutes.attendance}\n\nDISCUSSIONS:\n${generatedMinutes.discussions}\n\nRESOLUTIONS:\n${generatedMinutes.resolutions}`;
    const newDoc = {
      name: `${activeProject?.name || "Society"}_Minutes_${new Date().toLocaleDateString('en-IN').replace(/\//g, '_')}.txt`,
      folder: 'Reports' as const,
      size: `${Math.ceil(text.length / 1024)} KB`,
      uploadedBy: "AI Minutes Writer",
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Approved' as const,
      version: 'v1.0.0',
      tags: ['compliance', 'minutes', 'meeting-records'],
      linkedProject: activeProject?.name || undefined
    };
    onAddDocument(newDoc);
    showToast("Official Minutes saved to Project Documents!", "success");
  };

  // ----------------------------------------------------
  // ACTION 3: STATUTORY 11-IN-1 PACKAGE
  // ----------------------------------------------------
  const subTabMeta: Record<keyof GeneratedDocuments, { label: string; icon: any; category: string }> = {
    notice: { label: "1. Notice", icon: FileText, category: "Compliance" },
    agenda: { label: "2. Agenda", icon: CheckSquare, category: "Compliance" },
    explanatoryStatement: { label: "3. Explanatory Statement", icon: AlertCircle, category: "Compliance" },
    attendanceRegister: { label: "4. Attendance Register", icon: Users, category: "Forms" },
    proxyForm: { label: "5. Proxy Form", icon: FileSignature, category: "Forms" },
    resolution: { label: "6. Draft Resolution", icon: FileCheck, category: "Minutes" },
    votingSheet: { label: "7. Voting Sheet", icon: Vote, category: "Forms" },
    minutesFormat: { label: "8. Minutes Format", icon: FileSignature, category: "Minutes" },
    marathiVersion: { label: "9. मराठी आवृत्ती (Marathi)", icon: Globe, category: "Compliance" },
    email: { label: "10. Email Communication", icon: Mail, category: "Broadcast" },
    whatsAppMessage: { label: "11. WhatsApp Message", icon: MessageSquare, category: "Broadcast" }
  };

  const loadingSteps = [
    "Contacting Toughcons AI compliance core...",
    "Drafting detailed formal Notice & Agenda (English)...",
    "Writing Section 102 legal Explanatory Statement...",
    "Formatting Attendance Register and Proxy Form templates...",
    "Drafting statutory General Body Resolution & Voting Sheet...",
    "Creating post-meeting draft Minutes template...",
    "Translating and localizing Notice and Agenda to formal Marathi (मराठी आवृत्ती)...",
    "Composing Email notice template and broadcast-ready WhatsApp message...",
    "Finalizing compliance payload validation..."
  ];

  const handleGenerateStatutory = async (selectedPrompt?: string) => {
    const targetPrompt = selectedPrompt || prompt;
    if (!targetPrompt.trim()) {
      showToast("Please enter or select a secretary request first.", "warning");
      return;
    }

    setIsStatutoryLoading(true);
    setLoadingStep(0);
    setGeneratedStatutory(null);
    setSavedKeysStatutory({});

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      const res = await fetch('/api/secretary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: targetPrompt })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate compliance bundle");
      }

      const data = await res.json();
      setGeneratedStatutory(data);
      setActiveStatutoryTab('notice');
      showToast("11-in-1 Statutory Package created!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An error occurred during statutory generation.", "error");
    } finally {
      clearInterval(interval);
      setIsStatutoryLoading(false);
    }
  };

  const handleSaveStatutoryDoc = (key: keyof GeneratedDocuments) => {
    if (!generatedStatutory) return;
    const text = generatedStatutory[key];
    const meta = subTabMeta[key];
    
    const folderMap: Record<string, 'Drawings' | 'Permits' | 'Contracts' | 'Reports'> = {
      'Compliance': 'Permits',
      'Forms': 'Contracts',
      'Minutes': 'Reports',
      'Broadcast': 'Reports'
    };

    const newDoc = {
      name: `${activeProject?.name || "Society"}_${key.charAt(0).toUpperCase() + key.slice(1)}.txt`,
      folder: folderMap[meta.category] || 'Reports',
      size: `${Math.ceil(text.length / 1024)} KB`,
      uploadedBy: "AI Society Secretary",
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Draft' as const,
      version: 'v1.0.0',
      tags: ['compliance', 'ai-generated', key],
      linkedProject: activeProject?.name || undefined
    };

    onAddDocument(newDoc);
    setSavedKeysStatutory(prev => ({ ...prev, [key]: true }));
    showToast(`Saved ${key} to Project Documents!`, 'success');
  };

  // General Helpers
  const handleCopy = (text: string, key: string, isNotice = false, isMinutes = false) => {
    navigator.clipboard.writeText(text);
    if (isNotice) setCopiedKeyNotice(key);
    else if (isMinutes) setCopiedKeyMinutes(key);
    else setCopiedKeyStatutory(key);
    showToast("Content copied to clipboard", "success");
    setTimeout(() => {
      setCopiedKeyNotice(null);
      setCopiedKeyMinutes(null);
      setCopiedKeyStatutory(null);
    }, 2000);
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded: ${filename}`, "info");
  };

  return (
     <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="approvals-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
        >
    
    <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full min-h-screen">
      {/* HEADER WITH CONTEXT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase border border-blue-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
              Statutory Secretary &amp; Compliance Automations
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight font-sans">AI Society Secretary Suite</h1>
          <p className="text-slate-500 text-xs mt-1">
            Generate instantly all statutory notice templates, record meeting minutes via mobile, translate to Marathi, and produce society letterhead documents.
          </p>
        </div>
        {activeProject && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Connected Project</span>
              <span className="text-xs font-bold text-slate-700">{activeProject.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* CORE SUITE SUITE TAB CONTROLLER */}
      <div className="flex border-b border-slate-200 gap-6 pb-0.5 print:hidden">
        <button
          onClick={() => {
            setActiveSuiteTab('notice');
            setGeneratedNotice(null);
          }}
          className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSuiteTab === 'notice'
              ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
          }`}
        >
          <FileText className="w-4 h-4" />
          AI Notice &amp; Letter Drafting (17 Templates)
        </button>

        <button
          onClick={() => {
            setActiveSuiteTab('minutes');
            setGeneratedMinutes(null);
          }}
          className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSuiteTab === 'minutes'
              ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
          }`}
        >
          <Mic className="w-4 h-4" />
          AI Minutes Writer &amp; Speaker Diarizer
        </button>

        <button
          onClick={() => {
            setActiveSuiteTab('statutory');
            setGeneratedStatutory(null);
          }}
          className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeSuiteTab === 'statutory'
              ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          11-in-1 Premium SGBM package
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: AI NOTICE & LETTER DRAFTING */}
      {/* ==================================================================== */}
      {activeSuiteTab === 'notice' && (
        <div className="space-y-6 animate-fade-in print:hidden">
          {!generatedNotice && !isNoticeLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar: selection of 17 templates */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Select Legal Template</h3>
                  <p className="text-[11px] text-slate-500">Pick any of the 17 statutory society communications:</p>
                </div>
                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                  {NOTICE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all border ${
                        selectedTemplate === tpl
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600'
                      }`}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right panel: questionnaire */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50/40 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                      Interactive Questionnaire
                    </span>
                    <h3 className="text-sm font-black text-slate-800 uppercase mt-1 tracking-tight font-sans">
                      Drafting parameters: {selectedTemplate}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Answer these simple questions to draft a formal, legally compliance-bound {selectedTemplate} instantly.
                  </p>
                  
                  {TEMPLATE_QUESTIONS[selectedTemplate]?.map((q) => (
                    <div key={q.key} className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        {q.label}
                      </label>
                      <input
                        type="text"
                        value={templateAnswers[q.key] || ''}
                        onChange={(e) => setTemplateAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                        placeholder={q.placeholder}
                        className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={handleGenerateNotice}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition-all"
                  >
                    Draft Notice Now
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Screen */}
          {isNoticeLoading && (
            <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-6 py-16 animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <FileText className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">Formulating {selectedTemplate}</h3>
                <p className="text-slate-500 text-xs italic">Consulting CHS legal bylaws &amp; translating...</p>
              </div>
            </div>
          )}

          {/* Results Screen */}
          {generatedNotice && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar: Results Tabs */}
              <div className="lg:col-span-3 space-y-3">
                <button
                  onClick={() => setGeneratedNotice(null)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Parameters
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 block.5">DRAFT OUTPUTS</span>
                  
                  <button
                    onClick={() => setActiveNoticeSubTab('draft')}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                      activeNoticeSubTab === 'draft' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>1. English Draft</span>
                  </button>

                  <button
                    onClick={() => setActiveNoticeSubTab('marathi')}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                      activeNoticeSubTab === 'marathi' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>2. मराठी आवृत्ती (Marathi)</span>
                  </button>

                  <button
                    onClick={() => setActiveNoticeSubTab('whatsapp')}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                      activeNoticeSubTab === 'whatsapp' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>3. WhatsApp Broadcast</span>
                  </button>

                  <button
                    onClick={() => setActiveNoticeSubTab('compliance')}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                      activeNoticeSubTab === 'compliance' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>4. Compliance Guidelines</span>
                  </button>
                </div>
              </div>

              {/* Right Panel: Content preview */}
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                  {/* Toolbar */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        {selectedTemplate} - {activeNoticeSubTab.toUpperCase()}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                        {generatedNotice.subject}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          const val = activeNoticeSubTab === 'draft' ? generatedNotice.content :
                                      activeNoticeSubTab === 'marathi' ? generatedNotice.marathiContent :
                                      activeNoticeSubTab === 'whatsapp' ? generatedNotice.whatsappBroadcast :
                                      generatedNotice.keyTakeaways;
                          handleCopy(val, activeNoticeSubTab, true);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedKeyNotice === activeNoticeSubTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKeyNotice === activeNoticeSubTab ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => {
                          const val = activeNoticeSubTab === 'draft' ? generatedNotice.content :
                                      activeNoticeSubTab === 'marathi' ? generatedNotice.marathiContent :
                                      activeNoticeSubTab === 'whatsapp' ? generatedNotice.whatsappBroadcast :
                                      generatedNotice.keyTakeaways;
                          handleDownload(val, `${selectedTemplate.replace(/\s+/g, '_')}_${activeNoticeSubTab}.txt`);
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>

                      {activeNoticeSubTab === 'draft' && (
                        <button
                          onClick={handleSaveNoticeDoc}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Save to Project Docs
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Document Body */}
                  <div className="p-6 md:p-8">
                    <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl shadow-inner font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all max-h-[600px] overflow-y-auto">
                      {activeNoticeSubTab === 'draft' && generatedNotice.content}
                      {activeNoticeSubTab === 'marathi' && generatedNotice.marathiContent}
                      {activeNoticeSubTab === 'whatsapp' && generatedNotice.whatsappBroadcast}
                      {activeNoticeSubTab === 'compliance' && generatedNotice.keyTakeaways}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: AI MINUTES WRITER */}
      {/* ==================================================================== */}
      {activeSuiteTab === 'minutes' && (
        <div className="space-y-6 animate-fade-in print:hidden">
          {!generatedMinutes && !isMinutesLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar: Voice recorder / presets */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-2xs">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Mobile Audio Recorder</h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Simulate recording your committee meeting from your mobile phone.
                  </p>
                </div>

                {/* Simulated mobile card body */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-5 relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[8px] font-bold text-slate-400 font-mono">LIVE FEED</span>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-full">
                    {isRecording ? (
                      <MicOff className="w-10 h-10 text-red-500 cursor-pointer animate-pulse" onClick={handleStopRecording} />
                    ) : (
                      <Mic className="w-10 h-10 text-blue-500 cursor-pointer" onClick={handleStartRecording} />
                    )}
                  </div>

                  {/* Timer & details */}
                  <div className="text-center">
                    <span className="text-xl font-mono font-bold text-white tracking-widest block">
                      {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
                      {(recordingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                      {isRecording ? "Recording Society Meeting..." : "TAP MIC TO SIMULATE MOBILE AUDIO RECORDING"}
                    </span>
                  </div>

                  {/* Dynamic wave form visualization */}
                  {isRecording && (
                    <div className="flex items-end justify-center gap-1 h-12 w-full pt-2">
                      {audioWaveform.map((height, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-600 to-red-500 rounded-full transition-all duration-150"
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                  )}

                  {recordedAudioSuccess && !isRecording && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                      <Check className="w-3 h-3" /> Audio Simulated Successfully!
                    </span>
                  )}
                </div>

                {/* Pre-recorded transcripts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Or Load Preset Debates</span>
                    <span className="text-[9px] text-blue-600 bg-blue-50 border border-blue-100 px-2 rounded-full font-bold uppercase">No Audio Needed</span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {SIMULATED_TRANSCRIPTS.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTranscriptText(t.transcript);
                          showToast(`Loaded: ${t.title}`, "info");
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-100 p-3 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {t.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 italic leading-snug line-clamp-2">
                          "{t.description}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: Transcript Editor and Process */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col h-full space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Meeting Transcript / Speech-to-Text Raw</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Toughcons speech-to-text diarization resolving distinct speaker voice signatures. Paste any rough notes or edit the simulated transcription below:
                  </p>
                </div>

                <div className="flex-1">
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Rough notes, meeting transcript, or record above to populate speech-to-text logs here..."
                    className="w-full h-[360px] border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none bg-slate-50/50 select-all"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={handleProcessMinutes}
                    disabled={!transcriptText.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition-all"
                  >
                    Process &amp; Write Official Minutes
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Screen */}
          {isMinutesLoading && (
            <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-6 py-16 animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <Volume2 className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">Processing Meeting Audio Logs</h3>
                <p className="text-slate-500 text-xs italic">Resolving speaker profiles, mapping discussions, and formulating statutory resolutions...</p>
              </div>
            </div>
          )}

          {/* Results Screen */}
          {generatedMinutes && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar tabs for processed minutes */}
              <div className="lg:col-span-3 space-y-3">
                <button
                  onClick={() => setGeneratedMinutes(null)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Transcript
                </button>

                {/* Official society letterhead conversion */}
                <button
                  onClick={() => setShowLetterheadModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer border border-transparent"
                >
                  <Printer className="w-4 h-4" /> Convert to Letterhead PDF
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-1 shadow-2xs">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2 block.5">Processed Fields</span>
                  
                  {[
                    { key: 'attendance', label: "1. Attendance" },
                    { key: 'discussions', label: "2. Key Discussions" },
                    { key: 'memberQuestions', label: "3. Member Questions" },
                    { key: 'replies', label: "4. Official Replies" },
                    { key: 'decisions', label: "5. Final Decisions" },
                    { key: 'resolutions', label: "6. Formal Resolutions" },
                    { key: 'actionPoints', label: "7. Action Plan" },
                    { key: 'nextMeetingDate', label: "8. Next Meeting Date" },
                    { key: 'speakerLogs', label: "9. Speaker Logs" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveMinutesTab(tab.key as keyof GeneratedMinutes)}
                      className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all ${
                        activeMinutesTab === tab.key ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right panel: content box */}
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
                  {/* Toolbar */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        AI Minutes Segment: {activeMinutesTab.toUpperCase()}
                      </h4>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        Diarized speaker separation active
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(generatedMinutes[activeMinutesTab], activeMinutesTab, false, true)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedKeyMinutes === activeMinutesTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKeyMinutes === activeMinutesTab ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => handleDownload(generatedMinutes[activeMinutesTab], `Meeting_Minutes_${activeMinutesTab}.txt`)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>

                      <button
                        onClick={handleSaveMinutesDoc}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save to Docs
                      </button>
                    </div>
                  </div>

                  {/* Text panel */}
                  <div className="p-6 md:p-8">
                    <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl shadow-inner font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all max-h-[600px] overflow-y-auto">
                      {generatedMinutes[activeMinutesTab]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STATUTORY 11-IN-1 SGBM PACKAGE */}
      {/* ==================================================================== */}
      {activeSuiteTab === 'statutory' && (
        <div className="space-y-6 animate-fade-in print:hidden">
          {!generatedStatutory && !isStatutoryLoading && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Card to prompt */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">ASK THE AI SECRETARY</label>
                    <p className="text-slate-600 text-xs font-medium">
                      Describe what kind of statutory housing society meeting you need. AI will instantly prepare a complete 11-in-1 pack of compliance draft notices, agendas, Marathi versions, resolutions, proxy registers, and attendance sheets.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Prepare notice for Special General Body Meeting to appoint Architect."
                        rows={3}
                        className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none bg-slate-50/40"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleGenerateStatutory()}
                        disabled={!prompt.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        Generate SGBM Package
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Recommended statutory templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Appoint Redevelopment Architect",
                      text: "Prepare notice for Special General Body Meeting to appoint Architect.",
                      tag: "SGBM"
                    },
                    {
                      title: "Tender Selection Meeting",
                      text: "Draft Special General Body Meeting notice to select and finalize the redevelopment contractor/builder from tenders.",
                      tag: "SGBM"
                    },
                    {
                      title: "Annual General Meeting 2026",
                      text: "Create Annual General Meeting (AGM) notice to approve audited financial reports and appoint auditors for the year 2026.",
                      tag: "AGM"
                    },
                    {
                      title: "Form Conveyance Deed",
                      text: "Prepare committee meeting notice to finalize the execution of Deemed Conveyance for the housing society.",
                      tag: "Committee"
                    }
                  ].map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleStatutorySuggestion(s.text)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full uppercase">
                            {s.tag}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug">{s.title}</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed italic">"{s.text}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading statutory */}
          {isStatutoryLoading && (
            <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-6 py-16 animate-pulse">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">Drafting Compliance Package</h3>
                <p className="text-slate-500 text-xs italic font-medium">All generated within seconds</p>
              </div>
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Active Secretary Pipeline</span>
                </div>
                <p className="text-xs font-bold text-slate-700 font-mono transition-all">
                  &gt; {loadingSteps[loadingStep]}
                </p>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000"
                    style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Statutory Results workspace */}
          {generatedStatutory && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar: Tab selector (3 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase font-mono">WORKSPACE</span>
                    <button 
                      onClick={() => {
                        setGeneratedStatutory(null);
                        setPrompt('');
                      }}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-extrabold flex items-center gap-1 uppercase"
                    >
                      <RefreshCw className="w-3 h-3" /> New SGBM
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">"{prompt || "Special General Body Package"}"</p>
                </div>

                {/* Structured menu grouping */}
                {['Compliance', 'Forms', 'Minutes', 'Broadcast'].map((category) => {
                  const items = Object.entries(subTabMeta).filter(([_, m]) => m.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-2 block">{category}</span>
                      <div className="space-y-1">
                        {items.map(([key, meta]) => {
                          const Icon = meta.icon;
                          const isActive = activeStatutoryTab === key;
                          const isSaved = savedKeysStatutory[key];
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveStatutoryTab(key as keyof GeneratedDocuments)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border ${
                                isActive
                                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                                  : 'bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600 hover:text-slate-800'
                              }`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className="truncate flex-1">{meta.label}</span>
                              {isSaved && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 shrink-0">
                                  <Check className="w-2.5 h-2.5" /> Saved
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right panel: Tab content workspace (9 cols) */}
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
                  {/* Toolbar */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {React.createElement(subTabMeta[activeStatutoryTab].icon, { className: "w-5 h-5 text-blue-600" })}
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{subTabMeta[activeStatutoryTab].label.substring(3)}</h3>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                          {subTabMeta[activeStatutoryTab].category} Doc
                        </span>
                      </div>
                    </div>

                    {/* Document Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCopy(generatedStatutory[activeStatutoryTab], activeStatutoryTab)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedKeyStatutory === activeStatutoryTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKeyStatutory === activeStatutoryTab ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleDownload(generatedStatutory[activeStatutoryTab], `${activeProject?.name || "Society"}_${activeStatutoryTab}.txt`)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                      <button
                        onClick={() => handleSaveStatutoryDoc(activeStatutoryTab)}
                        disabled={savedKeysStatutory[activeStatutoryTab]}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-emerald-50 disabled:text-emerald-700 disabled:border-emerald-200 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-transparent"
                      >
                        {savedKeysStatutory[activeStatutoryTab] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Saved to Documents
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Save to Project Docs
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Document Text Box */}
                  <div className="p-6 md:p-8">
                    <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-2xl shadow-inner font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all max-h-[600px] overflow-y-auto">
                      {generatedStatutory[activeStatutoryTab]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. MODAL: SOCIETY LETTERHEAD PREVIEW & PRINT FOR MINUTES */}
      {/* ==================================================================== */}
      {showLetterheadModal && generatedMinutes && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:p-0 print:bg-white print:static print:h-auto overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
            
            {/* Modal Header Control Bar (Hidden on print) */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Official Society Letterhead Preview</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Ready to print or save as compliance PDF</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowLetterheadModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* Letterhead Print Area */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible">
              <div className="border border-slate-300 rounded-md p-8 md:p-12 min-h-[297mm] relative flex flex-col justify-between print:border-0 print:p-0 print:min-h-0">
                
                {/* 1. Letterhead Top Emblem */}
                <div>
                  <div className="text-center space-y-1.5 border-b-2 border-blue-800 pb-4">
                    <span className="text-[10px] font-extrabold text-blue-800 tracking-widest uppercase block">FOR PRIVATE CIRCULATION ONLY</span>
                    <h1 className="text-xl md:text-2xl font-black text-blue-900 tracking-tight font-sans uppercase">
                      {activeProject?.name?.toUpperCase() || "THE TOUGHCONS"} CO-OPERATIVE HOUSING SOCIETY LTD.
                    </h1>
                    <p className="text-[10px] font-bold text-slate-600 tracking-wider">
                      Regd No. MUM/HSG/12948 of 2012 | Sector-17, Vashi, Navi Mumbai - 400703
                    </p>
                    <p className="text-[9px] font-semibold text-slate-400">
                      Email: contact@toughconssociety.org | Contact Number: +91 22 2781 4050
                    </p>
                  </div>

                  {/* 2. Dated Reference Line */}
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 pt-4 pb-6">
                    <span>Ref No: TCHS/MTG/2026/04</span>
                    <span>Date: 16th July 2026</span>
                  </div>

                  {/* 3. Document Body */}
                  <div className="space-y-6 text-xs text-slate-800 leading-relaxed font-sans">
                    <h2 className="text-center text-sm font-black text-blue-900 underline tracking-wide uppercase">
                      MINUTES OF THE MANAGING COMMITTEE MEETING
                    </h2>

                    {/* Attendance */}
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-blue-900 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">
                        I. Attendance &amp; Quorum Designation
                      </h3>
                      <pre className="font-sans text-slate-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-slate-200">
                        {generatedMinutes.attendance}
                      </pre>
                    </div>

                    {/* Discussions */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-extrabold text-blue-900 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">
                        II. Agenda-wise Discussion Summary
                      </h3>
                      <pre className="font-sans text-slate-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-slate-200">
                        {generatedMinutes.discussions}
                      </pre>
                    </div>

                    {/* Questions & Replies */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-extrabold text-blue-900 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">
                        III. Member Interpellations &amp; Answers
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1">Questions Asked</span>
                          <p className="text-[11px] whitespace-pre-wrap text-slate-700 italic">"{generatedMinutes.memberQuestions}"</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-extrabold text-blue-600 block uppercase mb-1">Committee Replies</span>
                          <p className="text-[11px] whitespace-pre-wrap text-slate-700">"{generatedMinutes.replies}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Decisions & Resolutions */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-extrabold text-blue-900 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">
                        IV. Formal Statutory Resolutions Approved
                      </h3>
                      <pre className="font-sans text-slate-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-slate-200">
                        {generatedMinutes.resolutions}
                      </pre>
                    </div>

                    {/* Action Points */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-extrabold text-blue-900 border-b border-slate-100 pb-1 uppercase tracking-wider text-[11px]">
                        V. Action items &amp; Assignment Table
                      </h3>
                      <pre className="font-sans text-slate-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-slate-200">
                        {generatedMinutes.actionPoints}
                      </pre>
                    </div>

                    {/* Next Meeting Date */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
                      <span className="font-extrabold uppercase block mb-0.5">VI. Next Scheduled Session</span>
                      {generatedMinutes.nextMeetingDate}
                    </div>
                  </div>
                </div>

                {/* 4. Letterhead Footer Signatures */}
                <div className="pt-16 border-t border-slate-100 flex justify-between items-end">
                  <div className="text-center w-40">
                    <div className="h-10" /> {/* signature pad spacing */}
                    <span className="block border-t border-slate-400 text-[10px] font-extrabold text-slate-600 uppercase pt-1">
                      Hon. Chairman
                    </span>
                    <span className="text-[9px] text-slate-400 block">{activeProject?.name || "Society"} CHS</span>
                  </div>

                  {/* Stamp space */}
                  <div className="w-24 h-24 border-2 border-dashed border-blue-300 rounded-full flex items-center justify-center text-[8px] font-extrabold text-blue-300 text-center uppercase p-1">
                    OFFICIAL SOCIETY STAMP
                  </div>

                  <div className="text-center w-40">
                    <div className="h-10" /> {/* signature pad spacing */}
                    <span className="block border-t border-slate-400 text-[10px] font-extrabold text-slate-600 uppercase pt-1">
                      Hon. Secretary
                    </span>
                    <span className="text-[9px] text-slate-400 block">{activeProject?.name || "Society"} CHS</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </motion.div>
  );
}
