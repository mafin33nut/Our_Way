import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
import { HybridDynamicBackground } from '../background/HybridDynamicBackground';

export function WelcomePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleContinue = async () => {
    try {
      const formData = new FormData();
      formData.append('has_seen_welcome', 'true');
      await authAPI.updateProfile(formData);
      await refreshUser();
      navigate('/');
    } catch (error) {
      console.error('Failed to update welcome flag', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <HybridDynamicBackground
        opacity={0.68}
        speed={0.9}
        palette={{ a: '#2dd4bf', b: '#22d3ee', c: '#8b5cf6', d: '#d946ef' }}
      />
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1200px]">
          <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-[0_20px_46px_-16px_rgba(15,23,42,0.95)] p-8 sm:p-10 min-h-[58vh]">
            <div className="pointer-events-none absolute left-5 top-5 sm:left-7 sm:top-7">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-violet-300/90" />
            </div>

            <div className="flex justify-center mt-4">
              <h2 className="text-slate-50 text-2xl sm:text-3xl">Our way</h2>
            </div>

            <div className="mt-16 flex items-center justify-center">
              <div className="grid grid-cols-1 gap-4 w-full max-w-[1800px]">
                <div className="group rounded-2xl p-[2px] bg-gradient-to-r from-teal-400/75 via-cyan-400/70 to-violet-500/75 transition-transform duration-300 hover:scale-[1.02] hover:translate-x-1">
                  <div className="rounded-2xl bg-slate-900/90 p-5 sm:p-6">
                    <Button
                      onClick={() => navigate('/settings')}
                      size="lg"
                      className="w-full px-6 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-800 text-slate-100 border border-slate-600 hover:from-slate-800 hover:to-slate-700"
                    >
                      Настройки
                    </Button>
                  </div>
                </div>

                <div className="group rounded-2xl p-[2px] bg-gradient-to-r from-violet-500/75 via-fuchsia-500/70 to-teal-400/75 transition-transform duration-300 hover:scale-[1.02] hover:-translate-x-1">
                  <div className="rounded-2xl bg-slate-900/90 p-5 sm:p-6">
                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className="w-full px-6 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-teal-400/95 to-violet-500/95 text-white hover:from-teal-300 hover:to-violet-400 border border-violet-300/40 shadow-[0_14px_30px_-14px_rgba(45,212,191,0.55)]"
                    >
                      Перейти к приложению
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
