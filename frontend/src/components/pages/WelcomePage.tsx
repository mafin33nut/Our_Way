import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[560px]">
                <div className="group rounded-2xl p-[2px] bg-gradient-to-br from-cyan-400/70 to-violet-500/70 transition-transform duration-300 hover:scale-105 hover:rotate-[0.6deg]">
                  <div className="rounded-2xl bg-slate-900/90 p-4">
                    <Button
                      onClick={() => navigate('/settings')}
                      size="lg"
                      className="w-full px-5 py-3 rounded-xl text-base font-semibold bg-slate-900/85 border border-slate-700 text-slate-100 hover:bg-slate-800"
                    >
                      Настройки
                    </Button>
                  </div>
                </div>

                <div className="group rounded-2xl p-[2px] bg-gradient-to-br from-violet-500/70 to-fuchsia-500/70 transition-transform duration-300 hover:scale-105 hover:-rotate-[0.6deg]">
                  <div className="rounded-2xl bg-slate-900/90 p-4">
                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className="w-full px-5 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-500/95 to-indigo-500/95 text-white hover:from-violet-400 hover:to-indigo-400 border border-violet-300/40 shadow-[0_14px_30px_-14px_rgba(139,92,246,0.65)]"
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
