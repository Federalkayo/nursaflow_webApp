import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { LayoutWrapper } from './components/layout/LayoutWrapper';

// Page Imports
import { Login } from './pages/auth/Login';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AcademicTrackerPage } from './pages/academic/AcademicTrackerPage';
import { StudyHubPage } from './pages/study/StudyHubPage';
import { SubjectsPage } from './pages/study/SubjectsPage';
import { FlashcardsPage } from './pages/study/FlashcardsPage';
import { QuizzesPage } from './pages/study/QuizzesPage';
import { StudyPlansPage } from './pages/study/StudyPlansPage';
import { NotesPage } from './pages/study/NotesPage';
import { CommunityFeedPage } from './pages/community/CommunityFeedPage';
import { GroupsPage } from './pages/community/GroupsPage';
import { DirectChatPage } from './pages/community/DirectChatPage';
import { ClinicalToolsDashboard } from './pages/clinical/ClinicalToolsDashboard';
import { DosageCalculator } from './pages/clinical/DosageCalculator';
import { IvFlowCalculator } from './pages/clinical/IvFlowCalculator';
import { BmiCalculator } from './pages/clinical/BmiCalculator';
import { GcsCalculator } from './pages/clinical/GcsCalculator';
import { ApgarCalculator } from './pages/clinical/ApgarCalculator';
import { UnitConverter } from './pages/clinical/UnitConverter';
import { AiTutorPage } from './pages/ai-tutor/AiTutorPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { PaymentCallbackPage } from './pages/payment/PaymentCallbackPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Academic Tracker Routes */}
        <Route path="/academic" element={<AcademicTrackerPage />} />
        <Route path="/academic/semester/:id" element={<AcademicTrackerPage />} />

        {/* Nursing Study System Routes */}
        <Route path="/study" element={<StudyHubPage />} />
        <Route path="/study/subjects" element={<SubjectsPage />} />
        <Route path="/study/flashcards" element={<FlashcardsPage />} />
        <Route path="/study/quizzes" element={<QuizzesPage />} />
        <Route path="/study/plans" element={<StudyPlansPage />} />
        <Route path="/study/notes" element={<NotesPage />} />

        {/* Community Routes */}
        <Route path="/community" element={<CommunityFeedPage />} />
        <Route path="/community/groups" element={<GroupsPage />} />
        <Route path="/community/chat" element={<DirectChatPage />} />

        {/* Clinical Tools Routes */}
        <Route path="/clinical" element={<ClinicalToolsDashboard />} />
        <Route path="/clinical/dosage" element={<DosageCalculator />} />
        <Route path="/clinical/iv-flow" element={<IvFlowCalculator />} />
        <Route path="/clinical/bmi" element={<BmiCalculator />} />
        <Route path="/clinical/gcs" element={<GcsCalculator />} />
        <Route path="/clinical/apgar" element={<ApgarCalculator />} />
        <Route path="/clinical/converter" element={<UnitConverter />} />

        {/* AI Tutor, Profile & Subscription Routes */}
        <Route path="/ai-tutor" element={<AiTutorPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/payment/callback" element={<PaymentCallbackPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </LayoutWrapper>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
