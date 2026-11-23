import React, { useState } from 'react';
import { useApp, ADMIN_PASSKEY, STAFF_PASSKEY } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Building2,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialTab,
    loginUser,
    registerUser,
    organizations,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalInitialTab);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Register Form State
  const [volunteerType, setVolunteerType] = useState<'student' | 'alumnus' | 'corporate_supporter'>('student');
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Chennai');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password complexity criteria
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordComplex = hasMinLength && hasNumber && hasSpecial;
  const strengthScore = (password.length > 0 ? 1 : 0) + (hasMinLength ? 1 : 0) + (hasNumber && hasSpecial ? 1 : 0);

  // Specific fields
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2027);
  const [organizationName, setOrganizationName] = useState(organizations[0]?.name || 'Cognizant Outreach');
  const [skills, setSkills] = useState('Mentorship, Career Guidance');
  const [bio, setBio] = useState('');

  // Elevated Role Toggle
  const [requestElevatedRole, setRequestElevatedRole] = useState(false);
  const [requestedRole, setRequestedRole] = useState<'admin' | 'staff'>('admin');
  const [adminPasskey, setAdminPasskey] = useState('');

  // Initial Consents
  const [consentComms, setConsentComms] = useState(true);
  const [consentLinkedIn, setConsentLinkedIn] = useState(false);
  const [consentEmployer, setConsentEmployer] = useState(false);

  const [regFeedback, setRegFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginFeedback(null);
    const res = loginUser(loginEmail, loginPassword);
    if (res.success) {
      setLoginFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setLoginFeedback(null);
      }, 1000);
    } else {
      setLoginFeedback({ type: 'error', message: res.message });
    }
  };

  const handleQuickLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('demo123');
    loginUser(email, 'demo123');
    setIsAuthModalOpen(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);

    if (password !== confirmPassword) {
      setRegFeedback({ type: 'error', message: 'Passwords do not match. Please verify.' });
      return;
    }

    if (!isPasswordComplex) {
      setRegFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters long and include at least one number and one special character (!@#$%^&* etc.).',
      });
      return;
    }

    const payload = {
      fullName,
      email: regEmail,
      phone,
      password,
      city,
      volunteerType,
      college: volunteerType === 'student' ? college : undefined,
      graduationYear: Number(graduationYear),
      organizationName: volunteerType === 'corporate_supporter' ? organizationName : undefined,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      bio,
      role: requestElevatedRole ? requestedRole : ('volunteer' as UserRole),
      adminPasskey: requestElevatedRole ? adminPasskey : undefined,
      consent: {
        volunteeringCommunications: consentComms,
        linkedInRecognition: consentLinkedIn,
        identifiableEmployerAttribution: consentEmployer,
      },
    };

    const res = registerUser(payload);
    if (res.success) {
      setRegFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setRegFeedback(null);
      }, 1500);
    } else {
      setRegFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-[#F8FAF8] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B4332] flex items-center justify-center text-white font-bold text-base shadow-xs">
              M
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1B4332]">
                Maatram Connect Portal
              </h3>
              <p className="text-xs text-[#718096]">
                {activeTab === 'login' ? 'Sign in to access your volunteer portal' : 'Register as a volunteer or coordinator'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-[#718096] hover:text-black rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E2E8F0] bg-white">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginFeedback(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'border-[#2D6A4F] text-[#1B4332] bg-[#F8FAF8]'
                : 'border-transparent text-[#718096] hover:text-[#1E2922]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegFeedback(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'border-[#2D6A4F] text-[#1B4332] bg-[#F8FAF8]'
                : 'border-transparent text-[#718096] hover:text-[#1E2922]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: SIGN IN */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              {loginFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    loginFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {loginFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{loginFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. volunteer@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-[#A0AEC0]" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-[#A0AEC0] hover:text-[#4A5568]"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs sm:text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Sign In to Portal
                </button>
              </form>

              {/* Quick Login Preset Buttons */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096] block">
                  Quick Demo Login (One-Click)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleQuickLogin('kavya.lakshman@example.com')}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAF8] hover:bg-[#E8F5E9] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[#1E2922] truncate">Student Volunteer</div>
                    <div className="text-[10px] text-[#718096]">Kavya Lakshman</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('dinesh.k@example.com')}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAF8] hover:bg-[#E8F5E9] text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[#1E2922] truncate">Alumni Volunteer</div>
                    <div className="text-[10px] text-[#718096]">Dinesh Kumar (Batch '21)</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('shanthi.office@maatram.org')}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAF8] hover:bg-blue-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[#1E2922] truncate">Office Staff</div>
                    <div className="text-[10px] text-[#718096]">Shanthi Sundararajan</div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('admin@maatram.org')}
                    className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAF8] hover:bg-purple-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-[#1E2922] truncate">Administrator</div>
                    <div className="text-[10px] text-[#718096]">Sujith Kumar (Admin)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    regFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {regFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{regFeedback.message}</span>
                </div>
              )}

              {/* User Role Selection Component: Student Volunteer vs Alumni Volunteer */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#1E2922]">
                    Select Your Volunteering Role:
                  </label>
                  <span className="text-[10px] text-[#718096] uppercase font-semibold">
                    Step 1 of 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Student Volunteer Card */}
                  <div
                    onClick={() => setVolunteerType('student')}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                      volunteerType === 'student'
                        ? 'border-[#2D6A4F] bg-[#E8F5E9]/50 shadow-sm ring-1 ring-[#2D6A4F]'
                        : 'border-[#E2E8F0] bg-[#F8FAF8] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          volunteerType === 'student'
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {volunteerType === 'student' ? 'Selected' : 'Student'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h4 className="font-heading font-bold text-sm text-[#1E2922]">
                        Student Volunteer
                      </h4>
                      <p className="text-[11px] text-[#718096] mt-1 leading-relaxed">
                        Currently enrolled in college or university. Join school career visits, help desks, event operations, and peer tutoring.
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/80 flex items-center gap-1.5 text-[10px] text-[#2D6A4F] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>College student pathway</span>
                    </div>
                  </div>

                  {/* Alumni Volunteer Card */}
                  <div
                    onClick={() => setVolunteerType('alumnus')}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                      volunteerType === 'alumnus'
                        ? 'border-[#2D6A4F] bg-[#E8F5E9]/50 shadow-sm ring-1 ring-[#2D6A4F]'
                        : 'border-[#E2E8F0] bg-[#F8FAF8] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          volunteerType === 'alumnus'
                            ? 'bg-[#2D6A4F] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {volunteerType === 'alumnus' ? 'Selected' : 'Alumni'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h4 className="font-heading font-bold text-sm text-[#1E2922]">
                        Alumni Volunteer
                      </h4>
                      <p className="text-[11px] text-[#718096] mt-1 leading-relaxed">
                        Past Maatram Foundation scholarship graduate giving back. Conduct on-ground BGV house verifications, interview panels, and career mentorship.
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/80 flex items-center gap-1.5 text-[10px] text-amber-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Maatram graduate network</span>
                    </div>
                  </div>
                </div>

                {/* Optional Corporate Supporter Switch */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setVolunteerType(
                        volunteerType === 'corporate_supporter' ? 'student' : 'corporate_supporter'
                      )
                    }
                    className="text-[11px] text-[#718096] hover:text-[#2D6A4F] underline cursor-pointer flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>
                      {volunteerType === 'corporate_supporter'
                        ? 'Switch back to Student or Alumni volunteer role'
                        : 'Registering as a Corporate Supporter (Cognizant, Zoho, Freshworks)? Click here'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Adaptive Role-Specific Fields */}
              {volunteerType === 'student' && (
                <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#E2E8F0]">
                    <GraduationCap className="w-4 h-4 text-[#2D6A4F]" />
                    <span className="font-bold text-xs text-[#1E2922]">
                      Student Academic Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#2D3748] mb-1">
                        College / University Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anna University (CEG), PSG Tech"
                        value={college}
                        onChange={e => setCollege(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#2D3748] mb-1">
                        Expected Graduation Year <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={2024}
                        max={2032}
                        required
                        value={graduationYear}
                        onChange={e => setGraduationYear(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {volunteerType === 'alumnus' && (
                <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#E2E8F0]">
                    <Briefcase className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-xs text-[#1E2922]">
                      Maatram Alumni Credentials
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#2D3748] mb-1">
                        Maatram Scholarship Batch Year <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={2013}
                        max={2026}
                        required
                        placeholder="e.g. 2021"
                        value={graduationYear}
                        onChange={e => setGraduationYear(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#2D3748] mb-1">
                        Current Workplace / Designation <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zoho (Software Engineer), State Govt"
                        value={organizationName}
                        onChange={e => setOrganizationName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {volunteerType === 'corporate_supporter' && (
                <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2E8F0] space-y-2">
                  <label className="block text-[11px] font-bold text-[#2D3748]">
                    Corporate Partner Organization
                  </label>
                  <select
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#1E2922]"
                  >
                    {organizations.map(org => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                    <option value="Independent Corporate Volunteer">Other / Independent</option>
                  </select>
                </div>
              )}

              {/* Core Credentials */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sundaram"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98400 12345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">City / District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai, Madurai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 8 chars, 1 num, 1 special"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-[#A0AEC0] hover:text-[#4A5568]"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2D3748] mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8F0] rounded-xl text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-[#A0AEC0] hover:text-[#4A5568]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Complexity Validator Panel */}
              <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#2D3748]">Password Security Standards:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] uppercase ${
                      strengthScore === 3
                        ? 'bg-emerald-100 text-emerald-800'
                        : strengthScore === 2
                        ? 'bg-amber-100 text-amber-800'
                        : password.length > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'text-[#A0AEC0]'
                    }`}
                  >
                    {strengthScore === 3 ? 'Compliant' : strengthScore === 2 ? 'Moderate' : password.length > 0 ? 'Weak' : 'Required'}
                  </span>
                </div>

                {/* Strength Meter Bar */}
                <div className="w-full h-1.5 bg-[#EDF2F7] rounded-full overflow-hidden flex gap-1">
                  <div
                    className={`h-full flex-1 rounded-full transition-colors ${
                      strengthScore >= 1
                        ? strengthScore === 3
                          ? 'bg-emerald-500'
                          : strengthScore === 2
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                        : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-colors ${
                      strengthScore >= 2
                        ? strengthScore === 3
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-transparent'
                    }`}
                  />
                  <div
                    className={`h-full flex-1 rounded-full transition-colors ${
                      strengthScore === 3 ? 'bg-emerald-500' : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Complexity Criteria Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px] pt-1">
                  <div
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      hasMinLength ? 'text-emerald-700' : 'text-[#718096]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-[#CBD5E1]'}`}
                    />
                    <span>At least 8 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      hasNumber ? 'text-emerald-700' : 'text-[#718096]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-[#CBD5E1]'}`}
                    />
                    <span>At least 1 number (0-9)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      hasSpecial ? 'text-emerald-700' : 'text-[#718096]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-[#CBD5E1]'}`}
                    />
                    <span>At least 1 special char</span>
                  </div>
                </div>
              </div>

              {/* Elevated Role & Secret Passkey Section */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1E2922]">
                  <input
                    type="checkbox"
                    checked={requestElevatedRole}
                    onChange={e => setRequestElevatedRole(e.target.checked)}
                    className="rounded accent-[#2D6A4F] w-4 h-4"
                  />
                  <span>Register as Administrator or Office Staff (Requires Secret Passkey)</span>
                </label>

                {requestElevatedRole && (
                  <div className="mt-2.5 p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900">Requested Elevated Role:</span>
                      <select
                        value={requestedRole}
                        onChange={e => setRequestedRole(e.target.value as any)}
                        className="px-2 py-1 bg-white border border-purple-300 rounded font-bold text-purple-900"
                      >
                        <option value="admin">Administrator</option>
                        <option value="staff">Office Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">
                        Secret Access Passkey:
                      </label>
                      <input
                        type="password"
                        placeholder="Enter authorized passkey"
                        value={adminPasskey}
                        onChange={e => setAdminPasskey(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg text-[#1E2922] focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                      <p className="text-[10px] text-purple-700 mt-1">
                        Demo Keys: <code>MAATRAM_ADMIN_2026</code> (Admin) or <code>MAATRAM_STAFF_2026</code> (Staff)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Consent Checkboxes */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5 text-xs">
                <label className="flex items-start gap-2 cursor-pointer text-[#4A5568]">
                  <input
                    type="checkbox"
                    checked={consentComms}
                    onChange={e => setConsentComms(e.target.checked)}
                    className="rounded accent-[#2D6A4F] w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span>Consent to receive volunteering communications, schedule alerts & reminders</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer text-[#4A5568]">
                  <input
                    type="checkbox"
                    checked={consentLinkedIn}
                    onChange={e => setConsentLinkedIn(e.target.checked)}
                    className="rounded accent-[#2D6A4F] w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span>Consent for public LinkedIn recognition drafts & milestone cards</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs sm:text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Create Account & Join Maatram Connect
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
