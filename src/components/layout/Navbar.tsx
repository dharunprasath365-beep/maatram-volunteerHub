import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  UserCheck, 
  Shield, 
  ChevronDown, 
  RotateCcw, 
  CheckCircle2, 
  Bell, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onOpenTestSuite: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTestSuite, onOpenMobileMenu }) => {
  const { currentUser, switchUser, users, resetDemoData, emailLogs, openAuthModal, logoutUser } = useApp();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter key personas for quick switching
  const quickPersonas = [
    { id: 'vol-1', label: 'Karthik S. (Corporate Volunteer)', role: 'Volunteer', desc: 'Cognizant • 21 verified hrs' },
    { id: 'vol-3', label: 'Dinesh K. (Alumnus Volunteer)', role: 'Volunteer', desc: 'Anna Univ Alum • BGV Specialist' },
    { id: 'vol-7', label: 'Saravanan M. (Inactive/Opted Out)', role: 'Volunteer', desc: 'Alum • Consent Withdrawn' },
    { id: 'staff-1', label: 'Shanthi S. (Office Staff)', role: 'Staff', desc: 'Volunteer Coordinator' },
    { id: 'admin-1', label: 'Sujith Kumar (Admin)', role: 'Admin', desc: 'Managing Trustee & Chief Admin' },
  ];

  const recentEmails = emailLogs.slice(0, 4);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-[#2D3748] hover:bg-[#F2F6F3] rounded-lg"
            aria-label="Open navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1B4332] flex items-center justify-center text-white shadow-xs font-bold text-lg">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-[#1B4332]">
                  Maatram Connect
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider bg-[#D8F3DC] text-[#1B4332] px-2 py-0.5 rounded">
                  MH26-02
                </span>
              </div>
              <p className="text-[11px] text-[#718096] -mt-0.5 hidden sm:block">
                Maatram Foundation Volunteering & Impact Portal
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Account / Sign In Primary CTA */}
          <button
            onClick={() => openAuthModal('register')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <span>+ Create Account</span>
          </button>

          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#F2F6F3] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            <span>Sign In</span>
          </button>

          {/* Interactive Test Suite Button */}
          <button
            onClick={onOpenTestSuite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] rounded-lg transition-colors cursor-pointer"
            title="Run live automated system tests"
          >
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
            <span className="hidden sm:inline">System Test Suite</span>
            <span className="sm:hidden">Tests</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to clean initial state?')) {
                resetDemoData();
              }
            }}
            className="p-2 text-[#718096] hover:text-[#1B4332] hover:bg-[#F2F6F3] rounded-lg transition-colors cursor-pointer"
            title="Reset to pristine fictional demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications / Simulated Email Log */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#4A5568] hover:text-[#1B4332] hover:bg-[#F2F6F3] rounded-lg transition-colors cursor-pointer"
              title="Recent Dispatched Notifications"
            >
              <Bell className="w-4 h-4" />
              {emailLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2D6A4F] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#2D6A4F]" />
                    <h4 className="font-semibold text-sm text-[#1E2922]">Outbound Email Log</h4>
                  </div>
                  <span className="text-[10px] bg-[#F2F6F3] text-[#4A5568] px-2 py-0.5 rounded font-medium">
                    Consent-Enforced
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto text-xs">
                  {recentEmails.length === 0 ? (
                    <p className="text-[#718096] py-3 text-center">No email notifications recorded yet.</p>
                  ) : (
                    recentEmails.map(mail => (
                      <div
                        key={mail.id}
                        className={`p-2.5 rounded-lg border ${
                          mail.status === 'blocked_by_consent'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-[#F8FAF8] border-[#E2E8F0] text-[#2D3748]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[11px] truncate max-w-[190px]">
                            To: {mail.recipientName}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              mail.status === 'blocked_by_consent'
                                ? 'bg-amber-200 text-amber-900'
                                : mail.provider === 'resend_api'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {mail.status === 'blocked_by_consent'
                              ? 'Blocked (Consent)'
                              : mail.provider === 'resend_api'
                              ? 'Resend API'
                              : 'Dispatched'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-[#1E2922] line-clamp-1">{mail.subject}</p>
                        <p className="text-[10px] text-[#718096] mt-1 line-clamp-2">{mail.contentSnippet}</p>
                        {mail.gmailUrl && (
                          <div className="mt-2 pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between text-[10px]">
                            <span className="text-[#718096] font-mono truncate max-w-[170px]">{mail.recipientEmail}</span>
                            <a
                              href={mail.gmailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline"
                            >
                              <span>Send in Gmail</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#E2E8F0] mx-0.5" />

          {/* Quick Persona Switcher & User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-[#F2F6F3] transition-colors border border-transparent hover:border-[#E2E8F0] cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover border border-[#D8F3DC]"
              />
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#1E2922] line-clamp-1">
                    {currentUser.fullName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : currentUser.role === 'staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-[#D8F3DC] text-[#1B4332]'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-[#718096] truncate max-w-[130px]">
                  {currentUser.organizationName || currentUser.volunteerType.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#718096]" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2.5 z-50 divide-y divide-[#E2E8F0]">
                {/* Active User Header */}
                <div className="px-2 pb-2.5 pt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E2922]">{currentUser.fullName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-[#D8F3DC] text-[#1B4332]">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#718096]">{currentUser.email}</div>
                  <div className="text-[10px] font-semibold text-[#2D6A4F] capitalize">
                    Category: {currentUser.volunteerType.replace('_', ' ')}
                    {currentUser.college ? ` • ${currentUser.college}` : ''}
                    {currentUser.graduationYear ? ` (Batch ${currentUser.graduationYear})` : ''}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        openAuthModal('register');
                      }}
                      className="flex-1 py-1.5 text-[11px] font-bold text-center text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] rounded-lg transition-colors cursor-pointer"
                    >
                      + Create Account
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logoutUser();
                        openAuthModal('login');
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Quick Persona Switcher */}
                <div className="pt-2">
                  <div className="px-2 py-1 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                      Demo Persona Quick Switch
                    </p>
                  </div>

                  <div className="space-y-1">
                    {quickPersonas.map(persona => {
                      const isSelected = currentUser.id === persona.id;
                      return (
                        <button
                          key={persona.id}
                          onClick={() => {
                            switchUser(persona.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#E8F5E9] text-[#1B4332] font-semibold'
                              : 'hover:bg-[#F8FAF8] text-[#2D3748]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium">{persona.label}</span>
                            </div>
                            <p className="text-[10px] text-[#718096]">{persona.desc}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
