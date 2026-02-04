import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CustomizationProvider } from './contexts/Customization';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { HomePage } from './components/pages/HomePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ClansPage } from './components/pages/ClansPage';
import { LeadersPage } from './components/pages/LeadersPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { UserCustomizationPage } from './components/pages/UserCustomizationPage';
import { WelcomePage } from './components/pages/WelcomePage';
import { FocusTasksPage } from './components/pages/FocusTasksPage';
import { ProgressPage } from './components/pages/ProgressPage';
import { useAuth } from './hooks/useAuth';

function HomeRoute() {
  const { user } = useAuth();
  if (user && user.has_seen_welcome === false) {
    return <Navigate to="/welcome" replace />;
  }
  return <HomePage />;
}

function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <div className={isSidebarOpen ? 'pl-28' : 'pl-6'}>
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CustomizationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <HomeRoute />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/welcome"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <WelcomePage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route path="/focus" element={<Navigate to="/quests" replace />} />
            <Route
              path="/quests"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <FocusTasksPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clans"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <ClansPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/leaders"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <LeadersPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <ProgressPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <AchievementsPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <UserCustomizationPage />
                  </AppLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CustomizationProvider>
    </AuthProvider>
  );
}
export default App;