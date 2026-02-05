import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ListChecks } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
import { FooterArt } from '../layout/FooterArt';
import { PanelHelp } from '../ui/PanelHelp';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1000px]">
          <div className="panel-base panel-orange p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Добро пожаловать, {user.username}!</h2>
            </div>
            <p className="panel-comment mb-6">Добро пожаловать</p>
            <PanelHelp>
              <p>1) Пройдите шаги ниже, чтобы начать с правильных настроек.</p>
              <p>2) После этого переходите к квестам и создавайте первые задачи.</p>
            </PanelHelp>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-300 mt-0.5" />
                <div>
                  <p className="text-slate-200">Выберите направление</p>
                  <p className="text-slate-300/60 text-sm">
                    В разделе квестов выберите сферу развития и получите квесты.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ListChecks className="w-5 h-5 text-teal-300 mt-0.5" />
                <div>
                  <p className="text-slate-200">Выполняйте квесты</p>
                  <p className="text-slate-300/60 text-sm">
                    Создавайте свои квесты и завершайте их по мере выполнения.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleContinue} size="lg">
                Перейти к приложению
              </Button>
            </div>
          </div>
          <FooterArt
            className="mt-12 flex justify-end pr-6"
            imageClassName="w-full max-w-[420px] rounded-xl shadow-lg border border-white/10"
          />
        </div>
      </div>
    </div>
  );
}
