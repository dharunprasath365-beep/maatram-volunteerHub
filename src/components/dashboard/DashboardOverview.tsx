import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../layout/Sidebar';
import {
  Clock,
  CheckCircle,
  Calendar,
  Award,
  Users,
  AlertCircle,
  FileCheck,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenTestSuite: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab, onOpenTestSuite }) => {
  const {
    currentUser,
    opportunities,
    applications,
    participationRecords,
    users,
    organizations,
    getUserVerifiedHours,
    getUserCompletedEventsCount,
    getUserBadges,
    availabilities,
    auditLogs,
  } = useApp();

  // 1. VOLUNTEER DASHBOARD
  if (currentUser.role === 'volunteer') {
    const verifiedHours = getUserVerifiedHours(currentUser.id);
    const completedEvents = getUserCompletedEventsCount(currentUser.id);
    const userBadges = getUserBadges(currentUser.id);

    const userApps = applications.filter(a => a.userId === currentUser.id);
    const pendingApps = userApps.filter(a => a.status === 'pending');
    const approvedApps = userApps.filter(a => a.status === 'approved');

    const upcomingOpps = opportunities
      .filter(o => o.status === 'published' && new Date(o.deadline) >= new Date())
      .slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <span className="text-xs uppercase tracking-wider font-bold bg-white/20 text-[#D8F3DC] px-2.5 py-0.5 rounded-full inline-block">
              Welcome back, {currentUser.fullName.split(' ')[0]}!
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">
              Your Volunteering Journey & Community Impact
            </h1>
            <p className="text-xs sm:text-sm text-[#D8F3DC] leading-relaxed">
              Every hour you give transforms the lives of first-generation college scholars across rural Tamil Nadu.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        </div>

        {/* Impact Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between text-[#718096] text-xs">
              <span>Verified Hours</span>
              <Clock className="w-4 h-4 text-[#2D6A4F]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-[#2D6A4F] mt-2">
              {verifiedHours.toFixed(1)} hrs
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">100% certified by staff</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between text-[#718096] text-xs">
              <span>Completed Events</span>
              <CheckCircle className="w-4 h-4 text-[#1B4332]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-[#1E2922] mt-2">
              {completedEvents}
            </div>
            <span className="text-[10px] text-[#718096]">Sessions attended</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between text-[#718096] text-xs">
              <span>Active Applications</span>
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-blue-700 mt-2">
              {pendingApps.length}
            </div>
            <span className="text-[10px] text-blue-600">Pending office review</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between text-[#718096] text-xs">
              <span>Badges Earned</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-600 mt-2">
              {userBadges.length}
            </div>
            <span className="text-[10px] text-amber-700">Recognition milestones</span>
          </div>
        </div>

        {/* Dual Section: Active Applications & Recommended Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Applications Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#1E2922]">My Applications</h3>
              <button
                onClick={() => setActiveTab('applications')}
                className="text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({userApps.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userApps.length === 0 ? (
              <div className="text-center py-8 text-[#718096] text-xs">
                You haven't applied to any opportunities yet.
              </div>
            ) : (
              <div className="space-y-3">
                {userApps.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAF8] flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#1E2922] line-clamp-1">{app.opportunityTitle}</h4>
                      <p className="text-[11px] text-[#718096] capitalize">
                        {app.opportunityCategory.replace('_', ' ')} • Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize shrink-0 ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Opportunities */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#1E2922]">
                Recommended Opportunities
              </h3>
              <button
                onClick={() => setActiveTab('opportunities')}
                className="text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1 cursor-pointer"
              >
                <span>Browse Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingOpps.map(opp => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#2D6A4F] transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-xs text-[#1E2922] line-clamp-1">{opp.title}</h4>
                    <p className="text-[11px] text-[#718096]">
                      {new Date(opp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {opp.location}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className="px-3 py-1 text-xs font-bold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. OFFICE STAFF DASHBOARD
  if (currentUser.role === 'staff') {
    const pendingApps = applications.filter(a => a.status === 'pending');
    const pendingHours = participationRecords.filter(r => r.verificationStatus === 'pending');
    const activeVolunteersCount = users.filter(u => u.role === 'volunteer').length;
    const upcomingEvents = opportunities.filter(o => o.status === 'published').length;

    return (
      <div className="space-y-6">
        {/* Office Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Office Staff Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332] mt-1">
              Volunteer Operations & Review Hub
            </h1>
            <p className="text-sm text-[#718096]">
              Manage applicant approvals, verify on-ground service hours, and match interview panels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('applications')}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs cursor-pointer"
            >
              Review Applications ({pendingApps.length})
            </button>
          </div>
        </div>

        {/* Operational Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-semibold text-[#718096]">Pending Applications</span>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-600 mt-2">
              {pendingApps.length}
            </div>
            <span className="text-[10px] text-amber-700">Awaiting admission decision</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-semibold text-[#718096]">Hours To Verify</span>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-rose-600 mt-2">
              {pendingHours.length}
            </div>
            <span className="text-[10px] text-rose-700">Attendance submitted</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-semibold text-[#718096]">Active Volunteers</span>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-[#2D6A4F] mt-2">
              {activeVolunteersCount}
            </div>
            <span className="text-[10px] text-[#718096]">Enrolled community members</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-semibold text-[#718096]">Active Opportunities</span>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-[#1B4332] mt-2">
              {upcomingEvents}
            </div>
            <span className="text-[10px] text-[#718096]">Published drives</span>
          </div>
        </div>

        {/* Queues Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Applications Action Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#1E2922]">
                Priority Review Queue ({pendingApps.length})
              </h3>
              <button
                onClick={() => setActiveTab('applications')}
                className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1 cursor-pointer"
              >
                <span>Open Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingApps.slice(0, 3).map(app => (
                <div key={app.id} className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1E2922]">{app.userName}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                      Pending
                    </span>
                  </div>
                  <p className="text-[#718096]">{app.opportunityTitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hours Verification Queue */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-[#1E2922]">
                Awaiting Hours Verification ({pendingHours.length})
              </h3>
              <button
                onClick={() => setActiveTab('verification')}
                className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1 cursor-pointer"
              >
                <span>Verify All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingHours.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1E2922]">{rec.userName}</span>
                    <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded">
                      {rec.allocatedHours} hrs submitted
                    </span>
                  </div>
                  <p className="text-[#718096]">{rec.opportunityTitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. ADMIN DASHBOARD
  const totalVerifiedHours = participationRecords
    .filter(r => r.verificationStatus === 'verified')
    .reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              Administrator Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332] mt-1">
            System & Foundation Operations Overview
          </h1>
          <p className="text-sm text-[#718096]">
            Full visibility over users, organizations, certified hours, audit logs, and security checks.
          </p>
        </div>

        <button
          onClick={onOpenTestSuite}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] border border-[#A5D6A7] rounded-xl transition-colors cursor-pointer self-start sm:self-center"
        >
          <CheckCircle className="w-4 h-4 text-[#2D6A4F]" />
          <span>Run System Test Suite</span>
        </button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#718096]">Total Registered Users</span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-[#1E2922] mt-2">
            {users.length}
          </div>
          <span className="text-[10px] text-[#718096]">20 Volunteers • 2 Staff/Admin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#718096]">Total Verified Hours</span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-[#2D6A4F] mt-2">
            {totalVerifiedHours.toFixed(1)} hrs
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Audited & certified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#718096]">Partner Organizations</span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-blue-700 mt-2">
            {organizations.length}
          </div>
          <span className="text-[10px] text-blue-600">Corporates & Institutions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <span className="text-xs font-semibold text-[#718096]">Audit Trail Entries</span>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-purple-700 mt-2">
            {auditLogs.length}
          </div>
          <span className="text-[10px] text-purple-600">Immutable security logs</span>
        </div>
      </div>

      {/* Admin Quick Jump Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setActiveTab('admin_users')}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#2D6A4F] shadow-2xs cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-[#1E2922]">User & Role Governance</h4>
          <p className="text-xs text-[#718096]">
            Configure roles, guard against privilege escalation, and view user profiles.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('employer_reports')}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#2D6A4F] shadow-2xs cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-[#1E2922]">Employer & CSR Reports</h4>
          <p className="text-xs text-[#718096]">
            Organization hours breakdowns, category statistics, and consent-guarded CSV exports.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('audit_logs')}
          className="bg-white p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#2D6A4F] shadow-2xs cursor-pointer transition-all space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-[#1E2922]">Audit Trail & Integrations</h4>
          <p className="text-xs text-[#718096]">
            Inspect operations history, database schema migrations, and Resend simulator logs.
          </p>
        </div>
      </div>
    </div>
  );
};
