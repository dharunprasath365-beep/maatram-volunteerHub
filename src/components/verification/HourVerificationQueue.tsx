import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ParticipationRecord, AttendanceStatus } from '../../types';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Award,
  Calendar,
  Building2,
  User,
  Filter,
  Search,
  FileBadge,
  Sparkles,
} from 'lucide-react';

export const HourVerificationQueue: React.FC = () => {
  const {
    participationRecords,
    currentUser,
    verifyHours,
    rejectHours,
    getUserVerifiedHours,
    getUserCompletedEventsCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ParticipationRecord | null>(null);
  const [actualHoursInput, setActualHoursInput] = useState<number>(6.0);
  const [attendanceInput, setAttendanceInput] = useState<AttendanceStatus>('attended');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Volunteer vs Staff records
  const userRecords = participationRecords.filter(r => {
    if (currentUser.role === 'volunteer' && r.userId !== currentUser.id) {
      return false;
    }
    if (activeTab === 'pending' && r.verificationStatus !== 'pending') {
      return false;
    }
    if (activeTab === 'verified' && r.verificationStatus !== 'verified') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.userName.toLowerCase().includes(q);
      const matchTitle = r.opportunityTitle.toLowerCase().includes(q);
      if (!matchName && !matchTitle) return false;
    }
    return true;
  });

  const verifiedHoursTotal = getUserVerifiedHours(currentUser.id);
  const completedEventsTotal = getUserCompletedEventsCount(currentUser.id);

  const openVerifyModal = (record: ParticipationRecord) => {
    setSelectedRecord(record);
    setActualHoursInput(record.allocatedHours || 6.0);
    setAttendanceInput('attended');
    setFeedbackInput('Verified on-ground attendance and satisfactory execution.');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    verifyHours(selectedRecord.id, actualHoursInput, attendanceInput, feedbackInput);
    setSelectedRecord(null);
  };

  const handleReject = (recordId: string) => {
    const reason = window.prompt('Please provide a reason for rejecting these hours:');
    if (reason !== null) {
      rejectHours(recordId, reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Impact Summary */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
              {currentUser.role === 'volunteer'
                ? 'My Verified Volunteering Hours & Impact'
                : 'Contribution & Hours Verification Queue'}
            </h1>
            <p className="text-sm text-[#718096] mt-1">
              {currentUser.role === 'volunteer'
                ? 'Certified service hours approved by Maatram Foundation office staff.'
                : 'Review attendance records and verify service durations. Pending hours do not affect leaderboards.'}
            </p>
          </div>

          {currentUser.role === 'volunteer' && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#1B4332] bg-[#E8F5E9] hover:bg-[#D8F3DC] border border-[#A5D6A7] rounded-xl transition-colors cursor-pointer self-start sm:self-center"
            >
              <FileBadge className="w-4 h-4 text-[#2D6A4F]" />
              <span>Generate Impact Certificate</span>
            </button>
          )}
        </div>

        {/* Impact stats cards */}
        {currentUser.role === 'volunteer' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E2E8F0]">
            <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#718096] block uppercase tracking-wider">
                Total Verified Hours
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-[#2D6A4F] mt-1 block">
                {verifiedHoursTotal.toFixed(1)} hrs
              </span>
              <span className="text-[10px] text-[#52B788] font-medium">100% verified by staff</span>
            </div>

            <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#718096] block uppercase tracking-wider">
                Completed Events
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-[#1B4332] mt-1 block">
                {completedEventsTotal}
              </span>
              <span className="text-[10px] text-[#718096]">Programs attended</span>
            </div>

            <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#718096] block uppercase tracking-wider">
                Pending Verification
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-amber-600 mt-1 block">
                {participationRecords
                  .filter(r => r.userId === currentUser.id && r.verificationStatus === 'pending')
                  .length}
              </span>
              <span className="text-[10px] text-amber-700">Awaiting office check</span>
            </div>

            <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2E8F0]">
              <span className="text-[11px] font-semibold text-[#718096] block uppercase tracking-wider">
                Next Milestone Target
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-heading text-indigo-700 mt-1 block">
                {verifiedHoursTotal < 10
                  ? `${(10 - verifiedHoursTotal).toFixed(1)}h`
                  : verifiedHoursTotal < 25
                  ? `${(25 - verifiedHoursTotal).toFixed(1)}h`
                  : verifiedHoursTotal < 50
                  ? `${(50 - verifiedHoursTotal).toFixed(1)}h`
                  : 'Diamond Tier'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">To next badge level</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Awaiting Verification ({participationRecords.filter(r => r.verificationStatus === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'verified'
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'bg-[#F2F6F3] text-[#4A5568] hover:bg-[#E8EFEA]'
            }`}
          >
            Verified Log
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'bg-[#F2F6F3] text-[#4A5568] hover:bg-[#E8EFEA]'
            }`}
          >
            All Records
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
          <input
            type="text"
            placeholder="Search volunteer or event..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] border-b border-[#E2E8F0] text-[#718096] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Event & Date</th>
                {currentUser.role !== 'volunteer' && <th className="px-5 py-3">Volunteer</th>}
                <th className="px-5 py-3">Allocated / Actual Hours</th>
                <th className="px-5 py-3">Attendance</th>
                <th className="px-5 py-3">Verification Status</th>
                <th className="px-5 py-3 text-right">Actions / Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {userRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#718096]">
                    No participation records found in this category.
                  </td>
                </tr>
              ) : (
                userRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-[#F8FAF8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#1E2922]">{rec.opportunityTitle}</div>
                      <div className="text-[11px] text-[#718096] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#2D6A4F]" />
                        <span>{rec.eventDate}</span>
                        <span className="capitalize">• {rec.opportunityCategory.replace('_', ' ')}</span>
                      </div>
                    </td>

                    {currentUser.role !== 'volunteer' && (
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#1E2922]">{rec.userName}</div>
                        <div className="text-[11px] text-[#718096]">
                          {rec.organizationName || 'Individual Volunteer'}
                        </div>
                      </td>
                    )}

                    <td className="px-5 py-4">
                      <div className="font-bold text-[#1E2922] text-sm">
                        {rec.verificationStatus === 'verified' ? (
                          <span className="text-[#2D6A4F]">{rec.actualHours} hrs verified</span>
                        ) : rec.verificationStatus === 'pending' ? (
                          <span className="text-amber-700">{rec.allocatedHours} hrs allocated (pending)</span>
                        ) : (
                          <span className="text-rose-700">0.0 hrs (rejected)</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          rec.attendanceStatus === 'attended'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.attendanceStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.attendanceStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          rec.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.verificationStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.verificationStatus === 'verified' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : rec.verificationStatus === 'pending' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span className="capitalize">{rec.verificationStatus}</span>
                      </span>
                      {rec.verifiedByStaffName && (
                        <div className="text-[10px] text-[#718096] mt-0.5">
                          By: {rec.verifiedByStaffName}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {currentUser.role !== 'volunteer' && rec.verificationStatus === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openVerifyModal(rec)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                          >
                            Verify Hours
                          </button>
                          <button
                            onClick={() => handleReject(rec.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#718096] italic max-w-xs block ml-auto truncate">
                          {rec.staffFeedback || 'Record verified.'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Hours Staff Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-heading font-bold text-base text-[#1B4332]">Verify Volunteer Contribution</h3>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-[#718096] hover:text-black">
                ✕
              </button>
            </div>

            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
              <p>
                <span className="text-[#718096]">Volunteer:</span>{' '}
                <strong className="text-[#1E2922]">{selectedRecord.userName}</strong>
              </p>
              <p>
                <span className="text-[#718096]">Event:</span>{' '}
                <strong className="text-[#1E2922]">{selectedRecord.opportunityTitle}</strong>
              </p>
              <p>
                <span className="text-[#718096]">Event Date:</span> {selectedRecord.eventDate}
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Actual Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={actualHoursInput}
                    onChange={e => setActualHoursInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg font-bold text-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Attendance Status</label>
                  <select
                    value={attendanceInput}
                    onChange={e => setAttendanceInput(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  >
                    <option value="attended">Attended & Completed</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">Staff Coordinator Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  placeholder="Notes on volunteer impact, performance, or student feedback..."
                  className="w-full p-2.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Authorize & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Impact Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border-4 border-[#1B4332] space-y-6 text-center">
            <div className="flex justify-end">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-[#718096] hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1B4332]">
                <Award className="w-9 h-9 text-[#2D6A4F]" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#2D6A4F]">
                Maatram Foundation • Certificate of Verified Impact
              </span>
              <h2 className="text-2xl font-bold font-heading text-[#1B4332]">
                Volunteering Service Statement
              </h2>
            </div>

            <p className="text-sm text-[#4A5568] max-w-lg mx-auto leading-relaxed">
              This officially certifies that <strong>{currentUser.fullName}</strong> has completed a total of{' '}
              <strong className="text-[#1B4332] font-heading text-base">{verifiedHoursTotal.toFixed(1)} verified hours</strong>{' '}
              of voluntary service across {completedEventsTotal} foundation initiatives for higher education empowerment.
            </p>

            <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2E8F0] max-w-md mx-auto text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#718096]">Volunteer ID:</span>
                <span className="font-mono text-[#1E2922]">{currentUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Affiliation:</span>
                <span className="font-semibold text-[#1E2922]">
                  {currentUser.organizationName || 'Maatram Supporter'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Date of Issuance:</span>
                <span className="text-[#1E2922]">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Authorized Signatory:</span>
                <span className="font-semibold text-[#2D6A4F]">Sujith Kumar, Managing Trustee</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
