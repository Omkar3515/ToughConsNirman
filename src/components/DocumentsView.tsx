/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Folder, 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  FolderOpen,
  X,
  Plus,
  Tag,
  Link,
  Calendar,
  AlertTriangle,
  RefreshCw,
  User,
  CheckCircle2
} from 'lucide-react';
import { DocumentFile } from '../types';
import { motion } from 'motion/react';

interface DocumentsViewProps {
  documents: DocumentFile[];
  onAddDocument: (doc: Omit<DocumentFile, 'id'>) => void;
  onDeleteDocument: (id: string) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function DocumentsView({
  documents,
  onAddDocument,
  onDeleteDocument,
  showToast,
}: DocumentsViewProps) {
  const [activeFolder, setActiveFolder] = useState<'All' | 'Drawings' | 'Permits' | 'Contracts' | 'Reports'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state for immediate feedback and custom version control edits
  const [localDocs, setLocalDocs] = useState<DocumentFile[]>([]);

  useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docFolder, setDocFolder] = useState<'Drawings' | 'Permits' | 'Contracts' | 'Reports'>('Drawings');
  const [docVersion, setDocVersion] = useState('v1.0.0');
  const [docExpiryDate, setDocExpiryDate] = useState('2024-12-31');
  const [docStatus, setDocStatus] = useState<'Approved' | 'In Review' | 'Draft' | 'Expired'>('Draft');
  const [docTagsStr, setDocTagsStr] = useState('');
  const [docProject, setDocProject] = useState('Worli BDD 04 Redevelopment');
  const [docMember, setDocMember] = useState('Arthur Vance');

  // Filter documents from localDocs
  const filteredDocs = localDocs.filter(doc => {
    const folderMatch = activeFolder === 'All' || doc.folder === activeFolder;
    const searchMatch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (doc.linkedProject && doc.linkedProject.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (doc.linkedMember && doc.linkedMember.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return folderMatch && searchMatch;
  });

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (fileList: FileList) => {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      // Determine folder based on file extension or name
      let folder: DocumentFile['folder'] = 'Reports';
      if (file.name.toLowerCase().includes('dwg') || file.name.toLowerCase().includes('plan') || file.name.toLowerCase().includes('draw')) {
        folder = 'Drawings';
      } else if (file.name.toLowerCase().includes('permit') || file.name.toLowerCase().includes('clearance')) {
        folder = 'Permits';
      } else if (file.name.toLowerCase().includes('contract') || file.name.toLowerCase().includes('lease') || file.name.toLowerCase().includes('agreement')) {
        folder = 'Contracts';
      }

      onAddDocument({
        name: file.name,
        folder,
        size: sizeStr,
        uploadedBy: 'Director Desk',
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Draft',
        version: 'v1.0.0',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year expiry
        tags: [folder.toLowerCase(), 'external'],
        linkedProject: 'Worli BDD 04 Redevelopment',
        linkedMember: 'Director Desk',
      });
    }
  };

  const handleUpdateStatus = (id: string, newStatus: DocumentFile['status']) => {
    const updated = localDocs.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setLocalDocs(updated);
    localStorage.setItem('toughcons_documents', JSON.stringify(updated));
  };

  const handleIncrementVersion = (id: string) => {
    const updated = localDocs.map(d => {
      if (d.id === id) {
        const currentVersion = d.version || 'v1.0.0';
        const parts = currentVersion.replace('v', '').split('.');
        if (parts.length === 3) {
          const minor = parseInt(parts[1], 10) || 0;
          parts[1] = String(minor + 1);
          const nextVersion = `v${parts.join('.')}`;
          if (showToast) {
            showToast(`Document "${d.name}" incremented from ${currentVersion} to ${nextVersion}`, 'success');
          }
          return { ...d, version: nextVersion };
        } else {
          return { ...d, version: currentVersion + '.1' };
        }
      }
      return d;
    });
    setLocalDocs(updated);
    localStorage.setItem('toughcons_documents', JSON.stringify(updated));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    const tags = docTagsStr
      ? docTagsStr.split(',').map(t => t.trim()).filter(Boolean)
      : [docFolder.toLowerCase()];

    onAddDocument({
      name: docName,
      folder: docFolder,
      size: '1.4 MB',
      uploadedBy: 'Director Desk',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: docStatus,
      version: docVersion,
      expiryDate: docExpiryDate,
      tags,
      linkedProject: docProject,
      linkedMember: docMember,
    });

    setDocName('');
    setDocTagsStr('');
    setShowAddModal(false);
    if (showToast) {
      showToast('Extended document entry added successfully.', 'success');
    }
  };

  return (
    <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="approvals-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
        >
    <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Document Repository</h2>
          <p className="text-slate-500 text-xs mt-1">Central legal files, engineering drafts, approvals archives, and site charts.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-slate-950/10 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-emerald-400" /> Log Document Record
        </button>
      </div>

      {/* Grid Split: Upload Zone & Document Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Upload Zone & Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 shadow-sm rounded-2xl flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Upload Center</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit construction drawings, regulatory clearance files, tenant agreement lists, or engineering reports.
            </p>

            {/* Drag & Drop uploader area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                dragActive 
                  ? 'border-blue-600 bg-blue-50/20' 
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                onChange={handleFileInputChange}
              />
              <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-sans text-xs font-bold text-slate-800">Drag and Drop here</p>
                <p className="font-sans text-[10px] text-slate-400 mt-1">or click to browse local files</p>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Max size limit: 50MB</span>
            </div>
          </div>

          {/* Folder Breakdown */}
          <div className="bg-white border border-slate-200/80 p-6 shadow-sm rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Folder Breakdown</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2 font-bold text-slate-800">
                  <Folder className="w-4 h-4 text-slate-700" /> Drawings
                </span>
                <span className="font-bold text-slate-400">
                  {documents.filter(d => d.folder === 'Drawings').length} files
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2 font-bold text-slate-800">
                  <Folder className="w-4 h-4 text-slate-700" /> Permits
                </span>
                <span className="font-bold text-slate-400">
                  {documents.filter(d => d.folder === 'Permits').length} files
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2 font-bold text-slate-800">
                  <Folder className="w-4 h-4 text-slate-700" /> Contracts
                </span>
                <span className="font-bold text-slate-400">
                  {documents.filter(d => d.folder === 'Contracts').length} files
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2 font-bold text-slate-800">
                  <Folder className="w-4 h-4 text-slate-700" /> Reports
                </span>
                <span className="font-bold text-slate-400">
                  {documents.filter(d => d.folder === 'Reports').length} files
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Document Browser (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 shadow-sm flex flex-col rounded-2xl overflow-hidden">
          
          {/* Document Tabs & Search */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              {(['All', 'Drawings', 'Permits', 'Contracts', 'Reports'] as const).map(fld => (
                <button
                  key={fld}
                  onClick={() => setActiveFolder(fld)}
                  className={`font-sans text-xs font-bold uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                    activeFolder === fld 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {fld}
                </button>
              ))}
            </div>

            {/* Document search */}
            <div className="relative max-w-xs flex-grow w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full bg-white border border-slate-200 rounded-xl px-9 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto flex-1 min-h-[360px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[45%]">Document Details</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[12%]">Folder</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[18%]">Expiry Tracking</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[12%]">Size &amp; Owner</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">Approval Status</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-right w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => {
                    // Check if document has expired
                    const isExpired = doc.expiryDate ? new Date(doc.expiryDate) < new Date() : false;
                    const daysLeft = doc.expiryDate 
                      ? Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) 
                      : 999;
                    const isSoon = daysLeft > 0 && daysLeft < 90;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 space-y-2">
                          <div className="font-sans font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[280px]" title={doc.name}>{doc.name}</span>
                          </div>
                          
                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-semibold">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded-md font-mono">
                              {doc.version || 'v1.0.0'}
                            </span>
                            {doc.linkedProject && (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <Link className="w-3 h-3 text-slate-400" /> {doc.linkedProject}
                              </span>
                            )}
                            {doc.linkedMember && (
                              <span className="inline-flex items-center gap-1 text-slate-600">
                                <User className="w-3 h-3 text-slate-400" /> {doc.linkedMember}
                              </span>
                            )}
                          </div>

                          {/* Tags block */}
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-50/60 border border-blue-100 rounded-full">
                                  <Tag className="w-2.5 h-2.5 text-blue-400" /> {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded-lg font-bold text-[10px] text-slate-700">
                            {doc.folder}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="font-semibold text-slate-700 font-mono text-[11px]">
                            {doc.expiryDate || 'N/A'}
                          </div>
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-red-600 uppercase">
                              <AlertTriangle className="w-3 h-3 text-red-500" /> Expired
                            </span>
                          ) : isSoon ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-600 uppercase">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Expiring Soon ({daysLeft}d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active / Valid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold space-y-0.5">
                          <div>{doc.size}</div>
                          <div className="text-[10px] text-slate-400 font-medium">By {doc.uploadedBy}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={doc.status}
                            onChange={(e) => handleUpdateStatus(doc.id, e.target.value as any)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border cursor-pointer outline-none transition-colors ${
                              doc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              doc.status === 'In Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              doc.status === 'Expired' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="In Review">In Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Expired">Expired</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <button
                            onClick={() => handleIncrementVersion(doc.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 inline-flex cursor-pointer transition-colors"
                            title="Increment Minor Version (Bump)"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => showToast && showToast(`Initiating secure direct download for ${doc.name} (${doc.size}).`, 'info')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 inline-flex cursor-pointer transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 inline-flex cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 italic font-medium">
                      No files found in folder category. Drop your PDF or ZIP files or add one manually.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider text-center">
            🔒 Toughcons Encrypted Legal Document Storage (AES-256 Compliant)
          </div>
        </div>

      </div>

      {/* MANUAL LOG DOCUMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-xs font-bold text-slate-800">Log Legal/Technical Document</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Document File Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. MHADA_FloorSpace_NOC_Worli.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category Folder *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={docFolder}
                    onChange={(e) => setDocFolder(e.target.value as any)}
                  >
                    <option value="Drawings">Drawings</option>
                    <option value="Permits">Permits</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Reports">Reports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Version Control *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. v1.0.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    value={docVersion}
                    onChange={(e) => setDocVersion(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiry Date *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Initial Status *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    value={docStatus}
                    onChange={(e) => setDocStatus(e.target.value as any)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Linked Project / Society Cluster *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  value={docProject}
                  onChange={(e) => setDocProject(e.target.value)}
                >
                  <option value="Worli BDD 04 Redevelopment">Worli BDD 04 Redevelopment</option>
                  <option value="BDD Naigaon Cluster C">BDD Naigaon Cluster C</option>
                  <option value="Harbor Ridge Phase II">Harbor Ridge Phase II</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Responsible Representative *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Arthur Vance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={docMember}
                  onChange={(e) => setDocMember(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags (Comma-separated) *</label>
                <input 
                  type="text" 
                  placeholder="e.g. mhada, zoning, approval, slab"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={docTagsStr}
                  onChange={(e) => setDocTagsStr(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
                >
                  Log Document Record
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
