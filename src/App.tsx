/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { OpportunityList } from './components/opportunities/OpportunityList';
import { ApplicationQueue } from './components/applications/ApplicationQueue';
import { HourVerificationQueue } from './components/verification/HourVerificationQueue';
import { InterviewMatcher } from './components/interview/InterviewMatcher';
import { LeaderboardView } from './components/gamification/LeaderboardView';
import { AlumniAnalytics } from './components/analytics/AlumniAnalytics';
import { EmployerReports } from './components/analytics/EmployerReports';
import { ConsentManager } from './components/privacy/ConsentManager';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAccessDenied } from './components/common/AdminAccessDenied';
import { TestSuiteModal } from './components/test/TestSuiteModal';
import { AuthModal } from './components/auth/AuthModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);
  const { currentUser } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            setActiveTab={setActiveTab}
            onOpenTestSuite={() => setIsTestSuiteOpen(true)}
          />
        );
      case 'opportunities':
        return <OpportunityList />;
      case 'applications':
        return <ApplicationQueue />;
      case 'verification':
        return <HourVerificationQueue />;
      case 'interview_matcher':
        return <InterviewMatcher />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'alumni_analytics':
        return <AlumniAnalytics />;
      case 'employer_reports':
        return <EmployerReports />;
      case 'privacy_consent':
        return <ConsentManager />;
      case 'admin_insights':
        if (currentUser.role !== 'admin') {
          return (
            <AdminAccessDenied
              featureName="Personal Volunteer Insights & Intelligence"
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          );
        }
        return <AdminDashboard initialSubTab="personal_insights" />;
      case 'admin_users':
        if (currentUser.role !== 'admin') {
          return (
            <AdminAccessDenied
              featureName="User & Role Governance"
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          );
        }
        return <AdminDashboard initialSubTab="users" />;
      case 'audit_logs':
        if (currentUser.role !== 'admin') {
          return (
            <AdminAccessDenied
              featureName="Audit Trail Logs"
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          );
        }
        return <AdminDashboard initialSubTab="audit" />;
      case 'integrations':
        if (currentUser.role !== 'admin') {
          return (
            <AdminAccessDenied
              featureName="Email & API Integrations"
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          );
        }
        return <AdminDashboard initialSubTab="integrations" />;
      case 'database_schema':
        if (currentUser.role !== 'admin') {
          return (
            <AdminAccessDenied
              featureName="Database Migrations & Schema"
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          );
        }
        return <AdminDashboard initialSubTab="database" />;
      default:
        return (
          <DashboardOverview
            setActiveTab={setActiveTab}
            onOpenTestSuite={() => setIsTestSuiteOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col text-[#1E2922]">
      {/* Top Navbar */}
      <Navbar
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onOpenMobileMenu={() => setIsMobileOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        />

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Automated Regression Test Suite Modal */}
      {isTestSuiteOpen && (
        <TestSuiteModal
          isOpen={isTestSuiteOpen}
          onClose={() => setIsTestSuiteOpen(false)}
        />
      )}

      {/* Authentication & Account Creation Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
