import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CustomizationProvider } from './contexts/Customization';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { HomePage } from './components/pages/HomePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { WelcomePage } from './components/pages/WelcomePage';
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
<<<<<<< HEAD
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
=======
>>>>>>> 7d5d50b69d2952ea275d05782d711d2549c59957
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, []);
  return (
<<<<<<< HEAD
    <div className={`relative min-h-screen ${isLight ? 'ow-theme-light' : 'ow-theme-dark'}`}>
      {settings.background === 'dynamic' && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <video
            className="w-full h-full object-cover opacity-20 sm:opacity-25"
            autoPlay
            muted
            loop
            playsInline
            poster="/neon-background.mp4"
          >
            <source src="/neon-background.mp4" type="video/mp4" />
          </video>
        </div>
      )}
=======
    <div className="relative min-h-screen">
>>>>>>> 7d5d50b69d2952ea275d05782d711d2549c59957
      <div className="relative z-10">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Закрыть боковую панель"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />
        )}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className={`${isSidebarOpen ? 'md:ml-28' : ''} px-4 sm:px-6 md:px-8`}>
          {children}
        </div>
      </div>
    </div>
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
              path="/achievements"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <AchievementsPage />
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
