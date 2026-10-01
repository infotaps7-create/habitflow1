import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Shield,
  Award,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { PillarType, Goal } from '../types';

export const InsightsView: React.FC = () => {
  const {
    scores,
    profile,
    deposits,
    goals,
    habits,
    transactions,
    learning,
    timeAllocations,
    addGoal,
    editGoal,
    deleteGoal,
    currencySymbol,
    isPrivacyMode,
  } = useApp();

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalPillar, setGoalPillar] = useState<PillarType>('wealth');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState(currencySymbol);
  const [goalYear, setGoalYear] = useState('2027');

  // Editing and deleting goal state
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalCurrent, setEditGoalCurrent] = useState('');
  const [editGoalTarget, setEditGoalTarget] = useState('');
  const [editGoalUnit, setEditGoalUnit] = useState('');
  const [editGoalYear, setEditGoalYear] = useState('');

  // Dynamic Weekly Report Metrics
  const avgConsistency =
    habits.length > 0
      ? Math.round(habits.reduce((acc, h) => acc + h.consistency30Days, 0) / habits.length)
      : 0;

  const weeklyWorkoutCount = habits.find((h) => h.id === 'h3')?.weeklyHistory.filter(Boolean).length || 0;
  const weeklySleepCount = habits.find((h) => h.id === 'h6')?.weeklyHistory.filter(Boolean).length || 0;
  const weeklyWaterCount = habits.find((h) => h.id === 'h2')?.weeklyHistory.filter(Boolean).length || 0;

  const weeklyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklyExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklySaved = transactions
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLearningHours = learning.reduce((acc, l) => acc + l.timeThisMonthHours, 0);
  const totalLearningMinutes = learning.reduce((acc, l) => acc + l.todayMinutes, 0);
  const bookMinutes = learning.find((l) => l.type === 'book')?.todayMinutes || 0;
  const coursesCompleted = learning.filter((l) => l.completedToday).length;

  const deepWorkHours = timeAllocations.find((t) => t.category.includes('Deep Work'))?.hours || 0;
  const habitsDoneCount = habits.filter((h) => h.completed).length;

  const socialLeak = timeAllocations.find((t) => t.isLeak);
  const socialLeakMinutes = socialLeak ? socialLeak.hours * 60 + socialLeak.minutes : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = parseFloat(goalCurrent);
    const targ = parseFloat(goalTarget);
    if (!goalTitle.trim() || isNaN(curr) || isNaN(targ) || targ <= 0) return;
    addGoal({
      title: goalTitle.trim(),
      pillar: goalPillar,
      current: curr,
      target: targ,
      unit: goalUnit.trim() || currencySymbol,
      linkedHabits: [],
      targetYear: goalYear.trim() || 'Ongoing',
    });
    setGoalTitle('');
    setGoalCurrent('');
    setGoalTarget('');
    setShowAddGoalModal(false);
  };

  const openEditGoal = (g: Goal) => {
    setEditingGoal(g);
    setEditGoalTitle(g.title);
    setEditGoalCurrent(g.current.toString());
    setEditGoalTarget(g.target.toString());
    setEditGoalUnit(g.unit);
    setEditGoalYear(g.targetYear);
  };

  const handleSaveEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const curr = parseFloat(editGoalCurrent);
    const targ = parseFloat(editGoalTarget);
    editGoal(editingGoal.id, {
      title: editGoalTitle.trim() || editingGoal.title,
      current: isNaN(curr) ? editingGoal.current : curr,
      target: isNaN(targ) ? editingGoal.target : targ,
      unit: editGoalUnit.trim() || editingGoal.unit,
      targetYear: editGoalYear.trim() || editingGoal.targetYear,
    });
    setEditingGoal(null);
  };

  const totalTokens = deposits.reduce((acc, d) => acc + d.tokens, 0);

  // SVG Radar Coordinates
  const pillarsList = [
    { label: 'Health', score: scores.health, prev: Math.max(0, scores.health > 0 ? scores.health - 10 : 0), angle: -90 },
    { label: 'Wealth', score: scores.wealth, prev: Math.max(0, scores.wealth > 0 ? scores.wealth - 10 : 0), angle: -18 },
    { label: 'Productivity', score: scores.productivity, prev: Math.max(0, scores.productivity > 0 ? scores.productivity - 10 : 0), angle: 54 },
    { label: 'Mind', score: scores.mind, prev: Math.max(0, scores.mind > 0 ? scores.mind - 10 : 0), angle: 126 },
    { label: 'Lifestyle', score: scores.lifestyle, prev: Math.max(0, scores.lifestyle > 0 ? scores.lifestyle - 10 : 0), angle: 198 },
  ];

  const radarRadius = 85;
  const radarCenter = 120;

  const getCoordinates = (score: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const r = (score / 100) * radarRadius;
    const x = radarCenter + r * Math.cos(rad);
    const y = radarCenter + r * Math.sin(rad);
    return { x, y };
  };

  const currentPolygonPoints = pillarsList
    .map((p) => {
      const { x, y } = getCoordinates(p.score, p.angle);
      return `${x},${y}`;
    })
    .join(' ');

  const prevPolygonPoints = pillarsList
    .map((p) => {
      const { x, y } = getCoordinates(p.prev, p.angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Top Header Brief */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Insights & Life Balance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sunday weekly reporting, 5-pillar radar geometry, long-term goals, and your accumulated Life Bank capital.
          </p>
        </div>

        <button
          onClick={() => setShowAddGoalModal(true)}
          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Long-Term Goal</span>
        </button>
      </div>

      {/* Grid: 5-Pillar Balance Radar + Life Bank Capital */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Geometry Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Monthly "Life Balance" View
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                You vs. Your Previous Self
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4">
              A balanced geometry of vitality across your 5 dimensions of healthy and wealthy living.
            </p>

            {/* SVG Visualizer */}
            <div className="flex justify-center items-center py-2 px-4 overflow-hidden">
              <svg viewBox="0 0 240 240" className="w-full max-w-[240px] h-auto overflow-visible font-mono">
                {/* Concentric Radar Rings */}
                {[20, 40, 60, 80, 100].map((ring) => {
                  const r = (ring / 100) * radarRadius;
                  return (
                    <circle
                      key={ring}
                      cx={radarCenter}
                      cy={radarCenter}
                      r={r}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray={ring === 100 ? '0' : '2,2'}
                    />
                  );
                })}

                {/* Radar Axes */}
                {pillarsList.map((p, i) => {
                  const rad = (p.angle * Math.PI) / 180;
                  const x = radarCenter + radarRadius * Math.cos(rad);
                  const y = radarCenter + radarRadius * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={x}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Previous Month Shape */}
                <polygon
                  points={prevPolygonPoints}
                  fill="rgba(148, 163, 184, 0.15)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />

                {/* Current Month Shape */}
                <polygon
                  points={currentPolygonPoints}
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#059669"
                  strokeWidth="2"
                />

                {/* Labels around perimeter */}
                {pillarsList.map((p, i) => {
                  const rad = (p.angle * Math.PI) / 180;
                  const labelR = radarRadius + 22;
                  const lx = radarCenter + labelR * Math.cos(rad);
                  const ly = radarCenter + labelR * Math.sin(rad);
                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-700 text-[11px] font-sans font-semibold"
                    >
                      {p.label} ({p.score})
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
              <span className="text-slate-800 font-semibold">Current Month ({scores.overall}/100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-slate-400 inline-block border-b border-dashed" />
              <span className="text-slate-500">
                Previous Self ({scores.overall > 0 ? Math.max(0, scores.overall - 5) : 0}/100)
              </span>
            </div>
          </div>
        </div>

        {/* Life Bank Ledger & XP Progression (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">The Life Bank</h2>
                  <span className="text-xs text-slate-500">Habits as Compound Capital Deposits</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block font-medium">Life Capital</span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  +{totalTokens} Tokens
                </span>
              </div>
            </div>

            {/* Level Progression */}
            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Level {profile.level} · {profile.levelTitle}
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  +{profile.todayXp} XP Today
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(profile.totalXp % 500) / 5}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{profile.totalXp} Total XP</span>
                <span>Next Rank: 3,500 XP</span>
              </div>
            </div>

            {/* Deposits Log */}
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              Today's Capital Deposits
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {deposits.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  0 deposits recorded today. Completing habits, workouts, or learning will deposit Life Capital here.
                </div>
              ) : (
                deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span className="text-slate-800 font-medium">{dep.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-700 font-bold">+{dep.tokens}</span>
                      <span className="text-[10px] text-slate-400">{dep.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
            "Think of positive actions as permanent equity deposits in your mind, body, and wealth."
          </div>
        </div>
      </div>

      {/* Sunday Weekly Life Report */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sunday Weekly Life Report
              </h2>
              <span className="text-xs text-slate-500">
                End-of-week synthesis and actionable calibrations for next week
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Overall Consistency: {avgConsistency}%
            </span>
          </div>
        </div>

        {/* 4 Pillars Grid Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-rose-700 font-bold mb-2 uppercase tracking-wider text-[11px]">
              ❤️ Health Weekly
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Workout</span>
                <span className="text-slate-900 font-bold">{weeklyWorkoutCount} / 7 days</span>
              </div>
              <div className="flex justify-between">
                <span>Sleep Target</span>
                <span className="text-slate-900 font-bold">{weeklySleepCount} / 7 nights</span>
              </div>
              <div className="flex justify-between">
                <span>Water Target</span>
                <span className="text-slate-900 font-bold">{weeklyWaterCount} / 7 days</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-amber-700 font-bold mb-2 uppercase tracking-wider text-[11px]">
              💰 Wealth Weekly
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Income</span>
                <span className="text-emerald-700 font-bold">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${weeklyIncome.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expenses</span>
                <span className="text-slate-900 font-bold">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${weeklyExpenses.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Saved</span>
                <span className="text-emerald-700 font-bold">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${weeklySaved.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-cyan-700 font-bold mb-2 uppercase tracking-wider text-[11px]">
              🧠 Growth Weekly
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Active Learning</span>
                <span className="text-slate-900 font-bold">
                  {totalLearningHours}h {totalLearningMinutes}m
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reading</span>
                <span className="text-slate-900 font-bold">{bookMinutes}m logged</span>
              </div>
              <div className="flex justify-between">
                <span>Course Modules</span>
                <span className="text-slate-900 font-bold">{coursesCompleted} completed</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-emerald-700 font-bold mb-2 uppercase tracking-wider text-[11px]">
              🎯 Productivity Weekly
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Deep Work</span>
                <span className="text-slate-900 font-bold">{deepWorkHours}h clocked</span>
              </div>
              <div className="flex justify-between">
                <span>Major Tasks</span>
                <span className="text-slate-900 font-bold">
                  {habitsDoneCount} / {habits.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Focus Score</span>
                <span className="text-slate-900 font-bold">{scores.productivity}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Watch & Next Week Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">⚠️ Watch List</h4>
              <p className="text-xs text-slate-600 mt-1">
                {socialLeakMinutes > 0 ? (
                  <>Screen time reached <strong>{Math.floor(socialLeakMinutes / 60)}h {socialLeakMinutes % 60}m</strong> today.</>
                ) : (
                  <>Zero leaks detected today. Screen time and focus remain within healthy limits.</>
                )}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">💡 Next Week Priorities</h4>
              <ul className="text-xs text-slate-600 mt-1 list-disc list-inside space-y-0.5">
                <li>Maintain 4x weekly workout consistency</li>
                <li>Hydrate with water upon waking</li>
                <li>Complete your evening reflection review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Long-Term Goals with Edit & Delete by Symbols */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Long-Term Goals & Habit Contribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily habits directly power your target milestones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      {goal.pillar} · Target {goal.targetYear}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {goal.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-700 tabular-nums">
                      {percent}%
                    </span>

                    {/* Edit by Symbol */}
                    <button
                      onClick={() => openEditGoal(goal)}
                      title="Edit goal"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete by Symbol */}
                    <button
                      onClick={() => setDeletingGoal(goal)}
                      title="Delete goal"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                  <span>
                    Current: <strong className="text-slate-800">{isPrivacyMode && goal.unit === currencySymbol ? '••••' : `${goal.current.toLocaleString()} ${goal.unit}`}</strong>
                  </span>
                  <span>
                    Target: <strong className="text-slate-800">{isPrivacyMode && goal.unit === currencySymbol ? '••••' : `${goal.target.toLocaleString()} ${goal.unit}`}</strong>
                  </span>
                </div>

                <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Habit velocity contribution:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {goal.contributionRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Edit Goal</h3>
              <button onClick={() => setEditingGoal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={editGoalTitle}
                  onChange={(e) => setEditGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Progress
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editGoalCurrent}
                    onChange={(e) => setEditGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Target
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editGoalTarget}
                    onChange={(e) => setEditGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editGoalUnit}
                    onChange={(e) => setEditGoalUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Year
                  </label>
                  <input
                    type="text"
                    value={editGoalYear}
                    onChange={(e) => setEditGoalYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
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

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Set Long-Term Goal</h3>
              <button onClick={() => setShowAddGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build ₹1,00,000 Emergency Fund"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Life Pillar
                </label>
                <select
                  value={goalPillar}
                  onChange={(e) => setGoalPillar(e.target.value as PillarType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 capitalize focus:outline-none"
                >
                  <option value="wealth">💰 Wealth</option>
                  <option value="health">❤️ Health</option>
                  <option value="productivity">🎯 Career & Productivity</option>
                  <option value="lifestyle">🌱 Lifestyle & Travel</option>
                  <option value="mind">🧠 Mind & Knowledge</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 72000"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 150000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹, hours, days/wk"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Year / Cadence
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2027 or Ongoing"
                    value={goalYear}
                    onChange={(e) => setGoalYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Goal Confirmation Modal */}
      {deletingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Goal?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">"{deletingGoal.title}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingGoal(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGoal(deletingGoal.id);
                  setDeletingGoal(null);
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
