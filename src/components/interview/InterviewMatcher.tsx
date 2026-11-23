import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AvailabilityPreference, UserProfile } from '../../types';
import {
  UserCheck,
  Calendar,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  Mail,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Briefcase,
  Video,
} from 'lucide-react';

export const InterviewMatcher: React.FC = () => {
  const {
    currentUser,
    users,
    availabilities,
    saveAvailability,
    sendEmailNotification,
  } = useApp();

  // Volunteer availability state (for currently logged in user)
  const userExistingAvail = availabilities.find(a => a.userId === currentUser.id);

  const [interviewType, setInterviewType] = useState<'mock_interview' | 'admission_panel' | 'both'>(
    userExistingAvail?.interviewType || 'both'
  );
  const [preferredMode, setPreferredMode] = useState<'online' | 'offline' | 'any'>(
    userExistingAvail?.preferredMode || 'any'
  );
  const [expertiseInput, setExpertiseInput] = useState<string>(
    userExistingAvail?.expertiseDomains?.join(', ') || 'Software Engineering, Career Guidance'
  );
  const [maxInterviews, setMaxInterviews] = useState<number>(
    userExistingAvail?.maxInterviewsPerMonth || 4
  );
  const [notes, setNotes] = useState<string>(userExistingAvail?.notes || '');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Staff search & filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inviteModalUser, setInviteModalUser] = useState<UserProfile | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const domains = expertiseInput.split(',').map(s => s.trim()).filter(Boolean);

    const res = saveAvailability({
      userId: currentUser.id,
      interviewType,
      preferredMode,
      expertiseDomains: domains,
      availableDates: ['2026-11-28', '2026-11-29', '2026-12-05', '2026-12-06'],
      timeSlots: ['Morning (9am-12pm)', 'Afternoon (1pm-4pm)'],
      maxInterviewsPerMonth: Number(maxInterviews),
      notes,
    });

    setSaveFeedback(res.message);
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  // Staff Directory Filtering
  const volunteerUsers = users.filter(u => u.role === 'volunteer');

  const filteredVolunteers = volunteerUsers.filter(user => {
    const avail = availabilities.find(a => a.userId === user.id);

    if (filterType !== 'all') {
      if (!avail || (avail.interviewType !== filterType && avail.interviewType !== 'both')) {
        return false;
      }
    }

    if (filterMode !== 'all') {
      if (!avail || (avail.preferredMode !== filterMode && avail.preferredMode !== 'any')) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.fullName.toLowerCase().includes(q);
      const matchOrg = user.organizationName?.toLowerCase().includes(q) || false;
      const matchSkills = user.skills.some(s => s.toLowerCase().includes(q));
      const matchDomains = avail?.expertiseDomains.some(d => d.toLowerCase().includes(q)) || false;
      if (!matchName && !matchOrg && !matchSkills && !matchDomains) {
        return false;
      }
    }

    return true;
  });

  const [lastSentInviteResult, setLastSentInviteResult] = useState<{
    success: boolean;
    message: string;
    gmailUrl?: string;
  } | null>(null);

  const handleSendInterviewInvite = (user: UserProfile) => {
    setInviteFeedback(null);
    const res = sendEmailNotification(
      user.id,
      'interview_assigned',
      'Invitation: Maatram Foundation Interview Panel Slot',
      `Dear ${user.fullName}, based on your interview availability preferences and domain expertise, we would like to invite you to join our upcoming interview panel.`,
      {
        details: {
          interviewType: availabilities.find(a => a.userId === user.id)?.interviewType || 'mock_interview',
          domain: availabilities.find(a => a.userId === user.id)?.expertiseDomains.join(', ') || 'General',
          mode: availabilities.find(a => a.userId === user.id)?.preferredMode || 'Virtual Online',
        }
      }
    );

    if (res.success) {
      setInviteFeedback({ success: true, message: res.message });
      setLastSentInviteResult({ success: true, message: res.message, gmailUrl: res.gmailUrl });
    } else {
      setInviteFeedback({ success: false, message: res.message });
      setLastSentInviteResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
          {currentUser.role === 'volunteer'
            ? 'My Interview Availability & Expertise'
            : 'Interview Volunteer Talent Matcher'}
        </h1>
        <p className="text-sm text-[#718096] mt-1">
          {currentUser.role === 'volunteer'
            ? 'Specify your domain expertise, preferred interview types (mock vs admission panel), and availability slots.'
            : 'Filter eligible interviewers by domain, mode, and communication consent. Respects privacy preferences.'}
        </p>
      </div>

      {/* Volunteer Availability Form */}
      {currentUser.role === 'volunteer' ? (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs max-w-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <Clock className="w-5 h-5 text-[#2D6A4F]" />
            <h3 className="font-heading font-bold text-base text-[#1E2922]">
              Set Your Interview Availability Preferences
            </h3>
          </div>

          {saveFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSaveAvailability} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={e => setInterviewType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                >
                  <option value="both">Both (Mock & Admission Panel)</option>
                  <option value="mock_interview">Mock Interviews Only (Prep for Final-Year Scholars)</option>
                  <option value="admission_panel">Admission Panel Interviews (Scholar Selection)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Preferred Delivery Mode
                </label>
                <select
                  value={preferredMode}
                  onChange={e => setPreferredMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                >
                  <option value="any">Any (Virtual or In-Person)</option>
                  <option value="online">Virtual Only (Google Meet/Zoom)</option>
                  <option value="offline">In-Person Only (Chennai HQ / Centers)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3748] mb-1">
                Domain Expertise & Skills (comma separated)
              </label>
              <input
                type="text"
                value={expertiseInput}
                onChange={e => setExpertiseInput(e.target.value)}
                placeholder="e.g. Software Engineering, HR Interviewing, Soft Skills, Data Science, Civil Eng"
                className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3748] mb-1">
                Max Interviews Willing to Conduct Per Month: <span className="text-[#2D6A4F]">{maxInterviews} slots</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={maxInterviews}
                onChange={e => setMaxInterviews(Number(e.target.value))}
                className="w-full accent-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3748] mb-1">
                Additional Notes / Preferred Timing
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Free Saturday mornings between 10am-1pm; prefer candidates interested in engineering careers."
                className="w-full p-2.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              />
            </div>

            <div className="bg-[#E8F5E9] p-3 rounded-xl text-[11px] text-[#1B4332] space-y-1">
              <span className="font-bold block">Consent & Contact Privacy Notice:</span>
              <p>
                Staff can only contact you for interview slots if your "Volunteering Communications" consent is enabled in your Privacy & Consent settings.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Availability Preferences
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Staff Matcher Directory */
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
              <input
                type="text"
                placeholder="Search domain expertise, skills, or volunteer name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              >
                <option value="all">All Interview Types</option>
                <option value="mock_interview">Mock Interviewers</option>
                <option value="admission_panel">Admission Panelists</option>
              </select>

              <select
                value={filterMode}
                onChange={e => setFilterMode(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
              >
                <option value="all">All Modes</option>
                <option value="online">Online Mode</option>
                <option value="offline">Offline / In-Person</option>
              </select>
            </div>
          </div>

          {/* Volunteer Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVolunteers.map(vol => {
              const avail = availabilities.find(a => a.userId === vol.id);
              const hasConsent = vol.consent?.volunteeringCommunications;
              const hasAvailability = !!avail;

              // Distinct categories requested in prompt:
              // Available & Consented vs Unavailable vs Unknown availability vs Contact not permitted
              let badgeStatus: { label: string; bg: string; text: string; icon: any } = {
                label: 'Available & Consented',
                bg: 'bg-emerald-100',
                text: 'text-emerald-800',
                icon: ShieldCheck,
              };

              if (!hasConsent) {
                badgeStatus = {
                  label: 'Contact Not Permitted',
                  bg: 'bg-rose-100',
                  text: 'text-rose-800',
                  icon: XCircle,
                };
              } else if (!hasAvailability) {
                badgeStatus = {
                  label: 'Unknown Availability',
                  bg: 'bg-amber-100',
                  text: 'text-amber-800',
                  icon: HelpCircle,
                };
              }

              return (
                <div
                  key={vol.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStatus.bg} ${badgeStatus.text}`}
                      >
                        <badgeStatus.icon className="w-3 h-3" />
                        <span>{badgeStatus.label}</span>
                      </span>

                      {avail && (
                        <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E8F5E9] px-2 py-0.5 rounded capitalize">
                          {avail.preferredMode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={vol.avatarUrl}
                        alt={vol.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                      />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-[#1E2922]">{vol.fullName}</h4>
                        <p className="text-[11px] text-[#718096]">
                          {vol.organizationName || vol.volunteerType.replace('_', ' ')} • {vol.city}
                        </p>
                      </div>
                    </div>

                    {avail ? (
                      <div className="text-xs space-y-1.5 bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0]">
                        <div className="flex justify-between">
                          <span className="text-[#718096]">Type:</span>
                          <span className="font-semibold text-[#1E2922] capitalize">
                            {avail.interviewType.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#718096]">Capacity:</span>
                          <span className="font-semibold text-[#2D6A4F]">
                            Up to {avail.maxInterviewsPerMonth} / month
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="text-[#718096] block text-[10px] uppercase font-bold mb-1">
                            Expertise Domains:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {avail.expertiseDomains.map((dom, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded text-[#2D3748]"
                              >
                                {dom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                        No interview slot preferences submitted yet.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] mt-3">
                    <button
                      onClick={() => setInviteModalUser(vol)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        !hasConsent
                          ? 'bg-gray-100 text-[#718096] hover:bg-gray-200'
                          : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{hasConsent ? 'Assign & Notify' : 'Contact Not Permitted (View)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Staff Invite & Assign Modal */}
      {inviteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-heading font-bold text-base text-[#1B4332]">Assign Interview Slot</h3>
              <button onClick={() => setInviteModalUser(null)} className="p-1 text-[#718096] hover:text-black">
                ✕
              </button>
            </div>

            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
              <p>
                <span className="text-[#718096]">Volunteer:</span>{' '}
                <strong className="text-[#1E2922]">{inviteModalUser.fullName}</strong>
              </p>
              <p>
                <span className="text-[#718096]">Email:</span> {inviteModalUser.email}
              </p>
              <p>
                <span className="text-[#718096]">Communications Consent:</span>{' '}
                <strong
                  className={
                    inviteModalUser.consent.volunteeringCommunications
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }
                >
                  {inviteModalUser.consent.volunteeringCommunications ? 'ACTIVE (Allowed)' : 'WITHDRAWN (Blocked)'}
                </strong>
              </p>
            </div>

            {inviteFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold space-y-1.5 ${
                  inviteFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <div>{inviteFeedback.message}</div>
                {lastSentInviteResult?.gmailUrl && (
                  <div className="pt-1">
                    <a
                      href={lastSentInviteResult.gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline text-[11px]"
                    >
                      <span>Open in Gmail Web ↗</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {!inviteModalUser.consent.volunteeringCommunications && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Contact Policy Restriction:</p>
                  <p>
                    This volunteer has explicitly opted out of communications. Outbound scheduling notifications cannot be sent without prior written consent.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInviteModalUser(null)}
                className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSendInterviewInvite(inviteModalUser)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg shadow-xs cursor-pointer"
              >
                Send Slot Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
