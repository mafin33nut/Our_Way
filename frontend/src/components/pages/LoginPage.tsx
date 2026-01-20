import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { LogIn, Shield } from 'lucide-react';
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-amber-600/50 p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-amber-400 mb-2">
              Журнал заданий
            </h1>
            <p className="text-amber-200/60">Гильдейские приключения</p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm text-amber-200 mb-2">
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-amber-600/30 rounded-lg text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Введите имя пользователя"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-amber-200 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-amber-600/30 rounded-lg text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Введите пароль"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-amber-200/40 text-sm">
              Присоединяйтесь к гильдии и начните свои приключения
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}