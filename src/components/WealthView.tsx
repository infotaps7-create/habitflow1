import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Sparkles,
  Pencil,
  X,
  Calendar,
  CreditCard,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Settings,
  RefreshCw,
  AlertCircle,
  Building2,
  TrendingUp,
  Landmark,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  MoneyTransaction,
  ImpulseWishlistItem,
  InvestmentAsset,
  SalaryBucket,
  PaymentMethod,
  RecurringCommitment,
} from '../types';

export const WealthView: React.FC = () => {
  const {
    dailyMoney,
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    investments,
    updateInvestment,
    totalNetAssets,
    impulseWishlist,
    addImpulseItem,
    editImpulseItem,
    deleteImpulseItem,
    resolveImpulseItem,
    currencySymbol,
    isPrivacyMode,
    salaryProfile,
    updateSalaryProfile,
    toggleRecurringCommitment,
    addRecurringCommitment,
    editRecurringCommitment,
    deleteRecurringCommitment,
    creditMonthlySalary,
    executePaydayRoutine,
    salariedMetrics,
  } = useApp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'ledger' | 'commitments' | 'salary_slip' | 'assets'>('ledger');

  // Ledger Filter states
  const [bucketFilter, setBucketFilter] = useState<'all' | SalaryBucket>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Transaction Modal state
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [txBucket, setTxBucket] = useState<SalaryBucket>('need');
  const [txCategory, setTxCategory] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('UPI');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);

  // Edit Transaction Modal state
  const [editingTx, setEditingTx] = useState<MoneyTransaction | null>(null);
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxCategory, setEditTxCategory] = useState('');
  const [editTxDesc, setEditTxDesc] = useState('');
  const [editTxBucket, setEditTxBucket] = useState<SalaryBucket>('need');
  const [editTxPaymentMethod, setEditTxPaymentMethod] = useState<PaymentMethod>('UPI');
  const [editTxDate, setEditTxDate] = useState('');

  // Salary Settings Modal state
  const [showSalarySettings, setShowSalarySettings] = useState(false);
  const [tempInHand, setTempInHand] = useState(salaryProfile.monthlyInHand.toString());
  const [tempPayday, setTempPayday] = useState(salaryProfile.paydayDay.toString());
  const [tempGrossCTC, setTempGrossCTC] = useState((salaryProfile.grossSalaryCTC || '').toString());
  const [tempEpf, setTempEpf] = useState((salaryProfile.epfMonthly || '').toString());
  const [tempTds, setTempTds] = useState((salaryProfile.taxTdsMonthly || '').toString());

  // Add Commitment Modal state
  const [showAddCommitment, setShowAddCommitment] = useState(false);
  const [commitName, setCommitName] = useState('');
  const [commitAmount, setCommitAmount] = useState('');
  const [commitCategory, setCommitCategory] = useState('');
  const [commitBucket, setCommitBucket] = useState<'need' | 'want' | 'investment'>('need');
  const [commitDueDay, setCommitDueDay] = useState('5');
  const [commitPaymentMode, setCommitPaymentMode] = useState<PaymentMethod>('Salary Account');

  // Quick Salary Log confirmation modal
  const [showConfirmSalaryModal, setShowConfirmSalaryModal] = useState(false);
  const [customSalaryAmount, setCustomSalaryAmount] = useState(salaryProfile.monthlyInHand.toString());

  // Impulse wishlist modal state
  const [showAddImpulse, setShowAddImpulse] = useState(false);
  const [impulseProduct, setImpulseProduct] = useState('');
  const [impulsePrice, setImpulsePrice] = useState('');
  const [impulseNeed, setImpulseNeed] = useState<'Must have' | 'Maybe' | 'Want only'>('Maybe');
  const [impulseAfford, setImpulseAfford] = useState(true);
  const [impulseOften, setImpulseOften] = useState(true);
  const [impulseWait, setImpulseWait] = useState(true);

  // Editing impulse item state
  const [editingImpulse, setEditingImpulse] = useState<ImpulseWishlistItem | null>(null);
  const [deletingImpulse, setDeletingImpulse] = useState<ImpulseWishlistItem | null>(null);
  const [editImpulseProduct, setEditImpulseProduct] = useState('');
  const [editImpulsePrice, setEditImpulsePrice] = useState('');

  // Editing investment balance state
  const [editingInvestment, setEditingInvestment] = useState<InvestmentAsset | null>(null);
  const [editInvestmentAmount, setEditInvestmentAmount] = useState('');

  // Future You projection variables
  const [monthlyContribution, setMonthlyContribution] = useState(salariedMetrics.investmentsBudget || 15000);
  const [expectedCagr, setExpectedCagr] = useState(12);

  const calculateFutureValue = (years: number) => {
    const r = expectedCagr / 100 / 12;
    const n = years * 12;
    const futureInitial = totalNetAssets * Math.pow(1 + expectedCagr / 100, years);
    const futureAnnuity = r > 0 ? monthlyContribution * ((Math.pow(1 + r, n) - 1) / r) : monthlyContribution * n;
    return Math.round(futureInitial + futureAnnuity);
  };

  const future1Year = calculateFutureValue(1);
  const future5Years = calculateFutureValue(5);
  const future10Years = calculateFutureValue(10);

  // Quick preset category suggestions based on bucket
  const getPresetCategories = (bucket: SalaryBucket) => {
    switch (bucket) {
      case 'need':
        return [
          'House Rent / EMI',
          'Groceries & Pantry',
          'Electricity & Gas',
          'Wi-Fi & Broadband',
          'Office Commute & Fuel',
          'Health & Term Insurance',
          'Medical & Pharmacy',
          'Maid / Domestic Help',
        ];
      case 'want':
        return [
          'Dining Out & Cafes',
          'Food Delivery (Swiggy/Zomato)',
          'Shopping & Apparel',
          'OTT & Digital Subscriptions',
          'Weekend Trips & Outings',
          'Gadgets & Electronics',
          'Grooming & Salon',
        ];
      case 'investment':
        return [
          'Equity Mutual Fund SIP',
          'Direct Stock Investment',
          'Voluntary PF / PPF',
          'Emergency Liquid Fund',
          'NPS / Pension',
          'Gold / SGB',
          'Fixed Deposit (FD)',
        ];
      case 'salary_inflow':
        return [
          'Monthly Salary Credit',
          'Annual / Quarterly Bonus',
          'Travel / Medical Reimbursement',
          'Freelance / Consulting',
          'Stock Dividend / Interest',
          'Tax Refund',
        ];
    }
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (isNaN(val) || val <= 0) return;

    let derivedType = txType;
    if (txBucket === 'salary_inflow') derivedType = 'income';
    else if (txBucket === 'investment') derivedType = 'investment';
    else derivedType = 'expense';

    addTransaction({
      type: derivedType,
      category: txCategory.trim() || (txBucket === 'salary_inflow' ? 'Monthly Salary' : 'General'),
      amount: val,
      description: txDesc.trim() || `${txBucket.toUpperCase()} ledger entry`,
      bucket: txBucket,
      paymentMethod: txPaymentMethod,
      date: txDate,
      isRecurring: txIsRecurring,
    });

    setTxAmount('');
    setTxCategory('');
    setTxDesc('');
    setShowAddTx(false);
  };

  const openEditTx = (tx: MoneyTransaction) => {
    setEditingTx(tx);
    setEditTxAmount(tx.amount.toString());
    setEditTxCategory(tx.category);
    setEditTxDesc(tx.description);
    setEditTxBucket(tx.bucket || (tx.type === 'income' ? 'salary_inflow' : tx.type === 'investment' ? 'investment' : 'need'));
    setEditTxPaymentMethod(tx.paymentMethod || 'UPI');
    setEditTxDate(tx.date || new Date().toISOString().split('T')[0]);
  };

  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const val = parseFloat(editTxAmount);
    if (isNaN(val) || val <= 0) return;

    let derivedType = editingTx.type;
    if (editTxBucket === 'salary_inflow') derivedType = 'income';
    else if (editTxBucket === 'investment') derivedType = 'investment';
    else derivedType = 'expense';

    editTransaction(editingTx.id, {
      amount: val,
      category: editTxCategory.trim() || editingTx.category,
      description: editTxDesc.trim() || editingTx.description,
      bucket: editTxBucket,
      paymentMethod: editTxPaymentMethod,
      date: editTxDate,
      type: derivedType,
    });
    setEditingTx(null);
  };

  const handleSaveSalarySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const inHand = parseFloat(tempInHand);
    const payday = parseInt(tempPayday, 10);
    const gross = tempGrossCTC ? parseFloat(tempGrossCTC) : undefined;
    const epf = tempEpf ? parseFloat(tempEpf) : undefined;
    const tds = tempTds ? parseFloat(tempTds) : undefined;

    if (!isNaN(inHand) && inHand > 0 && !isNaN(payday) && payday >= 1 && payday <= 31) {
      updateSalaryProfile({
        monthlyInHand: inHand,
        paydayDay: payday,
        grossSalaryCTC: gross,
        epfMonthly: epf,
        taxTdsMonthly: tds,
      });
      setShowSalarySettings(false);
    }
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(commitAmount);
    const day = parseInt(commitDueDay, 10);
    if (!commitName.trim() || isNaN(val) || val <= 0) return;

    addRecurringCommitment({
      name: commitName.trim(),
      amount: val,
      category: commitCategory.trim() || commitName.trim(),
      bucket: commitBucket,
      dueDay: isNaN(day) ? 5 : Math.max(1, Math.min(31, day)),
      isPaidThisMonth: false,
      paymentMode: commitPaymentMode,
    });

    setCommitName('');
    setCommitAmount('');
    setCommitCategory('');
    setShowAddCommitment(false);
  };

  const handleConfirmSalaryCredit = () => {
    const amt = parseFloat(customSalaryAmount);
    creditMonthlySalary(isNaN(amt) || amt <= 0 ? undefined : amt);
    setShowConfirmSalaryModal(false);
  };

  const handleCreateImpulse = (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(impulsePrice);
    if (!impulseProduct.trim() || isNaN(priceVal) || priceVal <= 0) return;
    addImpulseItem({
      product: impulseProduct.trim(),
      price: priceVal,
      needScore: impulseNeed,
      canAfford: impulseAfford,
      useOften: impulseOften,
      canWait48Hours: impulseWait,
    });
    setImpulseProduct('');
    setImpulsePrice('');
    setShowAddImpulse(false);
  };

  const openEditImpulse = (item: ImpulseWishlistItem) => {
    setEditingImpulse(item);
    setEditImpulseProduct(item.product);
    setEditImpulsePrice(item.price.toString());
  };

  const handleSaveEditImpulse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImpulse) return;
    const val = parseFloat(editImpulsePrice);
    if (!editImpulseProduct.trim() || isNaN(val) || val <= 0) return;
    editImpulseItem(editingImpulse.id, {
      product: editImpulseProduct.trim(),
      price: val,
    });
    setEditingImpulse(null);
  };

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Bucket filter
      if (bucketFilter !== 'all') {
        if (bucketFilter === 'salary_inflow' && tx.type !== 'income' && tx.bucket !== 'salary_inflow') return false;
        if (bucketFilter === 'investment' && tx.type !== 'investment' && tx.bucket !== 'investment') return false;
        if (bucketFilter === 'need' && tx.bucket !== 'need' && tx.type !== 'expense') return false;
        if (bucketFilter === 'want' && tx.bucket !== 'want') return false;
      }
      // Payment method filter
      if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = tx.category.toLowerCase().includes(query);
        const matchDesc = tx.description.toLowerCase().includes(query);
        const matchMode = (tx.paymentMethod || '').toLowerCase().includes(query);
        return matchName || matchDesc || matchMode;
      }
      return true;
    });
  }, [transactions, bucketFilter, paymentFilter, searchQuery]);

  // Total unbilled credit card spending watch
  const creditCardSpend = salariedMetrics.creditCardTotal;
  const upiSpend = salariedMetrics.upiTotal;

  return (
    <div className="space-y-7 max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Top Header & Salaried Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Salaried Money Ledger &amp; Wealth
                </h1>
                <span className="text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Salaried Mode Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                50-30-20 budget discipline, payday countdown, safe daily spend allowance &amp; silent wealth growth.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Payday Action 1: Credit Monthly Salary */}
          <button
            onClick={() => {
              setCustomSalaryAmount(salaryProfile.monthlyInHand.toString());
              setShowConfirmSalaryModal(true);
            }}
            title="Log this month's net in-hand salary credit"
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>Log Salary Credit</span>
          </button>

          {/* Quick Payday Action 2: Execute Payday Commitments */}
          <button
            onClick={executePaydayRoutine}
            title="Auto-log all unpaid recurring commitments (Rent, SIPs, Utilities) for this month"
            className="px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
            <span>Payday Commitments</span>
          </button>

          {/* Impulse Check Friction */}
          <button
            onClick={() => setShowAddImpulse(true)}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            + 48h Impulse Check
          </button>

          {/* Add Transaction */}
          <button
            onClick={() => {
              setTxType('expense');
              setTxBucket('need');
              setTxCategory('');
              setTxDesc('');
              setTxAmount('');
              setTxDate(new Date().toISOString().split('T')[0]);
              setShowAddTx(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setTempInHand(salaryProfile.monthlyInHand.toString());
              setTempPayday(salaryProfile.paydayDay.toString());
              setTempGrossCTC((salaryProfile.grossSalaryCTC || '').toString());
              setTempEpf((salaryProfile.epfMonthly || '').toString());
              setTempTds((salaryProfile.taxTdsMonthly || '').toString());
              setShowSalarySettings(true);
            }}
            title="Configure monthly salary, payday day, and deductions"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Salaried Life Cycle & Payday Burn-Rate Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Left: Payday Countdown and Cycle info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Salary Cycle Progress · Payday on Day {salariedMetrics.paydayDay}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold font-mono tracking-tight text-white">
                {salariedMetrics.daysToPayday} Days
              </h2>
              <span className="text-xs text-slate-300">
                until next salary credit
              </span>
            </div>

            <div className="w-full max-w-md bg-slate-700/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (salariedMetrics.daysElapsedInCycle / salariedMetrics.totalCycleDays) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono block">
              Day {salariedMetrics.daysElapsedInCycle} of 30 · {30 - salariedMetrics.daysElapsedInCycle} days remaining in current cycle
            </span>
          </div>

          {/* Right: Key Salaried Numbers Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Net In-Hand
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-300 mt-0.5 block">
                {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.monthlyInHand.toLocaleString()}`}
              </span>
              <span className="text-[10px] text-slate-400">Monthly baseline</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Fixed &amp; SIPs
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-cyan-300 mt-0.5 block">
                {isPrivacyMode ? '••••' : `${currencySymbol}${(salariedMetrics.fixedCommitmentsTotal).toLocaleString()}`}
              </span>
              <span className="text-[10px] text-slate-400">Committed obligations</span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Discretionary Pool
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-amber-300 mt-0.5 block">
                {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.remainingDiscretionary.toLocaleString()}`}
              </span>
              <span className="text-[10px] text-slate-400">Remaining to spend</span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
                Safe Daily Spend
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-300 mt-0.5 block">
                {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.safeDailySpend.toLocaleString()}`}
              </span>
              <span className="text-[9px] text-emerald-200/80">/day to payday</span>
            </div>
          </div>
        </div>

        {/* Pacing diagnostic prompt */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong className="text-white">Pacing Guardrail:</strong> Spending at or below{' '}
              <strong className="text-emerald-300">
                {currencySymbol}{salariedMetrics.safeDailySpend.toLocaleString()}/day
              </strong>{' '}
              prevents month-end cash strain and protects your{' '}
              <strong className="text-emerald-300">
                {currencySymbol}{salariedMetrics.investmentsBudget.toLocaleString()} SIP wealth target
              </strong>.
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>💳 CC Spent: {currencySymbol}{creditCardSpend.toLocaleString()}</span>
            <span>📱 UPI Spent: {currencySymbol}{upiSpend.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Salaried 50-30-20 Rule Allocation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              50 / 30 / 20 Salaried Budget Rule
            </h2>
            <p className="text-xs text-slate-500">
              Optimal allocation framework for salaried employees: 50% Needs, 30% Wants, 20% Automated Investments.
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Savings Rate: {salariedMetrics.savingsRate.toFixed(1)}% (Target: ≥ 20%)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 50% Needs Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Needs (50% Target)
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    salariedMetrics.needsSpent <= salariedMetrics.needsBudget
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {salariedMetrics.needsPercentOfBudget.toFixed(0)}% of limit
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.needsSpent.toLocaleString()}`}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Max: {currencySymbol}{salariedMetrics.needsBudget.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    salariedMetrics.needsSpent <= salariedMetrics.needsBudget
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, salariedMetrics.needsPercentOfBudget)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Rent, EMIs, Groceries, Utilities, Commute</span>
              <span className="font-semibold text-slate-700">
                {currencySymbol}{Math.max(0, salariedMetrics.needsBudget - salariedMetrics.needsSpent).toLocaleString()} buffer
              </span>
            </div>
          </div>

          {/* 30% Wants Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Wants (30% Target)
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    salariedMetrics.wantsSpent <= salariedMetrics.wantsBudget
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {salariedMetrics.wantsPercentOfBudget.toFixed(0)}% of limit
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-800">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.wantsSpent.toLocaleString()}`}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Max: {currencySymbol}{salariedMetrics.wantsBudget.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    salariedMetrics.wantsSpent <= salariedMetrics.wantsBudget
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, salariedMetrics.wantsPercentOfBudget)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Dining out, Swiggy, Shopping, OTT, Trips</span>
              <span className="font-semibold text-slate-700">
                {currencySymbol}{Math.max(0, salariedMetrics.wantsBudget - salariedMetrics.wantsSpent).toLocaleString()} available
              </span>
            </div>
          </div>

          {/* 20% Investments Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  Investments &amp; SIPs (20% Target)
                </span>
                <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                  {salariedMetrics.investmentsPercentOfBudget.toFixed(0)}% reached
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-emerald-800">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.investmentsTotal.toLocaleString()}`}
                </span>
                <span className="text-xs font-mono text-emerald-600">
                  Target: {currencySymbol}{salariedMetrics.investmentsBudget.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-emerald-200/60 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, salariedMetrics.investmentsPercentOfBudget)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-800 flex items-center justify-between">
              <span>Equity SIPs, Stocks, EPF, Emergency Fund</span>
              <span className="font-bold flex items-center gap-1">
                {salariedMetrics.investmentsTotal >= salariedMetrics.investmentsBudget ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Target Achieved!
                  </>
                ) : (
                  `${currencySymbol}${(salariedMetrics.investmentsBudget - salariedMetrics.investmentsTotal).toLocaleString()} to goal`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Salaried View Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Daily Ledger Entries</span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full font-mono">
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('commitments')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'commitments'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Monthly Recurring Commitments &amp; EMIs</span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-full font-mono">
              {salaryProfile.recurringCommitments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('salary_slip')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'salary_slip'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Salary Slip &amp; Deductions (CTC vs In-Hand)</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'assets'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Asset Portfolio &amp; Future Projections</span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">
              {currencySymbol}{totalNetAssets.toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRANSACTIONS LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Bucket Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                Filter:
              </span>
              <button
                onClick={() => setBucketFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  bucketFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Entries
              </button>
              <button
                onClick={() => setBucketFilter('need')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  bucketFilter === 'need'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏠 Needs (50%)
              </button>
              <button
                onClick={() => setBucketFilter('want')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  bucketFilter === 'want'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ☕ Wants (30%)
              </button>
              <button
                onClick={() => setBucketFilter('investment')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  bucketFilter === 'investment'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📈 Investments (20%)
              </button>
              <button
                onClick={() => setBucketFilter('salary_inflow')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  bucketFilter === 'salary_inflow'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💼 Salary &amp; Inflows
              </button>
            </div>

            {/* Payment Method & Search */}
            <div className="flex items-center gap-2">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="all">All Payment Modes</option>
                <option value="UPI">UPI (GPay/PhonePe)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Salary Account">Salary Account</option>
                <option value="Auto-Debit">Auto-Debit</option>
                <option value="Cash">Cash</option>
              </select>

              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 w-36 sm:w-44"
              />
            </div>
          </div>

          {/* Ledger Table / List */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-700">
                {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'} displayed
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                  CC Spent: {currencySymbol}{creditCardSpend.toLocaleString()}
                </span>
                <span>•</span>
                <span>UPI Spent: {currencySymbol}{upiSpend.toLocaleString()}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No transactions match the selected filter. Click "+ Add Transaction" above to record daily expenses or SIPs.
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income' || tx.bucket === 'salary_inflow';
                  const isInvest = tx.type === 'investment' || tx.bucket === 'investment';
                  const bucketTag = tx.bucket || (isIncome ? 'salary_inflow' : isInvest ? 'investment' : 'need');

                  return (
                    <div
                      key={tx.id}
                      className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isInvest
                              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                              : bucketTag === 'want'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                          ) : isInvest ? (
                            'SIP'
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {tx.category}
                            </span>

                            {/* Salaried Bucket Badge */}
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                                bucketTag === 'need'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                  : bucketTag === 'want'
                                  ? 'bg-amber-100/70 text-amber-800 border border-amber-200'
                                  : bucketTag === 'investment'
                                  ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                                  : 'bg-cyan-100/70 text-cyan-800 border border-cyan-200'
                              }`}
                            >
                              {bucketTag === 'need'
                                ? 'Need (50%)'
                                : bucketTag === 'want'
                                ? 'Want (30%)'
                                : bucketTag === 'investment'
                                ? 'Invest (20%)'
                                : 'Salary Inflow'}
                            </span>

                            {/* Payment Mode Badge */}
                            {tx.paymentMethod && (
                              <span className="text-[10px] font-mono bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                {tx.paymentMethod === 'Credit Card' && <CreditCard className="w-2.5 h-2.5 text-amber-600" />}
                                {tx.paymentMethod}
                              </span>
                            )}

                            {tx.isRecurring && (
                              <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200">
                                Recurring
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{tx.description}</span>
                            <span>•</span>
                            <span>{tx.date || 'Today'} · {tx.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto">
                        <span
                          className={`text-sm font-mono font-bold tabular-nums ${
                            isIncome
                              ? 'text-emerald-700'
                              : isInvest
                              ? 'text-cyan-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{isPrivacyMode ? '••••' : `${currencySymbol}${tx.amount.toLocaleString()}`}
                        </span>

                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                          <button
                            onClick={() => openEditTx(tx)}
                            title="Edit entry"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            title="Delete entry"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECURRING MONTHLY COMMITMENTS & EMIS */}
      {activeTab === 'commitments' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Fixed Monthly Commitments &amp; EMIs
                </h3>
                <p className="text-xs text-slate-500">
                  Recurring expenses debited right after payday. Keep track of what is paid vs pending.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={executePaydayRoutine}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Execute All Pending</span>
                </button>
                <button
                  onClick={() => setShowAddCommitment(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Commitment</span>
                </button>
              </div>
            </div>

            {/* Commitments Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Total Monthly Obligations
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.fixedCommitmentsTotal.toLocaleString()}`}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider block font-semibold">
                  Paid This Cycle
                </span>
                <span className="text-lg font-bold font-mono text-emerald-800 mt-0.5 block">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${salariedMetrics.fixedCommitmentsPaid.toLocaleString()}`}
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-mono text-amber-800 uppercase tracking-wider block font-semibold">
                  Pending Due
                </span>
                <span className="text-lg font-bold font-mono text-amber-800 mt-0.5 block">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${(salariedMetrics.fixedCommitmentsTotal - salariedMetrics.fixedCommitmentsPaid).toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Checklist */}
            <div className="divide-y divide-slate-100">
              {salaryProfile.recurringCommitments.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRecurringCommitment(item.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                        item.isPaidThisMonth
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500 bg-white'
                      }`}
                    >
                      {item.isPaidThisMonth && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${item.isPaidThisMonth ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          Due on {item.dueDay}th
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.paymentMode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {currencySymbol}{item.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => {
                        addTransaction({
                          type: item.bucket === 'investment' ? 'investment' : 'expense',
                          category: item.name,
                          amount: item.amount,
                          description: `Logged commitment: ${item.category}`,
                          bucket: item.bucket,
                          paymentMethod: item.paymentMode,
                          isRecurring: true,
                          date: new Date().toISOString().split('T')[0],
                        });
                        toggleRecurringCommitment(item.id);
                      }}
                      disabled={item.isPaidThisMonth}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        item.isPaidThisMonth
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer'
                      }`}
                    >
                      {item.isPaidThisMonth ? 'Paid ✓' : 'Pay & Log'}
                    </button>

                    <button
                      onClick={() => deleteRecurringCommitment(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALARY SLIP & DEDUCTIONS (CTC vs IN-HAND) */}
      {activeTab === 'salary_slip' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Salary Structure &amp; Deductions Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Demystifying CTC deductions, employer EPF matching, and tax withholding.
                </p>
              </div>
              <button
                onClick={() => setShowSalarySettings(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Adjust Numbers</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* In-Hand vs Deductions Bar */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
                  Monthly Paycheck Breakdown
                </span>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        Net In-Hand Salary (Bank Credit)
                      </span>
                      <span className="text-[10px] text-emerald-700">What hits your salary account every payday</span>
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-800">
                      {currencySymbol}{salariedMetrics.monthlyInHand.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        EPF / PF Deduction (Employee + Employer)
                      </span>
                      <span className="text-[10px] text-slate-500">12% PF contribution + equal employer match</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-700">
                      {currencySymbol}{salariedMetrics.epfMonthly.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Income Tax Withheld (TDS)
                      </span>
                      <span className="text-[10px] text-slate-500">Monthly tax advance deduction under section 192</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-700">
                      {currencySymbol}{salariedMetrics.taxTdsMonthly.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200/80">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Estimated Gross Monthly CTC
                      </span>
                      <span className="text-[10px] text-slate-500">Total corporate payroll allocation</span>
                    </div>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      {currencySymbol}{salariedMetrics.grossSalaryCTC.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* EPF Silent Wealth Accumulator Explainer */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border border-emerald-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>The EPF Silent Wealth Accumulator</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Most salaried employees forget that their <strong>{currencySymbol}{salariedMetrics.epfMonthly.toLocaleString()}/month EPF</strong> is deducted before salary hits their bank.
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Backed by the government at <strong>8.25% sovereign tax-free interest</strong> with an equal employer match, this builds a multi-lakh safety cushion in the background without requiring daily budgeting effort.
                  </p>

                  <div className="mt-4 p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span>Annual EPF Contribution:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {currencySymbol}{(salariedMetrics.epfMonthly * 12).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Accumulated in Total Assets:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {currencySymbol}{(investments.find((i) => i.category.includes('EPF'))?.amount || 124000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
                  ✓ Automatically included in your Total Net Financial Assets balance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSET PORTFOLIO & FUTURE YOU */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Asset Allocation Class Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Liquid &amp; Invested Assets
                </h3>
                <span className="text-xs text-slate-500">
                  Total capital accumulated from monthly salary savings &amp; automated SIPs.
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Total Net Assets
                </span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {isPrivacyMode ? '••••' : `${currencySymbol}${totalNetAssets.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
              {investments.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{asset.category}</span>
                    <button
                      onClick={() => {
                        setEditingInvestment(asset);
                        setEditInvestmentAmount(asset.amount.toString());
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      title="Update balance"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {isPrivacyMode ? '••••' : `${currencySymbol}${asset.amount.toLocaleString()}`}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Exp. {asset.returnRate}% CAGR</span>
                    <span>{asset.allocationPercent}% share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Future You Compound Calculator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Future You Projection Simulator
                  </h3>
                  <span className="text-xs text-slate-500">
                    See where disciplined 20% SIP salary allocation takes your net worth.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Monthly SIP Contribution</span>
                    <span className="font-mono text-emerald-700">
                      {currencySymbol}{monthlyContribution.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Expected Portfolio CAGR</span>
                    <span className="font-mono text-emerald-700">{expectedCagr}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="18"
                    step="0.5"
                    value={expectedCagr}
                    onChange={(e) => setExpectedCagr(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
                    In 1 Year
                  </span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                    {isPrivacyMode ? '••••' : `${currencySymbol}${future1Year.toLocaleString()}`}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
                    In 5 Years
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald-700 mt-1 block">
                    {isPrivacyMode ? '••••' : `${currencySymbol}${future5Years.toLocaleString()}`}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 block font-bold">
                    In 10 Years
                  </span>
                  <span className="text-xl font-extrabold font-mono text-emerald-800 mt-1 block">
                    {isPrivacyMode ? '••••' : `${currencySymbol}${future10Years.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impulse Purchase 48-Hour Wishlist with Edit and Delete Symbols */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                48-Hour Impulse Purchase Wishlist
              </h2>
              <p className="text-xs text-slate-500">
                Conscious friction that protects your net wealth from impulse buying leaks.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            {impulseWishlist.filter((i) => i.status === 'waiting').length} active waiting delays
          </span>
        </div>

        {impulseWishlist.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No items in impulse wishlist. Use "+ 48h Impulse Check" above to pause and deliberate before making unbudgeted purchases.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {impulseWishlist.map((item) => {
              const isWaiting = item.status === 'waiting';
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${
                    item.status === 'passed'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : item.status === 'purchased'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.product}</h4>
                      <span className="text-base font-bold font-mono text-amber-700 mt-0.5 block">
                        {isPrivacyMode ? '••••' : `${currencySymbol}${item.price.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                          item.status === 'passed'
                            ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300'
                            : item.status === 'purchased'
                            ? 'bg-slate-200/60 text-slate-600 border-slate-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {item.status === 'passed'
                          ? 'Saved ✓'
                          : item.status === 'purchased'
                          ? 'Purchased'
                          : '⏳ In 48h Window'}
                      </span>

                      <button
                        onClick={() => openEditImpulse(item)}
                        title="Edit item"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingImpulse(item)}
                        title="Delete item"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <div className="text-slate-600">
                      Do I need it? <span className="font-semibold text-slate-900">{item.needScore}</span>
                    </div>
                    <div className="text-slate-600">
                      Can I afford it? <span className="font-semibold text-slate-900">{item.canAfford ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-slate-600">
                      Will I use often? <span className="font-semibold text-slate-900">{item.useOften ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="text-slate-600">
                      Wait 48 hours? <span className="font-semibold text-slate-900">{item.canWait48Hours ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {isWaiting && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => resolveImpulseItem(item.id, 'passed')}
                        className="flex-1 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Resisted / Saved ✓
                      </button>
                      <button
                        onClick={() => resolveImpulseItem(item.id, 'purchased')}
                        className="flex-1 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Proceeded to Buy
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Add Transaction Modal (Salaried-Optimized) */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Add Salaried Ledger Entry</h3>
              </div>
              <button onClick={() => setShowAddTx(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-4">
              {/* Salaried Bucket Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select 50-30-20 Category Bucket
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxBucket('need');
                      setTxType('expense');
                      setTxCategory('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      txBucket === 'need'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>🏠 Need</span>
                    <span className="text-[10px] font-normal opacity-80">50% Essential</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxBucket('want');
                      setTxType('expense');
                      setTxCategory('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      txBucket === 'want'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>☕ Want</span>
                    <span className="text-[10px] font-normal opacity-80">30% Lifestyle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxBucket('investment');
                      setTxType('investment');
                      setTxCategory('');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      txBucket === 'investment'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>📈 Invest</span>
                    <span className="text-[10px] font-normal opacity-80">20% SIP/Wealth</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTxBucket('salary_inflow');
                      setTxType('income');
                      setTxCategory('Monthly Salary Credit');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      txBucket === 'salary_inflow'
                        ? 'bg-cyan-700 border-cyan-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>💼 Salary</span>
                    <span className="text-[10px] font-normal opacity-80">Payroll Inflow</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Quick Preset Chips */}
              <div>
                <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Quick Category Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {getPresetCategories(txBucket).map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setTxCategory(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        txCategory === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount and Category input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 2400"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Groceries / Swiggy / SIP"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Salary Account">Salary Account (Debit Card)</option>
                    <option value="Auto-Debit">Auto-Debit / Mandate</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supermarket pantry refill, Friday team dinner"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={txIsRecurring}
                    onChange={(e) => setTxIsRecurring(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                  <span>Mark as recurring monthly expense</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTx(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Edit Ledger Entry</h3>
              <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editTxAmount}
                  onChange={(e) => setEditTxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  50-30-20 Bucket
                </label>
                <select
                  value={editTxBucket}
                  onChange={(e) => setEditTxBucket(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="need">Need (50% Essential)</option>
                  <option value="want">Want (30% Lifestyle)</option>
                  <option value="investment">Investment (20% SIP/Wealth)</option>
                  <option value="salary_inflow">Salary Inflow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editTxCategory}
                  onChange={(e) => setEditTxCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={editTxPaymentMethod}
                  onChange={(e) => setEditTxPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Salary Account">Salary Account</option>
                  <option value="Auto-Debit">Auto-Debit</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Salary Settings & Deductions Modal */}
      {showSalarySettings && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Salaried Profile Settings</h3>
              </div>
              <button onClick={() => setShowSalarySettings(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSalarySettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Net In-Hand Salary ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={tempInHand}
                  onChange={(e) => setTempInHand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The amount credited into your bank account on payday.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payday Day of the Month (1 to 31) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={tempPayday}
                  onChange={(e) => setTempPayday(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  E.g., 1 for 1st of month, 28 for last week.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly EPF / PF ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tempEpf}
                    onChange={(e) => setTempEpf(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly TDS / Tax ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tempTds}
                    onChange={(e) => setTempTds(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Gross CTC ({currencySymbol}) (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={tempGrossCTC}
                  onChange={(e) => setTempGrossCTC(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSalarySettings(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Update Salary Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Recurring Commitment Modal */}
      {showAddCommitment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Recurring Commitment / EMI</h3>
              <button onClick={() => setShowAddCommitment(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCommitment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commitment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Loan EMI, Gym Membership, Cook Salary"
                  value={commitName}
                  onChange={(e) => setCommitName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 12000"
                    value={commitAmount}
                    onChange={(e) => setCommitAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={commitDueDay}
                    onChange={(e) => setCommitDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bucket
                  </label>
                  <select
                    value={commitBucket}
                    onChange={(e) => setCommitBucket(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="need">Need (Essential)</option>
                    <option value="want">Want (Lifestyle)</option>
                    <option value="investment">Investment (SIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={commitPaymentMode}
                    onChange={(e) => setCommitPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Salary Account">Salary Account</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Auto-Debit">Auto-Debit</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCommitment(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Add Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Confirm Salary Log Modal */}
      {showConfirmSalaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <Coins className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Log Monthly Salary Credit</h3>
              <p className="text-xs text-slate-500 mt-1">
                Record your payroll deposit into the ledger for this month.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Net In-Hand Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                value={customSalaryAmount}
                onChange={(e) => setCustomSalaryAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono text-center font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSalaryModal(false)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSalaryCredit}
                className="w-1/2 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Impulse Wishlist Modal */}
      {showAddImpulse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">48-Hour Impulse Check</h3>
            <p className="text-xs text-slate-500 mb-4">
              Commit to waiting 48 hours before purchasing non-essential lifestyle items.
            </p>
            <form onSubmit={handleCreateImpulse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product / Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Headphones, Smartwatch, Shoes"
                  value={impulseProduct}
                  onChange={(e) => setImpulseProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1500"
                  value={impulsePrice}
                  onChange={(e) => setImpulsePrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Do I need it?</span>
                  <select
                    value={impulseNeed}
                    onChange={(e) => setImpulseNeed(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                  >
                    <option value="Must have">Must have</option>
                    <option value="Maybe">Maybe</option>
                    <option value="Want only">Want only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Can I afford it comfortably?</span>
                  <input
                    type="checkbox"
                    checked={impulseAfford}
                    onChange={(e) => setImpulseAfford(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Will I use it often?</span>
                  <input
                    type="checkbox"
                    checked={impulseOften}
                    onChange={(e) => setImpulseOften(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Can I wait 48 hours?</span>
                  <input
                    type="checkbox"
                    checked={impulseWait}
                    onChange={(e) => setImpulseWait(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddImpulse(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Add to 48h Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Investment Balance Modal */}
      {editingInvestment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update Asset Balance</h3>
              <button onClick={() => setEditingInvestment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = parseFloat(editInvestmentAmount);
                if (!isNaN(val) && val >= 0) {
                  updateInvestment(editingInvestment.id, val);
                }
                setEditingInvestment(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingInvestment.category} Balance ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  autoFocus
                  required
                  value={editInvestmentAmount}
                  onChange={(e) => setEditInvestmentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInvestment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Delete Impulse Item Modal */}
      {deletingImpulse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Wishlist Item?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">"{deletingImpulse.product}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingImpulse(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteImpulseItem(deletingImpulse.id);
                  setDeletingImpulse(null);
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
