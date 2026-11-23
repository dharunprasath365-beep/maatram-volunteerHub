# Maatram Connect — Volunteering & Community Impact Portal
**Track: MH26-02 | Maatram HackForge 2026–27**  
*A comprehensive volunteering portal built for Maatram Foundation to connect students, alumni, corporate supporters, and office coordinators.*

---

## 🌟 Overview & Purpose

**Maatram Foundation** bridges educational opportunities for deserving, first-generation college students across rural Tamil Nadu.  
**Maatram Connect** provides an end-to-end digital ecosystem for:
- Discovering verified volunteering opportunities (School awareness tours, admissions support, background verification visits [BGV], mock interviews, and scholarship admission panels).
- Applying to drives with automatic duplicate prevention, deadline enforcement, and capacity safeguards.
- Verifying on-ground service hours with strict isolation (pending or rejected hours never count towards totals or rankings until verified).
- Matching interviewer availability while respecting communication consent.
- Tracking alumni engagement trends and corporate CSR employer contributions with identity protection.
- Upholding strict privacy and consent governance with immutable audit logging.

---

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Design System**: Nonprofit forest green (`#1B4332`, `#2D6A4F`), off-white (`#F8FAF8`), and charcoal slate (`#1E2922`), responsive layout with Lucide icons.
- **Database & Auth**: PostgreSQL schemas with Row-Level Security (RLS) policies, UUIDs, constraints, and triggers (`/supabase/migrations/20261103000000_maatram_connect_schema.sql`).
- **Analytics & Visualizations**: Recharts for monthly participation trends, CSR category breakdowns, and alumni cohorts.
- **Outbound Email & Communications**: Resend Email API integration with server-side simulator and consent enforcement.
- **Testing & Quality Assurance**: Built-in interactive 10-point test runner validating permissions, capacity bounds, and calculation integrity.

---

## 🔐 Authentication, Account Creation & Role Governance

Users can create accounts and sign in through the **Sign In / Create Account** modal:
- **Student Volunteers**: Register with Full Name, Email, Phone, Password, College/Institution Name, Expected Graduation Year, and Skills.
- **Alumni Volunteers**: Register with Maatram Graduation Batch Year, Current Employer/Affiliation, and Mentorship Interests.
- **Corporate Supporters**: Register with corporate partner selection (Cognizant, Zoho, Freshworks, etc.).
- **Administrator & Staff Creation**:
  - Requires a verified **Secret Access Passkey**:
    - Administrator Passkey: `MAATRAM_ADMIN_2026`
    - Staff Coordinator Passkey: `MAATRAM_STAFF_2026`
  - Any registration attempt with an invalid or blank passkey strictly prevents role escalation and logs an `ESCALATION_ATTEMPT_BLOCKED` audit entry.

### 👥 Demo Personas Quick-Switcher
Switch between pre-seeded personas instantly via the top-right **Persona Switcher**:
1. **Volunteer (Corporate Supporter)**: `Karthik Subramanian` (Cognizant Outreach • 21 verified hours • Silver badge)
2. **Volunteer (Alumnus)**: `Dinesh Kumar` (Anna University Chapter • BGV Specialist)
3. **Volunteer (Student)**: `Kavya Lakshman` (B.Tech Scholar • Event Coordinator)
4. **Volunteer (Privacy Opted-Out)**: `Saravanan Muthuraj` (Withdrawn communications consent • Hidden from public leaderboard)
5. **Office Staff**: `Shanthi Sundararajan` (Lead Volunteer Coordinator • Application & Hours Verification)
6. **Administrator**: `Sujith Kumar` (Managing Trustee • Role Governance & Audit Logs)

---

## 🚀 Key Functional Modules

### 1. Opportunities & Application Lifecycle
- Categorized by **School Visits**, **Admissions Support**, **Background Verification (BGV)**, **Mock Interviews**, and **Admission Panels**.
- Modes: **In-Person (Offline)**, **Virtual (Online)**, and **Hybrid**.
- **Guardrails**:
  - Duplicate application prevention (users cannot apply twice to the same drive).
  - Expired deadline rejection (opportunities past their deadline block new submissions).
  - Capacity overbooking block (opportunities at max capacity prevent new applicants).

### 2. Contribution Tracking & Hours Verification
- Staff review attendance (`Attended`, `Absent`, `Excused`) and input actual hours worked.
- **Strict calculation rule**: Only records where `verificationStatus === 'verified'` are counted. Pending or rejected hours strictly contribute 0 hours to totals or rankings.
- One-click official **Impact Certificate** generation for volunteers.

### 3. Interview Availability & Matcher
- Volunteers specify preferred interview types, expertise domains, preferred mode, and monthly slots.
- Staff directory categorizes interviewers into:
  - `Available & Consented`
  - `Unknown Availability`
  - `Contact Not Permitted` (consent check prevents outbound emails if communication consent is withdrawn).

### 4. Alumni Analytics
- Configurable reporting windows: Last 30, 60, 90, 180, 365 days, and All-Time.
- Monthly participation area charts and returning volunteer metrics.
- **Operational Indicator Policy**: Alumni inactivity is tracked purely for internal scheduling; automated outreach to flagged individuals is strictly prevented.

### 5. Employer Reports & Identity Protection
- Aggregated CSR summaries for partner organizations (Cognizant, Zoho, Freshworks, Anna University, PSG Tech).
- Live CSV download.
- Volunteers who withheld `identifiableEmployerAttribution` consent are masked as anonymous contributors.

### 6. Granular Privacy & Consent Governance
- Independent toggles for:
  - Volunteering communications (emails & schedule reminders)
  - Public LinkedIn recognition & share posts
  - Identifiable employer attribution in corporate reports
  - Public leaderboard visibility
- Real-time timestamp updates and immutable audit logging.

### 7. Personal Insights & Volunteer Intelligence (Admin Exclusive)
- **Role Boundary**: Cross-volunteer personal dossiers, individual attendance reliability rates, operational inactivity indicators, private contact details, and coordinator review notes are strictly accessible **ONLY to Administrators**.
- **Privacy Shield**: If a non-admin (Student Volunteer, Alumni Volunteer, or Staff) attempts to access the Personal Insights tab, an impenetrable `AdminAccessDenied` shield is displayed, explaining that volunteer dossiers are protected under PostgreSQL Row Level Security (RLS) policies.
- **Volunteer Isolation**: Standard volunteers can only view their own personal impact, applications, and verified certificates through the *Verified Hours & Impact* and *My Applications* modules.
- **Intelligence Features**:
  - Breakdown by volunteer classification (Student vs Alumni)
  - Attendance reliability progress tracking (% of events attended vs dropped/absent)
  - Inactivity/burnout risk operational flags (with strict prohibition of automated outreach)
  - Expandable confidential coordinator notes and staff application evaluations
  - Real-time consent compliance tracking across communications, LinkedIn, and employer attribution.

### 8. Automated In-App Test Suite
- Comprehensive automated regression test runner accessible via the top navigation bar executing 14 verified test cases:
  1. Privilege Escalation Prevention
  2. Duplicate Application Prevention
  3. Expired Deadline Enforcement
  4. Capacity Overbooking Prevention
  5. Verified Hours Isolation (Pending & Rejected hours)
  6. Communications Consent Enforcement
  7. Leaderboard & Recognition Privacy Opt-Out
  8. Employer Report Identity Protection
  9. Alumni Inactivity Guard
  10. Immutable Audit Trail Logging
  11. User Account Registration & Role Classification (Student vs Alumni)
  12. Secret Passkey Anti-Escalation Barrier
  13. Password Complexity Security Standards (Length, digits, special characters)
  14. Personal Insights Admin-Exclusive Access Boundary

---

## 🗄️ Database Setup & Migrations

The complete, production-ready PostgreSQL migration script is available in:
```
/supabase/migrations/20261103000000_maatram_connect_schema.sql
```

To apply to your Supabase project:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `20261103000000_maatram_connect_schema.sql`.
3. Click **Run**. All enums, tables, foreign keys, indexes, and RLS policies will be created automatically.

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/your-org/maatram-connect.git
cd maatram-connect

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` to access the portal.

---

## 📄 License
Licensed under Apache 2.0. Built for Maatram HackForge 2026–27 (MH26-02).
