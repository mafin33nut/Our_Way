import { Activity } from '../../types';
import { Bell, TrendingUp, Trophy, Users, Zap } from 'lucide-react';
import { formatTime } from '../../utils/time';
interface ActivityFeedProps {
  activities: Activity[];
}
const ACTIVITY_ICONS = {
  quest_complete: TrendingUp,
  level_up: Zap,
  friend_achievement: Trophy,
  clan_event: Users,
};
const ACTIVITY_COLORS = {
  quest_complete: 'text-green-400',
  level_up: 'text-yellow-400',
  friend_achievement: 'text-purple-400',
  clan_event: 'text-orange-400',
};
export function ActivityFeed({ activities }: ActivityFeedProps) {
  const recentActivities = activities.slice(0, 8);
  return (
    <div className="panel-base panel-lime p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-purple-400" />
        <h2 className="text-purple-300">Последняя активность</h2>
      </div>
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const IconComponent = ACTIVITY_ICONS[activity.type] || TrendingUp;
          const color = ACTIVITY_COLORS[activity.type] || 'text-purple-400';
          const title =
            activity.title?.trim() ||
            activity.message?.trim() ||
            'Задание';
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-lg border border-purple-600/20 hover:border-purple-500/50 transition-colors"
            >
              <IconComponent className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-purple-200 text-sm">
                  {title}
                </p>
                {activity.message && activity.message !== title && (
                  <p className="text-purple-200/60 text-xs mt-1">{activity.message}</p>
                )}
                <p className="text-purple-200/40 text-xs mt-1">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
      {activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-purple-200/40 text-sm">Пока нет активности</p>
        </div>
      )}
    </div>
  );
}