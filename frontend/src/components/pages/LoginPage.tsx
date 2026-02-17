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
            <div className="grid grid-cols-1 gap-6 w-full max-w-[560px]">
              <div className="group rounded-2xl p-[3px] bg-gradient-to-r from-teal-400/80 via-cyan-400/75 to-violet-500/80 transform-gpu transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px] hover:shadow-[0_24px_48px_-16px_rgba(45,212,191,0.5),0_0_0_1px_rgba(45,212,191,0.2)] active:scale-[0.98] active:translate-y-0 active:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.9)]">
                <div className="rounded-[calc(1rem-2px)] bg-slate-900/95 backdrop-blur-sm px-8 py-6 sm:px-10 sm:py-7">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="w-full px-10 py-4.5 rounded-2xl text-xl font-semibold tracking-wide text-white bg-gradient-to-r from-teal-400 to-cyan-500 shadow-[0_12px_32px_-12px_rgba(45,212,191,0.6)] hover:from-teal-300 hover:to-cyan-400 hover:shadow-[0_16px_40px_-12px_rgba(45,212,191,0.7)] transform-gpu transition-all duration-200 active:scale-[0.98] active:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.85)]"
                  >
                    Войти
                  </Button>
                </div>
              </div>

              <div className="group rounded-2xl p-[3px] bg-gradient-to-r from-violet-500/80 via-fuchsia-500/75 to-teal-400/80 transform-gpu transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-2px] hover:shadow-[0_24px_48px_-16px_rgba(139,92,246,0.5),0_0_0_1px_rgba(139,92,246,0.2)] active:scale-[0.98] active:translate-y-0 active:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.9)]">
                <div className="rounded-[calc(1rem-2px)] bg-slate-900/95 backdrop-blur-sm px-8 py-6 sm:px-10 sm:py-7">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="w-full px-10 py-4.5 rounded-2xl text-xl font-semibold tracking-wide text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_12px_32px_-12px_rgba(139,92,246,0.6)] hover:from-violet-400 hover:to-fuchsia-400 hover:shadow-[0_16px_40px_-12px_rgba(139,92,246,0.7)] transform-gpu transition-all duration-200 active:scale-[0.98] active:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.85)]"
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode !== 'select' && (
          <div className="rounded-2xl bg-slate-900/92 border border-slate-700/60 shadow-[0_28px_56px_-20px_rgba(15,23,42,0.95),0_0_0_1px_rgba(148,163,184,0.06)] backdrop-blur-sm px-8 py-9 sm:px-12 sm:py-11 max-w-[900px] mx-auto">
            <div className="max-w-[480px] mx-auto space-y-7 sm:space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-slate-50 text-2xl sm:text-3xl font-bold tracking-tight">
                  {mode === 'register' ? 'Новый аккаунт' : 'Вход в аккаунт'}
                </h2>
                <p className="text-slate-400 text-base sm:text-[17px] leading-relaxed max-w-[420px] mx-auto">
                  {mode === 'register'
                    ? 'Заполните поля ниже — только необходимые данные для учётной записи.'
                    : 'Имя пользователя и пароль для доступа к квестам и прогрессу.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7 text-left">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-slate-200 text-[15px] sm:text-base font-medium">
                    Имя пользователя
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите имя пользователя"
                    className="w-full rounded-2xl border border-slate-600/40 bg-slate-950/70 px-5 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/30 transition-all duration-200"
                    required
                  />
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-slate-200 text-[15px] sm:text-base font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Введите email"
                      className="w-full rounded-2xl border border-slate-600/40 bg-slate-950/70 px-5 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/30 transition-all duration-200"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-slate-200 text-[15px] sm:text-base font-medium">
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
                      className="w-full rounded-2xl border border-slate-600/40 bg-slate-950/70 px-5 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/30 transition-all duration-200"
                      required
                    />
                    {mode === 'register' && passwordTouched && password && validatePassword(password) && (
                      <p className="mt-2 text-sm leading-relaxed text-rose-300/95">
                        {validatePassword(password)}
                      </p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label htmlFor="password2" className="block text-slate-200 text-[15px] sm:text-base font-medium">
                        Подтверждение
                      </label>
                      <input
                        id="password2"
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Повторите пароль"
                        className="w-full rounded-2xl border border-slate-600/40 bg-slate-950/70 px-5 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/30 transition-all duration-200"
                        required
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-950/50 border border-rose-400/30 px-5 py-4 shadow-[0_4px_16px_-4px_rgba(244,63,94,0.25)]">
                    <p className="text-rose-200 text-[15px] sm:text-base leading-relaxed">{error}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full sm:w-auto min-w-[220px] px-10 py-4.5 rounded-2xl text-lg sm:text-xl font-semibold tracking-wide text-white bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_14px_36px_-12px_rgba(139,92,246,0.65)] hover:from-violet-400 hover:to-indigo-400 hover:shadow-[0_18px_44px_-12px_rgba(139,92,246,0.75)] hover:translate-y-[-1px] transform-gpu transition-all duration-200 active:scale-[0.98] active:translate-y-0 active:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.9)] disabled:opacity-60 disabled:hover:translate-y-0"
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
