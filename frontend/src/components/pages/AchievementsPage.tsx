import { Award } from 'lucide-react';

export function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-500/50 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-purple-400" />
            <h2 className="text-purple-300">Достижения</h2>
          </div>
          <p className="text-purple-200/70">
            Здесь будут собраны личные и командные достижения. Скоро!
          </p>
        </div>
      </div>
    </div>
  );
}
