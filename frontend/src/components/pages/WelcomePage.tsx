import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ListChecks, LayoutDashboard, Settings } from 'lucide-react';
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
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-[0_20px_46px_-16px_rgba(15,23,42,0.95)] p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-300" />
              <h2 className="text-slate-50">Добро пожаловать, {user.username}!</h2>
            </div>
            <p className="text-sm text-slate-300 mb-6">Главный хаб перед стартом. Выберите, куда перейти дальше.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <LayoutDashboard className="w-5 h-5 text-cyan-300" />
                  <p className="text-slate-50">Главная панель</p>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">Квесты, фокусы и текущий прогресс в одном месте.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ListChecks className="w-5 h-5 text-violet-300" />
                  <p className="text-slate-50">Квесты и цели</p>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">Добавляйте задачи, закрывайте шаги, накапливайте XP.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <p className="text-slate-50">Кланы и команда</p>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">Присоединяйтесь к кланам и выполняйте совместные квесты.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-amber-300" />
                  <p className="text-slate-50">Настройки профиля</p>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">Управляйте профилем, описанием и звуковыми параметрами.</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <Button
                onClick={() => navigate('/settings')}
                size="lg"
                className="bg-slate-900/85 border border-slate-700 text-slate-100 hover:bg-slate-800"
              >
                Настройки
              </Button>
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-violet-500/95 to-indigo-500/95 text-white hover:from-violet-400 hover:to-indigo-400 border border-violet-300/40 shadow-[0_14px_30px_-14px_rgba(139,92,246,0.65)]"
              >
                Перейти к приложению
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
