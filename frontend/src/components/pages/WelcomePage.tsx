import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ListChecks } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex items-start justify-center px-4 py-6 sm:px-8 sm:py-12">
        <div className="w-full max-w-[1200px]">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-slate-800" />
              <h2 className="text-slate-900">Добро пожаловать, {user.username}!</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">Короткий гид по старту в Our Way.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-slate-700" />
                  <p className="text-slate-900">Шаг 1: Направление развития</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  В разделе квестов выберите направление развития и получите первые задачи.
                  Если нужно — создайте своё направление вручную.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ListChecks className="w-5 h-5 text-slate-700" />
                  <p className="text-slate-900">Шаг 2: Первые квесты</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Создайте 1–2 квеста и добавьте шаги, если цель сложная.
                  Завершайте их, чтобы видеть прогресс и получать XP.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-slate-700" />
                  <p className="text-slate-900">Шаг 3: Кланы и чат</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Найдите клан, отправьте запрос и общайтесь в чате.
                  Клановые квесты дают командный темп и дополнительный рост.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-slate-700" />
                  <p className="text-slate-900">Шаг 4: Настройки</p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Проверьте тему и звук в настройках, чтобы интерфейс был комфортным.
                  Подсказки можно отключить там же.
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={handleContinue} size="lg" className="bg-black text-white hover:bg-slate-900 border border-black">
                Перейти к приложению
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
