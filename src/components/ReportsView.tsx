/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ClipboardList, 
  Printer, 
  CheckCircle,
  HelpCircle,
  BarChart,
  Calendar
} from 'lucide-react';
import { Project, AuditLog } from '../types';
import { motion } from 'motion/react';

interface ReportsViewProps {
  projects: Project[];
  auditLogs: AuditLog[];
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

interface Transaction {
  id: string;
  type: 'Invoice' | 'Receipt';
  date: string;
  amount: number; // USD
  reference: string;
}

interface FinancialLedger {
  id: string;
  projectName: string;
  pmcFeeTotal: number;
  billedAmount: number;
  receivedAmount: number;
  outstanding: number;
  paymentStatus: 'Fully Paid' | 'Partially Invoiced' | 'Overdue Invoices';
  invoiceDate: string; // YYYY-MM-DD
  agingDays: number;   // Days outstanding
  transactions: Transaction[];
}

interface WeeklyReport {
  id: string;
  projectName: string;
  weekStart: string;
  generalStatus: 'On Schedule' | 'Delayed' | 'Critical';
  nextWeekPlan: string;
}

const INITIAL_FINANCIALS: FinancialLedger[] = [
  {
    id: "fin-1",
    projectName: "Worli BDD 04 Redevelopment",
    pmcFeeTotal: 2850000,
    billedAmount: 1425000,
    receivedAmount: 1200000,
    outstanding: 225000,
    paymentStatus: "Partially Invoiced",
    invoiceDate: "2023-08-15",
    agingDays: 45,
    transactions: [
      { id: "tx-101", type: "Invoice", date: "2023-08-15", amount: 1425000, reference: "INV-2023-004" },
      { id: "tx-102", type: "Receipt", date: "2023-09-01", amount: 1200000, reference: "UTR-HDFC-99381" }
    ]
  },
  {
    id: "fin-2",
    projectName: "Harbor Ridge Phase II",
    pmcFeeTotal: 1900000,
    billedAmount: 950000,
    receivedAmount: 500000,
    outstanding: 450000,
    paymentStatus: "Overdue Invoices",
    invoiceDate: "2023-06-10",
    agingDays: 110,
    transactions: [
      { id: "tx-201", type: "Invoice", date: "2023-06-10", amount: 950000, reference: "INV-2023-002" },
      { id: "tx-202", type: "Receipt", date: "2023-06-25", amount: 500000, reference: "UTR-ICICI-00492" }
    ]
  },
  {
    id: "fin-3",
    projectName: "BDD Naigaon Cluster C",
    pmcFeeTotal: 4200000,
    billedAmount: 420000,
    receivedAmount: 420000,
    outstanding: 0,
    paymentStatus: "Fully Paid",
    invoiceDate: "2023-09-01",
    agingDays: 0,
    transactions: [
      { id: "tx-301", type: "Invoice", date: "2023-09-01", amount: 420000, reference: "INV-2023-007" },
      { id: "tx-302", type: "Receipt", date: "2023-09-12", amount: 420000, reference: "UTR-SBI-77281" }
    ]
  },
  {
    id: "fin-4",
    projectName: "Parel Commercial Hub",
    pmcFeeTotal: 1284000,
    billedAmount: 1284000,
    receivedAmount: 1284000,
    outstanding: 0,
    paymentStatus: "Fully Paid",
    invoiceDate: "2023-05-15",
    agingDays: 0,
    transactions: [
      { id: "tx-401", type: "Invoice", date: "2023-05-15", amount: 1284000, reference: "INV-2023-001" },
      { id: "tx-402", type: "Receipt", date: "2023-05-20", amount: 1284000, reference: "UTR-AXIS-83711" }
    ]
  }
];

const INITIAL_WEEKLY: WeeklyReport[] = [
  {
    id: "wr-1",
    projectName: "Worli BDD 04 Redevelopment",
    weekStart: "2023-10-02",
    generalStatus: "On Schedule",
    nextWeekPlan: "Commence column steel cage reinforcement for building blocks A4 vertical floor pour."
  },
  {
    id: "wr-2",
    projectName: "Harbor Ridge Phase II",
    weekStart: "2023-10-02",
    generalStatus: "Delayed",
    nextWeekPlan: "Resolve coastal tide ingress at basement piling zone and step up high-output dewatering pump units."
  },
  {
    id: "wr-3",
    projectName: "BDD Naigaon Cluster C",
    weekStart: "2023-10-02",
    generalStatus: "Critical",
    nextWeekPlan: "Escalate tree clearance height limitation plan directly to Mumbai Deputy Commissioner."
  }
];

export default function ReportsView({ projects, auditLogs, showToast }: ReportsViewProps) {
  const [financials, setFinancials] = useState<FinancialLedger[]>(INITIAL_FINANCIALS);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(INITIAL_WEEKLY);
  const [selectedReportTab, setSelectedReportTab] = useState<'financial' | 'weekly' | 'audit'>('financial');

  // Currency Mode ('USD' or 'INR')
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'INR'>('INR');

  // Date Filters
  const [startDate, setStartDate] = useState<string>('2023-01-01');
  const [endDate, setEndDate] = useState<string>('2023-12-31');

  // Drill-down detailed source ledger state
  const [drillDownLedger, setDrillDownLedger] = useState<FinancialLedger | null>(null);

  // Live Export Preview Toggler
  const [showExportPreview, setShowExportPreview] = useState<boolean>(false);

  // Filter financial ledger and weekly reports dynamically based on date range
  const filteredFinancials = financials.filter(f => {
    return f.invoiceDate >= startDate && f.invoiceDate <= endDate;
  });

  const filteredWeekly = weeklyReports.filter(w => {
    return w.weekStart >= startDate && w.weekStart <= endDate;
  });

  // Calculations based on filtered ledger
  const totalPmcFees = filteredFinancials.reduce((sum, f) => sum + f.pmcFeeTotal, 0);
  const totalBilled = filteredFinancials.reduce((sum, f) => sum + f.billedAmount, 0);
  const totalReceived = filteredFinancials.reduce((sum, f) => sum + f.receivedAmount, 0);
  const totalOutstanding = totalBilled - totalReceived;

  // Currency Converter Formatter Helper
  const formatValue = (usdVal: number) => {
    if (currencyMode === 'INR') {
      const inrVal = usdVal * 83; // 1 USD = 83 INR
      return '₹' + inrVal.toLocaleString('en-IN');
    }
    return '$' + usdVal.toLocaleString('en-US');
  };

  // CSV Live Buffer Preview Renderer
  const renderCSVPreview = () => {
    const label = currencyMode === 'INR' ? "INR (₹)" : "USD ($)";
    let csv = `Project Name,Total PMC Fee (${label}),Total Billed (${label}),Total Received (${label}),Outstanding (${label}),Invoice Date,Aging,Status\n`;
    filteredFinancials.forEach(f => {
      const fee = currencyMode === 'INR' ? f.pmcFeeTotal * 83 : f.pmcFeeTotal;
      const billed = currencyMode === 'INR' ? f.billedAmount * 83 : f.billedAmount;
      const rec = currencyMode === 'INR' ? f.receivedAmount * 83 : f.receivedAmount;
      const out = currencyMode === 'INR' ? f.outstanding * 83 : f.outstanding;
      csv += `"${f.projectName}",${fee},${billed},${rec},${out},"${f.invoiceDate}","${f.agingDays} Days","${f.paymentStatus}"\n`;
    });
    const tFee = currencyMode === 'INR' ? totalPmcFees * 83 : totalPmcFees;
    const tBilled = currencyMode === 'INR' ? totalBilled * 83 : totalBilled;
    const tReceived = currencyMode === 'INR' ? totalReceived * 83 : totalReceived;
    const tOutstanding = currencyMode === 'INR' ? totalOutstanding * 83 : totalOutstanding;
    csv += `Total,${tFee},${tBilled},${tReceived},${tOutstanding},-,-\n`;
    return csv;
  };

  // Export functions
  const handleExportPDF = () => {
    // Elegant client-side printing/saving
    window.print();
  };

  const handleExportExcel = () => {
    let csv = "data:text/csv;charset=utf-8,";
    const label = currencyMode === 'INR' ? "INR (₹)" : "USD ($)";
    if (selectedReportTab === 'financial') {
      csv += `Project Name,Total PMC Fee (${label}),Total Billed (${label}),Total Received (${label}),Outstanding Invoiced (${label}),Invoice Date,Aging,Payment Status\n`;
      filteredFinancials.forEach(f => {
        const fee = currencyMode === 'INR' ? f.pmcFeeTotal * 83 : f.pmcFeeTotal;
        const billed = currencyMode === 'INR' ? f.billedAmount * 83 : f.billedAmount;
        const rec = currencyMode === 'INR' ? f.receivedAmount * 83 : f.receivedAmount;
        const out = currencyMode === 'INR' ? f.outstanding * 83 : f.outstanding;
        csv += `"${f.projectName}",${fee},${billed},${rec},${out},"${f.invoiceDate}","${f.agingDays} Days","${f.paymentStatus}"\n`;
      });
      const tFee = currencyMode === 'INR' ? totalPmcFees * 83 : totalPmcFees;
      const tBilled = currencyMode === 'INR' ? totalBilled * 83 : totalBilled;
      const tReceived = currencyMode === 'INR' ? totalReceived * 83 : totalReceived;
      const tOutstanding = currencyMode === 'INR' ? totalOutstanding * 83 : totalOutstanding;
      csv += `Total,${tFee},${tBilled},${tReceived},${tOutstanding},-,-\n`;
    } else {
      csv += "Project Name,Week Commencing,Operational Status,Proposed Next Steps\n";
      filteredWeekly.forEach(w => {
        csv += `"${w.projectName}","${w.weekStart}","${w.generalStatus}","${w.nextWeekPlan}"\n`;
      });
    }

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csv));
    downloadAnchor.setAttribute("download", `PMC_CRM_Core_${selectedReportTab}_Report.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) {
      showToast('Success: Excel-formatted CSV spreadsheet exported!', 'success');
    }
  };

  return (
    <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="approvals-view p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1440px] mx-auto w-full"
        >
    <div className="p-8 space-y-8 max-w-[1440px] mx-auto w-full print:p-0">
      
      {/* Header (hidden in print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">EXECUTIVE SUMMARY LOGS</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Operational &amp; Financial Reports</h2>
        </div>
        
        <div className="flex gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-sans text-xs font-bold hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export to Excel
          </button>
          
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-sans text-xs font-bold hover:bg-slate-800 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Date Filters, Currency & Preview Controls Panel */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center print:hidden">
        {/* Date Filter Start */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Invoice/Week Date</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Date Filter End */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Invoice/Week Date</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Currency Toggler */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Currency Denomination</label>
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setCurrencyMode('INR')}
              className={`py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${currencyMode === 'INR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              🇮🇳 INR (₹)
            </button>
            <button 
              onClick={() => setCurrencyMode('USD')}
              className={`py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${currencyMode === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              🇺🇸 USD ($)
            </button>
          </div>
        </div>

        {/* Export Preview Button */}
        <div className="space-y-1 md:pt-4">
          <button 
            onClick={() => setShowExportPreview(!showExportPreview)}
            className={`w-full py-2 border rounded-xl font-sans text-xs font-bold transition-all cursor-pointer text-center ${showExportPreview ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            {showExportPreview ? 'Hide Export Preview' : 'Show Live Export Preview'}
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-6 print:hidden">
        <button
          onClick={() => setSelectedReportTab('financial')}
          className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            selectedReportTab === 'financial' 
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
          }`}
        >
          Financial Milestones &amp; PMC Fees
        </button>
        <button
          onClick={() => setSelectedReportTab('weekly')}
          className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            selectedReportTab === 'weekly' 
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
          }`}
        >
          Weekly Progress Status logs
        </button>
        <button
          onClick={() => setSelectedReportTab('audit')}
          className={`pb-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            selectedReportTab === 'audit' 
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
          }`}
        >
          Compliance Audit Trail (Audit Logs)
        </button>
      </div>

      {/* RENDER TAB 1: FINANCIAL LEDGER */}
      {selectedReportTab === 'financial' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Portfolio Contract Value</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-slate-900">{formatValue(totalPmcFees)}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">{currencyMode}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Billed to Date</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-600">{formatValue(totalBilled)}</span>
                <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                  {totalPmcFees ? Math.round((totalBilled / totalPmcFees) * 100) : 0}% Invoiced
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Collected Fees</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-emerald-600">{formatValue(totalReceived)}</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  {totalBilled ? Math.round((totalReceived / totalBilled) * 100) : 0}% Realized
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Outstanding Invoices</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-red-600">{formatValue(totalOutstanding)}</span>
                <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                  Follow-up Active
                </span>
              </div>
            </div>
          </div>

          {/* Aging of Receivables Analysis Sub-Section */}
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">ERP RECEIVABLES LIQUIDITY DECK</span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mt-0.5">Aging of Receivables (Outstanding)</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-medium">Auto-bucketed based on invoice dates</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-center shadow-2xs">
                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mx-auto">0 - 30 Days</span>
                <span className="text-lg font-black text-slate-800 block mt-2">
                  {formatValue(filteredFinancials.filter(f => f.agingDays > 0 && f.agingDays <= 30).reduce((sum, f) => sum + f.outstanding, 0))}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Current Accounts</span>
              </div>

              <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-center shadow-2xs">
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mx-auto">31 - 60 Days</span>
                <span className="text-lg font-black text-slate-800 block mt-2">
                  {formatValue(filteredFinancials.filter(f => f.agingDays > 30 && f.agingDays <= 60).reduce((sum, f) => sum + f.outstanding, 0))}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Monitored Invoices</span>
              </div>

              <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-center shadow-2xs">
                <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mx-auto">61 - 90 Days</span>
                <span className="text-lg font-black text-slate-800 block mt-2">
                  {formatValue(filteredFinancials.filter(f => f.agingDays > 60 && f.agingDays <= 90).reduce((sum, f) => sum + f.outstanding, 0))}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Action Needed</span>
              </div>

              <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-center shadow-2xs">
                <span className="text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mx-auto">91+ Days</span>
                <span className="text-lg font-black text-red-600 block mt-2">
                  {formatValue(filteredFinancials.filter(f => f.agingDays > 90).reduce((sum, f) => sum + f.outstanding, 0))}
                </span>
                <span className="text-[10px] text-red-500 font-bold block mt-0.5">Critical Recovery</span>
              </div>
            </div>
          </div>

          {/* LIVE EXPORT SPREADSHEET PREVIEW BOX */}
          {showExportPreview && (
            <div className="bg-slate-900 text-slate-100 border border-slate-950 p-5 rounded-2xl shadow-lg space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">📄 CSV Export Live Buffer Preview</span>
                <span className="text-[9px]">UTF-8 Encoding Active</span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-slate-200 max-h-48 overflow-y-auto">
                {renderCSVPreview()}
              </pre>
              <div className="text-[9px] text-slate-500 pt-1">
                Note: Columns will instantly mapping to your device Microsoft Excel spreadsheet upon clicking "Export to Excel" above.
              </div>
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">PMC Fee &amp; Invoicing ledger</h3>
              </div>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">💡 Click row for Drill-Down Analysis</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/40 border-b border-slate-100">
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Redevelopment Project Name</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total PMC Fee</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding (Aging)</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFinancials.length > 0 ? (
                    filteredFinancials.map((f) => (
                      <tr 
                        key={f.id} 
                        onClick={() => setDrillDownLedger(f)}
                        className="hover:bg-blue-50/25 transition-all cursor-pointer group"
                        title="Click to view full ledger drill-down details"
                      >
                        <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 group-hover:text-blue-500">📁</span>
                            {f.projectName}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-medium text-slate-600">
                          {formatValue(f.pmcFeeTotal)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-medium text-slate-600">
                          {formatValue(f.billedAmount)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-medium text-emerald-600">
                          {formatValue(f.receivedAmount)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-sans text-xs font-medium text-slate-600">
                          <div className="flex flex-col">
                            <span className={f.outstanding > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}>
                              {formatValue(f.outstanding)}
                            </span>
                            {f.outstanding > 0 && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.1 rounded-md mt-0.5 w-fit uppercase ${
                                f.agingDays > 90 ? 'bg-red-50 text-red-600 border border-red-100' :
                                f.agingDays > 30 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {f.agingDays} Days Age
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border uppercase inline-block ${
                            f.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            f.paymentStatus === 'Partially Invoiced' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                            'bg-red-50 border-red-100 text-red-600'
                          }`}>
                            {f.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic text-xs">
                        No financial logs matched the specified date filters.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="px-5 py-4 font-sans text-xs text-slate-800">Total Portfolio</td>
                    <td className="px-5 py-4 font-sans text-xs text-slate-800">{formatValue(totalPmcFees)}</td>
                    <td className="px-5 py-4 font-sans text-xs text-slate-800">{formatValue(totalBilled)}</td>
                    <td className="px-5 py-4 font-sans text-xs text-emerald-700">{formatValue(totalReceived)}</td>
                    <td className="px-5 py-4 font-sans text-xs text-red-600">{formatValue(totalOutstanding)}</td>
                    <td className="px-5 py-4 text-center">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: OPERATIONAL WEEKLY STATUS */}
      {selectedReportTab === 'weekly' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredWeekly.length > 0 ? (
              filteredWeekly.map((w) => (
                <div key={w.id} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">WEEK COMMENCING</span>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {w.weekStart}
                      </span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                      w.generalStatus === 'On Schedule' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                      w.generalStatus === 'Delayed' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                      'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {w.generalStatus}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">PROJECT</span>
                    <p className="text-sm font-extrabold text-slate-900">{w.projectName}</p>
                  </div>

                  <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Next Week Core Milestones</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">{w.nextWeekPlan}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-white border border-slate-200 p-12 text-center text-slate-400 italic text-xs rounded-2xl">
                No weekly operational reports matched the specified date filters.
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 text-xs text-blue-700 leading-relaxed">
            <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[10px] font-bold uppercase tracking-wider text-blue-800">Weekly Reporting Auto-Generation</strong>
              These reports are automatically updated based on site engineers' weekly logs and plinth stage validations. Select individual project cards on the portfolio tab to view localized timelines.
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: AUDIT TRAIL */}
      {selectedReportTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">MANDATORY CHANGE AUDIT TRAIL</h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Active Compliance Engine
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/40 border-b border-slate-100">
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User &amp; Role</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Changes (Old → New)</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mandatory Comment / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{log.user}</div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">{log.role}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                            log.action === 'CREATE' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            log.action === 'DELETE' ? 'bg-red-50 border-red-100 text-red-700' :
                            'bg-blue-50 border-blue-100 text-blue-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-700">{log.entity}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{log.entityName}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                          {log.oldValue || log.newValue ? (
                            <div className="flex flex-col gap-0.5">
                              {log.oldValue && <span className="line-through text-red-500">Old: {log.oldValue}</span>}
                              {log.newValue && <span className="text-emerald-600 font-bold">New: {log.newValue}</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No value logs</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-medium text-slate-600 italic leading-relaxed shadow-xs max-w-md">
                            "{log.reason}"
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic">
                        No audit logs captured yet. Critical modifications will trigger compliance records here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DRILL-DOWN SOURCE TRANSACTION LEDGER MODAL */}
      {drillDownLedger && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">FINANCIAL DRILL-DOWN LEDGER</span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{drillDownLedger.projectName}</h3>
              </div>
              <button 
                onClick={() => setDrillDownLedger(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              
              {/* Financial Dashboard Sub-Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Contract PMC Fee</span>
                  <p className="text-base font-black text-slate-900 mt-1">{formatValue(drillDownLedger.pmcFeeTotal)}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outstanding (Unpaid)</span>
                  <p className="text-base font-black text-red-600 mt-1">
                    {formatValue(drillDownLedger.outstanding)}
                  </p>
                </div>
              </div>

              {/* Invoicing age & status */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Invoice Base Date</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{drillDownLedger.invoiceDate || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Receivable Age</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {drillDownLedger.outstanding > 0 ? `${drillDownLedger.agingDays} Days Outstanding` : '0 Days (Cleared)'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase inline-block mt-0.5 ${
                    drillDownLedger.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                    'bg-blue-50 border-blue-100 text-blue-700'
                  }`}>
                    {drillDownLedger.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Source Transactions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Source Transaction Entries</h4>
                  <span className="text-[9px] text-slate-400 font-mono font-medium">Mapped from General Ledger</span>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-wider">Reference No.</th>
                        <th className="px-4 py-2.5 font-bold text-slate-400 uppercase tracking-wider text-right">Amount ({currencyMode})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {drillDownLedger.transactions && drillDownLedger.transactions.length > 0 ? (
                        drillDownLedger.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-600">{tx.date}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                tx.type === 'Invoice' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500">{tx.reference}</td>
                            <td className={`px-4 py-3 text-right font-bold ${tx.type === 'Invoice' ? 'text-slate-800' : 'text-emerald-600'}`}>
                              {formatValue(tx.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No direct transaction records matched this ledger.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setDrillDownLedger(null)}
                className="px-5 py-2 bg-slate-900 text-white font-sans text-xs font-bold hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Close Ledger Drill-down
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
    </motion.div>
  );
}
