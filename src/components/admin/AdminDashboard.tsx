import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AdminAccessDenied } from '../common/AdminAccessDenied';
import {
  Users,
  ScrollText,
  Shield,
  Key,
  Database,
  Mail,
  Copy,
  Check,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  UserX,
  Calendar,
  Award,
  CheckSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Building,
  Phone,
  Activity,
  Eye,
  ShieldAlert,
  Clock,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  initialSubTab?: 'personal_insights' | 'users' | 'audit' | 'integrations' | 'database';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialSubTab = 'personal_insights' }) => {
  const {
    currentUser,
    users,
    updateUserRole,
    auditLogs,
    emailLogs,
    sendEmailNotification,
    organizations,
    participationRecords,
    applications,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'personal_insights' | 'users' | 'audit' | 'integrations' | 'database'>(initialSubTab);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchAuditQuery, setSearchAuditQuery] = useState('');
  const [selectedAuditCategory, setSelectedAuditCategory] = useState<string>('all');
  const [roleUpdateFeedback, setRoleUpdateFeedback] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Sync subtab when parent prop updates
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Personal insights state (Admin Exclusive)
  const [searchVolunteerQuery, setSearchVolunteerQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'student' | 'alumnus' | 'corporate_supporter'>('all');
  const [selectedReliabilityFilter, setSelectedReliabilityFilter] = useState<'all' | 'high' | 'moderate' | 'needs_attention' | 'new'>('all');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<'all' | 'active' | 'declining' | 'inactive'>('all');
  const [expandedNotesUserIds, setExpandedNotesUserIds] = useState<Set<string>>(new Set());

  // Test email state
  const [testEmailUserId, setTestEmailUserId] = useState<string>('vol-1');
  const [testEmailSubject, setTestEmailSubject] = useState<string>('Maatram Foundation: Welcome & Opportunity Update');
  const [testEmailFeedback, setTestEmailFeedback] = useState<string | null>(null);

  const [serverEmailStatus, setServerEmailStatus] = useState<{
    configured: boolean;
    provider: string;
    fromEmail: string;
    maskedKey?: string | null;
    message: string;
  } | null>(null);

  const [testEmailRecipientType, setTestEmailRecipientType] = useState<'persona' | 'custom'>('custom');
  const [testEmailCustomAddress, setTestEmailCustomAddress] = useState<string>('dharunprasath365@gmail.com');
  const [testEmailCustomName, setTestEmailCustomName] = useState<string>('Dharun Prasath');
  const [testEmailTemplate, setTestEmailTemplate] = useState<
    'application_received' | 'application_approved' | 'application_rejected' | 'hours_verified' | 'interview_assigned'
  >('application_approved');
  const [testEmailContent, setTestEmailContent] = useState<string>(
    'Thank you for your active dedication to Maatram Foundation scholars. Your volunteering contribution directly empowers students across Tamil Nadu.'
  );
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    deliveryMethod?: string;
    gmailUrl?: string;
    mailtoUrl?: string;
    messageId?: string;
    recipientEmail?: string;
  } | null>(null);

  const [viewingEmailModal, setViewingEmailModal] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/email-status')
      .then(res => res.json())
      .then(data => setServerEmailStatus(data))
      .catch(() => {
        setServerEmailStatus({
          configured: false,
          provider: 'simulator',
          fromEmail: 'onboarding@resend.dev',
          message: 'Client-assisted & Simulator mode active.',
        });
      });
  }, []);

  const [copiedSQL, setCopiedSQL] = useState(false);

  // Users filtering
  const filteredUsers = users.filter(u => {
    if (!searchUserQuery.trim()) return true;
    const q = searchUserQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.organizationName?.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Audit logs filtering
  const filteredAuditLogs = auditLogs.filter(log => {
    if (selectedAuditCategory !== 'all' && log.category !== selectedAuditCategory) {
      return false;
    }
    if (searchAuditQuery.trim()) {
      const q = searchAuditQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const res = updateUserRole(userId, newRole);
    setRoleUpdateFeedback({ id: userId, success: res.success, message: res.message });
    setTimeout(() => setRoleUpdateFeedback(null), 3000);
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const isCustom = testEmailRecipientType === 'custom';
    const res = sendEmailNotification(
      isCustom ? 'custom' : testEmailUserId,
      testEmailTemplate,
      testEmailSubject,
      testEmailContent,
      isCustom
        ? {
            customEmail: testEmailCustomAddress,
            customName: testEmailCustomName,
            details: {
              opportunityTitle: 'Tamil Nadu Scholar Admissions & Mentorship Drive',
              actualHours: 6.0,
              category: 'admissions_support',
            },
          }
        : undefined
    );
    setTestEmailResult(res);
    setTestEmailFeedback(res.message);
  };

  const sqlSchemaSnippet = `-- PostgreSQL & Supabase Database Migration
-- Project: MH26-02 | Maatram HackForge 2026–27
-- File: /supabase/migrations/20261103000000_maatram_connect_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role_type AS ENUM ('volunteer', 'staff', 'admin');
CREATE TYPE opportunity_category_type AS ENUM ('school_visit', 'admissions_support', 'bgv', 'mock_interview', 'admission_panel');
CREATE TYPE opportunity_mode_type AS ENUM ('offline', 'online', 'hybrid');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'volunteer',
    opt_out_public_leaderboard BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category opportunity_category_type NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    allocated_count INT NOT NULL DEFAULT 0 CHECK (allocated_count <= capacity)
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    CONSTRAINT unique_opportunity_volunteer UNIQUE (opportunity_id, user_id)
);

-- RLS POLICIES (Summary)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Volunteers view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff view all applications" ON applications FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin')));`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  // STRICT ACCESS CONTROL: Only administrators can access personal insights and governance
  if (currentUser.role !== 'admin') {
    return <AdminAccessDenied featureName="Personal Volunteer Insights & Governance" />;
  }

  // Toggle expanded coordinator review notes for a specific volunteer
  const toggleNotes = (userId: string) => {
    setExpandedNotesUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Compile deep volunteer intelligence metrics
  const volunteerProfiles = users.filter(u => u.role === 'volunteer');

  const volunteerMetrics = volunteerProfiles.map(vol => {
    const volApps = applications.filter(a => a.userId === vol.id);
    const volRecords = participationRecords.filter(p => p.userId === vol.id);

    const verifiedHours = volRecords
      .filter(p => p.verificationStatus === 'verified')
      .reduce((sum, p) => sum + p.actualHours, 0);

    const pendingHours = volRecords
      .filter(p => p.verificationStatus === 'pending')
      .reduce((sum, p) => sum + p.actualHours, 0);

    const totalEvents = volRecords.length;
    const attendedEvents = volRecords.filter(p => p.attendanceStatus === 'attended').length;
    const missedEvents = volRecords.filter(p => p.attendanceStatus === 'absent').length;

    const reliabilityRate = totalEvents > 0 ? Math.round((attendedEvents / totalEvents) * 100) : 100;
    const reliabilityLabel: 'High' | 'Moderate' | 'Needs Attention' | 'New Volunteer' =
      totalEvents === 0
        ? 'New Volunteer'
        : reliabilityRate >= 85
        ? 'High'
        : reliabilityRate >= 65
        ? 'Moderate'
        : 'Needs Attention';

    // Activity recency calculation (Days since last recorded application or event)
    const timestamps = [
      ...volRecords.map(p => new Date(p.eventDate).getTime()),
      ...volApps.map(a => new Date(a.appliedAt).getTime()),
    ].filter(t => !isNaN(t));

    const latestTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;
    const currentRefTime = new Date('2026-11-03').getTime();
    const daysSinceLastActivity = latestTimestamp ? Math.max(0, Math.floor((currentRefTime - latestTimestamp) / (1000 * 60 * 60 * 24))) : null;

    const inactivityStatus: 'active' | 'declining' | 'inactive' =
      daysSinceLastActivity === null || daysSinceLastActivity <= 30
        ? 'active'
        : daysSinceLastActivity <= 60
        ? 'declining'
        : 'inactive';

    // Confidential coordinator review notes from applications and event verifications
    const notes: { source: string; text: string; date: string; author: string }[] = [];
    volApps.forEach(a => {
      if (a.internalReviewNotes) {
        notes.push({
          source: `Application: ${a.opportunityTitle}`,
          text: a.internalReviewNotes,
          date: a.reviewedAt || a.appliedAt,
          author: 'Coordinator Application Review',
        });
      }
    });
    volRecords.forEach(p => {
      if (p.staffFeedback || p.notes) {
        notes.push({
          source: `Participation: ${p.opportunityTitle}`,
          text: p.staffFeedback || p.notes || '',
          date: p.verifiedAt || p.eventDate,
          author: p.verifiedByStaffName || 'Event Coordinator',
        });
      }
    });

    return {
      user: vol,
      volApps,
      volRecords,
      verifiedHours,
      pendingHours,
      totalEvents,
      attendedEvents,
      missedEvents,
      reliabilityRate,
      reliabilityLabel,
      daysSinceLastActivity,
      inactivityStatus,
      notes,
    };
  });

  // Aggregate statistics for personal insights overview
  const totalMonitoredVolunteers = volunteerMetrics.length;
  const studentVolunteersCount = volunteerMetrics.filter(v => v.user.volunteerType === 'student').length;
  const alumniVolunteersCount = volunteerMetrics.filter(v => v.user.volunteerType === 'alumnus').length;
  const avgReliability = Math.round(
    volunteerMetrics.reduce((sum, v) => sum + v.reliabilityRate, 0) / (totalMonitoredVolunteers || 1)
  );
  const inactiveFlagsCount = volunteerMetrics.filter(v => v.inactivityStatus === 'inactive').length;
  const commsConsentCount = volunteerMetrics.filter(v => v.user.consent.volunteeringCommunications).length;

  // Filter volunteer metrics list
  const filteredVolunteerMetrics = volunteerMetrics.filter(item => {
    // Search query
    if (searchVolunteerQuery.trim()) {
      const q = searchVolunteerQuery.toLowerCase();
      const match =
        item.user.fullName.toLowerCase().includes(q) ||
        item.user.email.toLowerCase().includes(q) ||
        item.user.phone.toLowerCase().includes(q) ||
        item.user.college?.toLowerCase().includes(q) ||
        item.user.organizationName?.toLowerCase().includes(q) ||
        item.user.skills.some(s => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      if (item.user.volunteerType !== selectedCategoryFilter) return false;
    }

    // Reliability filter
    if (selectedReliabilityFilter !== 'all') {
      if (selectedReliabilityFilter === 'high' && item.reliabilityLabel !== 'High') return false;
      if (selectedReliabilityFilter === 'moderate' && item.reliabilityLabel !== 'Moderate') return false;
      if (selectedReliabilityFilter === 'needs_attention' && item.reliabilityLabel !== 'Needs Attention') return false;
      if (selectedReliabilityFilter === 'new' && item.reliabilityLabel !== 'New Volunteer') return false;
    }

    // Activity filter
    if (selectedActivityFilter !== 'all') {
      if (item.inactivityStatus !== selectedActivityFilter) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-700" />
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
              Admin & System Governance
            </h1>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Role-based privilege management, personal volunteer intelligence, immutable audit logs, and integrations.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-[#F2F6F3] p-1 rounded-xl self-start sm:self-center overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('personal_insights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'personal_insights'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'text-[#4A5568] hover:text-purple-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Insights</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
              activeSubTab === 'personal_insights' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
            }`}>
              Admin Only
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'users' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-[#4A5568] hover:text-[#1B4332]'
            }`}
          >
            Users & Roles
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'audit' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-[#4A5568] hover:text-[#1B4332]'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'integrations' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-[#4A5568] hover:text-[#1B4332]'
            }`}
          >
            Integrations & Resend
          </button>
          <button
            onClick={() => setActiveSubTab('database')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === 'database' ? 'bg-[#1B4332] text-white shadow-2xs' : 'text-[#4A5568] hover:text-[#1B4332]'
            }`}
          >
            Database Schema
          </button>
        </div>
      </div>

      {/* Sub-tab 0: Personal Insights & Volunteer Intelligence (Admin Exclusive) */}
      {activeSubTab === 'personal_insights' && (
        <div className="space-y-6">
          {/* Privacy & Governance Notice Banner */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-950">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-purple-900">
                  Admin-Exclusive Confidential Dossiers & Volunteer Intelligence
                </span>
                <span className="text-purple-800 leading-relaxed block mt-0.5">
                  Under Maatram Foundation's Privacy By Design framework, cross-volunteer attendance reliability, coordinator review notes, private contact numbers, and drop-off risks are <strong>strictly accessible only to Administrators</strong>. Inactivity is treated as an operational signal and never triggers automated contact.
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 font-bold text-[11px] whitespace-nowrap">
                RLS Enforced
              </span>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between text-[#718096] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Monitored Volunteers</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold font-heading text-[#1E2922]">
                {totalMonitoredVolunteers}
              </div>
              <div className="text-[11px] text-[#718096] mt-1 flex items-center gap-2">
                <span className="text-emerald-700 font-semibold">{studentVolunteersCount} Students</span>
                <span>•</span>
                <span className="text-blue-700 font-semibold">{alumniVolunteersCount} Alumni</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between text-[#718096] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Attendance Reliability</span>
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-heading text-emerald-700">
                {avgReliability}%
              </div>
              <div className="text-[11px] text-[#718096] mt-1">
                Average event attendance vs missed/no-shows
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between text-[#718096] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Inactivity / Drop-off Risk</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-heading text-amber-700">
                {inactiveFlagsCount}
              </div>
              <div className="text-[11px] text-[#718096] mt-1">
                &gt;60 days inactive (Operational flag only)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between text-[#718096] mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Comms Consent Safeguard</span>
                <HeartHandshake className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <div className="text-2xl font-bold font-heading text-[#2D6A4F]">
                {Math.round((commsConsentCount / (totalMonitoredVolunteers || 1)) * 100)}%
              </div>
              <div className="text-[11px] text-[#718096] mt-1">
                {commsConsentCount} of {totalMonitoredVolunteers} actively opted-in
              </div>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
                <input
                  type="text"
                  placeholder="Search volunteer by name, email, phone, college, workplace, or skills..."
                  value={searchVolunteerQuery}
                  onChange={e => setSearchVolunteerQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] cursor-pointer"
                >
                  <option value="all">All Roles & Categories</option>
                  <option value="student">Student Volunteers Only</option>
                  <option value="alumnus">Alumni Volunteers Only</option>
                  <option value="corporate_supporter">Corporate Supporters</option>
                </select>

                {/* Reliability Filter */}
                <select
                  value={selectedReliabilityFilter}
                  onChange={e => setSelectedReliabilityFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] cursor-pointer"
                >
                  <option value="all">All Reliability Levels</option>
                  <option value="high">High Reliability (≥85%)</option>
                  <option value="moderate">Moderate (65–84%)</option>
                  <option value="needs_attention">Needs Attention (&lt;65%)</option>
                  <option value="new">New Volunteers (No events yet)</option>
                </select>

                {/* Activity Status Filter */}
                <select
                  value={selectedActivityFilter}
                  onChange={e => setSelectedActivityFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] cursor-pointer"
                >
                  <option value="all">All Activity Statuses</option>
                  <option value="active">Active (Recent &lt;30d)</option>
                  <option value="declining">Declining (30–60d)</option>
                  <option value="inactive">Inactive (&gt;60d)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#718096] pt-2 border-t border-[#F2F6F3]">
              <span>Showing <strong>{filteredVolunteerMetrics.length}</strong> of {totalMonitoredVolunteers} volunteers</span>
              <span className="text-[11px] italic">Strictly visible to Administrator ({currentUser.email})</span>
            </div>
          </div>

          {/* Volunteer Intelligence Cards List */}
          <div className="space-y-4">
            {filteredVolunteerMetrics.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center text-sm text-[#718096]">
                No volunteers match the selected filter criteria.
              </div>
            ) : (
              filteredVolunteerMetrics.map(item => {
                const isExpanded = expandedNotesUserIds.has(item.user.id);
                const hasNotes = item.notes.length > 0;

                return (
                  <div
                    key={item.user.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs transition-shadow hover:shadow-sm space-y-4"
                  >
                    {/* Header Row: Volunteer Identity */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold font-heading text-sm shrink-0">
                          {item.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold font-heading text-base text-[#1E2922]">
                              {item.user.fullName}
                            </h3>
                            {/* Volunteer Role Tag */}
                            {item.user.volunteerType === 'student' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <GraduationCap className="w-3 h-3 text-emerald-600" />
                                Student Volunteer {item.user.graduationYear ? `('2${item.user.graduationYear % 100})` : ''}
                              </span>
                            ) : item.user.volunteerType === 'alumnus' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                <Building className="w-3 h-3 text-blue-600" />
                                Alumni Volunteer {item.user.graduationYear ? `(Class of ${item.user.graduationYear})` : ''}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                Corporate Supporter
                              </span>
                            )}

                            {/* Inactivity Health Badge */}
                            {item.inactivityStatus === 'active' ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Active ({item.daysSinceLastActivity !== null ? `${item.daysSinceLastActivity}d ago` : 'Recent'})
                              </span>
                            ) : item.inactivityStatus === 'declining' ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Declining ({item.daysSinceLastActivity}d inactive)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                Inactive ({item.daysSinceLastActivity}d - Operational Flag)
                              </span>
                            )}
                          </div>

                          {/* Contact Details (Confidential to Admin) */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#718096] mt-1.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-[#A0AEC0]" />
                              {item.user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-[#A0AEC0]" />
                              {item.user.phone}
                            </span>
                            {item.user.college && (
                              <span className="text-[#4A5568]">
                                🎓 {item.user.college}
                              </span>
                            )}
                            {item.user.organizationName && (
                              <span className="text-[#4A5568]">
                                🏢 {item.user.organizationName}
                              </span>
                            )}
                            <span>📍 {item.user.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reliability Score Box */}
                      <div className="bg-[#F8FAF8] border border-[#E2E8F0] p-3 rounded-xl min-w-[170px] text-right self-start">
                        <div className="flex items-center justify-between text-xs text-[#718096] mb-1">
                          <span>Reliability Rate</span>
                          <span className={`font-bold ${
                            item.reliabilityRate >= 85 ? 'text-emerald-700' : item.reliabilityRate >= 65 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {item.reliabilityRate}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full ${
                              item.reliabilityRate >= 85 ? 'bg-emerald-600' : item.reliabilityRate >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.reliabilityRate}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-[#718096]">
                          {item.attendedEvents} attended • {item.missedEvents} missed
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Metrics & Skills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F2F6F3] text-xs">
                      <div className="bg-[#F8FAF8] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#718096] uppercase font-semibold block">Verified Hours</span>
                        <span className="text-base font-bold text-emerald-700">{item.verifiedHours} hrs</span>
                      </div>
                      <div className="bg-[#F8FAF8] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#718096] uppercase font-semibold block">Pending Hours</span>
                        <span className="text-base font-bold text-amber-700">{item.pendingHours} hrs</span>
                      </div>
                      <div className="bg-[#F8FAF8] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#718096] uppercase font-semibold block">Events Completed</span>
                        <span className="text-base font-bold text-[#1E2922]">{item.attendedEvents} events</span>
                      </div>
                      <div className="bg-[#F8FAF8] p-2.5 rounded-xl border border-[#E2E8F0]">
                        <span className="text-[10px] text-[#718096] uppercase font-semibold block">Applications</span>
                        <span className="text-base font-bold text-purple-700">{item.volApps.length} total</span>
                      </div>
                    </div>

                    {/* Bottom Row: Privacy Consents & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      {/* Privacy Consents Active */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-[#718096] font-semibold mr-1">Consents:</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          item.user.consent.volunteeringCommunications
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          Comms: {item.user.consent.volunteeringCommunications ? 'Allowed' : 'Opted Out'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          item.user.consent.linkedInRecognition
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          LinkedIn: {item.user.consent.linkedInRecognition ? 'Opted In' : 'Private'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          item.user.consent.identifiableEmployerAttribution
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          Attribution: {item.user.consent.identifiableEmployerAttribution ? 'Named' : 'Anonymous'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          !item.user.optOutPublicLeaderboard
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          Rankings: {!item.user.optOutPublicLeaderboard ? 'Public' : 'Hidden'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {hasNotes && (
                          <button
                            onClick={() => toggleNotes(item.user.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Coordinator Notes ({item.notes.length})</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSearchUserQuery(item.user.fullName);
                            setActiveSubTab('users');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] border border-[#CBD5E0] rounded-lg transition-colors cursor-pointer"
                        >
                          Manage Role
                        </button>
                      </div>
                    </div>

                    {/* Expandable Accordion: Confidential Coordinator Notes */}
                    {isExpanded && hasNotes && (
                      <div className="pt-3 border-t border-purple-100 space-y-2 bg-purple-50/50 p-3 rounded-xl border">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                          <Lock className="w-3.5 h-3.5 text-purple-700" />
                          <span>Confidential Staff & Coordinator Review Notes (Internal Only)</span>
                        </div>
                        <div className="space-y-2 mt-1">
                          {item.notes.map((note, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-purple-200 text-xs text-[#2D3748]">
                              <div className="flex items-center justify-between text-[11px] text-[#718096] mb-1">
                                <span className="font-semibold text-purple-800">{note.source}</span>
                                <span>{note.date.slice(0, 10)}</span>
                              </div>
                              <p className="italic text-[#1E2922]">"{note.text}"</p>
                              <div className="text-[10px] text-[#A0AEC0] mt-1 text-right">
                                Logged by: {note.author}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 1: Users & Roles */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
              <input
                type="text"
                placeholder="Search user by name, email, or company..."
                value={searchUserQuery}
                onChange={e => setSearchUserQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              />
            </div>
            <div className="text-xs text-[#718096]">
              Total Users: <strong>{users.length}</strong> (20 Volunteers + 2 Staff/Admin)
            </div>
          </div>

          {/* Feedback banner */}
          {roleUpdateFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                roleUpdateFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {roleUpdateFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{roleUpdateFeedback.message}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF8] border-b border-[#E2E8F0] text-[#718096] uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">User Profile</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Organization</th>
                    <th className="px-5 py-3">City</th>
                    <th className="px-5 py-3">Assigned Role</th>
                    <th className="px-5 py-3 text-right">Privilege Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredUsers.map(user => {
                    const isSelf = user.id === currentUser.id;

                    return (
                      <tr key={user.id} className="hover:bg-[#F8FAF8] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
                            />
                            <div>
                              <div className="font-bold text-[#1E2922] flex items-center gap-1.5">
                                <span>{user.fullName}</span>
                                {isSelf && (
                                  <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#718096]">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 capitalize text-[#4A5568]">
                          {user.volunteerType.replace('_', ' ')}
                        </td>

                        <td className="px-5 py-3.5 text-[#4A5568]">
                          {user.organizationName || 'Individual'}
                        </td>

                        <td className="px-5 py-3.5 text-[#718096]">{user.city}</td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'staff'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-[#D8F3DC] text-[#1B4332]'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <select
                            value={user.role}
                            onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                            disabled={currentUser.role !== 'admin' || (isSelf && user.role === 'admin')}
                            className="px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded-lg font-medium text-[#1E2922] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="volunteer">Volunteer</option>
                            <option value="staff">Office Staff</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
              <input
                type="text"
                placeholder="Search audit actions, actors, or details..."
                value={searchAuditQuery}
                onChange={e => setSearchAuditQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#718096]" />
              <select
                value={selectedAuditCategory}
                onChange={e => setSelectedAuditCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              >
                <option value="all">All Categories</option>
                <option value="auth">Auth & Session</option>
                <option value="application">Applications</option>
                <option value="verification">Hour Verification</option>
                <option value="consent">Privacy & Consent</option>
                <option value="opportunity">Opportunity Lifecycle</option>
                <option value="user_role">User Roles</option>
                <option value="email">Outbound Emails</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF8] border-b border-[#E2E8F0] text-[#718096] uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Timestamp (UTC)</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Log Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8FAF8] transition-colors font-mono">
                      <td className="px-5 py-3 text-[11px] text-[#718096] whitespace-nowrap">
                        {new Date(log.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-[#1E2922] font-sans">{log.actorName}</span>
                        <span className="text-[10px] text-[#718096] block uppercase">{log.actorRole}</span>
                      </td>
                      <td className="px-5 py-3 font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-[#1B4332]">{log.action}</td>
                      <td className="px-5 py-3 font-sans text-[#2D3748] max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Integrations & Resend */}
      {activeSubTab === 'integrations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Supabase Status */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-heading font-bold text-sm text-[#1E2922]">Supabase PostgreSQL</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#718096] leading-relaxed">
                PostgreSQL schema, RLS policies, foreign keys, and indexes defined in migration file ready for live deployment.
              </p>
              <div className="text-[11px] text-[#4A5568] bg-[#F8FAF8] p-2.5 rounded-lg border border-[#E2E8F0] space-y-1">
                <div>Migration: <code>20261103000000_maatram.sql</code></div>
                <div>Tables: 11 relational tables with RLS</div>
              </div>
            </div>

            {/* Resend Email Status */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h4 className="font-heading font-bold text-sm text-[#1E2922]">Resend Email API</h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    serverEmailStatus?.configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {serverEmailStatus?.configured ? 'Live API Active' : 'Ready / Assisted'}
                </span>
              </div>
              <p className="text-xs text-[#718096] leading-relaxed">
                {serverEmailStatus?.configured
                  ? `Connected to Resend (${serverEmailStatus.maskedKey}). Real emails are dispatched straight to recipient mailboxes.`
                  : 'Backend proxy active at /api/send-email. Inject RESEND_API_KEY for live delivery, or use 1-click Gmail sending.'}
              </p>
              <div className="text-[11px] text-[#4A5568] bg-[#F8FAF8] p-2.5 rounded-lg border border-[#E2E8F0] space-y-1">
                <div>Sender: <code>{serverEmailStatus?.fromEmail || 'onboarding@resend.dev'}</code></div>
                <div>Proxy Endpoint: <code>POST /api/send-email</code></div>
              </div>
            </div>

            {/* LinkedIn API */}
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#0077B5]" />
                  <h4 className="font-heading font-bold text-sm text-[#1E2922]">LinkedIn Sharing</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  OAuth-Ready
                </span>
              </div>
              <p className="text-xs text-[#718096] leading-relaxed">
                Generates editable verified recognition drafts and official web intent share dialogs, gated strictly by volunteer consent.
              </p>
              <div className="text-[11px] text-[#4A5568] bg-[#F8FAF8] p-2.5 rounded-lg border border-[#E2E8F0] space-y-1">
                <div>Flow: Explicit User Consent Required</div>
                <div>Automatic Publishing: Prevented</div>
              </div>
            </div>
          </div>

          {/* Test Email Dispatcher */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-5">
            <div>
              <h4 className="font-heading font-bold text-base text-[#1E2922] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2D6A4F]" />
                <span>Outbound Email Dispatcher & Live Delivery Console</span>
              </h4>
              <p className="text-xs text-[#718096] mt-1">
                Send real emails to your personal inbox (e.g. <code>dharunprasath365@gmail.com</code>) via the server proxy, or test consent gate policies against registered volunteer personas.
              </p>
            </div>

            {/* Recipient Mode Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-[#2D3748] mr-1">Recipient Destination:</span>
              <button
                type="button"
                onClick={() => setTestEmailRecipientType('custom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  testEmailRecipientType === 'custom'
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-[#F2F6F3] text-[#4A5568] hover:bg-[#E2E8F0]'
                }`}
              >
                Send to Real Email (My Address)
              </button>
              <button
                type="button"
                onClick={() => setTestEmailRecipientType('persona')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  testEmailRecipientType === 'persona'
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-[#F2F6F3] text-[#4A5568] hover:bg-[#E2E8F0]'
                }`}
              >
                Test Persona (Consent Enforced)
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              {testEmailRecipientType === 'custom' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#2D3748]">Recipient Email</label>
                      <button
                        type="button"
                        onClick={() => setTestEmailCustomAddress('dharunprasath365@gmail.com')}
                        className="text-[10px] text-[#2D6A4F] hover:underline font-semibold cursor-pointer"
                      >
                        Reset to dharunprasath365@gmail.com
                      </button>
                    </div>
                    <input
                      type="email"
                      required
                      value={testEmailCustomAddress}
                      onChange={e => setTestEmailCustomAddress(e.target.value)}
                      placeholder="e.g. dharunprasath365@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D3748] mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={testEmailCustomName}
                      onChange={e => setTestEmailCustomName(e.target.value)}
                      placeholder="e.g. Dharun Prasath"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0]">
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Select Volunteer Persona</label>
                  <select
                    value={testEmailUserId}
                    onChange={e => setTestEmailUserId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email}) — Consent: {u.consent.volunteeringCommunications ? 'ALLOWED' : 'OPTED OUT'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Email Template Type</label>
                  <select
                    value={testEmailTemplate}
                    onChange={e => {
                      const val = e.target.value as any;
                      setTestEmailTemplate(val);
                      if (val === 'application_approved') {
                        setTestEmailSubject('Congratulations: Application Approved for Maatram Volunteering Drive');
                        setTestEmailContent('You have been selected to volunteer for the Tamil Nadu Scholar Admissions & Mentorship Drive. Please report on time.');
                      } else if (val === 'hours_verified') {
                        setTestEmailSubject('Thank You: 6.0 Volunteering Hours Officially Verified');
                        setTestEmailContent('Your contribution of 6.0 verified volunteering hours has been permanently recorded on your Maatram Foundation profile.');
                      } else if (val === 'interview_assigned') {
                        setTestEmailSubject('Invitation: Maatram Scholar Interview Panel Slot');
                        setTestEmailContent('Based on your registered availability, you are invited to join our upcoming scholar panel interview session.');
                      } else if (val === 'application_received') {
                        setTestEmailSubject('Application Received: Maatram Volunteering Initiative');
                        setTestEmailContent('Your application has been received and is being reviewed by the volunteer coordination team.');
                      } else {
                        setTestEmailSubject('Update on your application for Maatram Volunteering');
                        setTestEmailContent('Thank you for your interest. On this occasion, we are unable to accept your application due to capacity limits.');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  >
                    <option value="application_approved">Application Approved (Scholar Mentorship)</option>
                    <option value="hours_verified">Hours Verified (Thank You & 6.0 Hours Credit)</option>
                    <option value="interview_assigned">Interview Panel Slot Invitation</option>
                    <option value="application_received">Application Received (Confirmation)</option>
                    <option value="application_rejected">Application Update (Capacity Limit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={testEmailSubject}
                    onChange={e => setTestEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={testEmailContent}
                  onChange={e => setTestEmailContent(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Real Email via Server Proxy</span>
                </button>

                {testEmailResult?.gmailUrl && (
                  <a
                    href={testEmailResult.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open & Send via Gmail Web</span>
                  </a>
                )}

                {testEmailResult?.mailtoUrl && (
                  <a
                    href={testEmailResult.mailtoUrl}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] border border-[#CBD5E0] rounded-xl transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Default Mail App</span>
                  </a>
                )}
              </div>
            </form>

            {/* Result / Feedback Banner */}
            {testEmailResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  testEmailResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testEmailResult.message}</span>
                </div>

                {testEmailResult.success && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                    <span>Recipient: <strong>{testEmailResult.recipientEmail}</strong></span>
                    {testEmailResult.messageId && (
                      <span className="bg-emerald-100 px-2 py-0.5 rounded font-mono">
                        Resend ID: {testEmailResult.messageId}
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <a
                        href={testEmailResult.gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline"
                      >
                        Launch in Gmail ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Outbound Email History & Consent Audit Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs space-y-3 p-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2D6A4F]" />
                <h4 className="font-heading font-bold text-sm text-[#1E2922]">
                  Outbound Email History & Consent Audit Log ({emailLogs.length})
                </h4>
              </div>
              <span className="text-[11px] text-[#718096]">
                All outbound messages are consent-validated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF8] border-b border-[#E2E8F0] text-[#718096] uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Template / Subject</th>
                    <th className="px-4 py-3">Delivery Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {emailLogs.slice(0, 8).map(mail => (
                    <tr key={mail.id} className="hover:bg-[#F8FAF8] transition-colors">
                      <td className="px-4 py-3 text-[11px] text-[#718096] whitespace-nowrap">
                        {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(mail.sentAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#1E2922]">{mail.recipientName}</div>
                        <div className="text-[11px] text-[#718096] font-mono">{mail.recipientEmail}</div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-[10px] font-bold uppercase text-[#2D6A4F] block">
                          {mail.templateType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#1E2922] truncate block font-medium">
                          {mail.subject}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {mail.status === 'blocked_by_consent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Blocked by Consent
                          </span>
                        ) : mail.provider === 'resend_api' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Live Resend API
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Send className="w-3 h-3 text-blue-600" />
                            Dispatched (Assisted)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        {mail.gmailUrl && (
                          <a
                            href={mail.gmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                            title="Open pre-composed email directly in Gmail"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Gmail</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setViewingEmailModal(mail)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#4A5568] hover:bg-[#F2F6F3] border border-[#CBD5E0] rounded-lg transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Email Preview Modal */}
          {viewingEmailModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#2D6A4F]" />
                    <h3 className="font-heading font-bold text-base text-[#1E2922]">
                      Email Dispatch Preview
                    </h3>
                  </div>
                  <button
                    onClick={() => setViewingEmailModal(null)}
                    className="p-1 text-[#718096] hover:text-black cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
                  <div><strong>To:</strong> {viewingEmailModal.recipientName} &lt;{viewingEmailModal.recipientEmail}&gt;</div>
                  <div><strong>Subject:</strong> {viewingEmailModal.subject}</div>
                  <div><strong>Template:</strong> {viewingEmailModal.templateType}</div>
                  <div><strong>Status:</strong> {viewingEmailModal.status} ({viewingEmailModal.provider})</div>
                </div>

                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-700 border-b border-[#E2E8F0]">
                    Rendered HTML Email
                  </div>
                  {viewingEmailModal.htmlContent ? (
                    <div
                      className="p-4 bg-white max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: viewingEmailModal.htmlContent }}
                    />
                  ) : (
                    <div className="p-4 bg-white text-xs text-gray-700 whitespace-pre-wrap">
                      {viewingEmailModal.contentSnippet}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {viewingEmailModal.gmailUrl && (
                    <a
                      href={viewingEmailModal.gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Send via Gmail Web</span>
                    </a>
                  )}
                  <button
                    onClick={() => setViewingEmailModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 4: Database Schema */}
      {activeSubTab === 'database' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#1E2922]">
                PostgreSQL & Supabase Migration Blueprint
              </h3>
              <p className="text-xs text-[#718096]">
                Location: <code>/supabase/migrations/20261103000000_maatram_connect_schema.sql</code>
              </p>
            </div>

            <button
              onClick={handleCopySQL}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] border border-[#A5D6A7] rounded-lg transition-colors cursor-pointer"
            >
              {copiedSQL ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSQL ? 'Copied SQL!' : 'Copy Migration SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#1E2922] text-[#D8F3DC] rounded-xl text-xs font-mono overflow-x-auto max-h-[500px]">
            {sqlSchemaSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
