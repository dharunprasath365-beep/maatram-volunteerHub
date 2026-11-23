export type UserRole = 'volunteer' | 'staff' | 'admin';

export type OpportunityCategory = 
  | 'school_visit' 
  | 'admissions_support' 
  | 'bgv' 
  | 'mock_interview' 
  | 'admission_panel';

export type OpportunityMode = 'offline' | 'online' | 'hybrid';

export type OpportunityStatus = 'draft' | 'published' | 'closed' | 'archived';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export type AttendanceStatus = 'pending' | 'attended' | 'absent' | 'excused';

export type HourVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface ConsentPreferences {
  volunteeringCommunications: boolean; // Consent to receive emails/calls about volunteering
  linkedInRecognition: boolean;        // Consent for LinkedIn shoutout & sharing
  identifiableEmployerAttribution: boolean; // Consent for organization report to list name vs anonymous
  lastUpdated: string;
}

export interface AvailabilityPreference {
  id: string;
  userId: string;
  interviewType: 'mock_interview' | 'admission_panel' | 'both';
  expertiseDomains: string[]; // e.g. ['Software Engineering', 'Data Science', 'Human Resources', 'Civil/Mech', 'Foundational English']
  preferredMode: 'online' | 'offline' | 'any';
  availableDates: string[];   // ISO dates or date strings
  timeSlots: string[];        // e.g. ['Morning (9am-12pm)', 'Afternoon (1pm-4pm)', 'Evening (5pm-8pm)']
  maxInterviewsPerMonth: number;
  notes?: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  organizationId?: string;
  organizationName?: string;
  college?: string;
  volunteerType: 'student' | 'alumnus' | 'corporate_supporter' | 'general';
  graduationYear?: number;
  skills: string[];
  city: string;
  bio?: string;
  consent: ConsentPreferences;
  optOutPublicLeaderboard: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface RegisterUserPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  volunteerType: 'student' | 'alumnus' | 'corporate_supporter';
  college?: string;
  graduationYear?: number;
  organizationName?: string;
  skills: string[];
  bio?: string;
  adminPasskey?: string;
  role?: UserRole;
  consent: {
    volunteeringCommunications: boolean;
    linkedInRecognition: boolean;
    identifiableEmployerAttribution: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  type: 'corporate' | 'institution' | 'ngo';
  contactPerson: string;
  contactEmail: string;
  logoText: string;
  totalVolunteers: number;
  totalVerifiedHours: number;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  mode: OpportunityMode;
  location: string;
  description: string;
  requirements: string[];
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  deadline: string; // ISO date string
  capacity: number;
  allocatedCount: number;
  status: OpportunityStatus;
  leadStaffId: string;
  leadStaffName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityCategory: OpportunityCategory;
  opportunityStartDate: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  userType: 'student' | 'alumnus' | 'corporate_supporter' | 'general';
  organizationName?: string;
  status: ApplicationStatus;
  motivationNotes: string;
  internalReviewNotes?: string;
  reviewedByStaffId?: string;
  reviewedAt?: string;
  appliedAt: string;
}

export interface ParticipationRecord {
  id: string;
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityCategory: OpportunityCategory;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId?: string;
  organizationName?: string;
  eventDate: string;
  allocatedHours: number;
  actualHours: number;
  attendanceStatus: AttendanceStatus;
  verificationStatus: HourVerificationStatus;
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  staffFeedback?: string;
  notes?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  category: 'hours' | 'events' | 'special';
  thresholdValue: number;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export interface VolunteerBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category: 'auth' | 'application' | 'verification' | 'consent' | 'opportunity' | 'user_role' | 'email';
  details: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  templateType: 'application_received' | 'application_approved' | 'application_rejected' | 'hours_verified' | 'interview_assigned';
  contentSnippet: string;
  sentAt: string;
  provider: 'resend_api' | 'simulator';
  status: 'sent' | 'blocked_by_consent' | 'failed';
  blockedReason?: string;
  messageId?: string;
  deliveryMethod?: 'resend_api' | 'simulator' | 'gmail_client' | 'mailto';
  gmailUrl?: string;
  mailtoUrl?: string;
  htmlContent?: string;
}
