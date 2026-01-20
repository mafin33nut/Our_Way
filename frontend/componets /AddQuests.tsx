import { useState } from 'react';
import { Plus, Sparkles, Flame, Skull } from 'lucide-react';

interface AddQuestProps {
  onAddQuest: (title: string, description: string, difficulty: 'easy' | 'medium' | 'hard') => void;
}

export function AddQuest({ onAddQuest }: AddQuestProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddQuest(title, description, difficulty);
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40"
      >
        <Plus className="w-5 h-5" />
        <span>Добавить новое задание</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-amber-600/50 p-6 shadow-xl backdrop-blur-sm">
      <h2 className="text-amber-300 mb-4">Создать новое задание</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-amber-200/80 text-sm mb-2">
            Название задания
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Утренняя тренировка"
            className="w-full bg-slate-950/50 border border-amber-600/30 rounded-lg px-4 py-2 text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            autoFocus
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-amber-200/80 text-sm mb-2">
            Описание задания (опционально)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Дополнительные детали о задании..."
            rows={2}
            className="w-full bg-slate-950/50 border border-amber-600/30 rounded-lg px-4 py-2 text-amber-100 placeholder-amber-200/30 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          />
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-amber-200/80 text-sm mb-2">
            Уровень сложности
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDifficulty('easy')}
              className={`p-3 rounded-lg border-2 transition-all ${
                difficulty === 'easy'
                  ? 'bg-green-900/40 border-green-500 text-green-300'
                  : 'bg-slate-950/30 border-green-600/30 text-green-400/60 hover:border-green-500/50'
              }`}
            >
              <Sparkles className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs">Легкое</p>
              <p className="text-xs opacity-60">+50 XP</p>
            </button>

            <button
              type="button"
              onClick={() => setDifficulty('medium')}
              className={`p-3 rounded-lg border-2 transition-all ${
                difficulty === 'medium'
                  ? 'bg-yellow-900/40 border-yellow-500 text-yellow-300'
                  : 'bg-slate-950/30 border-yellow-600/30 text-yellow-400/60 hover:border-yellow-500/50'
              }`}
            >
              <Flame className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs">Среднее</p>
              <p className="text-xs opacity-60">+100 XP</p>
            </button>

            <button
              type="button"
              onClick={() => setDifficulty('hard')}
              className={`p-3 rounded-lg border-2 transition-all ${
                difficulty === 'hard'
                  ? 'bg-red-900/40 border-red-500 text-red-300'
                  : 'bg-slate-950/30 border-red-600/30 text-red-400/60 hover:border-red-500/50'
              }`}
            >
              <Skull className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs">Сложное</p>
              <p className="text-xs opacity-60">+200 XP</p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 py-2 px-4 rounded-lg transition-all"
          >
            Создать задание
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setTitle('');
              setDescription('');
              setDifficulty('easy');
            }}
            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-amber-200 rounded-lg border border-slate-600 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}