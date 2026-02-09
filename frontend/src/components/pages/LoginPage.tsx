import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCustomization } from '../../hooks/useCustomization';
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
  const { settings } = useCustomization();
  const navigate = useNavigate();
  const isLight = settings.theme === 'light';

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
<<<<<<< HEAD
    <div className="relative min-h-screen bg-gradient-to-b from-slate-800/85 via-slate-900/80 to-slate-950/85 flex items-center justify-center px-4 py-0 sm:px-8 sm:py-12">
      <div className="absolute left-6 top-6 hidden sm:block">
        <Shield className="w-20 h-20 sm:w-24 sm:h-24 text-amber-400" />
      </div>
      <div className="w-full max-w-2xl relative z-10">
        <div className="relative bg-transparent rounded-lg border-0 p-0 sm:p-20 shadow-none text-[200%] text-center">
          <div className="text-center mb-6 sm:mb-8 hidden sm:block">
            <h1 className="text-amber-400 mb-3 sm:mb-2">
              Our way
            </h1>
=======
    <div className="relative min-h-[100svh] flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-3xl" />

      <div className="w-full max-w-[1100px] relative z-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-teal-300" />
            <div className="min-w-0">
              <h1 className={`text-2xl sm:text-3xl leading-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {title}
              </h1>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300/70'}`}>
                Командное саморазвитие через квесты, направления и кланы
              </p>
            </div>
>>>>>>> 7d5d50b69d2952ea275d05782d711d2549c59957
          </div>
          {mode !== 'select' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMode('select');
                setError(null);
              }}
              className="bg-slate-950/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
        </div>

        {mode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative rounded-3xl p-6">
              <div className="absolute -inset-10 rounded-[2.5rem] bg-gradient-to-br from-teal-300/30 via-sky-300/15 to-purple-400/20 blur-2xl opacity-40 transition-opacity group-hover:opacity-70" />
              <div
                className={`relative rounded-3xl backdrop-blur-md shadow-[0_22px_60px_-32px_rgba(0,0,0,0.85)] p-7 sm:p-8 transition-colors ${
                  isLight ? 'bg-white/80 group-hover:bg-white' : 'bg-slate-900/55 group-hover:bg-slate-100/85'
                }`}
              >
                <p
                  className={`text-sm transition-colors ${
                    isLight ? 'text-slate-600 group-hover:text-slate-700' : 'text-slate-300/70 group-hover:text-slate-700'
                  }`}
                >
                  Рады видеть вас снова
                </p>
                <h2
                  className={`mt-2 text-xl sm:text-2xl transition-colors group-hover:text-slate-900 ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  Войти в аккаунт
                </h2>
                <p
                  className={`mt-3 text-sm transition-colors ${
                    isLight ? 'text-slate-600 group-hover:text-slate-700' : 'text-slate-300/70 group-hover:text-slate-700'
                  }`}
                >
                  Продолжайте выполнять квесты и отслеживать прогресс по направлениям.
                </p>
                <div className="mt-6">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="w-full"
                  >
                    Войти
                  </Button>
                </div>
              </div>
            </div>

            <div className="group relative rounded-3xl p-6">
              <div className="absolute -inset-10 rounded-[2.5rem] bg-gradient-to-br from-purple-400/30 via-fuchsia-300/15 to-amber-300/20 blur-2xl opacity-40 transition-opacity group-hover:opacity-70" />
              <div
                className={`relative rounded-3xl backdrop-blur-md shadow-[0_22px_60px_-32px_rgba(0,0,0,0.85)] p-7 sm:p-8 transition-colors ${
                  isLight ? 'bg-white/80 group-hover:bg-white' : 'bg-slate-900/55 group-hover:bg-slate-100/85'
                }`}
              >
                <p
                  className={`text-sm transition-colors ${
                    isLight ? 'text-slate-600 group-hover:text-slate-700' : 'text-slate-300/70 group-hover:text-slate-700'
                  }`}
                >
                  Добро пожаловать
                </p>
                <h2
                  className={`mt-2 text-xl sm:text-2xl transition-colors group-hover:text-slate-900 ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  Создать аккаунт
                </h2>
                <p
                  className={`mt-3 text-sm transition-colors ${
                    isLight ? 'text-slate-600 group-hover:text-slate-700' : 'text-slate-300/70 group-hover:text-slate-700'
                  }`}
                >
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
                    className="w-full !bg-purple-400/80 hover:!bg-purple-400 !border-purple-300/60"
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode !== 'select' && (
          <div className="panel-base panel-purple p-6 sm:p-8 max-w-[820px] mx-auto">
            <div className="panel-caption text-left">
              {mode === 'register' ? 'Новый аккаунт' : 'Вход в аккаунт'}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs text-slate-300/70 mb-2">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                  className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 px-4 py-3 text-slate-100"
                  required
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="email" className="block text-xs text-slate-300/70 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                    className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 px-4 py-3 text-slate-100"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-xs text-slate-300/70 mb-2">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 px-4 py-3 text-slate-100"
                    required
                  />
                  {mode === 'register' && (
                    <p className="text-xs text-slate-300/60 mt-2">
                      Минимум 8 символов. Только латиница и цифры. Обязательно: A-Z, a-z и 0-9.
                    </p>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label htmlFor="password2" className="block text-xs text-slate-300/70 mb-2">
                      Подтверждение
                    </label>
                    <input
                      id="password2"
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full rounded-xl border border-slate-600/30 bg-slate-950/40 px-4 py-3 text-slate-100"
                      required
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-rose-900/25 border border-rose-500/30 px-4 py-3">
                  <p className="text-sm text-rose-200">{error}</p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button type="submit" size="lg" disabled={loading} className="action-button">
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
                  className="bg-slate-950/20"
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
