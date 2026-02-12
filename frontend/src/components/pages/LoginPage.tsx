import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { HybridDynamicBackground } from '../background/HybridDynamicBackground';

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
  const [passwordTouched, setPasswordTouched] = useState(false);

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
    <div className="relative min-h-screen flex items-center justify-center px-5 py-10 sm:px-10 sm:py-16 overflow-hidden bg-slate-950">
      <HybridDynamicBackground
        opacity={0.72}
        speed={1}
        palette={{ a: '#2dd4bf', b: '#22d3ee', c: '#8b5cf6', d: '#d946ef' }}
      />
      <div className="pointer-events-none absolute left-5 top-5 sm:left-7 sm:top-7">
        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-violet-300/90" />
      </div>

      <div className="w-full max-w-[1150px] relative z-10">
        <div className="flex items-center justify-center mb-8 sm:mb-11">
          <h1 className="font-ow-brand text-5xl sm:text-6xl leading-tight text-slate-50">Our way</h1>
        </div>

        {mode === 'select' && (
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-1 gap-5 w-full max-w-[1040px]">
              <div className="group rounded-2xl p-[2px] bg-gradient-to-r from-teal-400/75 via-cyan-400/70 to-violet-500/75 transform-gpu transition-transform transition-shadow duration-300 hover:scale-[1.03] hover:translate-x-1 hover:shadow-[0_22px_60px_-20px_rgba(56,189,248,0.9)]">
                <div className="rounded-2xl bg-slate-900/90 px-7 py-5 sm:px-9 sm:py-6">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="w-full px-8 py-4 rounded-xl text-xl font-semibold bg-gradient-to-r from-teal-400/95 to-violet-500/95 text-white hover:from-teal-300 hover:to-violet-400 border border-violet-300/40 shadow-[0_18px_40px_-18px_rgba(45,212,191,0.7)] transform-gpu transition-transform transition-shadow duration-200 active:scale-[0.97] active:shadow-[0_14px_32px_-16px_rgba(15,23,42,0.95)]"
                  >
                    Войти
                  </Button>
                </div>
              </div>

              <div className="group rounded-2xl p-[2px] bg-gradient-to-r from-violet-500/75 via-fuchsia-500/70 to-teal-400/75 transform-gpu transition-transform transition-shadow duration-300 hover:scale-[1.03] hover:-translate-x-1 hover:shadow-[0_22px_60px_-20px_rgba(147,51,234,0.9)]">
                <div className="rounded-2xl bg-slate-900/90 px-7 py-5 sm:px-9 sm:py-6">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="w-full px-8 py-4 rounded-xl text-xl font-semibold bg-gradient-to-r from-violet-500/95 to-teal-400/95 text-white hover:from-violet-400 hover:to-teal-300 border border-teal-300/40 shadow-[0_18px_40px_-18px_rgba(139,92,246,0.7)] transform-gpu transition-transform transition-shadow duration-200 active:scale-[0.97] active:shadow-[0_14px_32px_-16px_rgba(15,23,42,0.95)]"
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode !== 'select' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-[0_22px_54px_-18px_rgba(15,23,42,0.97)] px-10 py-9 sm:px-14 sm:py-12 max-w-[900px] mx-auto">
            <div className="space-y-6 sm:space-y-7">
              <div>
                <div className="text-slate-50 text-xl sm:text-2xl font-semibold mb-2">
                  {mode === 'register' ? 'Новый аккаунт' : 'Вход в аккаунт'}
                </div>
                <p className="text-[17px] sm:text-lg text-slate-300">
                  {mode === 'register'
                    ? 'Заполните поля ниже, чтобы создать учётную запись. Мы используем только необходимые данные.'
                    : 'Введите имя пользователя и пароль, чтобы продолжить работу с вашими квестами.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                  className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3.5 text-[15px] sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60 transition-colors"
                  required
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                    className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3.5 text-[15px] sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60 transition-colors"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!passwordTouched) setPasswordTouched(true);
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Введите пароль"
                    className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3.5 text-[15px] sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60 transition-colors"
                    required
                  />
                  {mode === 'register' && passwordTouched && password && validatePassword(password) && (
                    <p className="mt-3 text-sm leading-relaxed text-rose-300">
                      {validatePassword(password)}
                    </p>
                  )}
                </div>

                {mode === 'register' && (
                  <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-slate-200 mb-2">
                      Подтверждение
                    </label>
                    <input
                      id="password2"
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full rounded-xl border border-slate-600/50 bg-slate-950/60 px-4 py-3.5 text-[15px] sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-300/60 transition-colors"
                      required
                    />
                  </div>
                )}
              </div>

                {error && (
                  <div className="rounded-xl bg-rose-900/20 border border-rose-400/40 px-4 py-3 mt-2">
                    <p className="text-[15px] text-rose-200">{error}</p>
                  </div>
                )}

                <div className="pt-4 sm:pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="bg-gradient-to-r from-violet-500/95 to-indigo-500/95 text-white hover:from-violet-400 hover:to-indigo-400 border border-violet-300/40 px-8 py-4 text-[18px] sm:text-[19px] font-semibold shadow-[0_20px_44px_-18px_rgba(139,92,246,0.8)] transform-gpu transition-transform transition-shadow duration-200 active:scale-[0.97] active:shadow-[0_16px_36px_-18px_rgba(15,23,42,0.98)]"
                  >
                    {mode === 'register'
                      ? loading
                        ? 'Регистрация...'
                        : 'Зарегистрироваться'
                      : loading
                      ? 'Вход...'
                      : 'Войти'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
