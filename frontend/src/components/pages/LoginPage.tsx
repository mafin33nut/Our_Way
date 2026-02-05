import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Shield } from 'lucide-react';

export function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegisterMode) {
      if (password !== password2) {
        setError('Пароли не совпадают');
        return;
      }
      if (password.length < 8) {
        setError('Пароль должен содержать минимум 8 символов');
        return;
      }
    }
    
    setLoading(true);
    try {
      if (isRegisterMode) {
        await register({ username, email, password, password2 });
      } else {
        await login({ username, password });
      }
    } catch (err: any) {
      console.error(isRegisterMode ? 'Registration error:' : 'Login error:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = isRegisterMode 
        ? 'Ошибка регистрации. Проверьте данные.' 
        : 'Ошибка входа. Проверьте данные.';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors.join(', ') 
            : data.non_field_errors;
        } else if (data.username) {
          const usernameError = Array.isArray(data.username) 
            ? data.username.join(', ') 
            : data.username;
          errorMessage = 'Имя пользователя: ' + usernameError;
        } else if (data.email) {
          const emailError = Array.isArray(data.email) 
            ? data.email.join(', ') 
            : data.email;
          errorMessage = 'Email: ' + emailError;
        } else if (data.password) {
          const passwordError = Array.isArray(data.password) 
            ? data.password.join(', ') 
            : data.password;
          errorMessage = 'Пароль: ' + passwordError;
        } else if (data.password2) {
          const password2Error = Array.isArray(data.password2) 
            ? data.password2.join(', ') 
            : data.password2;
          errorMessage = 'Подтверждение пароля: ' + password2Error;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          const statusCode = err.response?.status || '';
          errorMessage = 'Ошибка ' + statusCode + ': ' + JSON.stringify(data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <p className="text-amber-200/60">Командное саморазвитие</p>
          </div>
          {!showForm && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-0 sm:gap-x-1 mb-8 sm:mb-6 items-center justify-center place-items-center -mt-6">
                <div
                  className="rounded-2xl border-2 p-4 min-h-[128px] flex flex-col items-center justify-center text-center transition-all duration-300 border-amber-600 bg-slate-800 hover:border-amber-400 hover:bg-amber-500 hover:text-slate-900"
                >
                  <p className="text-amber-200/80 text-lg mb-4">
                    Рады видеть вас снова
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setShowForm(true);
                      setError('');
                    }}
                  className="w-44 px-6 py-3 text-xl"
                  >
                    Войти
                  </Button>
                </div>
                <div
                  className="rounded-2xl border-2 p-4 min-h-[128px] flex flex-col items-center justify-center text-center transition-all duration-300 border-amber-600 bg-slate-800 hover:border-amber-400 hover:bg-amber-500 hover:text-slate-900"
                >
                  <p className="text-amber-200/80 text-lg mb-4">
                    Добро пожаловать
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setShowForm(true);
                      setError('');
                    }}
                  className="w-44 px-6 py-3 text-xl"
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </>
          )}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs text-amber-200 mb-2">
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-amber-600/30 rounded-lg text-base text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Введите имя пользователя"
                required
              />
            </div>
            {isRegisterMode && (
              <div>
                <label htmlFor="email" className="block text-xs text-amber-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-amber-600/30 rounded-lg text-base text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Введите email"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-xs text-amber-200 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-amber-600/30 rounded-lg text-base text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Введите пароль"
                required
              />
            </div>
            {isRegisterMode && (
              <div>
                <label htmlFor="password2" className="block text-xs text-amber-200 mb-2">
                  Подтвердите пароль
                </label>
                <input
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-amber-600/30 rounded-lg text-base text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Повторите пароль"
                  required
                />
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 text-xl"
              size="lg"
            >
              {isRegisterMode ? (
                <>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </>
              ) : (
                <>
                  {loading ? 'Вход...' : 'Войти'}
                </>
              )}
            </Button>
            </form>
          )}
          {showForm && !isRegisterMode && (
            <div className="mt-6 text-center">
              <p className="text-amber-200/40 text-sm">
                Присоединяйтесь к команде и начните свое саморазвитие
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
