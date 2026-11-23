import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  ShieldCheck,
  Bell,
  Share2,
  Building2,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  History,
  FileText,
} from 'lucide-react';

export const ConsentManager: React.FC = () => {
  const { currentUser, updateUserConsent, toggleOptOutLeaderboard, auditLogs } = useApp();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const consent = currentUser.consent || {
    volunteeringCommunications: true,
    linkedInRecognition: false,
    identifiableEmployerAttribution: false,
    lastUpdated: new Date().toISOString(),
  };

  const handleToggle = (key: 'volunteeringCommunications' | 'linkedInRecognition' | 'identifiableEmployerAttribution') => {
    const updatedValue = !consent[key];
    updateUserConsent(currentUser.id, { [key]: updatedValue });

    setToastMessage(`Preference updated: ${key.replace(/([A-Z])/g, ' $1')} is now ${updatedValue ? 'Enabled' : 'Disabled'}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleLeaderboard = () => {
    toggleOptOutLeaderboard(currentUser.id);
    const newStatus = !currentUser.optOutPublicLeaderboard;
    setToastMessage(`Public Leaderboard Visibility: You are now ${newStatus ? 'Hidden (Anonymous)' : 'Visible'}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter audit logs relevant to this user's consent
  const userConsentLogs = auditLogs.filter(
    l => l.category === 'consent' && (l.actorId === currentUser.id || l.targetId === currentUser.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
            Privacy & Consent Governance Center
          </h1>
        </div>
        <p className="text-sm text-[#718096] mt-1">
          Manage your communication permissions, social sharing consents, and employer attribution settings.
          Changes take effect immediately across all system workflows.
        </p>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Consent Toggles Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="font-heading font-bold text-base text-[#1E2922]">
              Granular Consent Preferences
            </h3>
            <p className="text-xs text-[#718096]">
              Last updated: {new Date(consent.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
            Consent Enforced
          </span>
        </div>

        <div className="space-y-5">
          {/* 1. Volunteering Communications */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAF8] transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center text-[#2D6A4F] shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1E2922]">
                  Volunteering Communications & Operational Notifications
                </h4>
                <p className="text-xs text-[#718096] leading-relaxed max-w-xl">
                  Receive email confirmations for submitted applications, schedule details, venue updates, and hour verification certificates.
                  If disabled, the office staff cannot send automated emails or scheduling notifications to your inbox.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('volunteeringCommunications')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                consent.volunteeringCommunications ? 'bg-[#2D6A4F]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  consent.volunteeringCommunications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. LinkedIn Recognition */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAF8] transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#0077B5] shrink-0 mt-0.5">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1E2922]">
                  LinkedIn Recognition & Public Social Shoutouts
                </h4>
                <p className="text-xs text-[#718096] leading-relaxed max-w-xl">
                  Allows generating celebratory LinkedIn share cards and pre-filled milestone posts.
                  If disabled, LinkedIn post generation is blocked to preserve your professional profile privacy.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('linkedInRecognition')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                consent.linkedInRecognition ? 'bg-[#2D6A4F]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  consent.linkedInRecognition ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Identifiable Employer Attribution */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAF8] transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1E2922]">
                  Identifiable Employer Attribution in Corporate Reports
                </h4>
                <p className="text-xs text-[#718096] leading-relaxed max-w-xl">
                  Permission for your company's CSR report to list your name alongside your verified service hours.
                  If disabled, your hours still count towards your company's aggregate CSR total, but your identity remains strictly anonymous.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('identifiableEmployerAttribution')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                consent.identifiableEmployerAttribution ? 'bg-[#2D6A4F]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  consent.identifiableEmployerAttribution ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Public Leaderboard Opt-Out */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAF8] transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#1E2922]">
                  Opt Out of Public Leaderboard Recognition
                </h4>
                <p className="text-xs text-[#718096] leading-relaxed max-w-xl">
                  If opted out, your rankings will appear as "Anonymous Contributor" to other volunteers. Your verified hours and badges remain fully credited to your personal account.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleLeaderboard}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                currentUser.optOutPublicLeaderboard ? 'bg-[#2D6A4F]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  currentUser.optOutPublicLeaderboard ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Audit Trail for Consent History */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F8FAF8] border-b border-[#E2E8F0] flex items-center gap-2">
          <History className="w-4 h-4 text-[#2D6A4F]" />
          <h4 className="font-heading font-bold text-sm text-[#1E2922]">
            Consent Audit & Compliance History
          </h4>
        </div>

        <div className="p-4">
          {userConsentLogs.length === 0 ? (
            <p className="text-xs text-[#718096] text-center py-4">No recent consent modification records.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {userConsentLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E2E8F0] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#1E2922] block">{log.action}</span>
                    <span className="text-[#718096]">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-[#A0AEC0] shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
