import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CustomizationProvider } from './contexts/Customization';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/pages/LoginPage';
import { HomePage } from './components/pages/HomePage';
import { SettingsPage } from './components/pages/SettingsPage';
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
          </Routes>
        </BrowserRouter>
      </CustomizationProvider>
    </AuthProvider>
  );
}
export default App;