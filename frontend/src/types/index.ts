export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  has_seen_welcome?: boolean;
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
  duration_minutes?: number;
  is_custom?: boolean;
  completed: boolean;
  completed_at?: string;
  accepted_at?: string | null;
  expires_at?: string | null;
  deleted_at?: string | null;
  created_at: string;
  user: number;
  focus_area?: string;
  steps?: QuestStep[];
  focuses?: UserFocus[];
}

export interface QuestStep {
  id: number;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  completed: boolean;
  order: number;
}

export interface UserFocus {
  id: number;
  name: string;
  created_at: string;
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
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  required_progress: number;
  total_progress: number;
  max_participants?: number;
  participant_count?: number;
  completed: boolean;
  expires_at?: string | null;
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
  focus_ids?: number[];
  steps?: Array<{ title: string; difficulty?: 'easy' | 'medium' | 'hard'; order?: number }>;
}
export interface Friend {
  id: number;
  username: string;
  avatar?: string | null;
  level: number;
  quests_completed_today: number;
  is_online: boolean;
}
export interface ClanMember {
  id: number;
  username: string;
  avatar?: string | null;
  level: number;
  contribution: number;
  role?: string;
}
export interface Clan {
  id: number;
  name: string;
  description?: string;
  is_public?: boolean;
  requires_password?: boolean;
  level: number;
  total_xp: number;
  members: ClanMember[];
}
export interface ClanJoinRequest {
  id: number;
  clan: number;
  clan_name?: string;
  user: number;
  username?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
export interface ClanMessage {
  id: number;
  clan: number;
  user: number;
  username: string;
  content: string;
  created_at: string;
}
export interface Activity {
  id: number;
  type: 'quest_complete' | 'level_up' | 'friend_achievement' | 'clan_event';
  title?: string;
  message?: string;
  timestamp: string;
  icon: string;
}
export interface CustomizationSettings {
  theme: 'light' | 'dark';
  background: string;
  customBackgroundUrl?: string;
  soundEnabled: boolean;
  showFriends: boolean;
  showActivities: boolean;
  showClan: boolean;
  showHelp: boolean;
}
export const BACKGROUND_OPTIONS = [
  {
    id: 'kingdom',
    name: 'Королевство',
    url: '/kingdom.jpg',
  },
  {
    id: 'adventure',
    name: 'Приключение',
    url: '/adventure.jpg',
  },
  {
    id: 'custom',
    name: 'Свой фон',
    url: '',
  },
  {
    id: 'dynamic',
    name: 'Динамичный фон',
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