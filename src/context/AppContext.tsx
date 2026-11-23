import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateEmailContent, generateGmailUrl, generateMailtoUrl } from '../utils/emailTemplates.ts';
import {
  UserProfile,
  Organization,
  Opportunity,
  Application,
  ParticipationRecord,
  Badge,
  VolunteerBadge,
  AvailabilityPreference,
  AuditLog,
  EmailLog,
  UserRole,
  ConsentPreferences,
  RegisterUserPayload,
} from '../types';
import {
  ORGANIZATIONS,
  BADGES,
  ALL_USERS,
  OPPORTUNITIES,
  INITIAL_APPLICATIONS,
  INITIAL_PARTICIPATION_RECORDS,
  INITIAL_AVAILABILITIES,
  INITIAL_VOLUNTEER_BADGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_EMAIL_LOGS,
} from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile;
  switchUser: (userId: string) => void;
  users: UserProfile[];
  organizations: Organization[];
  opportunities: Opportunity[];
  applications: Application[];
  participationRecords: ParticipationRecord[];
  availabilities: AvailabilityPreference[];
  badges: Badge[];
  volunteerBadges: VolunteerBadge[];
  auditLogs: AuditLog[];
  emailLogs: EmailLog[];

  // Authentication & Profile
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  registerUser: (payload: RegisterUserPayload) => { success: boolean; message: string; user?: UserProfile };
  loginUser: (email: string, password?: string) => { success: boolean; message: string };
  logoutUser: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => { success: boolean; message: string };
  updateUserRole: (userId: string, newRole: UserRole) => { success: boolean; message: string };
  updateUserConsent: (userId: string, consent: Partial<ConsentPreferences>) => void;
  toggleOptOutLeaderboard: (userId: string) => void;

  // Opportunities
  createOpportunity: (data: Omit<Opportunity, 'id' | 'allocatedCount' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string };
  updateOpportunity: (id: string, data: Partial<Opportunity>) => { success: boolean; message: string };
  setOpportunityStatus: (id: string, status: Opportunity['status']) => void;

  // Applications
  applyToOpportunity: (opportunityId: string, motivationNotes: string) => { success: boolean; message: string };
  reviewApplication: (applicationId: string, status: 'approved' | 'rejected', internalNotes: string) => { success: boolean; message: string };

  // Participation & Hours Verification
  verifyHours: (
    recordId: string, 
    actualHours: number, 
    attendanceStatus: ParticipationRecord['attendanceStatus'], 
    feedback: string
  ) => { success: boolean; message: string };
  rejectHours: (recordId: string, reason: string) => { success: boolean; message: string };

  // Availability
  saveAvailability: (pref: Omit<AvailabilityPreference, 'id' | 'updatedAt'>) => { success: boolean; message: string };

  // Communications / Email
  sendEmailNotification: (
    recipientUserId: string,
    templateType: EmailLog['templateType'],
    subject: string,
    content: string,
    options?: {
      customEmail?: string;
      customName?: string;
      details?: Record<string, any>;
    }
  ) => {
    success: boolean;
    message: string;
    blockedByConsent?: boolean;
    deliveryMethod?: 'resend_api' | 'simulator' | 'gmail_client' | 'mailto';
    gmailUrl?: string;
    mailtoUrl?: string;
    messageId?: string;
    recipientEmail?: string;
  };

  // Helpers
  getUserVerifiedHours: (userId: string) => number;
  getUserCompletedEventsCount: (userId: string) => number;
  getUserBadges: (userId: string) => VolunteerBadge[];
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ADMIN_PASSKEY = 'MAATRAM_ADMIN_2026';
export const STAFF_PASSKEY = 'MAATRAM_STAFF_2026';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback or default mock data
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('maatram_users');
    return saved ? JSON.parse(saved) : ALL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('maatram_current_user_id') || 'vol-1'; // Default: Karthik Subramanian
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const [organizations, setOrganizations] = useState<Organization[]>(ORGANIZATIONS);

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('maatram_opportunities');
    return saved ? JSON.parse(saved) : OPPORTUNITIES;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('maatram_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [participationRecords, setParticipationRecords] = useState<ParticipationRecord[]>(() => {
    const saved = localStorage.getItem('maatram_participation');
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPATION_RECORDS;
  });

  const [availabilities, setAvailabilities] = useState<AvailabilityPreference[]>(() => {
    const saved = localStorage.getItem('maatram_availabilities');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITIES;
  });

  const [volunteerBadges, setVolunteerBadges] = useState<VolunteerBadge[]>(() => {
    const saved = localStorage.getItem('maatram_volunteer_badges');
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEER_BADGES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('maatram_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('maatram_email_logs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('maatram_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('maatram_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('maatram_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('maatram_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('maatram_participation', JSON.stringify(participationRecords));
  }, [participationRecords]);

  useEffect(() => {
    localStorage.setItem('maatram_availabilities', JSON.stringify(availabilities));
  }, [availabilities]);

  useEffect(() => {
    localStorage.setItem('maatram_volunteer_badges', JSON.stringify(volunteerBadges));
  }, [volunteerBadges]);

  useEffect(() => {
    localStorage.setItem('maatram_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('maatram_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      addAuditLog({
        actorId: target.id,
        actorName: target.fullName,
        actorRole: target.role,
        action: 'USER_SWITCH',
        category: 'auth',
        details: `Active persona switched to ${target.fullName} (${target.role})`,
      });
    }
  };

  const addAuditLog = (entry: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper: Calculate verified hours
  const getUserVerifiedHours = (userId: string): number => {
    return participationRecords
      .filter(r => r.userId === userId && r.verificationStatus === 'verified')
      .reduce((sum, r) => sum + (Number(r.actualHours) || 0), 0);
  };

  // Helper: Calculate completed events
  const getUserCompletedEventsCount = (userId: string): number => {
    return participationRecords.filter(
      r => r.userId === userId && r.verificationStatus === 'verified' && r.attendanceStatus === 'attended'
    ).length;
  };

  const getUserBadges = (userId: string): VolunteerBadge[] => {
    return volunteerBadges.filter(vb => vb.userId === userId);
  };

  const registerUser = (payload: RegisterUserPayload): { success: boolean; message: string; user?: UserProfile } => {
    // 1. Email uniqueness check
    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: `An account with email ${cleanEmail} already exists. Please sign in instead.` };
    }

    // 2. Password complexity validation (min 8 chars, number, special character)
    if (!payload.password || payload.password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/\d/.test(payload.password)) {
      return { success: false, message: 'Password must include at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(payload.password)) {
      return { success: false, message: 'Password must include at least one special character (e.g. !@#$%^&*).' };
    }

    // 3. Determine role & validate Passkey if elevated role requested
    let assignedRole: UserRole = 'volunteer';
    if (payload.role === 'admin') {
      if (payload.adminPasskey?.trim() !== ADMIN_PASSKEY) {
        addAuditLog({
          actorId: 'system',
          actorName: payload.fullName,
          actorRole: 'volunteer',
          action: 'ESCALATION_ATTEMPT_BLOCKED',
          category: 'auth',
          details: `Unauthorized admin registration attempt for ${payload.email} with invalid passkey`,
        });
        return { 
          success: false, 
          message: 'Security Exception: Invalid Secret Admin Passkey. Role escalation strictly blocked.' 
        };
      }
      assignedRole = 'admin';
    } else if (payload.role === 'staff') {
      if (payload.adminPasskey?.trim() !== STAFF_PASSKEY && payload.adminPasskey?.trim() !== ADMIN_PASSKEY) {
        addAuditLog({
          actorId: 'system',
          actorName: payload.fullName,
          actorRole: 'volunteer',
          action: 'ESCALATION_ATTEMPT_BLOCKED',
          category: 'auth',
          details: `Unauthorized staff registration attempt for ${payload.email} with invalid passkey`,
        });
        return { 
          success: false, 
          message: 'Security Exception: Invalid Secret Staff Passkey. Role escalation strictly blocked.' 
        };
      }
      assignedRole = 'staff';
    }

    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.fullName)}&backgroundColor=2d6a4f,1b4332,40916c`;

    const newUser: UserProfile = {
      id: newId,
      email: cleanEmail,
      password: payload.password,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      role: assignedRole,
      avatarUrl,
      volunteerType: payload.volunteerType,
      college: payload.college?.trim(),
      graduationYear: payload.graduationYear ? Number(payload.graduationYear) : undefined,
      organizationName: payload.organizationName?.trim() || (payload.volunteerType === 'student' ? payload.college?.trim() : undefined),
      skills: payload.skills && payload.skills.length > 0 ? payload.skills : ['Mentorship', 'Volunteering'],
      city: payload.city.trim(),
      bio: payload.bio?.trim() || `${payload.volunteerType.replace('_', ' ')} contributing to educational access.`,
      consent: {
        volunteeringCommunications: payload.consent.volunteeringCommunications ?? true,
        linkedInRecognition: payload.consent.linkedInRecognition ?? false,
        identifiableEmployerAttribution: payload.consent.identifiableEmployerAttribution ?? false,
        lastUpdated: now,
      },
      optOutPublicLeaderboard: false,
      createdAt: now,
      lastActiveAt: now,
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    addAuditLog({
      actorId: newUser.id,
      actorName: newUser.fullName,
      actorRole: newUser.role,
      action: 'USER_REGISTERED',
      category: 'auth',
      details: `New user registered: ${newUser.fullName} as ${newUser.role} (${newUser.volunteerType})`,
      targetId: newUser.id,
      metadata: { role: assignedRole, volunteerType: payload.volunteerType },
    });

    return { 
      success: true, 
      message: `Account created successfully! Welcome to Maatram Connect, ${newUser.fullName}.`, 
      user: newUser 
    };
  };

  const loginUser = (email: string, password?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const target = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!target) {
      return { success: false, message: 'Invalid credentials: No account found with this email address.' };
    }

    if (target.password && password && target.password !== password) {
      return { success: false, message: 'Invalid credentials: Incorrect password.' };
    }

    setCurrentUserId(target.id);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    setUsers(prev => prev.map(u => u.id === target.id ? { ...u, lastActiveAt: new Date().toISOString() } : u));

    addAuditLog({
      actorId: target.id,
      actorName: target.fullName,
      actorRole: target.role,
      action: 'USER_LOGIN',
      category: 'auth',
      details: `${target.fullName} signed in successfully`,
      targetId: target.id,
    });

    return { success: true, message: `Welcome back, ${target.fullName}!` };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'USER_LOGOUT',
      category: 'auth',
      details: `${currentUser.fullName} signed out`,
      targetId: currentUser.id,
    });
  };

  // Profile update
  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, ...profileUpdate, lastActiveAt: new Date().toISOString() };
        }
        return u;
      })
    );
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'PROFILE_UPDATED',
      category: 'auth',
      details: `Profile updated for ${currentUser.fullName}`,
    });
    return { success: true, message: 'Profile updated successfully.' };
  };

  // Role update (Staff/Admin only - prevents self-escalation)
  const updateUserRole = (targetUserId: string, newRole: UserRole) => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Security Exception: Only administrators can modify user roles.' };
    }
    if (currentUser.id === targetUserId && newRole !== 'admin') {
      return { success: false, message: 'Action Prevented: Admin cannot demote themselves to avoid lockout.' };
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.id === targetUserId) {
          return { ...u, role: newRole };
        }
        return u;
      })
    );

    const targetUser = users.find(u => u.id === targetUserId);
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'ROLE_CHANGED',
      category: 'user_role',
      details: `Role for ${targetUser?.fullName || targetUserId} changed to ${newRole}`,
      targetId: targetUserId,
      metadata: { newRole },
    });

    return { success: true, message: `Role updated to ${newRole} successfully.` };
  };

  // Consent management
  const updateUserConsent = (userId: string, consentUpdate: Partial<ConsentPreferences>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const updatedConsent = {
            ...u.consent,
            ...consentUpdate,
            lastUpdated: new Date().toISOString(),
          };
          return { ...u, consent: updatedConsent };
        }
        return u;
      })
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'CONSENT_UPDATED',
      category: 'consent',
      details: `Privacy & Consent preferences updated for ${currentUser.fullName}`,
      targetId: userId,
      metadata: consentUpdate,
    });
  };

  const toggleOptOutLeaderboard = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const newStatus = !u.optOutPublicLeaderboard;
          return { ...u, optOutPublicLeaderboard: newStatus };
        }
        return u;
      })
    );
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'LEADERBOARD_PRIVACY_TOGGLED',
      category: 'consent',
      details: `Public leaderboard visibility changed for user ${userId}`,
    });
  };

  // Opportunity management
  const createOpportunity = (data: Omit<Opportunity, 'id' | 'allocatedCount' | 'createdAt' | 'updatedAt'>) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
      return { success: false, message: 'Unauthorized: Only staff or administrators can create opportunities.' };
    }

    const newOpp: Opportunity = {
      ...data,
      id: `opp-${Date.now()}`,
      allocatedCount: 0,
      leadStaffId: currentUser.id,
      leadStaffName: currentUser.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOpportunities(prev => [newOpp, ...prev]);
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'OPPORTUNITY_CREATED',
      category: 'opportunity',
      details: `Created new opportunity: "${data.title}"`,
      targetId: newOpp.id,
    });

    return { success: true, message: 'Opportunity created successfully.' };
  };

  const updateOpportunity = (id: string, data: Partial<Opportunity>) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
      return { success: false, message: 'Unauthorized: Only staff or administrators can edit opportunities.' };
    }

    setOpportunities(prev =>
      prev.map(opp => {
        if (opp.id === id) {
          return { ...opp, ...data, updatedAt: new Date().toISOString() };
        }
        return opp;
      })
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'OPPORTUNITY_UPDATED',
      category: 'opportunity',
      details: `Updated opportunity ID ${id}`,
      targetId: id,
    });

    return { success: true, message: 'Opportunity updated successfully.' };
  };

  const setOpportunityStatus = (id: string, status: Opportunity['status']) => {
    setOpportunities(prev =>
      prev.map(opp => (opp.id === id ? { ...opp, status, updatedAt: new Date().toISOString() } : opp))
    );
    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'OPPORTUNITY_STATUS_CHANGED',
      category: 'opportunity',
      details: `Status of opportunity ${id} changed to ${status}`,
      targetId: id,
    });
  };

  // Application submission with strict validation
  const applyToOpportunity = (opportunityId: string, motivationNotes: string): { success: boolean; message: string } => {
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) {
      return { success: false, message: 'Error: Opportunity not found.' };
    }

    // 1. Status Check
    if (opp.status !== 'published') {
      return { success: false, message: `Cannot apply: Opportunity is currently ${opp.status}.` };
    }

    // 2. Deadline Check (Prevent expired applications)
    const now = new Date();
    const deadline = new Date(opp.deadline);
    if (now > deadline) {
      return {
        success: false,
        message: `Application Closed: The deadline for this opportunity was ${deadline.toLocaleDateString()}. Late applications cannot be accepted.`,
      };
    }

    // 3. Duplicate Application Check
    const existingApp = applications.find(
      a => a.opportunityId === opportunityId && a.userId === currentUser.id && a.status !== 'withdrawn'
    );
    if (existingApp) {
      return {
        success: false,
        message: `Duplicate Application: You have already submitted an application for "${opp.title}" (Current status: ${existingApp.status}).`,
      };
    }

    // 4. Capacity Overbooking Check
    if (opp.allocatedCount >= opp.capacity) {
      return {
        success: false,
        message: `Capacity Full: This opportunity has reached maximum capacity (${opp.capacity}/${opp.capacity}). No further spots available.`,
      };
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      opportunityCategory: opp.category,
      opportunityStartDate: opp.startDate,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      userType: currentUser.volunteerType,
      organizationName: currentUser.organizationName,
      status: 'pending',
      motivationNotes: motivationNotes.trim() || 'Volunteering with Maatram Foundation to empower scholars.',
      appliedAt: new Date().toISOString(),
    };

    setApplications(prev => [newApp, ...prev]);

    // Send confirmation email (with consent check)
    sendEmailNotification(
      currentUser.id,
      'application_received',
      `Application Received: ${opp.title}`,
      `Dear ${currentUser.fullName}, thank you for stepping forward! Your application for "${opp.title}" has been received and is being reviewed by the Maatram office team.`
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'APPLICATION_SUBMITTED',
      category: 'application',
      details: `Submitted application for "${opp.title}"`,
      targetId: newApp.id,
    });

    return { success: true, message: 'Application submitted successfully! Our office staff will review it shortly.' };
  };

  // Staff review application
  const reviewApplication = (
    applicationId: string, 
    status: 'approved' | 'rejected', 
    internalNotes: string
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only staff members can review applications.' };
    }

    const targetApp = applications.find(a => a.id === applicationId);
    if (!targetApp) {
      return { success: false, message: 'Application not found.' };
    }

    const opp = opportunities.find(o => o.id === targetApp.opportunityId);
    if (status === 'approved' && opp && opp.allocatedCount >= opp.capacity) {
      return { success: false, message: 'Cannot approve: Opportunity is already at full capacity!' };
    }

    const reviewedAt = new Date().toISOString();

    setApplications(prev =>
      prev.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            status,
            internalReviewNotes: internalNotes,
            reviewedByStaffId: currentUser.id,
            reviewedAt,
          };
        }
        return app;
      })
    );

    // If approved, increment allocated count on opportunity and create initial participation record draft
    if (status === 'approved' && opp) {
      setOpportunities(prev =>
        prev.map(o => (o.id === opp.id ? { ...o, allocatedCount: o.allocatedCount + 1 } : o))
      );

      // Check if participation record already exists
      const existingRecord = participationRecords.find(p => p.applicationId === applicationId);
      if (!existingRecord) {
        const applicantUser = users.find(u => u.id === targetApp.userId);
        const newRecord: ParticipationRecord = {
          id: `rec-${Date.now()}`,
          applicationId,
          opportunityId: opp.id,
          opportunityTitle: opp.title,
          opportunityCategory: opp.category,
          userId: targetApp.userId,
          userName: targetApp.userName,
          userEmail: targetApp.userEmail,
          organizationId: applicantUser?.organizationId,
          organizationName: applicantUser?.organizationName,
          eventDate: opp.startDate.split('T')[0],
          allocatedHours: 6.0,
          actualHours: 0,
          attendanceStatus: 'pending',
          verificationStatus: 'pending',
          createdAt: new Date().toISOString(),
        };
        setParticipationRecords(prev => [newRecord, ...prev]);
      }

      // Send approval email
      sendEmailNotification(
        targetApp.userId,
        'application_approved',
        `Approved: Your application for "${targetApp.opportunityTitle}"`,
        `Congratulations ${targetApp.userName}! You have been selected to volunteer for "${targetApp.opportunityTitle}". Please report at the specified venue/online link on time.`
      );
    } else if (status === 'rejected') {
      sendEmailNotification(
        targetApp.userId,
        'application_rejected',
        `Update on your application for "${targetApp.opportunityTitle}"`,
        `Dear ${targetApp.userName}, thank you for your interest. On this occasion, we are unable to accept your application. Reason: ${internalNotes || 'Event capacity constraints'}.`
      );
    }

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: status === 'approved' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
      category: 'application',
      details: `${status.toUpperCase()} application for ${targetApp.userName} (${targetApp.opportunityTitle}). Notes: ${internalNotes}`,
      targetId: applicationId,
    });

    return { success: true, message: `Application ${status} successfully.` };
  };

  // Hour verification by staff
  const verifyHours = (
    recordId: string,
    actualHours: number,
    attendanceStatus: ParticipationRecord['attendanceStatus'],
    feedback: string
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only staff or administrators can verify volunteering hours.' };
    }

    const record = participationRecords.find(r => r.id === recordId);
    if (!record) {
      return { success: false, message: 'Participation record not found.' };
    }

    const verifiedAt = new Date().toISOString();

    setParticipationRecords(prev =>
      prev.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            actualHours,
            attendanceStatus,
            verificationStatus: 'verified',
            verifiedByStaffId: currentUser.id,
            verifiedByStaffName: currentUser.fullName,
            verifiedAt,
            staffFeedback: feedback,
          };
        }
        return r;
      })
    );

    // Auto-check badges for the volunteer
    const newTotalHours = getUserVerifiedHours(record.userId) + actualHours;
    BADGES.forEach(badge => {
      if (badge.category === 'hours' && newTotalHours >= badge.thresholdValue) {
        // Check if already earned
        const alreadyEarned = volunteerBadges.some(vb => vb.userId === record.userId && vb.badgeId === badge.id);
        if (!alreadyEarned) {
          const newVb: VolunteerBadge = {
            id: `vb-${Date.now()}-${badge.id}`,
            userId: record.userId,
            badgeId: badge.id,
            earnedAt: new Date().toISOString(),
            badge,
          };
          setVolunteerBadges(b => [...b, newVb]);
        }
      }
    });

    // Notify volunteer
    sendEmailNotification(
      record.userId,
      'hours_verified',
      `Thank You! ${actualHours} Volunteering Hours Officially Verified`,
      `Dear ${record.userName}, your contribution of ${actualHours} hours for "${record.opportunityTitle}" has been verified by ${currentUser.fullName}. Thank you for making a lasting difference!`
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'HOURS_VERIFIED',
      category: 'verification',
      details: `Verified ${actualHours} hours for ${record.userName} (${record.opportunityTitle})`,
      targetId: recordId,
      metadata: { actualHours, attendanceStatus },
    });

    return { success: true, message: `Successfully verified ${actualHours} hours for ${record.userName}.` };
  };

  const rejectHours = (recordId: string, reason: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only staff or administrators can reject hours.' };
    }

    const record = participationRecords.find(r => r.id === recordId);
    if (!record) {
      return { success: false, message: 'Participation record not found.' };
    }

    setParticipationRecords(prev =>
      prev.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            actualHours: 0,
            attendanceStatus: 'absent',
            verificationStatus: 'rejected',
            verifiedByStaffId: currentUser.id,
            verifiedByStaffName: currentUser.fullName,
            verifiedAt: new Date().toISOString(),
            staffFeedback: reason || 'Did not participate / Hours rejected by coordinator',
          };
        }
        return r;
      })
    );

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'HOURS_REJECTED',
      category: 'verification',
      details: `Rejected hours for ${record.userName} (${record.opportunityTitle}). Reason: ${reason}`,
      targetId: recordId,
    });

    return { success: true, message: 'Hours rejected. Zero hours added.' };
  };

  // Availability preferences
  const saveAvailability = (pref: Omit<AvailabilityPreference, 'id' | 'updatedAt'>) => {
    const existing = availabilities.find(a => a.userId === pref.userId);
    const now = new Date().toISOString();

    if (existing) {
      setAvailabilities(prev =>
        prev.map(a => (a.userId === pref.userId ? { ...a, ...pref, updatedAt: now } : a))
      );
    } else {
      const newPref: AvailabilityPreference = {
        ...pref,
        id: `avail-${Date.now()}`,
        updatedAt: now,
      };
      setAvailabilities(prev => [...prev, newPref]);
    }

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'AVAILABILITY_UPDATED',
      category: 'opportunity',
      details: `Interview availability slots updated`,
      targetId: pref.userId,
    });

    return { success: true, message: 'Availability preferences saved successfully.' };
  };

  // Email sending with strict consent check & server-side dispatch
  const sendEmailNotification = (
    recipientUserId: string,
    templateType: EmailLog['templateType'],
    subject: string,
    content: string,
    options?: {
      customEmail?: string;
      customName?: string;
      details?: Record<string, any>;
    }
  ): {
    success: boolean;
    message: string;
    blockedByConsent?: boolean;
    deliveryMethod?: 'resend_api' | 'simulator' | 'gmail_client' | 'mailto';
    gmailUrl?: string;
    mailtoUrl?: string;
    messageId?: string;
    recipientEmail?: string;
  } => {
    const isCustom = recipientUserId === 'custom' || !!options?.customEmail;
    const recipient = users.find(u => u.id === recipientUserId);

    if (!isCustom && !recipient) {
      return { success: false, message: 'Recipient persona not found.' };
    }

    // CHECK CONSENT: If known registered user, strictly enforce Volunteering Communications consent
    if (recipient && !recipient.consent.volunteeringCommunications) {
      const blockedLog: EmailLog = {
        id: `mail-blocked-${Date.now()}`,
        recipientEmail: recipient.email,
        recipientName: recipient.fullName,
        subject,
        templateType,
        contentSnippet: content.slice(0, 100) + '...',
        sentAt: new Date().toISOString(),
        provider: 'simulator',
        status: 'blocked_by_consent',
        blockedReason: 'Recipient explicitly opted out of volunteering-related email communications.',
        deliveryMethod: 'simulator',
      };
      setEmailLogs(prev => [blockedLog, ...prev]);

      addAuditLog({
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'EMAIL_BLOCKED_BY_CONSENT',
        category: 'email',
        details: `Outbound email to ${recipient.email} blocked due to active consent refusal.`,
        targetId: recipient.id,
      });

      return {
        success: false,
        blockedByConsent: true,
        message: `Email blocked: ${recipient.fullName} has opted out of volunteering communications.`,
        recipientEmail: recipient.email,
      };
    }

    const targetEmail = options?.customEmail?.trim() || recipient?.email || 'dharunprasath365@gmail.com';
    const targetName = options?.customName?.trim() || recipient?.fullName || targetEmail.split('@')[0];

    // Generate responsive HTML template and text fallback
    const { html, text } = generateEmailContent({
      recipientName: targetName,
      recipientEmail: targetEmail,
      templateType,
      subject,
      details: options?.details,
      customBody: content,
    });

    const gmailUrl = generateGmailUrl(targetEmail, subject, text);
    const mailtoUrl = generateMailtoUrl(targetEmail, subject, text);

    const logId = `mail-${Date.now()}`;
    const newLog: EmailLog = {
      id: logId,
      recipientEmail: targetEmail,
      recipientName: targetName,
      subject,
      templateType,
      contentSnippet: content.slice(0, 120) + '...',
      sentAt: new Date().toISOString(),
      provider: 'resend_api',
      status: 'sent',
      deliveryMethod: 'resend_api',
      gmailUrl,
      mailtoUrl,
      htmlContent: html,
    };

    setEmailLogs(prev => [newLog, ...prev]);

    // Dispatch asynchronous call to secure server proxy
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetEmail,
        subject,
        html,
        text,
        recipientName: targetName,
        templateType,
      }),
    })
      .then(async res => {
        const data = await res.json().catch(() => ({}));
        if (data.success && data.configured && data.messageId) {
          // Delivered live via Resend API
          setEmailLogs(prev =>
            prev.map(l =>
              l.id === logId
                ? {
                    ...l,
                    messageId: data.messageId,
                    provider: 'resend_api',
                    deliveryMethod: 'resend_api',
                  }
                : l
            )
          );
        } else if (data.simulated || !data.configured) {
          // Resend key not set in environment - record simulator / client-assisted
          setEmailLogs(prev =>
            prev.map(l =>
              l.id === logId
                ? {
                    ...l,
                    provider: 'simulator',
                    deliveryMethod: 'gmail_client',
                  }
                : l
            )
          );
        } else if (!data.success) {
          setEmailLogs(prev =>
            prev.map(l =>
              l.id === logId
                ? {
                    ...l,
                    status: 'failed',
                    blockedReason: data.error || 'Server dispatch error',
                  }
                : l
            )
          );
        }
      })
      .catch(err => {
        console.warn('[Email proxy call network issue]', err);
      });

    addAuditLog({
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'EMAIL_SENT',
      category: 'email',
      details: `Dispatched email "${subject}" to ${targetEmail} (${templateType})`,
      targetId: recipient?.id || 'custom',
    });

    return {
      success: true,
      message: `Email dispatched to ${targetEmail}. Ready for delivery via Resend / Gmail.`,
      deliveryMethod: 'resend_api',
      recipientEmail: targetEmail,
      gmailUrl,
      mailtoUrl,
    };
  };

  // Reset demo data to pristine state
  const resetDemoData = () => {
    localStorage.removeItem('maatram_users');
    localStorage.removeItem('maatram_current_user_id');
    localStorage.removeItem('maatram_opportunities');
    localStorage.removeItem('maatram_applications');
    localStorage.removeItem('maatram_participation');
    localStorage.removeItem('maatram_availabilities');
    localStorage.removeItem('maatram_volunteer_badges');
    localStorage.removeItem('maatram_audit_logs');
    localStorage.removeItem('maatram_email_logs');

    setUsers(ALL_USERS);
    setCurrentUserId('vol-1');
    setOrganizations(ORGANIZATIONS);
    setOpportunities(OPPORTUNITIES);
    setApplications(INITIAL_APPLICATIONS);
    setParticipationRecords(INITIAL_PARTICIPATION_RECORDS);
    setAvailabilities(INITIAL_AVAILABILITIES);
    setVolunteerBadges(INITIAL_VOLUNTEER_BADGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setEmailLogs(INITIAL_EMAIL_LOGS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialTab,
        openAuthModal,
        registerUser,
        loginUser,
        logoutUser,
        users,
        organizations,
        opportunities,
        applications,
        participationRecords,
        availabilities,
        badges: BADGES,
        volunteerBadges,
        auditLogs,
        emailLogs,
        updateUserProfile,
        updateUserRole,
        updateUserConsent,
        toggleOptOutLeaderboard,
        createOpportunity,
        updateOpportunity,
        setOpportunityStatus,
        applyToOpportunity,
        reviewApplication,
        verifyHours,
        rejectHours,
        saveAvailability,
        sendEmailNotification,
        getUserVerifiedHours,
        getUserCompletedEventsCount,
        getUserBadges,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
