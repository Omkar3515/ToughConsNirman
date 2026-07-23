/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  Edit, 
  Share2, 
  ListChecks, 
  UserPlus, 
  History, 
  PlusCircle, 
  X,
  FileText,
  Paperclip,
  Activity
} from 'lucide-react';
import { Meeting, Participant, MOMItem } from '../types';
import { motion } from 'motion/react';

interface MeetingsViewProps {
  meetings: Meeting[];
  selectedMeetingId: string | null;
  onSelectMeeting: (id: string) => void;
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onUpdateMeetingMOM: (id: string, mom: MOMItem[]) => void;
  onUpdateMeetingAgenda: (id: string, agendaCompleted: boolean[]) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function MeetingsView({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onAddMeeting,
  onUpdateMeetingMOM,
  onUpdateMeetingAgenda,
  showToast,
}: MeetingsViewProps) {
  // Calendar simulation state
  const [selectedDay, setSelectedDay] = useState<number>(11);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'info' | 'actions' | 'attachments'>('info');

  // Form states for new meeting
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2023-10-11');
  const [newTime, setNewTime] = useState('10:00 AM - 11:30 AM');
  const [newLocation, setNewLocation] = useState('Site Office A-12');
  const [newProject, setNewProject] = useState('SkyTower Redevelopment');
  const [newAgenda, setNewAgenda] = useState('');

  // MOM Item editor temp input state
  const [newMomText, setNewMomText] = useState('');
  const [newMomAssignee, setNewMomAssignee] = useState('Arthur Vance');
  const [newMomDueDate, setNewMomDueDate] = useState('2023-10-12');

  // Guest invitation states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState('Sub-Contractor');

  // Decisions and simulated attachment states
  const [newDecisionText, setNewDecisionText] = useState('');
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [uploadProgressAttachment, setUploadProgressAttachment] = useState(0);

  // Initialize and persist rich local meeting state
  const [localMeetings, setLocalMeetings] = useState<any[]>(() => {
    const saved = localStorage.getItem('toughcons_local_meetings_v2');
    if (saved) return JSON.parse(saved);
    return meetings.map(m => ({
      ...m,
      attendance: m.participants.reduce((acc: any, p: any) => {
        acc[p.name] = true; // default present
        return acc;
      }, {}),
      decisions: [
        'Unanimously approved plinth layout realignment for Wing B.',
        'Finalized concrete raw materials quality control matrix for structural load verification.'
      ],
      attachmentsList: [
        { id: '1', name: 'Slab_Pour_Calculations_V2.pdf', size: '1.4 MB', uploadedAt: 'Oct 11, 2023' },
        { id: '2', name: 'Zoning_B_Permits.zip', size: '14.2 MB', uploadedAt: 'Oct 09, 2023' }
      ]
    }));
  });

  // Persist local state
  useEffect(() => {
    localStorage.setItem('toughcons_local_meetings_v2', JSON.stringify(localMeetings));
  }, [localMeetings]);

  // Sync prop changes (e.g. if new meeting is added from parents)
  useEffect(() => {
    if (meetings.length > 0) {
      setLocalMeetings(prev => {
        const existingIds = prev.map(p => p.id);
        const newItems = meetings.filter(m => !existingIds.includes(m.id)).map(m => ({
          ...m,
          attendance: m.participants.reduce((acc: any, p: any) => {
            acc[p.name] = true;
            return acc;
          }, {}),
          decisions: ['Initial meeting baseline created.'],
          attachmentsList: [
            { id: '1', name: 'Meeting_Agenda_Outline.pdf', size: '420 KB', uploadedAt: 'Just Now' }
          ]
        }));
        if (newItems.length > 0) {
          return [...prev, ...newItems];
        }
        return prev;
      });
    }
  }, [meetings]);

  // Get active meeting or default from local master state
  const activeMeeting = localMeetings.find(m => m.id === (selectedMeetingId || meetings[0]?.id)) || localMeetings[0];
  const actionItems = activeMeeting?.mom?.filter((item: MOMItem) => item.status === 'Action Item') ?? [];

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    // Find first meeting on this simulated day
    const dayStr = `2023-10-${String(day).padStart(2, '0')}`;
    const dayMeeting = meetings.find(m => m.date === dayStr);
    if (dayMeeting) {
      onSelectMeeting(dayMeeting.id);
    }
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const agendaArr = newAgenda.split('\n').filter(line => line.trim() !== '');
    if (agendaArr.length === 0) {
      agendaArr.push('Review project current constraints.', 'Coordinate structural delivery validation.');
    }

    const standardParticipants: Participant[] = [
      { name: 'Arthur Vance', role: 'Lead Engineer', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBf1Q9m3fxQRGuyKuiCHEk-c8OFPvq0Cf3PZzdQ83ElGCIYsh_vk98PPznAnDuj6dCiD4Qgj4zYTlKiOCCu3pG7umAqxdh2wcaxeCZEN-3GYTuuC27FUt-yHBzV1efkmBvVcxbskHdQ79VC0vqYFpkyPb_trwJQqbZ-FGpK4toamlR9b7-quCdgsvWKeaZ4N4q1YucGALRDSjd_mUwAgRl5kHNtdSHu4njFSk56rbvmjFCb3p1J-quoBg', verified: true },
      { name: 'Sarah Connor', role: 'Safety Compliance', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt9xGNRC9kXG8NYwqcXCaaOf32QAvL2PI0MF5a30z_xG6Ojh1S8hOwheZzepiqo132aquSd5NQTIAk85W9d6W7IepsvQG20vWXC-mdPX4VrY6H20Im-TvDHo0tpc1RHYmEgDy3zv73kaQ3ItV0Kl0i63pUiIexmbk6RYrKk83cJsTNyJh6jmM396NnbHgIR-Nfzolyk39O9-eYdRi3pqchx62H5sOJE3IM1OTksDiZP8YKmv4oLw-16g', verified: true }
    ];

    onAddMeeting({
      title: newTitle,
      date: newDate,
      time: newTime,
      location: newLocation,
      project: newProject,
      status: 'Upcoming',
      agenda: agendaArr,
      agendaCompleted: new Array(agendaArr.length).fill(false),
      participants: standardParticipants,
      mom: [
        { id: '1', discussionPoint: 'Review of current milestones and safety briefings.', status: 'Completed' }
      ]
    });

    setNewTitle('');
    setNewAgenda('');
    setShowMeetingModal(false);
  };

  const handleAddMOMPoint = () => {
    if (!newMomText || !activeMeeting) return;

    const newItem: MOMItem = {
      id: String((activeMeeting.mom || []).length + 1),
      discussionPoint: newMomText,
      assignee: newMomAssignee || undefined,
      dueDate: newMomDueDate || undefined,
      status: 'Action Item'
    };

    setLocalMeetings(prev => prev.map(m => {
      if (m.id === activeMeeting.id) {
        return {
          ...m,
          mom: [...(m.mom || []), newItem]
        };
      }
      return m;
    }));

    onUpdateMeetingMOM(activeMeeting.id, [...(activeMeeting.mom || []), newItem]);
    setNewMomText('');
  };

  const handleToggleMOMStatus = (momId: string) => {
    if (!activeMeeting) return;
    let updatedMomList: any[] = [];
    setLocalMeetings(prev => prev.map(m => {
      if (m.id === activeMeeting.id) {
        const updated = m.mom.map((item: any) => {
          if (item.id === momId) {
            const nextStatus: MOMItem['status'] = 
              item.status === 'Convert' ? 'Action Item' : 
              item.status === 'Action Item' ? 'Completed' : 'Convert';
            return { ...item, status: nextStatus };
          }
          return item;
        });
        updatedMomList = updated;
        return { ...m, mom: updated };
      }
      return m;
    }));
    onUpdateMeetingMOM(activeMeeting.id, updatedMomList);
  };

  const handleToggleAgendaItem = (idx: number) => {
    if (!activeMeeting) return;
    let updatedAgenda: boolean[] = [];
    setLocalMeetings(prev => prev.map(m => {
      if (m.id === activeMeeting.id) {
        const currentCompleted = [...m.agendaCompleted];
        currentCompleted[idx] = !currentCompleted[idx];
        updatedAgenda = currentCompleted;
        return { ...m, agendaCompleted: currentCompleted };
      }
      return m;
    }));
    onUpdateMeetingAgenda(activeMeeting.id, updatedAgenda);
  };

  const handleInviteGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !activeMeeting) return;

    const newGuest: Participant = {
      name: guestName,
      role: guestRole,
      avatarUrl: '', 
      verified: false
    };

    setLocalMeetings(prev => prev.map(m => {
      if (m.id === activeMeeting.id) {
        const updatedParticipants = [...(m.participants || []), newGuest];
        const updatedAttendance = { ...m.attendance };
        updatedAttendance[newGuest.name] = true; // default present
        return {
          ...m,
          participants: updatedParticipants,
          attendance: updatedAttendance
        };
      }
      return m;
    }));

    setGuestName('');
    setShowGuestModal(false);
  };

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim() || !activeMeeting) return;

    setLocalMeetings(prev => prev.map(m => {
      if (m.id === activeMeeting.id) {
        return {
          ...m,
          decisions: [...(m.decisions || []), newDecisionText.trim()]
        };
      }
      return m;
    }));
    setNewDecisionText('');
    if (showToast) {
      showToast('Decision Registered: Added as official consensus point to minutes archive.', 'success');
    }
  };

  const handleSimulateAttachmentUpload = () => {
    if (isUploadingAttachment || !activeMeeting) return;
    setIsUploadingAttachment(true);
    setUploadProgressAttachment(0);

    const interval = setInterval(() => {
      setUploadProgressAttachment(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingAttachment(false);
          setLocalMeetings(curr => curr.map(m => {
            if (m.id === activeMeeting.id) {
              const fileName = `MEETING_ATTACHMENT_${Math.floor(100 + Math.random() * 899)}.pdf`;
              return {
                ...m,
                attachmentsList: [
                  ...(m.attachmentsList || []),
                  {
                    id: String((m.attachmentsList || []).length + 1),
                    name: fileName,
                    size: '2.8 MB',
                    uploadedAt: 'Just Now'
                  }
                ]
              };
            }
            return m;
          }));
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Calendar cells render (October 2023 simulated month)
  const renderCalendarDays = () => {
    const daysArr = [];

    // Prior month padding
    for (let i = 24; i <= 30; i++) {
      daysArr.push(
        <div key={`prev-${i}`} className="py-2 text-slate-300 text-xs font-semibold select-none">
          {i}
        </div>
      );
    }

    // Current month October 2023 days
    for (let day = 1; day <= 24; day++) {
      const isSelected = selectedDay === day;
      const isMeetingDay = meetings.some(m => m.date === `2023-10-${String(day).padStart(2, '0')}`);
      
      let containerClass = "py-2 text-xs font-bold rounded-xl cursor-pointer select-none transition-all flex flex-col items-center justify-center relative w-8 h-8 mx-auto ";
      if (isSelected) {
        containerClass += "bg-blue-600 text-white shadow-md shadow-blue-500/15";
      } else if (day === 11) {
        containerClass += "border border-blue-200 bg-blue-50/50 text-blue-600";
      } else {
        containerClass += "hover:bg-slate-50 text-slate-800";
      }

      daysArr.push(
        <div 
          key={`day-${day}`} 
          onClick={() => handleSelectDay(day)}
          className={containerClass}
        >
          <span>{day}</span>
          {isMeetingDay && !isSelected && (
            <span className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></span>
          )}
          {isMeetingDay && isSelected && (
            <span className="absolute bottom-1 w-1 h-1 bg-white/65 rounded-full"></span>
          )}
        </div>
      );
    }

    return daysArr;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="meetings-view flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)]"
    >
      
      {/* LEFT COLUMN: CALENDAR & MEETING LIST */}
      <section className="w-full lg:w-[380px] xl:w-[420px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white lg:h-full shrink-0">
        
        {/* Calendar Box */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-700">Schedule</span>
              <h2 className="text-sm font-extrabold text-slate-900 mt-1">October 2023</h2>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx} className="font-sans text-[10px] font-bold text-slate-400">{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center font-sans">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Meeting List Header */}
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today&apos;s Meetings</span>
          <button
            onClick={() => setShowMeetingModal(true)}
            className="bg-blue-600 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 hover:bg-blue-700 transition-colors cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <Plus className="w-3.5 h-3.5" /> NEW
          </button>
        </div>

        {/* Meeting List Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[360px] lg:max-h-none">
          {meetings.map((meeting) => {
            const isSelected = meeting.id === activeMeeting?.id;
            return (
              <div
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className={`p-4 sm:p-5 cursor-pointer transition-all flex flex-col justify-between hover:relative hover:z-10 hover:shadow-sm ${
                  isSelected 
                    ? 'border-l-4 border-l-blue-600 bg-blue-50/15' 
                    : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold block ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                      {meeting.time}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug line-clamp-1">
                      {meeting.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[280px]">
                      Project: {meeting.project}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 mt-1 group-hover:text-slate-500 transition-colors" />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {meeting.participants.slice(0, 3).map((p, pIdx) => (
                      <div key={pIdx} className="w-5.5 h-5.5 rounded-full border border-white bg-slate-100 overflow-hidden shadow-sm">
                        {p.avatarUrl ? (
                          <img className="w-full h-full object-cover" src={p.avatarUrl} alt={p.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-slate-700">
                            {p.name[0]}
                          </div>
                        )}
                      </div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <div className="w-5.5 h-5.5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] font-extrabold text-slate-600 shadow-sm">
                        +{meeting.participants.length - 3}
                      </div>
                    )}
                  </div>

                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    meeting.status === 'Ongoing' ? 'bg-red-50 text-red-600 border-red-100' :
                    meeting.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {meeting.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT COLUMN: MEETING DETAILS & ACTIONS */}
      <section className="flex-1 flex flex-col bg-white overflow-hidden lg:h-full min-h-[600px]">
        {activeMeeting ? (
          <>
            {/* Detail Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-start gap-4 shrink-0 bg-gradient-to-r from-white to-slate-50/80">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-full border ${
                    activeMeeting.status === 'Ongoing' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                    activeMeeting.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {activeMeeting.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {new Date(activeMeeting.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{activeMeeting.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {activeMeeting.location}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {activeMeeting.time}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => showToast && showToast(`Review Mode: Editing details of meeting ${activeMeeting.id}`, 'info')}
                  className="flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 font-sans text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => showToast && showToast(`Share Mode: Draft minutes of meeting successfully formatted & shared as operations report.`, 'success')}
                  className="flex items-center gap-1.5 bg-blue-600 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Report
                </button>
              </div>
            </div>

            {/* Tab switchers */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-6">
              <button
                onClick={() => setDetailTab('info')}
                className={`px-4 py-3.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                  detailTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Meeting Info &amp; Agenda
              </button>
              <button
                onClick={() => setDetailTab('actions')}
                className={`px-4 py-3.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                  detailTab === 'actions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Action Items ({actionItems.length})
              </button>
              <button
                onClick={() => setDetailTab('attachments')}
                className={`px-4 py-3.5 font-sans text-xs font-bold transition-all cursor-pointer ${
                  detailTab === 'attachments' ? 'border-b-2 border-b-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Attachments
              </button>
            </div>

            {/* Content Switcher Frame */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {detailTab === 'info' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Agenda & Decisions section (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Agenda Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ListChecks className="w-5 h-5 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Agenda Items</h3>
                      </div>

                      <div className="space-y-3">
                        {activeMeeting.agenda.map((agItem: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                            <input
                              type="checkbox"
                              checked={activeMeeting.agendaCompleted[idx]}
                              onChange={() => handleToggleAgendaItem(idx)}
                              className="rounded-lg border-slate-300 text-blue-600 mt-0.5 cursor-pointer focus:ring-blue-500/20 w-4 h-4"
                            />
                            <div>
                              <p className={`text-xs font-semibold ${
                                activeMeeting.agendaCompleted[idx] ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}>
                                {agItem}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decisions Taken Section */}
                    <div className="bg-blue-50/20 border border-blue-100 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">Decisions Taken / Consensus Points</h3>
                      </div>
                      
                      {activeMeeting.decisions && activeMeeting.decisions.length > 0 ? (
                        <div className="space-y-2.5">
                          {activeMeeting.decisions.map((decision: string, dIdx: number) => (
                            <div key={dIdx} className="flex items-start gap-2.5 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                              <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                              <p className="text-xs text-slate-700 font-semibold">{decision}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic">No specific strategic decisions recorded yet for this session.</p>
                      )}

                      {/* Add Decision Form */}
                      <form onSubmit={handleAddDecision} className="flex gap-2 pt-2 border-t border-blue-100/50">
                        <input
                          type="text"
                          required
                          placeholder="Record a key consensus or core decision..."
                          value={newDecisionText}
                          onChange={(e) => setNewDecisionText(e.target.value)}
                          className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10"
                        >
                          Record Decision
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Participants section (4 cols) */}
                  <div className="lg:col-span-4 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl self-start">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Participants</h3>
                        <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">Toggle attendance</span>
                      </div>
                      <button 
                        onClick={() => setShowGuestModal(true)}
                        className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Invite
                      </button>
                    </div>

                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
                      {activeMeeting.participants.map((person: any, pIdx: number) => {
                        const isPresent = activeMeeting.attendance?.[person.name] !== false;
                        return (
                          <div key={pIdx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7.5 h-7.5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 overflow-hidden shadow-xs">
                                {person.avatarUrl ? (
                                  <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{person.name[0]}</span>
                                )}
                              </div>
                              <div className="leading-tight">
                                <p className="text-xs font-bold text-slate-900">{person.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{person.role}</p>
                              </div>
                            </div>
                            
                            {/* Interactive Attendance Toggle */}
                            <button
                              onClick={() => {
                                setLocalMeetings(prev => prev.map(m => {
                                  if (m.id === activeMeeting.id) {
                                    const updatedAttendance = { ...m.attendance };
                                    updatedAttendance[person.name] = !updatedAttendance[person.name];
                                    return { ...m, attendance: updatedAttendance };
                                  }
                                  return m;
                                }));
                              }}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-lg cursor-pointer transition-all border ${
                                isPresent
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50'
                                  : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/50'
                              }`}
                            >
                              {isPresent ? 'Present' : 'Absent'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {detailTab === 'actions' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase">Formal Action Items Track</h3>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3 font-bold text-slate-400">Task Description</th>
                          <th className="px-6 py-3 font-bold text-slate-400 text-center">Responsible</th>
                          <th className="px-6 py-3 font-bold text-slate-400 text-center">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {actionItems.length > 0 ? actionItems.map((m: MOMItem, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-3.5 font-semibold text-slate-900">{m.discussionPoint}</td>
                            <td className="px-6 py-3.5 text-center text-slate-600 font-semibold">{m.assignee || 'Unassigned'}</td>
                            <td className="px-6 py-3.5 text-center text-red-500 font-bold">{m.dueDate || 'Immediate'}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="px-6 py-10 text-center text-xs text-slate-400">No action items have been assigned for this meeting.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase block">Meeting Assets &amp; Stamped Certificates</h3>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Formal linked attachments and legal design proofs.</span>
                    </div>
                    {isUploadingAttachment ? (
                      <div className="flex flex-col items-end min-w-[120px] space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">Uploading: {uploadProgressAttachment}%</span>
                        <div className="w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgressAttachment}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleSimulateAttachmentUpload}
                        className="flex items-center gap-1.5 text-xs text-white bg-blue-600 rounded-xl px-4 py-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10 font-bold"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> Upload Asset File
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeMeeting.attachmentsList && activeMeeting.attachmentsList.map((file: any) => (
                      <div key={file.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/55 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{file.size} • Uploaded {file.uploadedAt}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => showToast && showToast(`Opening / Downloading: ${file.name}`, 'info')}
                          className="text-[10px] text-blue-600 font-extrabold hover:underline uppercase shrink-0"
                        >
                          View
                        </button>
                      </div>
                    ))}
                    {(!activeMeeting.attachmentsList || activeMeeting.attachmentsList.length === 0) && (
                      <p className="text-slate-400 text-xs italic col-span-2 text-center py-4">No attachments uploaded for this session yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* MINUTES OF MEETING (MOM) CAPTURE */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Minutes of Meeting (MOM) Tracker</h3>
                  </div>
                  <button 
                    onClick={() => showToast && showToast('Historical audit version retrieved.', 'info')}
                    className="flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" /> View Version History
                  </button>
                </div>

                {/* MOM Capture Grid Table */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <div className="col-span-6">Discussion Point</div>
                    <div className="col-span-2 text-center">Assignee</div>
                    <div className="col-span-2 text-center">Due Date</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {(activeMeeting.mom || []).map((momItem: MOMItem) => (
                      <div key={momItem.id} className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center text-xs hover:bg-slate-50/40 transition-all">
                        <div className="col-span-6 font-semibold text-slate-900">
                          {momItem.discussionPoint}
                        </div>
                        <div className="col-span-2 text-center text-slate-600">
                          {momItem.assignee ? (
                            <span className="font-bold">{momItem.assignee}</span>
                          ) : (
                            <span className="italic text-slate-400">Not assigned</span>
                          )}
                        </div>
                        <div className="col-span-2 text-center text-slate-600">
                          {momItem.dueDate ? (
                            <span className="font-bold text-red-500">{momItem.dueDate}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          <button
                            onClick={() => handleToggleMOMStatus(momItem.id)}
                            className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full border cursor-pointer transition-all ${
                              momItem.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : momItem.status === 'Action Item' 
                                  ? 'bg-red-50 text-red-600 border-red-100' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {momItem.status}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Point Observational Bar */}
                <div className="bg-slate-50 border border-dashed border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row gap-3.5 items-end">
                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Discussion Observation</label>
                    <input
                      type="text"
                      placeholder="Type a new discussion point or final decision..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={newMomText}
                      onChange={(e) => setNewMomText(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-36 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={newMomAssignee}
                      onChange={(e) => setNewMomAssignee(e.target.value)}
                    >
                      <option value="Arthur Vance">Arthur Vance</option>
                      <option value="S. Connor">S. Connor</option>
                      <option value="Rajiv Kumar">Rajiv Kumar</option>
                      <option value="Amit Kulkarni">Amit Kulkarni</option>
                    </select>
                  </div>
                  <div className="w-full md:w-36 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={newMomDueDate}
                      onChange={(e) => setNewMomDueDate(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleAddMOMPoint}
                    className="bg-blue-600 text-white px-5 py-2 text-xs font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5 h-9 shrink-0 shadow-md shadow-blue-500/10"
                  >
                    <PlusCircle className="w-4 h-4" /> Commit
                  </button>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            Select a meeting on the left to see minutes, agenda, and participant logs.
          </div>
        )}
      </section>

      {/* NEW MEETING MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Schedule Redevelopment Meeting</h3>
              <button 
                onClick={() => setShowMeetingModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Meeting Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Portfolio Sync: Q3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Date *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Time Block</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Location Room</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Boardroom A / Zoom"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Related Project</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Harbor Ridge Phase II"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Agenda Items (One per line)</label>
                <textarea 
                  rows={3}
                  placeholder="Review current milestones&#10;Verify structural calculations"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE GUEST MODAL */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800">Invite Guest to Meeting</h3>
              <button 
                onClick={() => setShowGuestModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInviteGuest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rajiv Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Role / Department</label>
                <input 
                  type="text" 
                  placeholder="e.g. Contractor Lead"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={guestRole}
                  onChange={(e) => setGuestRole(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGuestModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Add Participant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </motion.div>
  );
}
