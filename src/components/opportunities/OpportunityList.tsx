import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Opportunity, OpportunityCategory, OpportunityMode, OpportunityStatus } from '../../types';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  Clock,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  X,
  FileCheck,
} from 'lucide-react';

export const OpportunityList: React.FC = () => {
  const {
    opportunities,
    currentUser,
    applyToOpportunity,
    applications,
    createOpportunity,
    updateOpportunity,
    setOpportunityStatus,
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('published');

  // Modals state
  const [applyingOpp, setApplyingOpp] = useState<Opportunity | null>(null);
  const [motivationNotes, setMotivationNotes] = useState('');
  const [applyFeedback, setApplyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isEditingOpp, setIsEditingOpp] = useState<Opportunity | null>(null);
  const [isCreatingOpp, setIsCreatingOpp] = useState(false);
  const [oppFormData, setOppFormData] = useState({
    title: '',
    category: 'school_visit' as OpportunityCategory,
    mode: 'offline' as OpportunityMode,
    location: '',
    description: '',
    requirements: '',
    requiredSkills: '',
    startDate: '',
    endDate: '',
    deadline: '',
    capacity: 10,
    status: 'published' as OpportunityStatus,
  });

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'school_visit', label: 'School Visits' },
    { key: 'admissions_support', label: 'Admissions Support' },
    { key: 'bgv', label: 'Background Verification (BGV)' },
    { key: 'mock_interview', label: 'Mock Interviews' },
    { key: 'admission_panel', label: 'Admission Panels' },
  ];

  const modes: { key: string; label: string }[] = [
    { key: 'all', label: 'All Modes' },
    { key: 'offline', label: 'In-Person (Offline)' },
    { key: 'online', label: 'Virtual (Online)' },
    { key: 'hybrid', label: 'Hybrid' },
  ];

  // Filtering
  const filteredOpportunities = opportunities.filter(opp => {
    // Role filter: Volunteers only see published
    if (currentUser.role === 'volunteer' && opp.status !== 'published') {
      return false;
    }
    if (currentUser.role !== 'volunteer' && selectedStatus !== 'all' && opp.status !== selectedStatus) {
      return false;
    }

    if (selectedCategory !== 'all' && opp.category !== selectedCategory) {
      return false;
    }

    if (selectedMode !== 'all' && opp.mode !== selectedMode) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      const matchLocation = opp.location.toLowerCase().includes(q);
      const matchSkills = opp.requiredSkills.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchLocation && !matchSkills) {
        return false;
      }
    }

    return true;
  });

  const handleApplyClick = (opp: Opportunity) => {
    setApplyingOpp(opp);
    setMotivationNotes('');
    setApplyFeedback(null);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpp) return;

    const res = applyToOpportunity(applyingOpp.id, motivationNotes);
    if (res.success) {
      setApplyFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setApplyingOpp(null);
        setApplyFeedback(null);
      }, 1800);
    } else {
      setApplyFeedback({ type: 'error', message: res.message });
    }
  };

  const openCreateModal = () => {
    setOppFormData({
      title: '',
      category: 'school_visit',
      mode: 'offline',
      location: '',
      description: '',
      requirements: 'Commitment for scheduled duration\nPunctuality & empathy',
      requiredSkills: 'Public Speaking, Mentorship',
      startDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000 * 7 + 18000000).toISOString().slice(0, 16),
      deadline: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
      capacity: 10,
      status: 'published',
    });
    setIsCreatingOpp(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setOppFormData({
      title: opp.title,
      category: opp.category,
      mode: opp.mode,
      location: opp.location,
      description: opp.description,
      requirements: opp.requirements.join('\n'),
      requiredSkills: opp.requiredSkills.join(', '),
      startDate: opp.startDate.slice(0, 16),
      endDate: opp.endDate.slice(0, 16),
      deadline: opp.deadline.slice(0, 16),
      capacity: opp.capacity,
      status: opp.status,
    });
    setIsEditingOpp(opp);
  };

  const handleSaveOppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: oppFormData.title,
      category: oppFormData.category,
      mode: oppFormData.mode,
      location: oppFormData.location,
      description: oppFormData.description,
      requirements: oppFormData.requirements.split('\n').map(s => s.trim()).filter(Boolean),
      requiredSkills: oppFormData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      startDate: new Date(oppFormData.startDate).toISOString(),
      endDate: new Date(oppFormData.endDate).toISOString(),
      deadline: new Date(oppFormData.deadline).toISOString(),
      capacity: Number(oppFormData.capacity),
      status: oppFormData.status,
      leadStaffId: currentUser.id,
      leadStaffName: currentUser.fullName,
    };

    if (isEditingOpp) {
      updateOpportunity(isEditingOpp.id, payload);
      setIsEditingOpp(null);
    } else {
      createOpportunity(payload);
      setIsCreatingOpp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#1B4332]">
              Volunteering Opportunities
            </h1>
            <span className="bg-[#D8F3DC] text-[#1B4332] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {filteredOpportunities.length} Active
            </span>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Discover upcoming student outreach, background verification drives, and interview panels across Tamil Nadu.
          </p>
        </div>

        {currentUser.role !== 'volunteer' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Opportunity</span>
          </button>
        )}
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
            <input
              type="text"
              placeholder="Search by title, required skills, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:bg-white text-[#1E2922]"
            />
          </div>

          {/* Mode Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#718096]" />
            <select
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1E2922]"
            >
              {modes.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown (Staff/Admin only) */}
          {currentUser.role !== 'volunteer' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1E2922]"
            >
              <option value="all">All Lifecycle States</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1B4332] text-white shadow-2xs'
                    : 'bg-[#F2F6F3] text-[#4A5568] hover:bg-[#E8EFEA]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-8">
            <Calendar className="w-10 h-10 mx-auto text-[#A0AEC0] mb-3" />
            <h3 className="font-heading font-semibold text-base text-[#2D3748]">No Opportunities Found</h3>
            <p className="text-xs text-[#718096] max-w-sm mx-auto mt-1">
              Try adjusting your search terms or category filters to see more events.
            </p>
          </div>
        ) : (
          filteredOpportunities.map(opp => {
            const isFull = opp.allocatedCount >= opp.capacity;
            const isExpired = new Date() > new Date(opp.deadline);
            const userExistingApp = applications.find(
              a => a.opportunityId === opp.id && a.userId === currentUser.id && a.status !== 'withdrawn'
            );

            const categoryLabels: Record<OpportunityCategory, { label: string; color: string }> = {
              school_visit: { label: 'School Visit', color: 'bg-emerald-100 text-emerald-800' },
              admissions_support: { label: 'Admissions Support', color: 'bg-blue-100 text-blue-800' },
              bgv: { label: 'Background Verification', color: 'bg-amber-100 text-amber-900' },
              mock_interview: { label: 'Mock Interview', color: 'bg-indigo-100 text-indigo-800' },
              admission_panel: { label: 'Admission Panel', color: 'bg-purple-100 text-purple-800' },
            };

            const catInfo = categoryLabels[opp.category] || { label: opp.category, color: 'bg-gray-100 text-gray-800' };

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#4A5568] bg-[#F2F6F3] px-2 py-0.5 rounded capitalize">
                        {opp.mode}
                      </span>
                      {opp.status !== 'published' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                          {opp.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#1E2922] line-clamp-2 hover:text-[#2D6A4F]">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-[#718096] mt-1.5 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-1.5 text-xs text-[#4A5568] pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      <span>{new Date(opp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                      <span className="truncate">{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className={isExpired ? 'text-rose-600 font-semibold' : ''}>
                        Deadline: {new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {isExpired && ' (Expired)'}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#718096]">Capacity Allocated</span>
                      <span className="font-bold text-[#1E2922]">
                        {opp.allocatedCount} / {opp.capacity} ({opp.capacity - opp.allocatedCount} left)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EDF2F7] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? 'bg-rose-500' : opp.allocatedCount / opp.capacity > 0.7 ? 'bg-amber-500' : 'bg-[#2D6A4F]'
                        }`}
                        style={{ width: `${Math.min(100, (opp.allocatedCount / opp.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Required Skills chips */}
                  {opp.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {opp.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[10px] bg-[#F8FAF8] border border-[#E2E8F0] text-[#4A5568] px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {opp.requiredSkills.length > 3 && (
                        <span className="text-[10px] text-[#718096] self-center">
                          +{opp.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-[#F8FAF8] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  {currentUser.role === 'volunteer' ? (
                    userExistingApp ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F]">
                        <CheckCircle className="w-4 h-4" />
                        <span>Applied ({userExistingApp.status.toUpperCase()})</span>
                      </div>
                    ) : isExpired ? (
                      <span className="text-xs font-semibold text-rose-600">Deadline Passed</span>
                    ) : isFull ? (
                      <span className="text-xs font-semibold text-amber-700">Fully Booked</span>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(opp)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Apply to Volunteer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )
                  ) : (
                    // Staff & Admin Actions
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(opp)}
                          className="p-1.5 text-[#4A5568] hover:text-[#1B4332] hover:bg-white rounded border border-[#E2E8F0] transition-colors cursor-pointer"
                          title="Edit details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {opp.status === 'draft' && (
                          <button
                            onClick={() => setOpportunityStatus(opp.id, 'published')}
                            className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer"
                          >
                            Publish
                          </button>
                        )}
                        {opp.status === 'published' && (
                          <button
                            onClick={() => setOpportunityStatus(opp.id, 'closed')}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded cursor-pointer"
                          >
                            Close
                          </button>
                        )}
                        {opp.status === 'closed' && (
                          <button
                            onClick={() => setOpportunityStatus(opp.id, 'archived')}
                            className="px-2 py-1 text-[11px] font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Volunteer Application Modal */}
      {applyingOpp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1B4332]">Apply for Volunteering</h3>
                <p className="text-xs text-[#718096] truncate max-w-sm">{applyingOpp.title}</p>
              </div>
              <button
                onClick={() => setApplyingOpp(null)}
                className="p-1 text-[#718096] hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E2E8F0] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#718096]">Date:</span>
                <span className="font-semibold text-[#1E2922]">
                  {new Date(applyingOpp.startDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Location:</span>
                <span className="font-semibold text-[#1E2922]">{applyingOpp.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718096]">Available Capacity:</span>
                <span className="font-bold text-[#2D6A4F]">
                  {applyingOpp.capacity - applyingOpp.allocatedCount} slots remaining
                </span>
              </div>
            </div>

            {applyFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  applyFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {applyFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{applyFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Why do you wish to join this session? (Motivation & Relevant Skills)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share a brief note on your background, languages spoken, or motivation for helping students..."
                  value={motivationNotes}
                  onChange={e => setMotivationNotes(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1E2922]"
                />
              </div>

              <div className="bg-[#E8F5E9] p-3 rounded-lg text-[11px] text-[#1B4332] space-y-1">
                <p className="font-bold">Automatic Protections & Consent Check:</p>
                <p>• Duplicate applications and overbooking are strictly prevented.</p>
                <p>• Confirmation email is dispatched in accordance with your communication consent.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingOpp(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Opportunity Modal (Staff & Admin) */}
      {(isCreatingOpp || isEditingOpp) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-heading font-bold text-lg text-[#1B4332]">
                {isEditingOpp ? 'Edit Opportunity' : 'Create New Volunteering Opportunity'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingOpp(false);
                  setIsEditingOpp(null);
                }}
                className="p-1 text-[#718096] hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOppSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={oppFormData.title}
                  onChange={e => setOppFormData({ ...oppFormData, title: e.target.value })}
                  placeholder="e.g. Chengalpattu Career Awareness Camp"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#1E2922]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Category</label>
                  <select
                    value={oppFormData.category}
                    onChange={e => setOppFormData({ ...oppFormData, category: e.target.value as OpportunityCategory })}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  >
                    <option value="school_visit">School Visit</option>
                    <option value="admissions_support">Admissions Support</option>
                    <option value="bgv">Background Verification (BGV)</option>
                    <option value="mock_interview">Mock Interview</option>
                    <option value="admission_panel">Admission Panel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Mode</label>
                  <select
                    value={oppFormData.mode}
                    onChange={e => setOppFormData({ ...oppFormData, mode: e.target.value as OpportunityMode })}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  >
                    <option value="offline">In-Person (Offline)</option>
                    <option value="online">Virtual (Online)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">Location / Venue</label>
                <input
                  type="text"
                  required
                  value={oppFormData.location}
                  onChange={e => setOppFormData({ ...oppFormData, location: e.target.value })}
                  placeholder="e.g. Govt Hr Sec School, Chengalpattu or Google Meet"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={oppFormData.description}
                  onChange={e => setOppFormData({ ...oppFormData, description: e.target.value })}
                  className="w-full p-2.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={oppFormData.startDate}
                    onChange={e => setOppFormData({ ...oppFormData, startDate: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={oppFormData.endDate}
                    onChange={e => setOppFormData({ ...oppFormData, endDate: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Application Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={oppFormData.deadline}
                    onChange={e => setOppFormData({ ...oppFormData, deadline: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Capacity (Max Volunteers)</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    required
                    value={oppFormData.capacity}
                    onChange={e => setOppFormData({ ...oppFormData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Status</label>
                  <select
                    value={oppFormData.status}
                    onChange={e => setOppFormData({ ...oppFormData, status: e.target.value as OpportunityStatus })}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3748] mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={oppFormData.requiredSkills}
                  onChange={e => setOppFormData({ ...oppFormData, requiredSkills: e.target.value })}
                  placeholder="e.g. Public Speaking, Tamil Fluency, Career Guidance"
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-lg text-[#1E2922]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingOpp(false);
                    setIsEditingOpp(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#4A5568] hover:bg-[#F2F6F3] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-lg shadow-xs"
                >
                  {isEditingOpp ? 'Save Changes' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
