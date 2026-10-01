import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import {
  Check,
  Plus,
  Flame,
  Droplets,
  Coins,
  Shield,
  ArrowUpRight,
  Sparkles,
  Heart,
  Brain,
  Target,
  Leaf,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Habit } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    profile,
    habits,
    toggleHabit,
    editHabit,
    deleteHabit,
    scores,
    dailyMoney,
    currencySymbol,
    isPrivacyMode,
    addWater,
    deposits,
    health,
    morningPriorities,
    toggleMorningPriority,
    editMorningPriority,
    deleteMorningPriority,
    addTransaction,
    salariedMetrics,
  } = useApp();

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [moneyViewMode, setMoneyViewMode] = useState<'monthly' | 'today'>('monthly');
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [moneyType, setMoneyType] = useState<'expense' | 'income'>('expense');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyCategory, setMoneyCategory] = useState('');
  const [moneyDesc, setMoneyDesc] = useState('');

  // Editing habit state
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitTarget, setEditHabitTarget] = useState('');
  const [editHabitUnit, setEditHabitUnit] = useState('');

  // Editing priority state
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [editPriorityText, setEditPriorityText] = useState('');

  const handleToggleHabitWithDelight = (id: string, currentlyCompleted: boolean) => {
    toggleHabit(id);
    if (!currentlyCompleted) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#06b6d4'],
          disableForReducedMotion: true,
        });
      } catch {
        // fallback
      }
    }
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(moneyAmount);
    if (isNaN(parsed) || parsed <= 0) return;
    addTransaction({
      type: moneyType,
      category: moneyCategory.trim() || (moneyType === 'income' ? 'Salary / Income' : 'Daily Expense'),
      amount: parsed,
      description: moneyDesc.trim() || 'Logged via Dashboard',
      bucket: moneyType === 'income' ? 'salary_inflow' : 'need',
      paymentMethod: 'UPI',
    });
    setMoneyAmount('');
    setMoneyCategory('');
    setMoneyDesc('');
    setShowAddMoneyModal(false);
  };

  const openEditHabit = (h: Habit) => {
    setEditingHabit(h);
    setEditHabitName(h.name);
    setEditHabitTarget(h.target);
    setEditHabitUnit(h.unit);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editHabitName.trim()) return;
    editHabit(editingHabit.id, {
      name: editHabitName.trim(),
      target: editHabitTarget.trim() || editingHabit.target,
      unit: editHabitUnit.trim() || editingHabit.unit,
    });
    setEditingHabit(null);
  };

  const openEditPriority = (id: string, text: string) => {
    setEditingPriorityId(id);
    setEditPriorityText(text);
  };

  const handleSavePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriorityId || !editPriorityText.trim()) return;
    editMorningPriority(editingPriorityId, editPriorityText.trim());
    setEditingPriorityId(null);
  };

  // Pillars breakdown
  const pillarCards = [
    {
      id: 'health',
      label: 'Health',
      icon: Heart,
      score: scores.health,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    {
      id: 'wealth',
      label: 'Wealth',
      icon: Coins,
      score: scores.wealth,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      id: 'mind',
      label: 'Mind',
      icon: Brain,
      score: scores.mind,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      id: 'productivity',
      label: 'Productivity',
      icon: Target,
      score: scores.productivity,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      id: 'lifestyle',
      label: 'Lifestyle',
      icon: Leaf,
      score: scores.lifestyle,
      color: 'text-cyan-700',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
    },
  ];

  const todayTokens = deposits.reduce((acc, d) => acc + d.tokens, 0);
  const completedHabitsCount = habits.filter((h) => h.completed).length;
  const avgConsistency =
    habits.length > 0
      ? Math.round(habits.reduce((acc, h) => acc + h.consistency30Days, 0) / habits.length)
      : 0;

  const savingsRatePercent =
    dailyMoney.income > 0 ? ((dailyMoney.saved / dailyMoney.income) * 100).toFixed(1) : '0.0';

  const healthDeposits = deposits
    .filter((d) => d.category === 'health')
    .reduce((acc, d) => acc + d.tokens, 0);
  const wealthDeposits = deposits
    .filter((d) => d.category === 'wealth')
    .reduce((acc, d) => acc + d.tokens, 0);
  const knowledgeDeposits = deposits
    .filter((d) => d.category === 'knowledge')
    .reduce((acc, d) => acc + d.tokens, 0);
  const relationshipDeposits = deposits
    .filter((d) => d.category === 'relationships')
    .reduce((acc, d) => acc + d.tokens, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Good day, {profile.name}
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Daily Life Alignment &amp; Capital
          </p>
        </div>

        {/* Motivational Consistency Streak */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2.5 px-4 shadow-xs self-start sm:self-auto">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-flame" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">
              <span className="font-mono tabular-nums text-amber-700 font-bold">{profile.consistencyStreakDays} day</span> consistency streak
            </div>
            <div className="text-[11px] text-slate-500">
              {avgConsistency}% monthly keystone completion rate
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Score Card + Money Today + Life Bank */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Main Composite Score Box (5 cols on lg, 2 cols on md) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Composite Index
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Today's Life Score
              </h2>
            </div>
            <button
              onClick={() => onNavigate('insights')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Life Balance
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Big Animated Score Gauge */}
          <div className="my-5 flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-slate-100"
                  strokeWidth="7"
                  fill="transparent"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#scoreGradient)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 40}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - scores.overall / 100) }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 leading-none">
                  {scores.overall}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-800">
                {scores.overall >= 80
                  ? 'Exceptional Alignment'
                  : scores.overall >= 70
                  ? 'Solid Goal Alignment'
                  : 'Recovery Recommended'}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Objective feedback metric: <span className="text-slate-700 italic">"How closely did today's actions fulfill your targets?"</span>
              </p>
            </div>
          </div>

          {/* 5 Pillars Mini Breakdown Bar */}
          <div className="pt-3 border-t border-slate-100">
            <div className="grid grid-cols-5 gap-2 text-center">
              {pillarCards.map((p) => {
                const IconComponent = p.icon;
                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-xl ${p.bg} border ${p.border} flex flex-col items-center transition-all`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${p.color} mb-1`} />
                    <span className="text-[10px] text-slate-600 font-medium truncate w-full">
                      {p.label}
                    </span>
                    <span className="text-xs font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {p.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Cashflow Box (4 cols on lg, 1 col on md) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {moneyViewMode === 'monthly' ? 'Monthly Cashflow' : 'Money Today'}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {moneyViewMode === 'monthly' ? 'Salary Inflow & 50-30-20 Cycle' : 'Daily Cashflow Ledger'}
                </span>
              </div>
            </div>

            {/* Toggle between Monthly Cycle (default) and Today */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setMoneyViewMode('monthly')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    moneyViewMode === 'monthly'
                      ? 'bg-white text-emerald-800 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyViewMode('today')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    moneyViewMode === 'today'
                      ? 'bg-white text-emerald-800 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Today
                </button>
              </div>

              <button
                onClick={() => setShowAddMoneyModal(true)}
                className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Log</span>
              </button>
            </div>
          </div>

          {/* Numbers Grid (Monthly vs Today) */}
          <div className="my-3.5 grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
                {moneyViewMode === 'monthly' ? 'Salary Inflow' : 'Income'}
              </span>
              <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
                {isPrivacyMode
                  ? '••••'
                  : `${currencySymbol}${
                      moneyViewMode === 'monthly'
                        ? salariedMetrics.totalInflowThisMonth.toLocaleString()
                        : dailyMoney.income.toLocaleString()
                    }`}
              </span>
              {moneyViewMode === 'monthly' && (
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">In-hand baseline</span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
                {moneyViewMode === 'monthly' ? 'Total Outflow' : 'Spending'}
              </span>
              <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-800 mt-1 block">
                {isPrivacyMode
                  ? '••••'
                  : `${currencySymbol}${
                      moneyViewMode === 'monthly'
                        ? salariedMetrics.totalExpensesThisMonth.toLocaleString()
                        : dailyMoney.spending.toLocaleString()
                    }`}
              </span>
              {moneyViewMode === 'monthly' && (
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Needs + Wants</span>
              )}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 block font-semibold">
                {moneyViewMode === 'monthly' ? 'Saved & SIPs' : 'Saved'}
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-emerald-800 mt-1 block">
                {isPrivacyMode
                  ? '••••'
                  : `${currencySymbol}${
                      moneyViewMode === 'monthly'
                        ? (salariedMetrics.currentCycleSavings + salariedMetrics.totalInvestedThisMonth).toLocaleString()
                        : dailyMoney.saved.toLocaleString()
                    }`}
              </span>
              {moneyViewMode === 'monthly' && (
                <span className="text-[9px] text-emerald-700 font-mono block mt-0.5 font-medium">
                  {salariedMetrics.savingsRate.toFixed(0)}% rate
                </span>
              )}
            </div>
          </div>

          {/* 50-30-20 Monthly Cycle Progress Bar */}
          {moneyViewMode === 'monthly' && (
            <div className="mb-3 p-2 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold text-slate-700">50-30-20 Progress:</span>
                <span className="font-mono text-[10px] text-slate-500">
                  Needs {salariedMetrics.needsPercentOfBudget.toFixed(0)}% · Wants {salariedMetrics.wantsPercentOfBudget.toFixed(0)}% · SIPs {salariedMetrics.investmentsPercentOfBudget.toFixed(0)}%
                </span>
              </div>
              <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200 gap-0.5">
                <div
                  className="bg-slate-700 h-full rounded-l-full transition-all"
                  style={{ width: `${Math.min(50, (salariedMetrics.needsSpent / (salariedMetrics.monthlyInHand || 1)) * 100)}%` }}
                  title={`Needs: ${currencySymbol}${salariedMetrics.needsSpent.toLocaleString()} of ${currencySymbol}${salariedMetrics.needsBudget.toLocaleString()}`}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${Math.min(30, (salariedMetrics.wantsSpent / (salariedMetrics.monthlyInHand || 1)) * 100)}%` }}
                  title={`Wants: ${currencySymbol}${salariedMetrics.wantsSpent.toLocaleString()} of ${currencySymbol}${salariedMetrics.wantsBudget.toLocaleString()}`}
                />
                <div
                  className="bg-emerald-500 h-full rounded-r-full transition-all"
                  style={{ width: `${Math.min(20, (salariedMetrics.investmentsTotal / (salariedMetrics.monthlyInHand || 1)) * 100)}%` }}
                  title={`Investments: ${currencySymbol}${salariedMetrics.investmentsTotal.toLocaleString()} of ${currencySymbol}${salariedMetrics.investmentsBudget.toLocaleString()}`}
                />
              </div>
            </div>
          )}

          {/* Salaried Pacing & Quick Stats */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>
                Savings Rate: <strong className="text-emerald-700 font-mono font-bold">{salariedMetrics.savingsRate.toFixed(1)}%</strong>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Safe: <strong className="text-emerald-700 font-bold">{currencySymbol}{salariedMetrics.safeDailySpend}</strong>/day
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono flex items-center gap-1">
                <span>📅</span>
                <span>{salariedMetrics.daysToPayday} days to payday</span>
                <span className="text-slate-400">({currencySymbol}{salariedMetrics.remainingDiscretionary.toLocaleString()} left)</span>
              </span>
              <button
                onClick={() => onNavigate('wealth')}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                Salaried Ledger
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Life Bank & Micro-Action Box (3 cols on lg, 1 col on md) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Life Bank</h3>
                  <span className="text-[10px] font-mono text-slate-400">Habit Capital Vault</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                +{todayTokens} today
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>❤️ Health Deposits</span>
                <span className="font-mono font-bold text-slate-800">+{healthDeposits}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>💰 Wealth Deposits</span>
                <span className="font-mono font-bold text-slate-800">+{wealthDeposits}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>🧠 Knowledge Deposits</span>
                <span className="font-mono font-bold text-slate-800">+{knowledgeDeposits}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>👨‍👩‍👦 Relationship Deposits</span>
                <span className="font-mono font-bold text-slate-800">+{relationshipDeposits}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button
              onClick={() => addWater(0.25)}
              className="w-full py-2 px-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-xs font-semibold text-cyan-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>+250ml Hydration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keystone Habits with Edit and Delete Options by Symbols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Keystone Habits (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Today's Keystone Habits</h3>
                <span className="text-xs font-mono tabular-nums text-slate-500 font-medium">
                  ({completedHabitsCount}/{habits.length} completed)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                5–8 essential habits. Edit or remove items using the action symbols.
              </p>
            </div>
            <button
              onClick={() => onNavigate('habits')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              All Habits
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Habit Items Checklist with Animated Presence & Micro-interactions */}
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    habit.completed
                      ? 'bg-slate-50/70 border-emerald-200/90 text-slate-700'
                      : 'bg-white border-slate-200/80 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {/* Toggle & Title */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <motion.button
                      whileTap={{ scale: 0.84 }}
                      whileHover={{ scale: 1.08 }}
                      onClick={() => handleToggleHabitWithDelight(habit.id, habit.completed)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        habit.completed
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'border border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/30'
                      }`}
                    >
                      {habit.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </motion.button>

                    <div className="min-w-0 flex-1">
                      <span
                        onClick={() => handleToggleHabitWithDelight(habit.id, habit.completed)}
                        className={`text-xs font-semibold cursor-pointer transition-colors truncate block ${
                          habit.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {habit.name}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        Target: {habit.target} {habit.unit}
                      </div>
                    </div>
                  </div>

                  {/* Habit Streak, Edit and Delete Symbols */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <div
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono font-bold tabular-nums shadow-2xs"
                      title={`${habit.streak} consecutive days maintained`}
                    >
                      <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 text-amber-500 animate-flame" />
                      <span>{habit.streak}d</span>
                    </div>

                    {/* Edit by Symbol */}
                    <button
                      onClick={() => openEditHabit(habit)}
                      title="Edit habit details"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete by Symbol */}
                    <button
                      onClick={() => setHabitToDelete(habit)}
                      title="Delete habit"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Center: Morning Priorities & AI Coach Callout (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Morning Priorities Widget with Edit/Delete Symbols */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">☀️</span>
                <h3 className="text-sm font-bold text-slate-900">Today's Priorities</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Actionable Flow</span>
            </div>

            <div className="space-y-2">
              {morningPriorities.slice(0, 4).map((mp) => (
                <div
                  key={mp.id}
                  className={`flex items-start justify-between gap-2 p-2.5 rounded-lg border text-xs transition-colors ${
                    mp.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-white border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 cursor-pointer" onClick={() => toggleMorningPriority(mp.id)}>
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                        mp.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {mp.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={mp.completed ? 'line-through text-slate-400' : 'font-medium'}>
                      {mp.text}
                    </span>
                  </div>

                  {/* Priority Edit & Delete by Symbols */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditPriority(mp.id, mp.text)}
                      title="Edit priority"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteMorningPriority(mp.id)}
                      title="Delete priority"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">
                {morningPriorities.filter((p) => p.completed).length}/{morningPriorities.length} finished
              </span>
              <button
                onClick={() => onNavigate('habits')}
                className="text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold cursor-pointer"
              >
                Evening Review & Routine →
              </button>
            </div>
          </div>

          {/* Daily Momentum & Growth Insight Callout */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daily Momentum &amp; Growth</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {health.sleepHours > 0 || health.steps > 0 || health.workoutMinutes > 0 ? (
                `"Today: ${health.sleepHours}h sleep, ${health.steps.toLocaleString()} steps logged, ${health.workoutMinutes}m workout. Keep your evening recovery on track!"`
              ) : (
                `"Welcome to HabitFlow! All logs are clean and reset to zero. Complete your morning habits or log hydration to build your first life momentum."`
              )}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Grounded in your 4-week metrics
              </span>
              <button
                onClick={() => onNavigate('insights')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>View Insights</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Edit Habit Details</h3>
              <button onClick={() => setEditingHabit(null)} className="text-slate-400 hover:text-slate-600">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target</label>
                  <input
                    type="text"
                    value={editHabitTarget}
                    onChange={(e) => setEditHabitTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
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
          </div>
        </div>
      )}

      {/* Delete Habit Confirmation Modal */}
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
                  Are you sure you want to remove <span className="font-semibold text-slate-800">"{habitToDelete.name}"</span>?
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHabitToDelete(null)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteHabit(habitToDelete.id);
                    setHabitToDelete(null);
                  }}
                  className="w-1/2 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Delete
                </button>
              </div>
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

      {/* Log Money Modal */}
      <AnimatePresence>
        {showAddMoneyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMoneyModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl"
            >
              <h3 className="text-base font-bold text-slate-900 mb-4">Log Daily Money Entry</h3>
              <form onSubmit={handleAddMoney} className="space-y-4">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMoneyType('expense')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      moneyType === 'expense'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoneyType('income')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      moneyType === 'income'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Income
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 180"
                    value={moneyAmount}
                    onChange={(e) => setMoneyAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:border-emerald-600 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder={moneyType === 'expense' ? 'Food, Travel, Books...' : 'Salary, Freelance, Bonus...'}
                    value={moneyCategory}
                    onChange={(e) => setMoneyCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Note / Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief context..."
                    value={moneyDesc}
                    onChange={(e) => setMoneyDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMoneyModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    Save Entry
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
