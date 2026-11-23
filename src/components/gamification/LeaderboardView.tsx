import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Award,
  Medal,
  ShieldCheck,
  Share2,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const {
    users,
    currentUser,
    getUserVerifiedHours,
    getUserCompletedEventsCount,
    badges,
    volunteerBadges,
    participationRecords,
  } = useApp();

  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'monthly' | 'all_time'>('monthly');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [editableLinkedInPost, setEditableLinkedInPost] = useState(
    `Proud to volunteer with Maatram Foundation (MH26-02)! Just achieved a milestone in verified service hours mentoring first-generation scholars across Tamil Nadu. Every hour helps bridge higher education opportunities for deserving rural students. #MaatramFoundation #Volunteering #EducationForAll #SocialImpact`
  );

  // Compute leaderboard
  const volunteers = users.filter(u => u.role === 'volunteer');

  const rankedVolunteers = volunteers.map(vol => {
    let hours = 0;
    if (leaderboardTimeframe === 'all_time') {
      hours = getUserVerifiedHours(vol.id);
    } else {
      // Current month verified hours (e.g. October/November 2026)
      hours = participationRecords
        .filter(
          r =>
            r.userId === vol.id &&
            r.verificationStatus === 'verified' &&
            r.eventDate >= '2026-10-01'
        )
        .reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);
    }

    const eventsCount = getUserCompletedEventsCount(vol.id);
    const earnedBadges = volunteerBadges.filter(vb => vb.userId === vol.id);

    return {
      user: vol,
      hours,
      eventsCount,
      badgesCount: earnedBadges.length,
      earnedBadges,
    };
  });

  // Sort descending by hours
  rankedVolunteers.sort((a, b) => b.hours - a.hours);

  const currentUserVerifiedHours = getUserVerifiedHours(currentUser.id);
  const currentUserBadges = volunteerBadges.filter(vb => vb.userId === currentUser.id);

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(editableLinkedInPost);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleShareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://maatramfoundation.org')}`;
    window.open(shareUrl, '_blank', 'width=600,height=500');
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'Medal':
        return <Medal className="w-5 h-5" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#2D6A4F]" />
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
              Volunteer Leaderboard & Badges
            </h1>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Celebrating the dedication of volunteers empowering first-generation college scholars across Tamil Nadu.
          </p>
        </div>

        {/* Timeframe toggle */}
        <div className="flex items-center gap-1 bg-[#F2F6F3] p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setLeaderboardTimeframe('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              leaderboardTimeframe === 'monthly'
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'text-[#4A5568] hover:text-[#1B4332]'
            }`}
          >
            Monthly Leaderboard
          </button>
          <button
            onClick={() => setLeaderboardTimeframe('all_time')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              leaderboardTimeframe === 'all_time'
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'text-[#4A5568] hover:text-[#1B4332]'
            }`}
          >
            All-Time Hall of Fame
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
            <div className="p-4 bg-[#F8FAF8] border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E2922] uppercase tracking-wider">
                {leaderboardTimeframe === 'monthly' ? 'Top Contributors This Month' : 'All-Time Verified Hours'}
              </span>
              <span className="text-[11px] text-[#718096]">
                Only verified hours count towards rankings
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {rankedVolunteers.slice(0, 10).map((item, index) => {
                const rank = index + 1;
                const isCurrentUser = item.user.id === currentUser.id;
                const isOptedOut = item.user.optOutPublicLeaderboard && !isCurrentUser;

                return (
                  <div
                    key={item.user.id}
                    className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentUser ? 'bg-[#E8F5E9]/50' : 'hover:bg-[#F8FAF8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          rank === 1
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : rank === 3
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'bg-[#F2F6F3] text-[#718096]'
                        }`}
                      >
                        {rank}
                      </div>

                      {/* Avatar */}
                      <img
                        src={isOptedOut ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' : item.user.avatarUrl}
                        alt="Volunteer Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-sm text-[#1E2922]">
                            {isOptedOut ? `Supporter #${item.user.id.slice(-4)}` : item.user.fullName}
                          </h4>
                          {isCurrentUser && (
                            <span className="text-[10px] font-bold bg-[#1B4332] text-white px-2 py-0.2 rounded">
                              You
                            </span>
                          )}
                          {isOptedOut && (
                            <span className="text-[10px] font-semibold text-[#718096] bg-[#F2F6F3] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Anonymous
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#718096]">
                          {isOptedOut ? 'Privacy Protected' : item.user.organizationName || item.user.volunteerType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-heading font-bold text-base text-[#2D6A4F]">
                        {item.hours.toFixed(1)} hrs
                      </div>
                      <div className="text-[11px] text-[#718096]">
                        {item.eventsCount} events completed
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Badges & LinkedIn Recognition */}
        <div className="space-y-6">
          {/* Milestone Badges Collection */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2D6A4F]" />
                <h3 className="font-heading font-bold text-sm text-[#1E2922]">
                  Milestone Badges ({currentUserBadges.length}/{badges.length} Unlocked)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {badges.map(badge => {
                const isEarned = currentUserBadges.some(cb => cb.badgeId === badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isEarned
                        ? 'bg-[#E8F5E9]/60 border-[#A5D6A7] text-[#1B4332]'
                        : 'bg-[#F8FAF8] border-[#E2E8F0] text-[#A0AEC0] opacity-60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center mb-1.5 ${
                        isEarned ? 'bg-[#2D6A4F] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {getBadgeIcon(badge.iconName)}
                    </div>
                    <h5 className="font-bold text-xs truncate text-[#1E2922]">{badge.title}</h5>
                    <p className="text-[10px] text-[#718096] mt-0.5 line-clamp-2">{badge.description}</p>
                    {isEarned && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                        Earned ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LinkedIn Recognition Generator (With strict consent check) */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#0077B5]" />
                <h3 className="font-heading font-bold text-sm text-[#1E2922]">LinkedIn Recognition Share</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  currentUser.consent.linkedInRecognition
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentUser.consent.linkedInRecognition ? 'Consent Granted' : 'Consent Withdrawn'}
              </span>
            </div>

            {currentUser.consent.linkedInRecognition ? (
              <div className="space-y-3">
                <p className="text-xs text-[#718096]">
                  Share your verified volunteering milestone on LinkedIn to inspire colleagues and celebrate educational impact:
                </p>

                <textarea
                  rows={4}
                  value={editableLinkedInPost}
                  onChange={e => setEditableLinkedInPost(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDraft}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#2D3748] bg-[#F2F6F3] hover:bg-[#E8EFEA] rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDraft ? 'Copied!' : 'Copy Draft'}</span>
                  </button>

                  <button
                    onClick={handleShareOnLinkedIn}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-[#0077B5] hover:bg-[#005E93] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Share on LinkedIn</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>LinkedIn Recognition Blocked by Privacy Consent</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  You have currently opted out of public LinkedIn recognition in your Privacy & Consent preferences.
                  To generate share cards or drafts, please enable "LinkedIn Recognition Consent" in the Privacy tab.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
