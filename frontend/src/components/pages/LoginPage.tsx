import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, Shield, User } from 'lucide-react';
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
  const isNetworkError =
    !err?.response &&
    (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED');
  if (isNetworkError) {
    return 'Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен (по умолчанию порт 8000). Если сервер на другом адресе — задайте VITE_API_URL в .env.';
  }

  const data = err?.response?.data;
  if (!data || typeof data !== 'object') {
    const msg = err?.message || (typeof data === 'string' ? data : null);
    if (msg) return String(msg);
    return mode === 'register' ? 'Ошибка регистрации. Проверьте данные.' : 'Ошибка входа. Проверьте данные.';
  }

  const detail = data.detail;
  if (typeof detail === 'string') {
    if (detail.includes('No active account found') || detail.toLowerCase().includes('invalid') || detail.toLowerCase().includes('invalid credentials')) {
      return 'Неверное имя пользователя или пароль.';
    }
    if (detail.toLowerCase().includes('passwords do not match')) {
      return 'Пароли не совпадают.';
    }
    return detail;
  }
  if (Array.isArray(detail)) {
    const text = detail.map((d: any) => (typeof d === 'string' ? d : String(d))).join('. ');
    if (text) return text;
  }

  const field = (name: string): string | null => {
    const raw = data[name];
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw.map((x: any) => String(x)).join('. ');
    return String(raw);
  };

  const usernameError = field('username');
  if (usernameError) {
    if (usernameError.toLowerCase().includes('already exists') || usernameError.toLowerCase().includes('exists')) {
      return 'Это имя пользователя уже занято.';
    }
    return `Имя пользователя: ${usernameError}`;
  }
  const emailError = field('email');
  if (emailError) return `Email: ${emailError}`;
  const passwordError = field('password');
  if (passwordError) return `Пароль: ${passwordError}`;

  const nonField = field('non_field_errors');
  if (nonField) return nonField;

  const message = data.message ?? data.error ?? data.msg;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.map((m: any) => String(m)).join('. ');

  const parts: string[] = [];
  for (const key of Object.keys(data)) {
    if (key === 'detail' || key === 'message' || key === 'error' || key === 'msg') continue;
    const val = data[key];
    const text = Array.isArray(val) ? val.map((x: any) => String(x)).join('. ') : String(val);
    if (text) parts.push(`${key}: ${text}`);
  }
  if (parts.length) return parts.join('; ');

  return mode === 'register' ? 'Ошибка регистрации. Проверьте данные.' : 'Ошибка входа. Проверьте данные.';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
      } else {
        await login({ username: cleanUsername, password });
      }
      navigate('/', { replace: true });
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
        opacity={0.58}
        speed={0.85}
        palette={{ a: '#2dd4bf', b: '#22d3ee', c: '#8b5cf6', d: '#d946ef' }}
      />
      <div className="pointer-events-none absolute left-5 top-5 sm:left-7 sm:top-7">
        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-violet-300/90" />
      </div>

      <div className="w-full relative z-10 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-8 sm:mb-11">
          <h1 className="font-ow-brand text-5xl sm:text-6xl leading-tight text-slate-50 text-center">Our way</h1>
        </div>

        {mode === 'select' && (
          <div className="flex items-center justify-center w-full">
            <div className="grid grid-cols-1 gap-6 w-full max-w-[560px] mx-auto">
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
          <div className="rounded-2xl bg-slate-900/96 border border-slate-700/70 shadow-[0_28px_56px_-20px_rgba(15,23,42,0.95),0_0_0_1px_rgba(148,163,184,0.08)] backdrop-blur-sm px-8 py-9 sm:px-12 sm:py-11 w-full mx-auto flex flex-col items-center">
            <div className="w-full flex flex-col items-center space-y-7 sm:space-y-8">
              <div className="text-center space-y-2 w-full">
                <h2 className="text-slate-50 text-3xl sm:text-4xl font-bold tracking-tight">
                  {mode === 'register' ? 'Новый аккаунт' : 'Вход в аккаунт'}
                </h2>
                <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                  {mode === 'register'
                    ? 'Создайте аккаунт, чтобы сохранить прогресс и получить доступ ко всем возможностям.'
                    : 'Введите имя пользователя и пароль, чтобы продолжить.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-6 sm:space-y-7">
                <div className="w-full flex flex-col items-center space-y-6 sm:space-y-7 max-w-[400px]">
                  <div className="space-y-3 w-full flex flex-col items-center text-center">
                    <label htmlFor="username" className="block text-slate-100 text-[15px] sm:text-base font-semibold w-full">
                      Имя пользователя
                    </label>
                    <div className="relative w-full">
                      <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введите имя пользователя"
                        className="w-full min-h-[52px] rounded-2xl border border-slate-600/40 bg-slate-950/70 pl-12 pr-4 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/35 transition-all duration-200"
                        autoComplete="username"
                        autoFocus
                        aria-label="Имя пользователя"
                        required
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-3 w-full flex flex-col items-center text-center">
                      <label htmlFor="email" className="block text-slate-100 text-[15px] sm:text-base font-semibold w-full">
                        Email
                      </label>
                      <div className="relative w-full">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Введите email"
                          className="w-full min-h-[52px] rounded-2xl border border-slate-600/40 bg-slate-950/70 pl-12 pr-4 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/35 transition-all duration-200"
                          autoComplete="email"
                          aria-label="Email"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 w-full flex flex-col items-center text-center">
                    <label htmlFor="password" className="block text-slate-100 text-[15px] sm:text-base font-semibold w-full">
                      Пароль
                    </label>
                    <div className="relative w-full">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (!passwordTouched) setPasswordTouched(true);
                        }}
                        onBlur={() => {
                          setPasswordTouched(true);
                          setCapsLockOn(false);
                        }}
                        onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                        onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                        placeholder="Введите пароль"
                        className="w-full min-h-[52px] rounded-2xl border border-slate-600/40 bg-slate-950/70 pl-12 pr-12 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/35 transition-all duration-200"
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        aria-label="Пароль"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {capsLockOn && <p className="text-amber-300 text-sm w-full text-center">Caps Lock включен</p>}
                    {mode === 'register' && passwordTouched && password && validatePassword(password) && (
                      <p className="mt-2 text-sm leading-relaxed text-rose-300/95 w-full text-center">
                        {validatePassword(password)}
                      </p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-3 w-full flex flex-col items-center text-center">
                      <label htmlFor="password2" className="block text-slate-100 text-[15px] sm:text-base font-semibold w-full">
                        Подтверждение
                      </label>
                      <div className="relative w-full">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="password2"
                          type={showPassword2 ? 'text' : 'password'}
                          value={password2}
                          onChange={(e) => setPassword2(e.target.value)}
                          onBlur={() => setCapsLockOn(false)}
                          onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                          onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                          placeholder="Повторите пароль"
                          className="w-full min-h-[52px] rounded-2xl border border-slate-600/40 bg-slate-950/70 pl-12 pr-12 py-4 text-base text-slate-100 placeholder-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/35 transition-all duration-200"
                          autoComplete="new-password"
                          aria-label="Подтверждение пароля"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword2((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                          aria-label={showPassword2 ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl bg-rose-950/50 border border-rose-400/30 px-5 py-4 shadow-[0_4px_16px_-4px_rgba(244,63,94,0.25)] w-full text-center">
                      <p className="text-rose-200 text-[15px] sm:text-base leading-relaxed">{error}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-center w-full max-w-[400px]">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full px-10 py-4.5 rounded-2xl text-lg sm:text-xl font-semibold tracking-wide text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-[0_14px_36px_-12px_rgba(45,212,191,0.7)] hover:from-teal-400 hover:to-cyan-400 hover:shadow-[0_18px_44px_-12px_rgba(45,212,191,0.85)] hover:translate-y-[-1px] transform-gpu transition-all duration-200 active:scale-[0.98] active:translate-y-0 active:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.9)] disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    {mode === 'register' ? (loading ? 'Регистрация...' : 'Зарегистрироваться') : loading ? 'Вход...' : 'Войти'}
                  </Button>
                </div>
                <div className="w-full max-w-[400px] text-center">
                  {mode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError(null);
                      }}
                      className="text-teal-300 hover:text-teal-200 text-base sm:text-[17px] font-medium transition-colors"
                    >
                      Нет аккаунта? Создать
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="text-teal-300 hover:text-teal-200 text-base sm:text-[17px] font-medium transition-colors"
                    >
                      Уже есть аккаунт? Войти
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
