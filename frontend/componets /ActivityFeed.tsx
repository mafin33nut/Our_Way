import { Activities } from '../../app';
import { Bell, CheckCircle2, Star, Users, Award } from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quest_complete':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'level_up':
        return <Star className="w-4 h-4 text-amber-400" />;
      case 'friend_achievement':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'clan_event':
        return <Award className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'quest_complete':
        return 'border-emerald-600/30 bg-emerald-900/10';
      case 'level_up':
        return 'border-amber-600/30 bg-amber-900/10';
      case 'friend_achievement':
        return 'border-blue-600/30 bg-blue-900/10';
      case 'clan_event':
        return 'border-purple-600/30 bg-purple-900/10';
      default:
        return 'border-slate-600/30 bg-slate-800/10';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes === 0) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-slate-600/50 p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-slate-400" />
        <h2 className="text-slate-300">Активность</h2>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-slate-400/20 mx-auto mb-2" />
            <p className="text-slate-400/60 text-sm">Пока нет активности</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm mb-1">{activity.message}</p>
                <p className="text-slate-400 text-xs">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
