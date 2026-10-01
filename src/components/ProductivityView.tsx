import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  AlertTriangle,
  BookOpen,
  Code,
  GraduationCap,
  Smile,
  Zap,
  Coffee,
  Pencil,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { LearningItem } from '../types';

export const ProductivityView: React.FC = () => {
  const {
    timeAllocations,
    updateTimeAllocation,
    learning,
    toggleLearningToday,
    addLearningMinutes,
    editLearning,
    deleteLearning,
    mind,
    updateMind,
  } = useApp();

  const [highlightInput, setHighlightInput] = useState(mind.highlight);
  const [gratitudeInput, setGratitudeInput] = useState(mind.gratitude);
  const [journalSaved, setJournalSaved] = useState(false);

  const [editingLearning, setEditingLearning] = useState<LearningItem | null>(null);
  const [deletingLearning, setDeletingLearning] = useState<LearningItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProgress, setEditProgress] = useState('');
  const [editType, setEditType] = useState<'book' | 'skill' | 'course'>('skill');
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  const socialLeak = timeAllocations.find((t) => t.isLeak);
  const socialHours = socialLeak ? socialLeak.hours : 0;
  const socialMinutes = socialLeak ? socialLeak.minutes : 0;
  const totalLeakMinutes = socialHours * 60 + socialMinutes;
  const weeklyReclaimedMinutes = totalLeakMinutes * 7;
  const potentialWeeklyRecovery = `${Math.floor(weeklyReclaimedMinutes / 60)}h ${weeklyReclaimedMinutes % 60}m/week`;
  const totalTodayLearningMinutes = learning.reduce((acc, l) => acc + l.todayMinutes, 0);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    updateMind({
      highlight: highlightInput.trim(),
      gratitude: gratitudeInput.trim(),
    });
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2500);
  };

  const openEditLearning = (item: LearningItem) => {
    setEditingLearning(item);
    setEditTitle(item.title);
    setEditProgress(item.progressPercent.toString());
    setEditType(item.type);
  };

  const handleSaveLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLearning) return;
    const progressVal = parseInt(editProgress, 10);
    editLearning(editingLearning.id, {
      title: editTitle.trim() || editingLearning.title,
      progressPercent: isNaN(progressVal) ? editingLearning.progressPercent : Math.min(100, Math.max(0, progressVal)),
      type: editType,
    });
    setEditingLearning(null);
  };

  const totalAllocatedMinutes = timeAllocations.reduce(
    (acc, t) => acc + (t.hours * 60 + t.minutes),
    0
  );

  const skillInvestmentData = learning.map((l) => ({
    skill: l.title,
    hours: l.timeThisMonthHours,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Top Header Brief */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Productivity, Time & Mind
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit where your 24 hours go, eliminate sneaky time leaks, and invest in career-compounding skills.
          </p>
        </div>
      </div>

      {/* Section 3: Time Allocation Bar & Leak Detector */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Today's 24-Hour Time Allocation
              </h2>
              <span className="text-xs text-slate-500">
                Track where your finite 24 hours actually went today.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">
            {(totalAllocatedMinutes / 60).toFixed(1)} / 24 Hours Audited
          </span>
        </div>

        {/* Proportional 24-Hour Color Strip */}
        <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center shadow-inner border border-slate-200">
          {totalAllocatedMinutes === 0 ? (
            <div className="w-full text-center text-[10px] font-mono text-slate-400">
              0 hours logged today — Click categories below to allocate time
            </div>
          ) : (
            timeAllocations.map((t) => {
              const minutes = t.hours * 60 + t.minutes;
              const percentage = (minutes / (24 * 60)) * 100;
              if (percentage <= 0) return null;
              return (
                <div
                  key={t.id}
                  style={{ width: `${percentage}%`, backgroundColor: t.color }}
                  className="h-full relative group transition-all"
                  title={`${t.category}: ${t.hours}h ${t.minutes}m (${percentage.toFixed(1)}%)`}
                />
              );
            })
          )}
        </div>

        {/* Time Categories Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {timeAllocations.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border ${
                item.isLeak
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-800 font-semibold truncate">{item.category}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-900 tabular-nums">
                  {item.hours}h {item.minutes > 0 ? `${item.minutes}m` : ''}
                </span>
                {item.isLeak && (
                  <span className="text-[10px] text-amber-800 font-bold uppercase">
                    Time Leak
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Time Leak Recovery Alert Box */}
        {totalLeakMinutes > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Time Leak Detected</h4>
                  <span className="text-[11px] font-mono text-amber-900 font-semibold">
                    {socialHours}h {socialMinutes}m on social media today
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Screen attention leak recorded today. Potential reclaimed weekly focus:{' '}
                  <strong className="text-emerald-800 font-mono font-bold">≈ {potentialWeeklyRecovery}</strong>.
                </p>
                {limitNotice && (
                  <div className="mt-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-md inline-block">
                    {limitNotice}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const leak = timeAllocations.find((t) => t.isLeak);
                  if (leak) {
                    const newMins = Math.max(0, leak.minutes - 15);
                    updateTimeAllocation(leak.id, leak.hours, newMins);
                  }
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-xs"
              >
                -15 min today
              </button>
              <button
                onClick={() => {
                  setLimitNotice('✓ Commitment locked: Screen wind-down set for 10:15 PM tonight!');
                  setTimeout(() => setLimitNotice(null), 3500);
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Set 30m Limit
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                <Clock className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Zero Time Leaks Logged</h4>
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                    0h 0m recorded on social feeds
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Default focus is protected. Use the categories above to log where your 24 hours go today and guard deep work blocks.
                </p>
                {limitNotice && (
                  <div className="mt-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-md inline-block">
                    {limitNotice}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setLimitNotice('✓ Evening screen protection active: wind-down begins at 10:15 PM tonight.');
                  setTimeout(() => setLimitNotice(null), 3500);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Set Screen Limit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Learning with Edit & Delete Symbols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Learning Items (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-700" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Active Learning & Skill Progress
                </h2>
                <span className="text-xs text-slate-500">Books, courses, and technical mastery</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block font-medium">Today's Learning</span>
              <span className="text-xs font-bold font-mono text-emerald-700">
                {totalTodayLearningMinutes} minutes logged
              </span>
            </div>
          </div>

          {/* Learning Items List with Edit/Delete Symbols */}
          <div className="space-y-3.5">
            {learning.map((item) => {
              const IconType =
                item.type === 'book' ? BookOpen : item.type === 'skill' ? Code : GraduationCap;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                        <IconType className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        <div className="text-[10px] font-mono text-slate-500 capitalize">
                          {item.type} · {item.timeThisMonthHours}h this month
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-800 tabular-nums">
                        {item.progressPercent}%
                      </span>
                      <button
                        onClick={() => addLearningMinutes(item.id, 15)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold rounded border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                        title="Add 15 min learning"
                      >
                        +15m
                      </button>

                      {/* Edit by Symbol */}
                      <button
                        onClick={() => openEditLearning(item)}
                        title="Edit learning item"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete by Symbol */}
                      <button
                        onClick={() => setDeletingLearning(item)}
                        title="Delete learning item"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 rounded-full transition-all"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skill Investment Breakdown Table */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Skill Investment (Time Invested This Month)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3 italic">
              "Am I actually investing in high-leverage skills that will increase my future income?"
            </p>

            <div className="space-y-1.5 font-mono text-xs">
              {skillInvestmentData.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-700 font-sans">{s.skill}</span>
                  <span className="text-emerald-700 font-bold tabular-nums">{s.hours} hours</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Mind & Lifestyle Journal (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">How Do You Feel?</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Mind & Vitality</span>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4">
              Track daily mood, vital energy, stress levels, and active gratitude.
            </p>

            {/* Quick Metrics Bar */}
            <div className="space-y-3 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-600" />
                  Mood Rating
                </span>
                <span className="font-mono font-bold text-amber-800 tabular-nums">
                  {mind.mood} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mind.mood}
                onChange={(e) => updateMind({ mood: parseInt(e.target.value) })}
                className="w-full accent-amber-500"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Physical Energy
                </span>
                <span className="font-mono font-bold text-emerald-700 tabular-nums">
                  {mind.energy} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mind.energy}
                onChange={(e) => updateMind({ energy: parseInt(e.target.value) })}
                className="w-full accent-emerald-600"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-rose-600" />
                  Stress Level
                </span>
                <span className="font-mono font-bold text-rose-700 tabular-nums">
                  {mind.stress} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mind.stress}
                onChange={(e) => updateMind({ stress: parseInt(e.target.value) })}
                className="w-full accent-rose-600"
              />
            </div>

            {/* Reflection Inputs */}
            <form onSubmit={handleSaveJournal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Today's Highlight
                </label>
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="Finished presentation ahead of deadline"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gratitude Note
                </label>
                <input
                  type="text"
                  value={gratitudeInput}
                  onChange={(e) => setGratitudeInput(e.target.value)}
                  placeholder="Family dinner, peaceful walk, good health"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  {journalSaved && '✓ Mind state saved!'}
                </span>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Update Journal
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Family / Connection Time:</span>
            <span className="font-mono text-slate-900 font-bold">{mind.familyTimeMinutes} min today</span>
          </div>
        </div>
      </div>

      {/* Edit Learning Modal */}
      {editingLearning && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Edit Learning Item</h3>
              <button onClick={() => setEditingLearning(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveLearning} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 capitalize"
                >
                  <option value="book">📘 Book</option>
                  <option value="skill">💻 Skill</option>
                  <option value="course">🎓 Course</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Progress Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={editProgress}
                  onChange={(e) => setEditProgress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLearning(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Learning Confirmation Modal */}
      {deletingLearning && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Learning Item?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">"{deletingLearning.title}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLearning(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLearning(deletingLearning.id);
                  setDeletingLearning(null);
                }}
                className="w-1/2 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
