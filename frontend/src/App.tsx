import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CustomizationProvider } from './contexts/Customization';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/pages/LoginPage';
import { HomePage } from './components/pages/HomePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ClansPage } from './components/pages/ClansPage';
import { LeadersPage } from './components/pages/LeadersPage';
import { AchievementsPage } from './components/pages/AchievementsPage';
import { UserCustomizationPage } from './components/pages/UserCustomizationPage';
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
                  <>
                    <Header />
                    <HomePage />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <SettingsPage />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/clans"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <ClansPage />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/leaders"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <LeadersPage />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <AchievementsPage />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <UserCustomizationPage />
                  </>
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