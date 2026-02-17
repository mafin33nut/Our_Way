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
import { CalendarPage } from './components/pages/CalendarPage';
import { useAuth } from './hooks/useAuth';
import { useCustomization } from './hooks/useCustomization';

function HomeRoute() {
  return <HomePage />;
}

function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { settings } = useCustomization();
  const isLight = settings.theme === 'light';
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, []);
  return (
    <div className={`relative min-h-screen ${isLight ? 'ow-theme-light' : 'ow-theme-dark'}`}>
      {/* Убрали динамический видео‑фон, используем только градиенты из CSS */}
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
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <CalendarPage />
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
