import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus } from '../../types';
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Shield,
  MessageSquare,
} from 'lucide-react';

export const ApplicationQueue: React.FC = () => {
  const {
    applications,
    currentUser,
    reviewApplication,
    getUserVerifiedHours,
    opportunities,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(currentUser.role === 'volunteer' ? 'all' : 'pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected' | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter based on user role
  const relevantApplications = applications.filter(app => {
    if (currentUser.role === 'volunteer' && app.userId !== currentUser.id) {
      return false;
    }
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.userName.toLowerCase().includes(q);
      const matchTitle = app.opportunityTitle.toLowerCase().includes(q);
      const matchOrg = app.organizationName?.toLowerCase().includes(q) || false;
      if (!matchName && !matchTitle && !matchOrg) return false;
    }
    return true;
  });

  const handleOpenReview = (app: Application, decision: 'approved' | 'rejected') => {
    setSelectedApp(app);
    setReviewDecision(decision);
    setInternalNotes('');
    setActionFeedback(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !reviewDecision) return;

    if (reviewDecision === 'rejected' && !internalNotes.trim()) {
      setActionFeedback({ type: 'error', message: 'Mandatory: Please provide internal review reason for rejection.' });
      return;
    }

    const res = reviewApplication(selectedApp.id, reviewDecision, internalNotes);
    if (res.success) {
      setActionFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setSelectedApp(null);
        setReviewDecision(null);
        setActionFeedback(null);
      }, 1500);
    } else {
      setActionFeedback({ type: 'error', message: res.message });
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
            {currentUser.role === 'volunteer' ? 'My Volunteer Applications' : 'Application Review Queue'}
          </h1>
          <p className="text-sm text-[#718096] mt-1">
            {currentUser.role === 'volunteer'
              ? 'Track the approval progress of your opportunity applications.'
              : 'Review volunteer submissions, inspect applicant credentials, and authorize admissions.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#4A5568] bg-[#F2F6F3] px-3 py-1 rounded-lg">
            Total Shown: {relevantApplications.length}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
          <input
            type="text"
            placeholder={currentUser.role === 'volunteer' ? 'Search event titles...' : 'Search volunteer, event or org...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1E2922]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#1B4332] text-white shadow-2xs'
                : 'bg-[#F2F6F3] text-[#4A5568] hover:bg-[#E8EFEA]'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'approved'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Applications List / Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        {relevantApplications.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-base text-[#2D3748]">No Applications Found</h3>
            <p className="text-xs text-[#718096] mt-1">
              {currentUser.role === 'volunteer'
                ? "You haven't submitted any applications under this filter."
                : 'No pending applications matching criteria.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {relevantApplications.map(app => {
              const volunteerVerifiedHours = getUserVerifiedHours(app.userId);
              const opp = opportunities.find(o => o.id === app.opportunityId);

              return (
                <div key={app.id} className="p-5 hover:bg-[#F8FAF8] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(app.status)}
                        <span className="text-xs font-bold text-[#1B4332] bg-[#D8F3DC] px-2 py-0.5 rounded capitalize">
                          {app.opportunityCategory.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-[#718096]">
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-base text-[#1E2922]">
                        {app.opportunityTitle}
                      </h3>

                      {currentUser.role !== 'volunteer' && (
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#4A5568] pt-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#1E2922]">
                            <User className="w-3.5 h-3.5 text-[#2D6A4F]" />
                            <span>{app.userName}</span>
                            <span className="text-[10px] text-[#718096] capitalize">
                              ({app.userType.replace('_', ' ')})
                            </span>
                          </div>

                          {app.organizationName && (
                            <div className="flex items-center gap-1 text-[#718096]">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{app.organizationName}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-[#2D6A4F] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded">
                            <span>{volunteerVerifiedHours} verified hrs</span>
                          </div>
                        </div>
                      )}

                      {/* Motivation notes snippet */}
                      <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#2D3748] mt-2">
                        <span className="font-bold text-[#4A5568] block mb-0.5">Applicant Statement:</span>
                        <p className="italic text-[#1E2922]">"{app.motivationNotes}"</p>
                      </div>

                      {/* Internal review notes if available */}
                      {app.internalReviewNotes && (
                        <div className="text-xs text-[#718096] flex items-center gap-1.5 mt-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[#A0AEC0]" />
                          <span>Office Review Note: {app.internalReviewNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons (Staff only) */}
                    {currentUser.role !== 'volunteer' && app.status === 'pending' && (
                      <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => handleOpenReview(app, 'approved')}
                          className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenReview(app, 'rejected')}
                          className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal (Staff action) */}
      {selectedApp && reviewDecision && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-heading font-bold text-base text-[#1B4332]">
                {reviewDecision === 'approved' ? 'Confirm Approval' : 'Provide Rejection Reason'}
              </h3>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setReviewDecision(null);
                }}
                className="p-1 text-[#718096] hover:text-black rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
              <p>
                <span className="text-[#718096]">Volunteer:</span>{' '}
                <strong className="text-[#1E2922]">{selectedApp.userName}</strong>
              </p>
              <p>
                <span className="text-[#718096]">Opportunity:</span>{' '}
                <strong className="text-[#1E2922]">{selectedApp.opportunityTitle}</strong>
              </p>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Internal Review Notes {reviewDecision === 'rejected' && <span className="text-rose-600">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={reviewDecision === 'rejected'}
                  placeholder={
                    reviewDecision === 'approved'
                      ? 'e.g. Assigned to team Alpha / Meets qualifications'
                      : 'e.g. Schedule mismatch / Position requirements filled'
                  }
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1E2922]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApp(null);
                    setReviewDecision(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
                    reviewDecision === 'approved'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {reviewDecision === 'approved' ? 'Authorize & Send Email' : 'Submit Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
