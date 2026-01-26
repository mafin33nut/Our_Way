export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  total_quests_completed: number;
  current_focus?: string;
}
export interface Quest {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  user: number;
  focus_area?: string;
}
export interface ClanQuestParticipant {
  id: number;
  username: string;
  level: number;
  contribution: number;
}
export interface ClanQuest {
  id: number;
  title: string;
  description: string;
  difficulty: 'epic' | 'legendary';
  xp_reward: number;
  required_progress: number;
  total_progress: number;
  completed: boolean;
  expires_at: string;
  participants: ClanQuestParticipant[];
  clan: number;
}
export interface FocusArea {
  id: string;
  name: string;
  description: string;
  icon: string;
}
export interface AuthTokens {
  access: string;
  refresh: string;
}
export interface LoginCredentials {
  username: string;
  password: string;
}
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}
export interface QuestCreate {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
export interface Friend {
  id: number;
  username: string;
  level: number;
  quests_completed_today: number;
  is_online: boolean;
}
export interface ClanMember {
  id: number;
  username: string;
  level: number;
  contribution: number;
}
export interface Clan {
  id: number;
  name: string;
  level: number;
  total_xp: number;
  members: ClanMember[];
}
export interface Activity {
  id: number;
  type: 'quest_complete' | 'level_up' | 'friend_achievement' | 'clan_event';
  message: string;
  timestamp: string;
  icon: string;
}
export interface CustomizationSettings {
  theme: 'light' | 'dark';
  background: string;
  soundEnabled: boolean;
  showFriends: boolean;
  showActivities: boolean;
  showClan: boolean;
}
export const BACKGROUND_OPTIONS = [
  {
    id: 'castle',
    name: 'Замок',
    url: 'https://images.unsplash.com/photo-1763446365107-6b35499f487c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwY2FzdGxlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2ODM0OTUzNXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'forest',
    name: 'Волшебный лес',
    url: 'https://images.unsplash.com/photo-1675611559364-4b3e04347077?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwZm9yZXN0JTIwbWFnaWN8ZW58MXx8fHwxNzY4Mzk3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'mountain',
    name: 'Драконьи горы',
    url: 'https://images.unsplash.com/photo-1655432223749-9e902b33ed93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbW91bnRhaW4lMjBkcmFnb258ZW58MXx8fHwxNzY4Mzk3NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'kingdom',
    name: 'Королевство',
    url: 'https://images.unsplash.com/photo-1683660108375-ea3ee43e3c8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWVkaWV2YWwlMjBraW5nZG9tfGVufDF8fHx8MTc2ODM5NzQ5MHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'adventure',
    name: 'Приключение',
    url: 'https://yandex.ru/images/search?text=приключение+картинка+фэнтези&img_url=https%3A%2F%2Fimg.freepik.com%2Fpremium-photo%2Fmajestic-stone-castle-nestled-amidst-fiery-autumn-forest-cascading-waterfall-mountainous-landscape_681147-32383.jpg%3Fsemt%3Dais_hybrid&pos=1&rpt=simage&stype=image&lr=213&parent-reqid=1769368913129590-1768100861777395609-balancer-l7leveler-kubr-yp-sas-178-BAL&source=serp',
  },
  {
    id: 'none',
    name: 'Без фона',
    url: '',
  },
];

export interface ActivityTimer {
  id: number;
  user: number;
  activity?: number | null;
  started_at: string;
  stopped_at?: string | null;
  active: boolean;
  duration_seconds: number;
}