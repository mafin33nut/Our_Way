import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CharacterData {
  id: number | string;
  name: string;
}

interface Quest {
  id: number | string;
  title: string;
  completed?: boolean;
  completedAt?: string;
  xpReward?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ProgressChartProps {
  character: CharacterData;
  quests: Quest[];
}

export function ProgressChart({ character, quests }: ProgressChartProps) {
  const getLast7DaysData = () => {
    const data: { day: string; quests: number; xp: number }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const completedOnDay = quests.filter(q => {
        if (!q.completed || !q.completedAt) return false;
        return new Date(q.completedAt).toDateString() === dateString;
      });

      const dayName = i === 0 ? 'Сегодня' : date.toLocaleDateString('ru-RU', { weekday: 'short' });
      
      data.push({
        day: dayName,
        quests: completedOnDay.length,
        xp: completedOnDay.reduce((sum, q) => sum + (q.xpReward ?? 0), 0),
      });
    }
    
    return data;
  };

  const data = getLast7DaysData();
  const totalXPThisWeek = data.reduce((sum, d) => sum + d.xp, 0);
  const totalQuestsThisWeek = data.reduce((sum, d) => sum + d.quests, 0);

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border-2 border-purple-600/50 p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h2 className="text-purple-300">Прогресс за неделю</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
          <p className="text-purple-200/60 text-sm mb-1">Всего заданий</p>
          <p className="text-purple-100 text-2xl">{totalQuestsThisWeek}</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
          <p className="text-purple-200/60 text-sm mb-1">Заработано XP</p>
          <p className="text-purple-100 text-2xl">{totalXPThisWeek}</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#a78bfa" tick={{ fill: '#c4b5fd', fontSize: 12 }} />
            <YAxis stroke="#a78bfa" tick={{ fill: '#c4b5fd', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #7c3aed', borderRadius: '8px', color: '#e9d5ff' }} labelStyle={{ color: '#c4b5fd' }} />
            <Bar dataKey="quests" fill="#a78bfa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}