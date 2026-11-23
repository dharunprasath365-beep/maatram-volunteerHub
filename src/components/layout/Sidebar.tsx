import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  FileCheck,
  Clock,
  UserCheck,
  Trophy,
  ShieldAlert,
  BarChart3,
  Building2,
  Users,
  ScrollText,
  MailCheck,
  Database,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'opportunities'
  | 'applications'
  | 'verification'
  | 'interview_matcher'
  | 'leaderboard'
  | 'alumni_analytics'
  | 'employer_reports'
  | 'privacy_consent'
  | 'admin_users'
  | 'admin_insights'
  | 'audit_logs'
  | 'integrations'
  | 'database_schema';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenTestSuite: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  onOpenTestSuite,
}) => {
  const { currentUser, applications, participationRecords } = useApp();

  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const pendingHoursCount = participationRecords.filter(p => p.verificationStatus === 'pending').length;

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Volunteer / Common Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Volunteering Portal
              </span>
              <span className="text-[10px] font-semibold text-[#2D6A4F] bg-[#E8F5E9] px-1.5 py-0.5 rounded">
                Portal
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('opportunities')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'opportunities'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Opportunities</span>
              </button>

              <button
                onClick={() => handleNavClick('applications')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'applications'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span>
                    {currentUser.role === 'volunteer' ? 'My Applications' : 'Applications Review'}
                  </span>
                </div>
                {currentUser.role !== 'volunteer' && pendingAppsCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingAppsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('verification')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'verification'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    {currentUser.role === 'volunteer' ? 'Verified Hours & Impact' : 'Hours Verification'}
                  </span>
                </div>
                {currentUser.role !== 'volunteer' && pendingHoursCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingHoursCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('interview_matcher')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'interview_matcher'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>
                  {currentUser.role === 'volunteer' ? 'Interview Availability' : 'Interviews & Matcher'}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('leaderboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'leaderboard'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <Trophy className="w-4 h-4 shrink-0" />
                <span>Leaderboard & Badges</span>
              </button>

              <button
                onClick={() => handleNavClick('privacy_consent')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'privacy_consent'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Privacy & Consent</span>
              </button>
            </nav>
          </div>

          {/* Operational & Staff Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Operational Insights
              </span>
              {currentUser.role === 'volunteer' && (
                <span className="text-[9px] text-[#A0AEC0] uppercase">Staff/Admin</span>
              )}
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('alumni_analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'alumni_analytics'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Alumni Analytics</span>
              </button>

              <button
                onClick={() => handleNavClick('employer_reports')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'employer_reports'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Employer Reports</span>
              </button>
            </nav>
          </div>

          {/* Governance & Admin Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Admin & Governance
              </span>
              <span className="text-[9px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('admin_insights')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'admin_insights'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>Personal Insights</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                  Admin Only
                </span>
              </button>

              <button
                onClick={() => handleNavClick('admin_users')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'admin_users'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>User & Role Governance</span>
              </button>

              <button
                onClick={() => handleNavClick('audit_logs')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'audit_logs'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <ScrollText className="w-4 h-4 shrink-0" />
                <span>Audit Trail Logs</span>
              </button>

              <button
                onClick={() => handleNavClick('integrations')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'integrations'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <MailCheck className="w-4 h-4 shrink-0" />
                <span>Email & API Integrations</span>
              </button>

              <button
                onClick={() => handleNavClick('database_schema')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'database_schema'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#2D3748] hover:bg-[#F2F6F3]'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Supabase Schema & RLS</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer info & Test Suite card */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAF8]">
          <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
              <span className="text-xs font-bold text-[#1E2922]">Automated Tests</span>
            </div>
            <p className="text-[11px] text-[#718096] mb-2.5">
              10 comprehensive security, capacity, consent & calculation tests.
            </p>
            <button
              onClick={onOpenTestSuite}
              className="w-full text-center py-1.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg transition-colors cursor-pointer"
            >
              Run Test Suite
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
