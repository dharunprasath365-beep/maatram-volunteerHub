import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminAccessDeniedProps {
  featureName?: string;
  onBackToDashboard?: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  featureName = 'Personal Volunteer Insights',
  onBackToDashboard,
}) => {
  const { currentUser, switchUser, openAuthModal } = useApp();

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 bg-white rounded-3xl border border-red-200 shadow-sm text-center">
      {/* Icon Badge */}
      <div className="relative inline-flex mb-5">
        <div className="w-18 h-18 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 shadow-xs">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
      </div>

      <h2 className="text-2xl font-bold font-heading text-[#1E2922] mb-2">
        Admin Privileges Required
      </h2>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-4">
        <span>Protected Resource: {featureName}</span>
      </div>

      <p className="text-sm text-[#4A5568] leading-relaxed mb-6">
        Under Maatram Foundation's strict <strong>Privacy by Design</strong> principles and PostgreSQL Row Level Security (RLS) policies, cross-volunteer personal intelligence, attendance reliability scores, confidential review notes, and private contact dossiers are <strong>accessible ONLY to Administrators</strong>.
      </p>

      {/* User Context Card */}
      <div className="bg-[#F8FAF8] border border-[#E2E8F0] rounded-2xl p-4 text-left text-xs mb-6 space-y-2">
        <div className="flex items-center justify-between text-[#718096]">
          <span>Current Account:</span>
          <span className="font-semibold text-[#1E2922]">{currentUser.fullName} ({currentUser.email})</span>
        </div>
        <div className="flex items-center justify-between text-[#718096]">
          <span>Current Role:</span>
          <span className="font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {currentUser.role} {currentUser.volunteerType ? `(${currentUser.volunteerType})` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#718096]">
          <span>Required Privilege:</span>
          <span className="font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Admin (Level 3 - Foundation Administrator)
          </span>
        </div>
        <div className="text-[11px] text-[#718096] pt-1 border-t border-[#E2E8F0]">
          * Volunteers are strictly authorized to view only their own personal contributions and application statuses via the <em>Verified Hours & Impact</em> and <em>My Applications</em> tabs.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] border border-[#A5D6A7] rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        )}

        <button
          onClick={() => switchUser('admin-1')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Switch to Admin Persona (Suresh K.)</span>
        </button>

        <button
          onClick={() => openAuthModal('login')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#2D3748] bg-white hover:bg-[#F2F6F3] border border-[#CBD5E0] rounded-xl transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Sign In as Admin</span>
        </button>
      </div>
    </div>
  );
};
