import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

type AuthMode = 'select' | 'login' | 'register';

function validatePassword(password: string): string | null {
  const value = password || '';
  if (value.length < 8) {
    return 'Пароль должен быть не короче 8 символов.';
  }
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    return 'Пароль должен содержать только английские буквы и цифры (без спецсимволов).';
  }
  if (!/[a-z]/.test(value)) {
    return 'Пароль должен содержать хотя бы одну строчную букву (a-z).';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Пароль должен содержать хотя бы одну заглавную букву (A-Z).';
  }
  if (!/[0-9]/.test(value)) {
    return 'Пароль должен содержать хотя бы одну цифру (0-9).';
  }
  return null;
}

function humanizeAuthError(err: any, mode: AuthMode): string {
  const data = err?.response?.data;
  const detail = data?.detail;

  if (typeof detail === 'string') {
    if (detail.includes('No active account found')) {
      return 'Неверное имя пользователя или пароль.';
    }
    if (detail.toLowerCase().includes('passwords do not match')) {
      return 'Пароли не совпадают.';
    }
    return detail;
  }

  const field = (name: string) => {
    const raw = data?.[name];
    if (!raw) return null;
    if (Array.isArray(raw)) return raw.join(', ');
    return String(raw);
  };

  const usernameError = field('username');
  if (usernameError) {
    if (usernameError.includes('already exists')) {
      return 'Это имя пользователя уже занято.';
    }
    return `Имя пользователя: ${usernameError}`;
  }
  const emailError = field('email');
  if (emailError) return `Email: ${emailError}`;
  const passwordError = field('password');
  if (passwordError) return `Пароль: ${passwordError}`;

  if (mode === 'register') {
    return 'Ошибка регистрации. Проверьте данные.';
  }
  return 'Ошибка входа. Проверьте данные.';
}

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('select');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const title = useMemo(() => {
    if (mode === 'register') return 'Регистрация';
    if (mode === 'login') return 'Вход';
    return 'Our Way';
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Введите имя пользователя.');
      return;
    }

    if (mode === 'register') {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        setError('Введите email.');
        return;
      }
      if (password !== password2) {
        setError('Пароли не совпадают.');
        return;
      }
      const policyError = validatePassword(password);
      if (policyError) {
        setError(policyError);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ username: cleanUsername, email: email.trim(), password, password2 });
        return;
      }
      await login({ username: cleanUsername, password });
    } catch (err: any) {
      console.error(mode === 'register' ? 'Register error:' : 'Login error:', err);
      setError(humanizeAuthError(err, mode));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100svh] flex items-center justify-center px-4 py-10 overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="w-full max-w-[1100px] relative z-10">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-violet-300" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl leading-tight text-slate-50">
                Our way
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Единая точка входа: выберите, войти в существующий профиль или создать новый аккаунт.
              </p>
            </div>
          </div>
          {mode !== 'select' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMode('select');
                setError(null);
              }}
              className="bg-slate-900/80 border border-slate-700 text-slate-100 hover:bg-slate-800 px-5 py-3 text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
        </div>

        {mode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative rounded-3xl p-6">
              <div
                className="relative rounded-3xl bg-slate-900/85 border border-slate-700/70 shadow-[0_18px_42px_-18px_rgba(15,23,42,0.95)] p-7 sm:p-8"
              >
                <p className="text-base leading-relaxed text-slate-300">
                  Рады видеть вас снова.
                </p>
                <h2 className="mt-2 text-xl sm:text-2xl text-slate-50">
                  Войти в аккаунт
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  Продолжайте выполнять квесты, отслеживать прогресс по направлениям и открывать достижения.
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="w-full bg-gradient-to-r from-violet-500/95 to-indigo-500/95 text-white hover:from-violet-400 hover:to-indigo-400 border border-violet-300/40 px-6 py-3.5 text-[17px] font-semibold shadow-[0_14px_30px_-14px_rgba(139,92,246,0.65)]"
                  >
                    Войти
                  </Button>
                </div>
              </div>
            </div>

            <div className="group relative rounded-3xl p-6">
              <div
                className="relative rounded-3xl bg-slate-900/85 border border-slate-700/70 shadow-[0_18px_42px_-18px_rgba(15,23,42,0.95)] p-7 sm:p-8"
              >
                <p className="text-base leading-relaxed text-slate-300">
                  Добро пожаловать.
                </p>
                <h2 className="mt-2 text-xl sm:text-2xl text-slate-50">
                  Создать аккаунт
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  Имя пользователя должно быть уникальным. Пароль: латиница и цифры, минимум 8, с
                  заглавной буквой.
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="w-full bg-gradient-to-r from-violet-500/95 to-indigo-500/95 text-white hover:from-violet-400 hover:to-indigo-400 border border-violet-300/40 px-6 py-3.5 text-[17px] font-semibold shadow-[0_14px_30px_-14px_rgba(139,92,246,0.65)]"
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode !== 'select' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-[0_20px_46px_-16px_rgba(15,23,42,0.95)] p-8 sm:p-10 max-w-[860px] mx-auto">
            <div className="text-slate-50 text-lg font-semibold mb-2">
              {mode === 'register' ? 'Новый аккаунт' : 'Вход в аккаунт'}
            </div>
            <p className="text-base text-slate-300 mb-7">
              {mode === 'register'
                ? 'Заполните поля ниже, чтобы создать учётную запись. Мы используем только необходимые данные.'
                : 'Введите имя пользователя и пароль, чтобы продолжить работу с вашими квестами.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-xs text-slate-300 mb-2">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                  className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60"
                  required
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="email" className="block text-xs text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                    className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-xs text-slate-300 mb-2">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60"
                    required
                  />
                  {mode === 'register' && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                      Минимум 8 символов. Только латиница и цифры. Обязательно: A-Z, a-z и 0-9.
                    </p>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label htmlFor="password2" className="block text-xs text-slate-300 mb-2">
                      Подтверждение
                    </label>
                    <input
                      id="password2"
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60"
                      required
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-rose-900/20 border border-rose-400/40 px-4 py-3">
                  <p className="text-sm text-rose-200">{error}</p>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Button type="submit" size="lg" disabled={loading} className="bg-gradient-to-r from-violet-500/95 to-indigo-500/95 text-white hover:from-violet-400 hover:to-indigo-400 border border-violet-300/40 px-6 py-3.5 text-[17px] font-semibold shadow-[0_14px_30px_-14px_rgba(139,92,246,0.65)]">
                  {mode === 'register'
                    ? loading
                      ? 'Регистрация...'
                      : 'Зарегистрироваться'
                    : loading
                    ? 'Вход...'
                    : 'Войти'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setMode('select');
                    setError(null);
                  }}
                  className="bg-slate-900/80 border border-slate-700 text-slate-100 hover:bg-slate-800 px-6 py-3.5 text-base"
                >
                  Назад к выбору
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
