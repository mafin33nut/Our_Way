import { Award, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { FooterArt } from '../layout/FooterArt';

type Requirement = {
  quests?: number;
  level?: number;
};

type AchievementNode = {
  id: string;
  title: string;
  description: string;
  requirement: Requirement;
};

type AchievementGroup = {
  id: string;
  title: string;
  subtitle?: string;
  nodes: AchievementNode[];
};

const achievementGroups: AchievementGroup[] = [
  {
    id: 'team',
    title: 'Командное взаимодействие',
    subtitle: 'Получайте за прогресс в заданиях',
    nodes: [
      {
        id: 'social-circle',
        title: 'Круг общения',
        description: 'Пригласи 3 друзей в игру',
        requirement: { quests: 3 },
      },
      {
        id: 'team-play',
        title: 'Игра в команде',
        description: 'Вступи в клан',
        requirement: { quests: 10 },
      },
      {
        id: 'clan-support',
        title: 'Опора гильдии',
        description: 'Займи топ-10 в клане',
        requirement: { quests: 25 },
      },
      {
        id: 'clan-king',
        title: 'Король клана',
        description: 'Создай клан и собери 10 участников',
        requirement: { quests: 40 },
      },
    ],
  },
  {
    id: 'levels',
    title: 'Уровни',
    subtitle: 'Достижения за рост уровня',
    nodes: [
      {
        id: 'novice',
        title: 'Новичок',
        description: 'Достигни 5 уровня',
        requirement: { level: 5 },
      },
      {
        id: 'fighter',
        title: 'Боец',
        description: 'Достигни 10 уровня',
        requirement: { level: 10 },
      },
      {
        id: 'soldier',
        title: 'Солдат',
        description: 'Достигни 20 уровня',
        requirement: { level: 20 },
      },
      {
        id: 'legend',
        title: 'Легенда',
        description: 'Достигни 50 уровня',
        requirement: { level: 50 },
      },
    ],
  },
  {
    id: 'quests',
    title: 'Квесты',
    subtitle: 'Достижения за выполненные задания',
    nodes: [
      {
        id: 'first-step',
        title: 'Первый шаг',
        description: 'Выполни 1 квест',
        requirement: { quests: 1 },
      },
      {
        id: 'strategist',
        title: 'Стратег',
        description: 'Выполни 10 квестов',
        requirement: { quests: 10 },
      },
      {
        id: 'commander',
        title: 'Командир',
        description: 'Выполни 25 квестов',
        requirement: { quests: 25 },
      },
      {
        id: 'general',
        title: 'Генерал',
        description: 'Выполни 50 квестов',
        requirement: { quests: 50 },
      },
    ],
  },
  {
    id: 'player',
    title: 'Достижения игрока',
    subtitle: 'Личные цели по активности',
    nodes: [
      {
        id: 'titan',
        title: 'Титан',
        description: 'Выполни 10 квестов за день',
        requirement: { quests: 10 },
      },
      {
        id: 'reliable',
        title: 'Надёжный',
        description: 'Выполняй квесты 7 дней подряд',
        requirement: { quests: 20 },
      },
      {
        id: 'iron-will',
        title: 'Железная воля',
        description: 'Выполняй 5 квестов 5 дней подряд',
        requirement: { quests: 25 },
      },
      {
        id: 'dragonborn',
        title: 'Драконорожденный',
        description: 'Удерживай топ-1 10 дней',
        requirement: { quests: 35 },
      },
    ],
  },
];

function isUnlocked(node: AchievementNode, stats: { quests: number; level: number }) {
  if (node.requirement.level && stats.level < node.requirement.level) {
    return false;
  }
  if (node.requirement.quests && stats.quests < node.requirement.quests) {
    return false;
  }
  return true;
}

function requirementText(req: Requirement) {
  if (req.level && req.quests) {
    return `Уровень ${req.level} и ${req.quests} квестов`;
  }
  if (req.level) {
    return `Уровень ${req.level}`;
  }
  if (req.quests) {
    return `${req.quests} квестов`;
  }
  return '';
}

export function AchievementsPage() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const stats = {
    quests: user.total_quests_completed || 0,
    level: user.level || 1,
  };
  const allNodes = achievementGroups.flatMap((g) => g.nodes);
  const unlockedCount = allNodes.filter((n) => isUnlocked(n, stats)).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="panel-base panel-teal p-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="text-purple-300">Достижения</h2>
          </div>
          <p className="text-purple-200/70">
            Достижения открываются по мере выполнения заданий.
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm text-purple-200/70">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Получено: {unlockedCount} / {allNodes.length}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievementGroups.map((group) => (
            <div key={group.id} className="panel-base panel-purple p-6">
              <div className="mb-4">
                <h3 className="text-purple-300">{group.title}</h3>
                {group.subtitle && (
                  <p className="text-xs text-purple-200/50">{group.subtitle}</p>
                )}
              </div>
              <div className="space-y-4">
                {group.nodes.map((node) => {
                  const unlocked = isUnlocked(node, stats);
                  return (
                    <div key={node.id} className="flex items-start gap-3">
                      <div className="mt-1">
                        {unlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-purple-300/60" />
                        )}
                      </div>
                      <div className="flex-1 rounded-lg border border-purple-600/20 bg-slate-950/40 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-purple-200 text-sm">{node.title}</p>
                          <span className="text-xs text-purple-200/50">
                            {requirementText(node.requirement)}
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/50 mt-1">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <FooterArt />
      </div>
    </div>
  );
}
