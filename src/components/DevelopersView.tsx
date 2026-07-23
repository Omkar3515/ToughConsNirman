/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  Award, 
  Zap, 
  Search, 
  Plus, 
  CheckCircle, 
  Star, 
  ShieldCheck, 
  BarChart3,
  ThumbsUp,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export interface DeveloperPartner {
  id: string;
  name: string;
  technicalScore: number; // out of 100
  liquidityRating: 'AAA' | 'AA+' | 'AA' | 'A+';
  safetyIndex: number; // incident free days or score
  projectsDelivered: number;
  specialty: string;
  reputation: 'Elite' | 'Strong' | 'Average';
  contactPerson: string;
}

const INITIAL_DEVELOPERS: DeveloperPartner[] = [
  {
    id: "dev-1",
    name: "L&T Construction Ltd.",
    technicalScore: 96,
    liquidityRating: "AAA",
    safetyIndex: 98,
    projectsDelivered: 42,
    specialty: "High-Rise Steel & Composite Frame Structures",
    reputation: "Elite",
    contactPerson: "Rajesh Malhotra"
  },
  {
    id: "dev-2",
    name: "Shapoorji Pallonji Group",
    technicalScore: 93,
    liquidityRating: "AAA",
    safetyIndex: 95,
    projectsDelivered: 35,
    specialty: "Urban Rehabilitation & Slum Rehabilitation",
    reputation: "Elite",
    contactPerson: "Cyrus Mistry Jr."
  },
  {
    id: "dev-3",
    name: "Tata Projects",
    technicalScore: 91,
    liquidityRating: "AA+",
    safetyIndex: 96,
    projectsDelivered: 29,
    specialty: "Commercial Complexes & Mass Transit Integration",
    reputation: "Strong",
    contactPerson: "Amrutha Sen"
  },
  {
    id: "dev-4",
    name: "Godrej Properties",
    technicalScore: 88,
    liquidityRating: "AA",
    safetyIndex: 90,
    projectsDelivered: 18,
    specialty: "Premium Residential Redevelopments",
    reputation: "Strong",
    contactPerson: "Siddharth Godrej"
  }
];

interface DevelopersViewProps {
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function DevelopersView({ showToast }: DevelopersViewProps) {
  const [developers, setDevelopers] = useState<DeveloperPartner[]>(() => {
    const saved = localStorage.getItem('toughcons_devs_v1');
    return saved ? JSON.parse(saved) : INITIAL_DEVELOPERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New partner state
  const [newName, setNewName] = useState('');
  const [newTechnical, setNewTechnical] = useState(85);
  const [newLiquidity, setNewLiquidity] = useState<'AAA' | 'AA+' | 'AA' | 'A+'>('AA');
  const [newSafety, setNewSafety] = useState(90);
  const [newProjects, setNewProjects] = useState(10);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newReputation, setNewReputation] = useState<'Elite' | 'Strong' | 'Average'>('Strong');
  const [newContact, setNewContact] = useState('');

  // Interactive Calculator State
  const [calcExperience, setCalcExperience] = useState(5); // max 10
  const [calcFinancial, setCalcFinancial] = useState(5); // max 10
  const [calcTechnical, setCalcTechnical] = useState(5); // max 10
  const [calcSecurity, setCalcSecurity] = useState(5); // max 10

  const calculatedRating = Math.round(
    ((calcExperience * 0.2) + (calcFinancial * 0.3) + (calcTechnical * 0.3) + (calcSecurity * 0.2)) * 10
  );

  const saveDevelopers = (updated: DeveloperPartner[]) => {
    setDevelopers(updated);
    localStorage.setItem('toughcons_devs_v1', JSON.stringify(updated));
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSpecialty) {
      if (showToast) showToast('Please fill out Developer Name and Specialty.', 'error');
      return;
    }

    const fresh: DeveloperPartner = {
      id: `dev-${Date.now()}`,
      name: newName,
      technicalScore: Number(newTechnical),
      liquidityRating: newLiquidity,
      safetyIndex: Number(newSafety),
      projectsDelivered: Number(newProjects),
      specialty: newSpecialty,
      reputation: newReputation,
      contactPerson: newContact || "Lead Liaison Desk"
    };

    const nextDevs = [...developers, fresh];
    saveDevelopers(nextDevs);

    if (showToast) {
      showToast(`Proposal for "${fresh.name}" registered successfully!`, 'success');
    }

    // Reset Form
    setNewName('');
    setNewSpecialty('');
    setNewContact('');
    setShowAddModal(false);
  };

  const filteredDevs = developers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">PARTNER AUDITS &amp; CONTRACTS</span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Developer Evaluations</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer rounded-xl shadow-md shadow-blue-500/15 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Developer Bid
        </button>
      </div>

      {/* Grid: Developer List (Left) and Evaluation Score Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Developers Cards list (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Approved Construction Partners</h3>
            </div>
            
            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                placeholder="Search builder profile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDevs.map(d => (
              <div key={d.id} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-[6px_6px_5px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-2 hover:shadow-md space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{d.specialty}</p>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                      d.reputation === 'Elite' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                      d.reputation === 'Strong' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                      'bg-slate-50 border-slate-100 text-slate-600'
                    }`}>
                      {d.reputation} Builder
                    </span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 bg-slate-50/30 rounded-xl p-3">
                    <div className="text-center">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">TECH SCORE</span>
                      <span className="text-sm font-extrabold text-slate-800">{d.technicalScore}%</span>
                    </div>
                    <div className="text-center border-x border-slate-100">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">LIQUID RATING</span>
                      <span className="text-sm font-extrabold text-blue-600">{d.liquidityRating}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">DELIVERED</span>
                      <span className="text-sm font-extrabold text-slate-800">{d.projectsDelivered} Proj</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Safety Index: {d.safetyIndex}%
                  </span>
                  <span>Liaison: {d.contactPerson}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Evaluation criteria calculator (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Bid Evaluation Calculator</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Calibrate developer scorecard criteria weightages to generate an overall suitability rating index.
            </p>

            {/* Slider 1 */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <span>Past Delivery History (20%)</span>
                <span className="text-blue-600 font-extrabold">{calcExperience}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={calcExperience}
                onChange={(e) => setCalcExperience(Number(e.target.value))}
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <span>Financial Solvency / AAA (30%)</span>
                <span className="text-blue-600 font-extrabold">{calcFinancial}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={calcFinancial}
                onChange={(e) => setCalcFinancial(Number(e.target.value))}
              />
            </div>

            {/* Slider 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <span>Technical Layout Score (30%)</span>
                <span className="text-blue-600 font-extrabold">{calcTechnical}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={calcTechnical}
                onChange={(e) => setCalcTechnical(Number(e.target.value))}
              />
            </div>

            {/* Slider 4 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <span>Site Safety Rating (20%)</span>
                <span className="text-blue-600 font-extrabold">{calcSecurity}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={calcSecurity}
                onChange={(e) => setCalcSecurity(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center mt-6 space-y-2">
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">Weighted suitability rating</span>
            <span className="block text-4xl font-black text-blue-600 font-sans">{calculatedRating}%</span>
            
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-semibold">
              {calculatedRating >= 85 ? (
                <span className="text-emerald-600 uppercase">Strongly Recommended Partner Bid</span>
              ) : calculatedRating >= 65 ? (
                <span className="text-blue-600 uppercase">Acceptable Partnership Criteria</span>
              ) : (
                <span className="text-red-500 uppercase">Below Minimal Acceptable Index</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* NEW BIDDER ENTRY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="font-sans text-sm font-bold text-slate-800 uppercase tracking-wider">Log Developer Partner Proposal</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Builder / Developer Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Godrej Properties"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technical Score (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    value={newTechnical}
                    onChange={(e) => setNewTechnical(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Liquidity Class</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    value={newLiquidity}
                    onChange={(e) => setNewLiquidity(e.target.value as any)}
                  >
                    <option value="AAA">AAA</option>
                    <option value="AA+">AA+</option>
                    <option value="AA">AA</option>
                    <option value="A+">A+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects Delivered</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    value={newProjects}
                    onChange={(e) => setNewProjects(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reputation Level</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    value={newReputation}
                    onChange={(e) => setNewReputation(e.target.value as any)}
                  >
                    <option value="Elite">Elite</option>
                    <option value="Strong">Strong</option>
                    <option value="Average">Average</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Construction Specialty / Focus</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  placeholder="e.g. Prefabricated concrete panels, piling, etc."
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Liaison Contact Person</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  placeholder="e.g. Siddharth Godrej"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                />
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
                  Log Builder proposal
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
