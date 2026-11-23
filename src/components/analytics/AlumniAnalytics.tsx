import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  GraduationCap,
  Info,
  Shield,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const AlumniAnalytics: React.FC = () => {
  const { users, participationRecords } = useApp();

  const [periodDays, setPeriodDays] = useState<number>(90); // 30, 60, 90, 180, 365
  const [searchQuery, setSearchQuery] = useState<string>('');

  const alumniVolunteers = users.filter(u => u.volunteerType === 'alumnus');

  // Filter records within period
  const cutoffDate = new Date(Date.now() - periodDays * 86400000);

  // Active alumni: had a verified participation record after cutoffDate
  const activeAlumniIds = new Set(
    participationRecords
      .filter(r => r.verificationStatus === 'verified' && new Date(r.eventDate) >= cutoffDate)
      .map(r => r.userId)
  );

  const activeAlumniCount = alumniVolunteers.filter(a => activeAlumniIds.has(a.id)).length;

  // Returning alumni: completed 2 or more verified events overall
  const returningAlumniCount = alumniVolunteers.filter(a => {
    const verifiedEvents = participationRecords.filter(
      r => r.userId === a.id && r.verificationStatus === 'verified'
    ).length;
    return verifiedEvents >= 2;
  }).length;

  // Inactive / Declining activity alumni: no recorded contribution in past periodDays
  const inactiveAlumni = alumniVolunteers.filter(a => !activeAlumniIds.has(a.id));

  // Monthly trend chart data (fictional multi-month aggregation)
  const monthlyTrendsData = [
    { month: 'Jun 2026', alumniVolunteers: 4, verifiedHours: 28 },
    { month: 'Jul 2026', alumniVolunteers: 6, verifiedHours: 42 },
    { month: 'Aug 2026', alumniVolunteers: 5, verifiedHours: 35 },
    { month: 'Sep 2026', alumniVolunteers: 8, verifiedHours: 54 },
    { month: 'Oct 2026', alumniVolunteers: 7, verifiedHours: 48 },
    { month: 'Nov 2026', alumniVolunteers: 9, verifiedHours: 62 },
  ];

  const filteredInactiveList = inactiveAlumni.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.fullName.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header with configurable timeframe */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#2D6A4F]" />
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
              Alumni Engagement Analytics
            </h1>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Operational dashboard tracking participation trends of past Maatram scholarship graduates.
          </p>
        </div>

        {/* Timeframe dropdown */}
        <div className="flex items-center gap-2 bg-[#F2F6F3] p-1.5 rounded-xl self-start sm:self-center">
          <Calendar className="w-4 h-4 text-[#718096] ml-2" />
          <span className="text-xs font-semibold text-[#4A5568]">Period:</span>
          <select
            value={periodDays}
            onChange={e => setPeriodDays(Number(e.target.value))}
            className="text-xs font-bold bg-white text-[#1E2922] px-2.5 py-1 rounded-lg border border-[#E2E8F0] focus:outline-none"
          >
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days (Quarter)</option>
            <option value={180}>Last 6 Months</option>
            <option value={365}>Last 1 Year</option>
          </select>
        </div>
      </div>

      {/* Strict Ethical Guard Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Foundation Policy on Operational Inactivity:</p>
          <p className="leading-relaxed">
            Alumni inactivity is strictly an internal operational indicator for event planning, not proof of disengagement. 
            Automated contact or outreach to flagged alumni is strictly prevented to respect their work and personal commitments.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Registered Alumni</span>
            <Users className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-[#1E2922] mt-2">
            {alumniVolunteers.length}
          </div>
          <span className="text-[11px] text-[#718096]">Graduates enrolled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Active in Period</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-[#2D6A4F] mt-2">
            {activeAlumniCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {Math.round((activeAlumniCount / (alumniVolunteers.length || 1)) * 100)}% active rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Returning Alumni</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-blue-700 mt-2">
            {returningAlumniCount}
          </div>
          <span className="text-[11px] text-[#718096]">Joined ≥ 2 initiatives</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">No Recent Records</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-600 mt-2">
            {inactiveAlumni.length}
          </div>
          <span className="text-[11px] text-amber-700">Operational check only</span>
        </div>
      </div>

      {/* Chart Section: Monthly Participation Trends */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2D6A4F]" />
            <h3 className="font-heading font-bold text-base text-[#1E2922]">
              Monthly Alumni Participation & Verified Hours
            </h3>
          </div>
          <span className="text-xs text-[#718096]">Past 6 Months Overview</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendsData}>
              <defs>
                <linearGradient id="colorAlumniHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#718096' }} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="verifiedHours"
                name="Verified Hours"
                stroke="#1B4332"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAlumniHours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Indicator: Inactive Alumni Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F8FAF8] border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1E2922]">
              Operational Inactivity List ({filteredInactiveList.length})
            </h4>
            <p className="text-[11px] text-[#718096]">
              Alumni with no recorded volunteering in the last {periodDays} days.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A0AEC0]" />
            <input
              type="text"
              placeholder="Search alumni..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#1E2922]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] border-b border-[#E2E8F0] text-[#718096] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Alumnus Name</th>
                <th className="px-5 py-3">Graduation Batch</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Last Recorded Activity</th>
                <th className="px-5 py-3 text-right">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredInactiveList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#718096]">
                    No alumni meet the inactivity filter for this time window.
                  </td>
                </tr>
              ) : (
                filteredInactiveList.map(alum => (
                  <tr key={alum.id} className="hover:bg-[#F8FAF8] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#1E2922]">
                      <div className="flex items-center gap-2">
                        <img
                          src={alum.avatarUrl}
                          alt={alum.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0]"
                        />
                        <span>{alum.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#4A5568]">
                      Batch of {alum.graduationYear || '2022'}
                    </td>
                    <td className="px-5 py-3.5 text-[#718096]">{alum.city}</td>
                    <td className="px-5 py-3.5 text-[#718096]">
                      {new Date(alum.lastActiveAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Operational Indicator
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
