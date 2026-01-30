import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ListChecks } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
import { FooterArt } from '../layout/FooterArt';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <div className="panel-base panel-orange p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-purple-300">Добро пожаловать, {user.username}!</h2>
          </div>
          <p className="text-purple-200/70 mb-6">
            Это краткий гид по приложению, чтобы быстрее начать приключение.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-300 mt-0.5" />
              <div>
                <p className="text-purple-200">Выберите направление</p>
                <p className="text-purple-200/60 text-sm">
                  В разделе фокуса выберите сферу развития и получите задания.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ListChecks className="w-5 h-5 text-amber-300 mt-0.5" />
              <div>
                <p className="text-purple-200">Выполняйте задания</p>
                <p className="text-purple-200/60 text-sm">
                  Принимайте задания, запускайте таймер и завершайте их.
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
        <div className="mt-24">
          <FooterArt />
        </div>
      </div>
    </div>
  );
}
