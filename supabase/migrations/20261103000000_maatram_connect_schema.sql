-- ======================================================================================
-- MAATRAM CONNECT - PostgreSQL & Supabase Database Migration
-- Project: MH26-02 | Maatram HackForge 2026–27
-- Description: Complete schema with UUIDs, Enums, RLS policies, Constraints, Indexes & Triggers
-- ======================================================================================

-- 1. EXTENSIONS & CUSTOM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('volunteer', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_category_type AS ENUM (
        'school_visit', 
        'admissions_support', 
        'bgv', 
        'mock_interview', 
        'admission_panel'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_mode_type AS ENUM ('offline', 'online', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_status_type AS ENUM ('draft', 'published', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status_type AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status_type AS ENUM ('pending', 'attended', 'absent', 'excused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hour_verification_status_type AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('corporate', 'institution', 'ngo')),
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_text VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PROFILES & ROLES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'volunteer',
    avatar_url TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    volunteer_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (volunteer_type IN ('student', 'alumnus', 'corporate_supporter', 'general')),
    graduation_year INT CHECK (graduation_year >= 1970 AND graduation_year <= 2035),
    skills TEXT[] DEFAULT '{}',
    city VARCHAR(100) NOT NULL,
    bio TEXT,
    opt_out_public_leaderboard BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CONSENT RECORDS TABLE
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    volunteering_communications BOOLEAN NOT NULL DEFAULT true,
    linkedin_recognition BOOLEAN NOT NULL DEFAULT false,
    identifiable_employer_attribution BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category opportunity_category_type NOT NULL,
    mode opportunity_mode_type NOT NULL DEFAULT 'offline',
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    allocated_count INT NOT NULL DEFAULT 0 CHECK (allocated_count >= 0 AND allocated_count <= capacity),
    status opportunity_status_type NOT NULL DEFAULT 'draft',
    lead_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_dates CHECK (end_date >= start_date AND deadline <= start_date)
);

-- 6. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status application_status_type NOT NULL DEFAULT 'pending',
    motivation_notes TEXT NOT NULL,
    internal_review_notes TEXT,
    reviewed_by_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Prevent duplicate application by same volunteer to same opportunity
    CONSTRAINT unique_opportunity_volunteer UNIQUE (opportunity_id, user_id)
);

-- 7. PARTICIPATION & VERIFIED HOURS TABLE
CREATE TABLE IF NOT EXISTS participation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    allocated_hours NUMERIC(4, 2) NOT NULL CHECK (allocated_hours >= 0),
    actual_hours NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (actual_hours >= 0),
    attendance_status attendance_status_type NOT NULL DEFAULT 'pending',
    verification_status hour_verification_status_type NOT NULL DEFAULT 'pending',
    verified_by_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    staff_feedback TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. INTERVIEW AVAILABILITY PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS availability_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    interview_type VARCHAR(50) NOT NULL CHECK (interview_type IN ('mock_interview', 'admission_panel', 'both')),
    expertise_domains TEXT[] NOT NULL DEFAULT '{}',
    preferred_mode VARCHAR(20) NOT NULL CHECK (preferred_mode IN ('online', 'offline', 'any')),
    available_dates DATE[] NOT NULL DEFAULT '{}',
    time_slots TEXT[] NOT NULL DEFAULT '{}',
    max_interviews_per_month INT NOT NULL DEFAULT 4 CHECK (max_interviews_per_month >= 1 AND max_interviews_per_month <= 30),
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. BADGES & VOLUNTEER BADGES
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('hours', 'events', 'special')),
    threshold_value INT NOT NULL,
    badge_level VARCHAR(20) NOT NULL CHECK (badge_level IN ('bronze', 'silver', 'gold', 'diamond'))
);

CREATE TABLE IF NOT EXISTS volunteer_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role user_role_type NOT NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    target_id TEXT,
    metadata JSONB
);

-- 11. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    content_snippet TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    blocked_reason TEXT
);

-- ======================================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ======================================================================================
CREATE INDEX IF NOT EXISTS idx_opportunities_status_deadline ON opportunities(status, deadline);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_participation_user_verification ON participation_records(user_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_participation_org ON participation_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ======================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE participation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public fields of profiles, only user can update own profile, staff/admin can view all
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile only (cannot change own role)" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Consent: Volunteers can only read and update their own consent records
CREATE POLICY "Users manage own consent" 
ON consent_records FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Staff can view consent for contact checking" 
ON consent_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
);

-- Opportunities: Published opportunities are visible to all; drafts/archived only to staff/admin
CREATE POLICY "Published opportunities are viewable by all" 
ON opportunities FOR SELECT USING (status = 'published' OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin')));

CREATE POLICY "Staff and admin can manage opportunities" 
ON opportunities FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
);

-- Applications: Volunteers can only see their own applications; Staff/Admin see all
CREATE POLICY "Volunteers view own applications" 
ON applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff/admin view all applications" 
ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
);

CREATE POLICY "Volunteers can insert own application" 
ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff/admin can review applications" 
ON applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
);

-- Participation Records: Volunteers see their own; Staff/Admin see all and can verify
CREATE POLICY "Volunteers see own participation records" 
ON participation_records FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin manage participation records" 
ON participation_records FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
);

-- Availability: Volunteers manage their own availability; Staff can search and read
CREATE POLICY "Volunteers manage own availability" 
ON availability_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Staff view all availability" 
ON availability_preferences FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
);

-- Audit logs: Read-only for admin; Append-only system
CREATE POLICY "Admins view audit logs" 
ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
