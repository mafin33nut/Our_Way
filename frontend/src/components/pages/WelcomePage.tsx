import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ListChecks } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/Button';
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
        <div className="w-full max-w-[1200px]">
          <div className="panel-base panel-purple p-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-teal-300" />
              <h2 className="text-slate-100">Добро пожаловать, {user.username}!</h2>
            </div>
            <p className="panel-comment mb-6">Гид по старту</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-teal-300" />
                  <p className="text-slate-200">Шаг 1: Направление развития</p>
                </div>
                <p className="text-slate-300/70 text-sm">
                  В разделе квестов выберите направление развития и получите первые задачи.
                  Если нужно — создайте своё направление вручную.
                </p>
              </div>
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ListChecks className="w-5 h-5 text-teal-300" />
                  <p className="text-slate-200">Шаг 2: Первые квесты</p>
                </div>
                <p className="text-slate-300/70 text-sm">
                  Создайте 1–2 квеста и добавьте шаги, если цель сложная.
                  Завершайте их, чтобы видеть прогресс и получать XP.
                </p>
              </div>
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-teal-300" />
                  <p className="text-slate-200">Шаг 3: Кланы и чат</p>
                </div>
                <p className="text-slate-300/70 text-sm">
                  Найдите клан, отправьте запрос и общайтесь в чате.
                  Клановые квесты дают командный темп и дополнительный рост.
                </p>
              </div>
              <div className="rounded-lg border border-slate-600/40 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-teal-300" />
                  <p className="text-slate-200">Шаг 4: Настройки</p>
                </div>
                <p className="text-slate-300/70 text-sm">
                  Проверьте фон, звук и видимость панелей.
                  Подсказки можно отключить в настройках интерфейса.
                </p>
              </div>
            </div>
            <PanelHelp>
              <p>1) Пройдите шаги ниже — так вы быстрее настроите приложение под себя.</p>
              <p>2) После этого переходите к квестам и начинайте прокачку.</p>
            </PanelHelp>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleContinue} size="lg">
                Перейти к приложению
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
