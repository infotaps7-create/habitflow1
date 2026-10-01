import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import {
  Check,
  Plus,
  Flame,
  Sunrise,
  Moon,
  Pencil,
  Trash2,
  X,
  Sliders,
  Sparkles,
  Trophy,
  AlertTriangle,
  Zap,
  Award,
} from 'lucide-react';
import { PillarType, Habit } from '../types';

export const HabitsView: React.FC = () => {
  const {
    habits,
    toggleHabit,
    addHabit,
    editHabit,
    deleteHabit,
    morningPriorities,
    toggleMorningPriority,
    addMorningPriority,
    editMorningPriority,
    deleteMorningPriority,
    eveningReview,
    saveEveningReview,
  } = useApp();

  const [activePillarFilter, setActivePillarFilter] = useState<'all' | PillarType>('all');
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitPillar, setNewHabitPillar] = useState<PillarType>('health');
  const [newHabitTarget, setNewHabitTarget] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');

  // Editing habit state
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitTarget, setEditHabitTarget] = useState('');
  const [editHabitUnit, setEditHabitUnit] = useState('');
  const [editHabitPillar, setEditHabitPillar] = useState<PillarType>('health');

  // Morning priority form state
  const [newPriorityText, setNewPriorityText] = useState('');
  const [newPriorityPillar, setNewPriorityPillar] = useState<PillarType>('productivity');
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [editPriorityText, setEditPriorityText] = useState('');

  // Evening review state
  const [reviewMood, setReviewMood] = useState(eveningReview.mood || 4);
  const [reviewEnergy, setReviewEnergy] = useState(eveningReview.energy || 4);
  const [reviewStress, setReviewStress] = useState(eveningReview.stress || 2);
  const [reviewAccomplishments, setReviewAccomplishments] = useState(
    eveningReview.accomplishments.join('\n')
  );
  const [reviewImprove, setReviewImprove] = useState(eveningReview.whatCouldImprove);
  const [reviewTomorrowFocus, setReviewTomorrowFocus] = useState(eveningReview.tomorrowFocus);
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState(false);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const filteredHabits = activePillarFilter === 'all'
    ? habits
    : habits.filter((h) => h.pillar === activePillarFilter);

  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.completed).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Streak Analytics
  const longestStreak = habits.length > 0 ? Math.max(0, ...habits.map((h) => h.streak)) : 0;
  const habitsWithStreak = habits.filter((h) => h.streak > 0).length;
  const habitsOnFire = habits.filter((h) => h.streak >= 7).length;

  const getStreakTier = (streak: number) => {
    const milestones = [7, 14, 21, 30, 60, 100];
    const nextMilestone = milestones.find((m) => m > streak) || (Math.floor(streak / 50) + 1) * 50;
    const prevMilestone = [0, ...milestones].filter((m) => m <= streak).pop() || 0;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round(((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
    );
    const daysRemaining = Math.max(0, nextMilestone - streak);

    if (streak >= 30) {
      return {
        tierName: 'Legendary Streak',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        flameContainer: 'bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 text-white shadow-rose-500/25',
        flameIcon: 'text-white fill-white',
        accentColor: 'text-rose-600',
        progressBar: 'bg-gradient-to-r from-rose-500 to-amber-400',
        nextMilestone,
        daysRemaining,
        progressPercent,
        tag: '🔥 30+ Day Legend',
      };
    }
    if (streak >= 21) {
      return {
        tierName: 'Mastery Streak',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        flameContainer: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white shadow-purple-500/25',
        flameIcon: 'text-white fill-white',
        accentColor: 'text-purple-600',
        progressBar: 'bg-gradient-to-r from-purple-500 to-pink-500',
        nextMilestone,
        daysRemaining,
        progressPercent,
        tag: '⚡ 21+ Day Master',
      };
    }
    if (streak >= 7) {
      return {
        tierName: 'Fire Streak',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        flameContainer: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white shadow-amber-500/25',
        flameIcon: 'text-white fill-white',
        accentColor: 'text-amber-600',
        progressBar: 'bg-gradient-to-r from-amber-500 to-orange-500',
        nextMilestone,
        daysRemaining,
        progressPercent,
        tag: '🔥 7+ Day Heatwave',
      };
    }
    if (streak >= 1) {
      return {
        tierName: 'Ignited Streak',
        badgeClass: 'bg-amber-50/70 text-amber-800 border-amber-200/60',
        flameContainer: 'bg-amber-100 text-amber-600 border border-amber-300 shadow-xs',
        flameIcon: 'text-amber-500 fill-amber-500',
        accentColor: 'text-amber-700',
        progressBar: 'bg-gradient-to-r from-amber-400 to-amber-500',
        nextMilestone,
        daysRemaining,
        progressPercent,
        tag: '✨ Spark Active',
      };
    }
    return {
      tierName: 'Zero Streak',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      flameContainer: 'bg-slate-100 text-slate-400 border border-slate-200',
      flameIcon: 'text-slate-400',
      accentColor: 'text-slate-600',
      progressBar: 'bg-slate-300',
      nextMilestone,
      daysRemaining,
      progressPercent: 0,
      tag: '🌱 Ready to Ignite',
    };
  };

  const handleToggleHabit = (id: string, currentlyCompleted: boolean) => {
    toggleHabit(id);
    if (!currentlyCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#06b6d4', '#8b5cf6'],
          disableForReducedMotion: true,
        });
      } catch {
        // fallback
      }
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit({
      name: newHabitName.trim(),
      pillar: newHabitPillar,
      target: newHabitTarget.trim() || 'Daily',
      unit: newHabitUnit.trim() || 'check',
    });
    setNewHabitName('');
    setNewHabitTarget('');
    setNewHabitUnit('');
    setShowAddHabitModal(false);
  };

  const openEditHabit = (h: Habit) => {
    setEditingHabit(h);
    setEditHabitName(h.name);
    setEditHabitTarget(h.target);
    setEditHabitUnit(h.unit);
    setEditHabitPillar(h.pillar);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editHabitName.trim()) return;
    editHabit(editingHabit.id, {
      name: editHabitName.trim(),
      target: editHabitTarget.trim() || editingHabit.target,
      unit: editHabitUnit.trim() || editingHabit.unit,
      pillar: editHabitPillar,
    });
    setEditingHabit(null);
  };

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityText.trim()) return;
    addMorningPriority(newPriorityPillar, newPriorityText.trim());
    setNewPriorityText('');
  };

  const handleSavePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriorityId || !editPriorityText.trim()) return;
    editMorningPriority(editingPriorityId, editPriorityText.trim());
    setEditingPriorityId(null);
  };

  const handleSaveEvening = (e: React.FormEvent) => {
    e.preventDefault();
    saveEveningReview({
      mood: reviewMood,
      energy: reviewEnergy,
      stress: reviewStress,
      accomplishments: reviewAccomplishments
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      whatCouldImprove: reviewImprove.trim(),
      tomorrowFocus: reviewTomorrowFocus.trim(),
      completed: true,
    });
    setReviewSavedSuccess(true);
    setTimeout(() => setReviewSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Top Header Brief */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Habit Engine &amp; Daily Cadence
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Flow Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Focus on 5–8 high-leverage habits. Consistency percentage prevents demoralization if a streak breaks.
          </p>
        </div>

        <button
          onClick={() => setShowAddHabitModal(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs hover:shadow-emerald-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Keystone Habit</span>
        </button>
      </div>

      {/* Daily Momentum & Completion Progress Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-200/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Today's Habit Momentum
              </div>
              <div className="text-[11px] text-slate-500">
                {completedHabits} of {totalHabits} habits completed today ({completionPercentage}%)
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-800 tabular-nums">
              {completionPercentage}% Target Reached
            </span>
          </div>
        </div>

        {/* Animated Progress Meter */}
        <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-xs"
          />
        </div>

        {/* Visual Streaks Radar Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-emerald-200/60">
          <div className="flex items-center gap-2.5 p-2 sm:px-3 rounded-xl bg-white/80 border border-emerald-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Longest Active Streak
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                {longestStreak} consecutive days
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 sm:px-3 rounded-xl bg-white/80 border border-emerald-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-flame" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Habits On Fire (7d+)
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                {habitsOnFire} habits maintained
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 sm:px-3 rounded-xl bg-white/80 border border-emerald-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Active Streak Chains
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                {habitsWithStreak} of {totalHabits} habits alive
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keystone Habits Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        {/* Segmented Filter Control with Sliding Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 relative">
            {(['all', 'health', 'wealth', 'productivity', 'mind'] as const).map((pillar) => {
              const isActive = activePillarFilter === pillar;
              return (
                <button
                  key={pillar}
                  onClick={() => setActivePillarFilter(pillar)}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer z-10 ${
                    isActive
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHabitPillarTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  {pillar}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {filteredHabits.length} keystone habits
          </div>
        </div>

        {/* Habits Cards with Action Symbols and Smooth Layout Animation */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit) => {
              const streakDetails = getStreakTier(habit.streak);
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    habit.completed
                      ? 'bg-slate-50/70 border-emerald-200/90'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Habit Info & Today Action */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-[220px]">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.08 }}
                        onClick={() => handleToggleHabit(habit.id, habit.completed)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0 ${
                          habit.completed
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'border border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/30'
                        }`}
                        title={habit.completed ? 'Mark pending' : 'Mark completed today to extend streak'}
                      >
                        {habit.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </motion.button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold transition-all ${habit.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {habit.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 capitalize">
                            · {habit.pillar}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>Target: {habit.target} {habit.unit}</span>
                          <span>·</span>
                          <span className={habit.completed ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                            {habit.completed ? 'Completed today ✓' : 'Pending today'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Visual Streaks Counter for this habit */}
                    <div className="flex-1 w-full max-w-full lg:max-w-md bg-white border border-slate-200/90 rounded-xl p-2.5 sm:px-3.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        {/* Visual Flame & Big Counter */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 ${streakDetails.flameContainer}`}
                            title={`${habit.streak} consecutive days maintained`}
                          >
                            <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${streakDetails.flameIcon} ${habit.streak > 0 ? 'animate-flame' : ''}`} />
                          </div>

                          <div>
                            <div className="flex items-baseline gap-1.5 leading-none">
                              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-slate-900">
                                {habit.streak}
                              </span>
                              <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-500">
                                {habit.streak === 1 ? 'day streak' : 'days consecutive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${streakDetails.badgeClass}`}>
                                {streakDetails.tag}
                              </span>
                              {habit.completed ? (
                                <span className="text-[10px] font-medium text-emerald-700 font-mono flex items-center gap-0.5">
                                  ✓ Maintained
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-amber-700 font-mono flex items-center gap-0.5 animate-pulse">
                                  🔥 Pending today
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Next Milestone Gauge & 30d Consistency */}
                        <div className="text-left sm:text-right shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-[10px] font-mono text-slate-400">
                            Target: <strong className="text-slate-700">{streakDetails.nextMilestone}d</strong> ({streakDetails.daysRemaining}d to go)
                          </div>
                          <div className="w-full sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/80 sm:ml-auto">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${streakDetails.progressBar}`}
                              style={{ width: `${streakDetails.progressPercent}%` }}
                            />
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 mt-1">
                            30d consistency: <strong className="text-slate-700">{habit.consistency30Days}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly History Capsules & Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                      {/* Weekly Checkbox Track (M T W T F S S) */}
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                        {daysOfWeek.map((day, idx) => {
                          const done = habit.weeklyHistory[idx];
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400">{day}</span>
                              <div
                                className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-mono font-medium transition-colors ${
                                  done
                                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold'
                                    : 'bg-slate-100 border border-slate-200 text-slate-400'
                                }`}
                              >
                                {done ? '✓' : '·'}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Symbols: Edit (✏️) and Delete (🗑️) */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          onClick={() => openEditHabit(habit)}
                          title="Edit Habit"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setHabitToDelete(habit)}
                          title="Delete Habit"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Routine Blocks: Morning Priorities & Evening Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning Priorities with Edit/Delete Symbols */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Morning Routine & Priorities
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Actionable Morning Intent
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4">
              Prime your day across Health, Wealth, Growth, and Work before touching reactive feeds.
            </p>

            {/* Priorities List with Symbols */}
            <div className="space-y-2">
              {morningPriorities.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs transition-colors ${
                    item.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-white border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div
                    className="flex items-start gap-2.5 flex-1 cursor-pointer"
                    onClick={() => toggleMorningPriority(item.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                        item.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className={item.completed ? 'line-through text-slate-400' : 'font-medium'}>
                        {item.text}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                        {item.pillar}
                      </span>
                    </div>
                  </div>

                  {/* Priority Edit & Delete by Symbols */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPriorityId(item.id);
                        setEditPriorityText(item.text);
                      }}
                      title="Edit priority"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteMorningPriority(item.id)}
                      title="Delete priority"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Priority Form */}
          <form onSubmit={handleAddPriority} className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
            <select
              value={newPriorityPillar}
              onChange={(e) => setNewPriorityPillar(e.target.value as PillarType)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="health">Health</option>
              <option value="wealth">Wealth</option>
              <option value="productivity">Work</option>
              <option value="mind">Growth</option>
            </select>
            <input
              type="text"
              placeholder="Add actionable morning priority..."
              value={newPriorityText}
              onChange={(e) => setNewPriorityText(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>

        {/* Evening Review */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Evening Review & Reflection
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Nightly Calibration
            </span>
          </div>

          <form onSubmit={handleSaveEvening} className="mt-4 space-y-4">
            {/* Mood / Energy / Stress Sliders */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mood: <span className="font-mono text-amber-700">{reviewMood}/5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewMood}
                  onChange={(e) => setReviewMood(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Energy: <span className="font-mono text-emerald-700">{reviewEnergy}/5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewEnergy}
                  onChange={(e) => setReviewEnergy(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Stress: <span className="font-mono text-rose-700">{reviewStress}/5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewStress}
                  onChange={(e) => setReviewStress(parseInt(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What did you accomplish today?
              </label>
              <textarea
                rows={2}
                value={reviewAccomplishments}
                onChange={(e) => setReviewAccomplishments(e.target.value)}
                placeholder="✓ Workout&#10;✓ Completed work&#10;✓ Saved money"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What could improve?
                </label>
                <input
                  type="text"
                  value={reviewImprove}
                  onChange={(e) => setReviewImprove(e.target.value)}
                  placeholder="e.g. Screen time: 2h 45m"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tomorrow's #1 Focus:
                </label>
                <input
                  type="text"
                  value={reviewTomorrowFocus}
                  onChange={(e) => setReviewTomorrowFocus(e.target.value)}
                  placeholder="e.g. Reduce screen time by 30 min"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-emerald-700">
                {reviewSavedSuccess && '✓ Evening review recorded & banked!'}
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Save Review
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation In-App Modal */}
      <AnimatePresence>
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHabitToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">Delete Habit?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-slate-800">"{habitToDelete.name}"</span>? Your streak and logs will be removed.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToDelete(null)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Keep Habit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteHabit(habitToDelete.id);
                    setHabitToDelete(null);
                  }}
                  className="w-1/2 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Habit Modal */}
      <AnimatePresence>
        {editingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingHabit(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Edit Keystone Habit</h3>
                <button onClick={() => setEditingHabit(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveHabit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Habit Title</label>
                  <input
                    type="text"
                    required
                    value={editHabitName}
                    onChange={(e) => setEditHabitName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pillar</label>
                  <select
                    value={editHabitPillar}
                    onChange={(e) => setEditHabitPillar(e.target.value as PillarType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 capitalize focus:border-emerald-600"
                  >
                    <option value="health">❤️ Health</option>
                    <option value="wealth">💰 Wealth</option>
                    <option value="productivity">🎯 Productivity</option>
                    <option value="mind">🧠 Mind</option>
                    <option value="lifestyle">🌱 Lifestyle</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target</label>
                    <input
                      type="text"
                      value={editHabitTarget}
                      onChange={(e) => setEditHabitTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={editHabitUnit}
                      onChange={(e) => setEditHabitUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingHabit(null)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Morning Priority Modal */}
      <AnimatePresence>
        {editingPriorityId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPriorityId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-xl"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-3">Edit Priority Item</h3>
              <form onSubmit={handleSavePriority} className="space-y-3">
                <input
                  type="text"
                  required
                  value={editPriorityText}
                  onChange={(e) => setEditPriorityText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingPriorityId(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddHabitModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Create Keystone Habit</h3>
                </div>
                <button onClick={() => setShowAddHabitModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning 20 min reading"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Life Pillar
                  </label>
                  <select
                    value={newHabitPillar}
                    onChange={(e) => setNewHabitPillar(e.target.value as PillarType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-emerald-600 focus:outline-none capitalize"
                  >
                    <option value="health">❤️ Health</option>
                    <option value="wealth">💰 Wealth</option>
                    <option value="productivity">🎯 Productivity</option>
                    <option value="mind">🧠 Mind &amp; Knowledge</option>
                    <option value="lifestyle">🌱 Lifestyle</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20 or 2"
                      value={newHabitTarget}
                      onChange={(e) => setNewHabitTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. min, L, steps"
                      value={newHabitUnit}
                      onChange={(e) => setNewHabitUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHabitModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Add Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
