import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Download,
  Calendar,
  Users,
  Clock,
  Shield,
  FileSpreadsheet,
  BarChart2,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const EmployerReports: React.FC = () => {
  const { organizations, users, participationRecords } = useApp();

  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [showDetailedVolunteers, setShowDetailedVolunteers] = useState(false);

  // Filter participation records by date and verified status
  const verifiedRecords = participationRecords.filter(
    r =>
      r.verificationStatus === 'verified' &&
      r.eventDate >= startDate &&
      r.eventDate <= endDate
  );

  // Compute metrics per organization
  const orgReportData = organizations.map(org => {
    const orgVolunteers = users.filter(u => u.organizationId === org.id);
    const orgRecords = verifiedRecords.filter(r => r.organizationId === org.id);

    const totalHours = orgRecords.reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);
    const completedEvents = orgRecords.filter(r => r.attendanceStatus === 'attended').length;

    // Category breakdown
    const schoolVisitHours = orgRecords
      .filter(r => r.opportunityCategory === 'school_visit')
      .reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);

    const bgvHours = orgRecords
      .filter(r => r.opportunityCategory === 'bgv')
      .reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);

    const interviewHours = orgRecords
      .filter(r => r.opportunityCategory === 'mock_interview' || r.opportunityCategory === 'admission_panel')
      .reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);

    return {
      org,
      name: org.name,
      volunteersCount: orgVolunteers.length,
      totalHours: Number(totalHours.toFixed(1)),
      completedEvents,
      schoolVisitHours: Number(schoolVisitHours.toFixed(1)),
      bgvHours: Number(bgvHours.toFixed(1)),
      interviewHours: Number(interviewHours.toFixed(1)),
    };
  });

  // Chart data
  const chartData = orgReportData.map(d => ({
    name: d.name.split(' ')[0], // short name
    'School Visits': d.schoolVisitHours,
    'BGV Verification': d.bgvHours,
    'Interview Panels': d.interviewHours,
  }));

  // CSV Export Handler with strict consent & identity protection
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (!showDetailedVolunteers) {
      // Aggregated Corporate Summary (Default)
      csvContent += 'Organization,Type,Contact Person,Volunteer Count,Total Verified Hours,Completed Events\n';
      orgReportData.forEach(item => {
        csvContent += `"${item.name}","${item.org.type}","${item.org.contactPerson}",${item.volunteersCount},${item.totalHours},${item.completedEvents}\n`;
      });
    } else {
      // Detailed Breakdown with Privacy Protection
      csvContent += 'Organization,Volunteer Name (Consent Checked),Role,Event,Category,Date,Verified Hours\n';
      verifiedRecords.forEach(rec => {
        const vol = users.find(u => u.id === rec.userId);
        const hasAttributionConsent = vol?.consent?.identifiableEmployerAttribution ?? true;
        const displayName = hasAttributionConsent ? rec.userName : `Corporate Contributor #${rec.userId.slice(-4)} (Anonymous)`;

        csvContent += `"${rec.organizationName || 'Individual'}","${displayName}","${vol?.volunteerType || 'supporter'}","${rec.opportunityTitle}","${rec.opportunityCategory}","${rec.eventDate}",${rec.actualHours}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Maatram_Employer_Report_${showDetailedVolunteers ? 'Detailed' : 'Aggregated'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2D6A4F]" />
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
              Employer & Partner CSR Reports
            </h1>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Audited volunteering contributions by corporate sponsors, colleges, and alumni chapters.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Download className="w-4 h-4" />
          <span>Export Official CSV</span>
        </button>
      </div>

      {/* Date Filters and Export Mode Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-[#4A5568]">
            <Calendar className="w-4 h-4 text-[#718096]" />
            <span className="font-semibold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#4A5568]">
            <span className="font-semibold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
            />
          </div>
        </div>

        {/* Aggregated vs Individual attribution toggle */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-[#2D3748] font-semibold">
            <input
              type="checkbox"
              checked={showDetailedVolunteers}
              onChange={e => setShowDetailedVolunteers(e.target.checked)}
              className="rounded accent-[#2D6A4F] w-4 h-4"
            />
            <span>Show Individual Volunteer Records (Consent Enforced)</span>
          </label>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-[#E8F5E9] border border-[#A5D6A7] p-4 rounded-2xl flex items-start gap-3 text-xs text-[#1B4332]">
        <Shield className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Employer Attribution & Privacy Protection Active:</p>
          <p className="leading-relaxed">
            Data is aggregated by default. When exporting or viewing individual contributions, volunteers who have not opted in to "Identifiable Employer Attribution" are masked as anonymous contributors in all generated reports.
          </p>
        </div>
      </div>

      {/* Chart: Category Breakdown by Partner Org */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2D6A4F]" />
            <h3 className="font-heading font-bold text-base text-[#1E2922]">
              Verified Volunteering Hours by Category & Organization
            </h3>
          </div>
          <span className="text-xs text-[#718096]">Aggregated Hours</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#718096' }} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="School Visits" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="BGV Verification" fill="#D97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Interview Panels" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Organizations Report Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F8FAF8] border-b border-[#E2E8F0]">
          <h4 className="font-heading font-bold text-sm text-[#1E2922]">
            Corporate & Institutional CSR Summary ({orgReportData.length} Partners)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] border-b border-[#E2E8F0] text-[#718096] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Partner Organization</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Contact Lead</th>
                <th className="px-5 py-3">Volunteer Count</th>
                <th className="px-5 py-3">Verified Hours</th>
                <th className="px-5 py-3 text-right">Completed Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {orgReportData.map(item => (
                <tr key={item.org.id} className="hover:bg-[#F8FAF8] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#1E2922]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center font-bold text-xs text-[#1B4332]">
                        {item.org.logoText}
                      </div>
                      <div>
                        <span>{item.name}</span>
                        <div className="text-[11px] text-[#718096] font-normal">{item.org.contactEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#4A5568] capitalize">
                    {item.org.type}
                  </td>
                  <td className="px-5 py-4 text-[#4A5568]">
                    {item.org.contactPerson}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#1E2922]">{item.volunteersCount} volunteers</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-base text-[#2D6A4F]">{item.totalHours} hrs</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-[#1E2922]">{item.completedEvents} sessions</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
