import React from 'react';
import { Sparkles, Download, Film, Crown, CreditCard, Receipt, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { ProductionProject } from '../types/producer';
import { UserProfile, OWNER_EMAIL } from '../types/auth';

interface TopBarProps {
  currentProject: ProductionProject;
  projects: ProductionProject[];
  currentUser: UserProfile;
  onSelectProject: (proj: ProductionProject) => void;
  onOpenNewModal: () => void;
  onExportAll: () => void;
  isExporting?: boolean;
  exportProgress?: number;
  onOpenSubscription: () => void;
  onOpenTransactionModal: () => void;
  onOpenTutorial: () => void;
  onOpenAuth: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentProject,
  projects,
  currentUser,
  onSelectProject,
  onOpenNewModal,
  onExportAll,
  isExporting = false,
  exportProgress = 0,
  onOpenSubscription,
  onOpenTransactionModal,
  onOpenTutorial,
  onOpenAuth,
  activeSection,
  onNavigate,
}) => {
  const isOwner = currentUser.isOwner || currentUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('director_deck');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="font-serif tracking-wider">vicky.AI</span>
        </a>
      </div>

      {/* Zone 2: Clean Text Navigation Links */}
      <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onNavigate('director_deck')}
          className={`transition-colors text-left ${
            activeSection === 'director_deck'
              ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-amber-400/80'
              : 'hover:text-white'
          }`}
        >
          Director Deck
        </button>
        <button
          onClick={() => onNavigate('timeline')}
          className={`transition-colors text-left ${
            activeSection === 'timeline'
              ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-amber-400/80'
              : 'hover:text-white'
          }`}
        >
          Timeline & Shots
        </button>
        <button
          onClick={() => onNavigate('decisions')}
          className={`transition-colors text-left ${
            activeSection === 'decisions'
              ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-amber-400/80'
              : 'hover:text-white'
          }`}
        >
          Autonomous Decisions
        </button>
        <button
          onClick={() => onNavigate('connectors')}
          className={`transition-colors text-left ${
            activeSection === 'connectors'
              ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-amber-400/80'
              : 'hover:text-white'
          }`}
        >
          Connectors Hub
        </button>
        <button
          onClick={() => onNavigate('ai_lab')}
          className={`transition-colors text-left ${
            activeSection === 'ai_lab'
              ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-amber-400/80'
              : 'hover:text-white'
          }`}
        >
          AI Studio Lab
        </button>
      </nav>

      {/* Zone 3: Payment Proof Button + Account Status + Primary Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Always-Visible Payment Proof Button */}
        <button
          type="button"
          onClick={onOpenTransactionModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
          title="Upload Easypaisa Transaction Screenshot Proof (PKR or USD)"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Payment Proof</span>
        </button>

        {/* Pricing / Plans Button */}
        <button
          type="button"
          onClick={onOpenSubscription}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap"
          title="View Easypaisa Plans ($3 / $250)"
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Plans ($3 / $250)</span>
        </button>

        {/* Video Tutorial Button */}
        <button
          type="button"
          onClick={onOpenTutorial}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-medium transition-colors whitespace-nowrap"
          title="Watch vicky.AI Video Tutorial (Idea-to-Editor Guide)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Tutorial</span>
        </button>

        {/* User Account / Verification Status Button */}
        {currentUser.verificationStatus === 'pending' && !isOwner ? (
          <button
            type="button"
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors whitespace-nowrap"
            title="Payment Proof Pending Admin Verification"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Verification</span>
          </button>
        ) : isOwner ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
            title="Owner Account: waqar.aliakbar920@gmail.com (Lifetime Free VIP)"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="hidden md:inline font-semibold">Owner · Switch User</span>
            <span className="md:hidden font-semibold">Owner</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:border-amber-400 transition-colors whitespace-nowrap"
          >
            <span>{currentUser.email.split('@')[0]}</span>
          </button>
        )}

        {/* Project Switcher */}
        <select
          value={currentProject.id}
          onChange={(e) => {
            const found = projects.find((p) => p.id === e.target.value);
            if (found) onSelectProject(found);
          }}
          aria-label="Select active project"
          className="hidden md:block text-xs bg-slate-900 border border-slate-700/80 text-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-amber-500 max-w-[145px] truncate"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onExportAll}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 border border-slate-700/80 rounded-md transition-colors whitespace-nowrap"
          title="Export Complete vicky.AI JSON Production Package"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-300 font-mono">{exportProgress}%</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-sm whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Pitch Idea</span>
        </button>
      </div>
    </header>
  );
};
