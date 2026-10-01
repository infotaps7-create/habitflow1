import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Habit,
  HealthMetrics,
  MoneyTransaction,
  ImpulseWishlistItem,
  InvestmentAsset,
  TimeAllocation,
  LearningItem,
  MindMetrics,
  Goal,
  LifeBankDeposit,
  MorningPriority,
  EveningReview,
  CoachMessage,
  LifeScores,
  StorageSnapshot,
  SalaryProfile,
  RecurringCommitment,
  SalariedMetrics,
} from '../types';
import {
  initialProfile,
  defaultSalaryProfile,
  initialHabits,
  initialHealthMetrics,
  initialTransactions,
  initialInvestments,
  initialImpulseWishlist,
  initialTimeAllocations,
  initialLearning,
  initialMind,
  initialGoals,
  initialDeposits,
  initialMorningPriorities,
  initialEveningReview,
  initialCoachMessages,
} from '../data/initialData';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface StorageFacilityStats {
  totalBytes: number;
  kb: number;
  itemsCount: number;
  lastSaved: string;
  quotaPercent: number;
  status: 'healthy' | 'synced' | 'local_only';
}

interface AppContextType {
  currentUser: User | null;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<void>;
  switchAccount: () => Promise<void>;
  logout: () => Promise<void>;
  authNotification: string | null;
  dismissAuthNotification: () => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  habits: Habit[];
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'completed' | 'streak' | 'consistency30Days' | 'weeklyHistory'>) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  health: HealthMetrics;
  updateHealth: (updates: Partial<HealthMetrics>) => void;
  addWater: (amountLiters: number) => void;
  transactions: MoneyTransaction[];
  addTransaction: (tx: Omit<MoneyTransaction, 'id' | 'time'>) => void;
  editTransaction: (id: string, updates: Partial<MoneyTransaction>) => void;
  deleteTransaction: (id: string) => void;
  investments: InvestmentAsset[];
  updateInvestment: (id: string, newAmount: number) => void;
  impulseWishlist: ImpulseWishlistItem[];
  addImpulseItem: (item: Omit<ImpulseWishlistItem, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void;
  editImpulseItem: (id: string, updates: Partial<ImpulseWishlistItem>) => void;
  deleteImpulseItem: (id: string) => void;
  resolveImpulseItem: (id: string, action: 'passed' | 'purchased') => void;
  timeAllocations: TimeAllocation[];
  updateTimeAllocation: (id: string, hours: number, minutes: number) => void;
  learning: LearningItem[];
  toggleLearningToday: (id: string) => void;
  addLearningMinutes: (id: string, minutes: number) => void;
  editLearning: (id: string, updates: Partial<LearningItem>) => void;
  deleteLearning: (id: string) => void;
  mind: MindMetrics;
  updateMind: (updates: Partial<MindMetrics>) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'contributionRate'>) => void;
  editGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  deposits: LifeBankDeposit[];
  addDeposit: (category: 'health' | 'wealth' | 'knowledge' | 'relationships', label: string, tokens: number) => void;
  morningPriorities: MorningPriority[];
  toggleMorningPriority: (id: string) => void;
  addMorningPriority: (pillar: MorningPriority['pillar'], text: string) => void;
  editMorningPriority: (id: string, text: string) => void;
  deleteMorningPriority: (id: string) => void;
  eveningReview: EveningReview;
  saveEveningReview: (review: EveningReview) => void;
  coachMessages: CoachMessage[];
  sendCoachMessage: (text: string, role?: 'fast' | 'general' | 'deep', useSearch?: boolean) => Promise<void>;
  isCoachTyping: boolean;
  scores: LifeScores;
  dailyMoney: { income: number; spending: number; saved: number };
  totalNetAssets: number;
  currencySymbol: string;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPinLock: (pin: string | null) => void;
  verifyPin: (pin: string) => boolean;
  resetAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  storageStats: StorageFacilityStats;
  storageSnapshots: StorageSnapshot[];
  createSnapshot: (name?: string) => void;
  restoreSnapshot: (id: string) => boolean;
  deleteSnapshot: (id: string) => void;
  salaryProfile: SalaryProfile;
  updateSalaryProfile: (updates: Partial<SalaryProfile>) => void;
  toggleRecurringCommitment: (id: string) => void;
  addRecurringCommitment: (commitment: Omit<RecurringCommitment, 'id'>) => void;
  editRecurringCommitment: (id: string, updates: Partial<RecurringCommitment>) => void;
  deleteRecurringCommitment: (id: string) => void;
  creditMonthlySalary: (customAmount?: number) => void;
  executePaydayRoutine: () => void;
  salariedMetrics: SalariedMetrics;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'habitflow_lifeos_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>(() => loadInitial('profile', initialProfile));
  const [habits, setHabits] = useState<Habit[]>(() => loadInitial('habits', initialHabits));
  const [health, setHealth] = useState<HealthMetrics>(() => loadInitial('health', initialHealthMetrics));
  const [transactions, setTransactions] = useState<MoneyTransaction[]>(() => loadInitial('transactions', initialTransactions));
  const [investments, setInvestments] = useState<InvestmentAsset[]>(() => loadInitial('investments', initialInvestments));
  const [impulseWishlist, setImpulseWishlist] = useState<ImpulseWishlistItem[]>(() => loadInitial('impulseWishlist', initialImpulseWishlist));
  const [timeAllocations, setTimeAllocations] = useState<TimeAllocation[]>(() => loadInitial('timeAllocations', initialTimeAllocations));
  const [learning, setLearning] = useState<LearningItem[]>(() => loadInitial('learning', initialLearning));
  const [mind, setMind] = useState<MindMetrics>(() => loadInitial('mind', initialMind));
  const [goals, setGoals] = useState<Goal[]>(() => loadInitial('goals', initialGoals));
  const [deposits, setDeposits] = useState<LifeBankDeposit[]>(() => loadInitial('deposits', initialDeposits));
  const [morningPriorities, setMorningPriorities] = useState<MorningPriority[]>(() => loadInitial('morningPriorities', initialMorningPriorities));
  const [eveningReview, setEveningReview] = useState<EveningReview>(() => loadInitial('eveningReview', initialEveningReview));
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(() => loadInitial('coachMessages', initialCoachMessages));
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);

      if (user) {
        // Scoped key for local storage fallback
        const userScope = `u_${user.uid}`;
        const loadUserCache = <T,>(key: string, fallback: T): T => {
          try {
            const saved = localStorage.getItem(`${STORAGE_KEY}_${userScope}_${key}`);
            return saved ? JSON.parse(saved) : fallback;
          } catch {
            return fallback;
          }
        };

        // Load persisted state from Firestore
        const userStateDocRef = doc(db, 'users', user.uid, 'data', 'state');
        const userProfileDocRef = doc(db, 'users', user.uid);

        try {
          const [snapshot, profileSnapshot] = await Promise.all([
            getDoc(userStateDocRef),
            getDoc(userProfileDocRef),
          ]);

          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.habits) setHabits(data.habits);
            if (data.health) setHealth(data.health);
            if (data.transactions) setTransactions(data.transactions);
            if (data.investments) setInvestments(data.investments);
            if (data.impulseWishlist) setImpulseWishlist(data.impulseWishlist);
            if (data.timeAllocations) setTimeAllocations(data.timeAllocations);
            if (data.learning) setLearning(data.learning);
            if (data.mind) setMind(data.mind);
            if (data.goals) setGoals(data.goals);
            if (data.deposits) setDeposits(data.deposits);
            if (data.morningPriorities) setMorningPriorities(data.morningPriorities);
            if (data.eveningReview) setEveningReview(data.eveningReview);

            // Profile info
            const pData = profileSnapshot.exists() ? profileSnapshot.data() : {};
            setProfile((prev) => ({
              ...prev,
              name: user.displayName || pData.name || prev.name,
              avatarUrl: user.photoURL || pData.avatarUrl || prev.avatarUrl,
              currencySymbol: pData.currencySymbol || prev.currencySymbol,
              level: pData.level ?? prev.level,
              levelTitle: pData.levelTitle || prev.levelTitle,
              totalXp: pData.totalXp ?? prev.totalXp,
            }));
          } else {
            // First time login for this specific Google user:
            // Check if they have cached data for this user ID, or create a pristine personalized account
            const cachedHabits = loadUserCache('habits', initialHabits);
            const cachedHealth = loadUserCache('health', initialHealthMetrics);
            const cachedTransactions = loadUserCache('transactions', initialTransactions);
            const cachedInvestments = loadUserCache('investments', initialInvestments);
            const cachedImpulseWishlist = loadUserCache('impulseWishlist', initialImpulseWishlist);
            const cachedTimeAllocations = loadUserCache('timeAllocations', initialTimeAllocations);
            const cachedLearning = loadUserCache('learning', initialLearning);
            const cachedMind = loadUserCache('mind', initialMind);
            const cachedGoals = loadUserCache('goals', initialGoals);
            const cachedDeposits = loadUserCache('deposits', initialDeposits);
            const cachedMorningPriorities = loadUserCache('morningPriorities', initialMorningPriorities);
            const cachedEveningReview = loadUserCache('eveningReview', initialEveningReview);

            const newProfile: UserProfile = {
              name: user.displayName || 'LifeOS User',
              title: 'Consistent Builder',
              avatarUrl: user.photoURL || initialProfile.avatarUrl,
              currencySymbol: '₹',
              level: 1,
              levelTitle: 'Novice Builder',
              todayXp: 0,
              totalXp: 0,
              consistencyStreakDays: 1,
              isPrivacyMode: false,
              pinLock: null,
            };

            setProfile(newProfile);
            setHabits(cachedHabits);
            setHealth(cachedHealth);
            setTransactions(cachedTransactions);
            setInvestments(cachedInvestments);
            setImpulseWishlist(cachedImpulseWishlist);
            setTimeAllocations(cachedTimeAllocations);
            setLearning(cachedLearning);
            setMind(cachedMind);
            setGoals(cachedGoals);
            setDeposits(cachedDeposits);
            setMorningPriorities(cachedMorningPriorities);
            setEveningReview(cachedEveningReview);

            // Initialize isolated cloud document for this specific Google account
            await setDoc(userStateDocRef, {
              userId: user.uid,
              habits: cachedHabits,
              health: cachedHealth,
              transactions: cachedTransactions,
              investments: cachedInvestments,
              impulseWishlist: cachedImpulseWishlist,
              timeAllocations: cachedTimeAllocations,
              learning: cachedLearning,
              mind: cachedMind,
              goals: cachedGoals,
              deposits: cachedDeposits,
              morningPriorities: cachedMorningPriorities,
              eveningReview: cachedEveningReview,
              updatedAt: new Date().toISOString(),
            });

            await setDoc(userProfileDocRef, {
              userId: user.uid,
              name: user.displayName || 'LifeOS User',
              email: user.email || '',
              currencySymbol: '₹',
              level: 1,
              levelTitle: 'Novice Builder',
              totalXp: 0,
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/data/state`);
        }
      } else {
        // User logged out: restore guest sandbox state so previous user's confidential data is not visible
        setProfile(initialProfile);
        setHabits(initialHabits);
        setHealth(initialHealthMetrics);
        setTransactions(initialTransactions);
        setInvestments(initialInvestments);
        setImpulseWishlist(initialImpulseWishlist);
        setTimeAllocations(initialTimeAllocations);
        setLearning(initialLearning);
        setMind(initialMind);
        setGoals(initialGoals);
        setDeposits(initialDeposits);
        setMorningPriorities(initialMorningPriorities);
        setEveningReview(initialEveningReview);
        setCoachMessages(initialCoachMessages);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthNotification(null);
      // Prompt user to select their Google account
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        // Standard cancellation when the user dismisses the Google sign-in window
        return;
      }
      if (code === 'auth/popup-blocked') {
        setAuthNotification('Popups were blocked by your browser. Please allow popups for this site to sign in with Google.');
        return;
      }
      if (code === 'auth/network-request-failed') {
        setAuthNotification('Network error while connecting to Google Authentication. Please check your internet connection.');
        return;
      }
      // Non-fatal notification for any other authentication issue
      setAuthNotification(err?.message || 'Authentication could not be completed.');
    }
  };

  const switchAccount = async () => {
    try {
      setAuthNotification(null);
      // Force account selection dialog so user can pick any Google account or add a new one
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (code === 'auth/popup-blocked') {
        setAuthNotification('Popups were blocked by your browser. Please allow popups to switch Google accounts.');
        return;
      }
      setAuthNotification(err?.message || 'Failed to switch Google accounts.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthNotification(null);
    } catch (err: any) {
      console.warn('Sign-out not completed:', err?.message || err);
    }
  };

  // Sync to local storage (user-scoped) & Firestore (account-scoped)
  useEffect(() => {
    const userScope = currentUser ? `u_${currentUser.uid}` : 'guest';
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_profile`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_habits`, JSON.stringify(habits));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_health`, JSON.stringify(health));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_investments`, JSON.stringify(investments));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_impulseWishlist`, JSON.stringify(impulseWishlist));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_timeAllocations`, JSON.stringify(timeAllocations));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_learning`, JSON.stringify(learning));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_mind`, JSON.stringify(mind));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_goals`, JSON.stringify(goals));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_deposits`, JSON.stringify(deposits));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_morningPriorities`, JSON.stringify(morningPriorities));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_eveningReview`, JSON.stringify(eveningReview));
      localStorage.setItem(`${STORAGE_KEY}_${userScope}_coachMessages`, JSON.stringify(coachMessages));
    } catch {}

    // Cloud Firestore Sync when user is authenticated
    if (currentUser) {
      const userStateDocRef = doc(db, 'users', currentUser.uid, 'data', 'state');
      setDoc(userStateDocRef, {
        userId: currentUser.uid,
        habits,
        health,
        transactions,
        investments,
        impulseWishlist,
        timeAllocations,
        learning,
        mind,
        goals,
        deposits,
        morningPriorities,
        eveningReview,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/data/state`);
      });
    }
  }, [
    profile, habits, health, transactions, investments, impulseWishlist,
    timeAllocations, learning, mind, goals, deposits, morningPriorities,
    eveningReview, coachMessages, currentUser,
  ]);

  // Daily Money calculation tailored for salaried professionals
  const dailyMoney = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter((tx) => tx.date === todayStr);

    let income = 0;
    let spending = 0;

    if (todayTxs.length > 0) {
      todayTxs.forEach((tx) => {
        if (tx.type === 'income') income += tx.amount;
        else if (tx.type === 'expense') spending += tx.amount;
      });
    }

    // Derive effective daily earning power from monthly in-hand salary if no lump-sum income logged today
    const monthlyInHand = profile.salaryProfile?.monthlyInHand || defaultSalaryProfile.monthlyInHand;
    const effectiveDailySalary = Math.round(monthlyInHand / 30);
    const finalIncome = income > 0 ? income : effectiveDailySalary;
    const saved = Math.max(0, finalIncome - spending);

    return { income: finalIncome, spending, saved };
  }, [transactions, profile.salaryProfile]);

  // Salaried Cycle & 50-30-20 Rule Metrics Engine
  const salariedMetrics = React.useMemo<SalariedMetrics>(() => {
    const currentSalary = profile.salaryProfile || defaultSalaryProfile;
    const monthlyInHand = currentSalary.monthlyInHand || 75000;
    const grossSalaryCTC = currentSalary.grossSalaryCTC || Math.round(monthlyInHand * 1.25);
    const epfMonthly = currentSalary.epfMonthly || 3600;
    const taxTdsMonthly = currentSalary.taxTdsMonthly || 5500;
    const paydayDay = currentSalary.paydayDay || 1;

    // Cycle countdown
    const now = new Date();
    const currentDay = now.getDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    let daysToPayday: number;
    if (currentDay < paydayDay) {
      daysToPayday = paydayDay - currentDay;
    } else {
      daysToPayday = (daysInCurrentMonth - currentDay) + paydayDay;
    }
    const totalCycleDays = 30;
    const daysElapsedInCycle = Math.max(1, Math.min(totalCycleDays, totalCycleDays - daysToPayday));

    // 50-30-20 Rule Budgets
    const needsBudget = Math.round(monthlyInHand * 0.5);
    const wantsBudget = Math.round(monthlyInHand * 0.3);
    const investmentsBudget = Math.round(monthlyInHand * 0.2);

    let needsSpent = 0;
    let wantsSpent = 0;
    let investmentsTotal = 0;
    let totalInflowThisMonth = 0;
    let totalExpensesThisMonth = 0;
    let creditCardTotal = 0;
    let upiTotal = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalInflowThisMonth += tx.amount;
      } else if (tx.type === 'investment' || tx.bucket === 'investment') {
        investmentsTotal += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpensesThisMonth += tx.amount;
        if (tx.bucket === 'need') {
          needsSpent += tx.amount;
        } else if (tx.bucket === 'want') {
          wantsSpent += tx.amount;
        } else {
          const text = (tx.category + ' ' + tx.description).toLowerCase();
          const isNeed = /rent|hous|grocer|food store|utilit|bill|electr|water|gas|wifi|broadband|fuel|metro|commute|cab|petrol|insur|maid|cook|clean|emi|loan|medic|doctor|health|tax/.test(text);
          if (isNeed) needsSpent += tx.amount;
          else wantsSpent += tx.amount;
        }
      }

      if (tx.paymentMethod === 'Credit Card') creditCardTotal += tx.amount;
      else if (tx.paymentMethod === 'UPI') upiTotal += tx.amount;
    });

    const effectiveInflow = totalInflowThisMonth > 0 ? totalInflowThisMonth : monthlyInHand;
    const currentCycleSavings = Math.max(0, effectiveInflow - totalExpensesThisMonth - investmentsTotal);
    const savingsRate = effectiveInflow > 0 ? ((currentCycleSavings + investmentsTotal) / effectiveInflow) * 100 : 0;
    const remainingDiscretionary = Math.max(0, effectiveInflow - totalExpensesThisMonth - investmentsTotal);
    const safeDailySpend = Math.max(0, Math.round(remainingDiscretionary / Math.max(1, daysToPayday)));

    const needsPercentOfBudget = needsBudget > 0 ? (needsSpent / needsBudget) * 100 : 0;
    const wantsPercentOfBudget = wantsBudget > 0 ? (wantsSpent / wantsBudget) * 100 : 0;
    const investmentsPercentOfBudget = investmentsBudget > 0 ? (investmentsTotal / investmentsBudget) * 100 : 0;

    const fixedCommitmentsTotal = currentSalary.recurringCommitments.reduce((sum, c) => sum + c.amount, 0);
    const fixedCommitmentsPaid = currentSalary.recurringCommitments.filter((c) => c.isPaidThisMonth).reduce((sum, c) => sum + c.amount, 0);

    return {
      monthlyInHand,
      grossSalaryCTC,
      epfMonthly,
      taxTdsMonthly,
      paydayDay,
      daysToPayday,
      daysElapsedInCycle,
      totalCycleDays,
      needsSpent,
      needsBudget,
      needsPercentOfBudget,
      wantsSpent,
      wantsBudget,
      wantsPercentOfBudget,
      investmentsTotal,
      investmentsBudget,
      investmentsPercentOfBudget,
      totalInflowThisMonth: effectiveInflow,
      totalExpensesThisMonth,
      totalInvestedThisMonth: investmentsTotal,
      currentCycleSavings,
      savingsRate,
      remainingDiscretionary,
      safeDailySpend,
      creditCardTotal,
      upiTotal,
      fixedCommitmentsTotal,
      fixedCommitmentsPaid,
    };
  }, [profile.salaryProfile, transactions]);

  // Total Net Financial Assets
  const totalNetAssets = React.useMemo(() => {
    return investments.reduce((acc, item) => acc + item.amount, 0);
  }, [investments]);

  // Score calculation engine
  const scores = React.useMemo<LifeScores>(() => {
    // 1. Health Score (Sleep, Water, Steps, Workout, Outdoor, Junk food)
    const hasHealthLogs =
      health.sleepHours > 0 ||
      health.waterLiters > 0 ||
      health.steps > 0 ||
      health.workoutMinutes > 0 ||
      health.outdoorMinutes > 0;
    let healthScore = 0;
    if (hasHealthLogs) {
      const sleepFactor = Math.min(1, health.sleepHours / health.sleepTarget);
      const waterFactor = Math.min(1, health.waterLiters / health.waterTarget);
      const stepsFactor = Math.min(1, health.steps / health.stepsTarget);
      const workoutFactor = Math.min(1, health.workoutMinutes / health.workoutTarget);
      const outdoorFactor = Math.min(1, health.outdoorMinutes / health.outdoorTarget);
      const junkPenalty = Math.max(0, (health.junkFoodCount - 1) * 0.1);
      healthScore = Math.round(
        Math.max(
          0,
          Math.min(
            100,
            ((sleepFactor * 0.25 +
              waterFactor * 0.2 +
              stepsFactor * 0.25 +
              workoutFactor * 0.2 +
              outdoorFactor * 0.1) -
              junkPenalty) *
              100
          )
        )
      );
    }

    // 2. Wealth Score (Salaried 50-30-20 discipline, Savings rate, Habits, Impulse friction)
    const wealthHabitsCompleted = habits.filter((h) => h.pillar === 'wealth' && h.completed).length;
    const wealthHabitsTotal = Math.max(1, habits.filter((h) => h.pillar === 'wealth').length);
    const wealthHabitRatio = wealthHabitsCompleted / wealthHabitsTotal;

    const needsFactor = salariedMetrics.needsSpent <= salariedMetrics.needsBudget ? 1 : Math.max(0.3, salariedMetrics.needsBudget / Math.max(1, salariedMetrics.needsSpent));
    const wantsFactor = salariedMetrics.wantsSpent <= salariedMetrics.wantsBudget ? 1 : Math.max(0.3, salariedMetrics.wantsBudget / Math.max(1, salariedMetrics.wantsSpent));
    const invFactor = Math.min(1.2, salariedMetrics.investmentsTotal / Math.max(1, salariedMetrics.investmentsBudget));
    const salariedDiscipline = (needsFactor * 0.35 + wantsFactor * 0.35 + invFactor * 0.3);

    const savingsRatio = dailyMoney.income > 0 ? dailyMoney.saved / dailyMoney.income : 0.5;
    const impulseBonus = impulseWishlist.filter((i) => i.status === 'passed').length * 2;
    const wealthScore = Math.round(
      Math.max(
        0,
        Math.min(
          100,
          (savingsRatio * 0.25 + wealthHabitRatio * 0.35 + salariedDiscipline * 0.4) * 90 + Math.min(10, impulseBonus)
        )
      )
    );

    // 3. Mind Score (Mood, Energy, Low stress, Gratitude)
    const hasMindLogs = mind.mood > 0 || mind.energy > 0 || mind.gratitude.trim().length > 0;
    let mindScore = 0;
    if (hasMindLogs) {
      const moodFactor = mind.mood / 5;
      const energyFactor = mind.energy / 5;
      const stressInverted = mind.stress > 0 ? (6 - mind.stress) / 5 : 0.5;
      const gratitudeBonus = mind.gratitude.trim().length > 5 ? 0.1 : 0;
      mindScore = Math.round(
        Math.max(0, Math.min(100, (moodFactor * 0.35 + energyFactor * 0.35 + stressInverted * 0.2 + gratitudeBonus) * 100))
      );
    }

    // 4. Productivity Score (Time leak penalty, Learning, Tasks completed)
    const learningCompleted = learning.filter((l) => l.completedToday).length;
    const learningRatio = learning.length > 0 ? learningCompleted / learning.length : 0;
    const prodHabits = habits.filter((h) => h.pillar === 'productivity');
    const prodHabitsCompleted = prodHabits.filter((h) => h.completed).length;
    const prodHabitsRatio = prodHabits.length > 0 ? prodHabitsCompleted / prodHabits.length : 0;
    const hasProdLogs =
      prodHabitsCompleted > 0 ||
      learningCompleted > 0 ||
      learning.some((l) => l.todayMinutes > 0);
    let productivityScore = 0;
    if (hasProdLogs) {
      const leakItem = timeAllocations.find((t) => t.isLeak);
      const leakMinutes = leakItem ? leakItem.hours * 60 + leakItem.minutes : 0;
      const leakPenalty = Math.max(0, (leakMinutes - 90) / 120) * 0.15;
      productivityScore = Math.round(
        Math.max(0, Math.min(100, (prodHabitsRatio * 0.55 + learningRatio * 0.45 - leakPenalty) * 100))
      );
    }

    // 5. Lifestyle Score (Balance, Family time, Outdoor, Evening review)
    const hasLifestyleLogs = mind.familyTimeMinutes > 0 || health.outdoorMinutes > 0 || eveningReview.completed;
    let lifestyleScore = 0;
    if (hasLifestyleLogs) {
      const outdoorFactor = Math.min(1, health.outdoorMinutes / health.outdoorTarget);
      const familyFactor = Math.min(1, mind.familyTimeMinutes / 60);
      const eveningReviewBonus = eveningReview.completed ? 0.2 : 0;
      lifestyleScore = Math.round(
        Math.max(0, Math.min(100, (outdoorFactor * 0.4 + familyFactor * 0.4 + eveningReviewBonus) * 100))
      );
    }

    const overall = Math.round((healthScore + wealthScore + mindScore + productivityScore + lifestyleScore) / 5);

    return {
      overall,
      health: healthScore,
      wealth: wealthScore,
      mind: mindScore,
      productivity: productivityScore,
      lifestyle: lifestyleScore,
    };
  }, [health, dailyMoney, impulseWishlist, habits, mind, timeAllocations, learning, eveningReview, investments]);

  // Habit Toggle
  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const newCompleted = !h.completed;
        const newStreak = newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1);
        const newHistory = [...h.weeklyHistory];
        newHistory[6] = newCompleted;
        return {
          ...h,
          completed: newCompleted,
          streak: newStreak,
          weeklyHistory: newHistory,
        };
      })
    );

    // Grant XP and deposit
    setProfile((prev) => ({
      ...prev,
      todayXp: prev.todayXp + 10,
      totalXp: prev.totalXp + 10,
    }));
  };

  const addHabit = (data: Omit<Habit, 'id' | 'completed' | 'streak' | 'consistency30Days' | 'weeklyHistory'>) => {
    const newHabit: Habit = {
      ...data,
      id: `h-${Date.now()}`,
      completed: false,
      streak: 0,
      consistency30Days: 100,
      weeklyHistory: [false, false, false, false, false, false, false],
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const editHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const updateHealth = (updates: Partial<HealthMetrics>) => {
    setHealth((prev) => ({ ...prev, ...updates }));
  };

  const addWater = (amountLiters: number) => {
    setHealth((prev) => {
      const newWater = parseFloat((prev.waterLiters + amountLiters).toFixed(2));
      return { ...prev, waterLiters: newWater };
    });
    addDeposit('health', `Drank ${amountLiters}L water hydration`, 1);
  };

  const addTransaction = (tx: Omit<MoneyTransaction, 'id' | 'time'>) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = tx.date || now.toISOString().split('T')[0];
    const newTx: MoneyTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      time,
      date,
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (tx.type === 'income') {
      addDeposit('wealth', `Income earned: +${profile.currencySymbol || '₹'}${tx.amount}`, 2);
    } else if (tx.type === 'investment') {
      addDeposit('wealth', `Invested: +${profile.currencySymbol || '₹'}${tx.amount}`, 2);
    }
  };

  const editTransaction = (id: string, updates: Partial<MoneyTransaction>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateInvestment = (id: string, newAmount: number) => {
    setInvestments((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, amount: newAmount } : inv))
    );
  };

  const updateSalaryProfile = (updates: Partial<SalaryProfile>) => {
    setProfile((prev) => {
      const current = prev.salaryProfile || defaultSalaryProfile;
      const updated: SalaryProfile = { ...current, ...updates };
      return { ...prev, salaryProfile: updated };
    });
  };

  const toggleRecurringCommitment = (id: string) => {
    setProfile((prev) => {
      const current = prev.salaryProfile || defaultSalaryProfile;
      const commitments = current.recurringCommitments.map((c) =>
        c.id === id ? { ...c, isPaidThisMonth: !c.isPaidThisMonth } : c
      );
      return {
        ...prev,
        salaryProfile: { ...current, recurringCommitments: commitments },
      };
    });
  };

  const addRecurringCommitment = (commitment: Omit<RecurringCommitment, 'id'>) => {
    setProfile((prev) => {
      const current = prev.salaryProfile || defaultSalaryProfile;
      const newItem: RecurringCommitment = {
        ...commitment,
        id: `rc-${Date.now()}`,
      };
      return {
        ...prev,
        salaryProfile: {
          ...current,
          recurringCommitments: [...current.recurringCommitments, newItem],
        },
      };
    });
  };

  const editRecurringCommitment = (id: string, updates: Partial<RecurringCommitment>) => {
    setProfile((prev) => {
      const current = prev.salaryProfile || defaultSalaryProfile;
      const commitments = current.recurringCommitments.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      return {
        ...prev,
        salaryProfile: { ...current, recurringCommitments: commitments },
      };
    });
  };

  const deleteRecurringCommitment = (id: string) => {
    setProfile((prev) => {
      const current = prev.salaryProfile || defaultSalaryProfile;
      const commitments = current.recurringCommitments.filter((c) => c.id !== id);
      return {
        ...prev,
        salaryProfile: { ...current, recurringCommitments: commitments },
      };
    });
  };

  const creditMonthlySalary = (customAmount?: number) => {
    const salary = customAmount || (profile.salaryProfile?.monthlyInHand || defaultSalaryProfile.monthlyInHand);
    const date = new Date().toISOString().split('T')[0];
    const monthName = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    addTransaction({
      type: 'income',
      category: 'Monthly Salary Credit',
      amount: salary,
      description: `Payroll in-hand credit for ${monthName}`,
      bucket: 'salary_inflow',
      paymentMethod: 'Salary Account',
      date,
    });
  };

  const executePaydayRoutine = () => {
    const current = profile.salaryProfile || defaultSalaryProfile;
    const unpaid = current.recurringCommitments.filter((c) => !c.isPaidThisMonth);
    const date = new Date().toISOString().split('T')[0];

    unpaid.forEach((c) => {
      addTransaction({
        type: c.bucket === 'investment' ? 'investment' : 'expense',
        category: c.name,
        amount: c.amount,
        description: `Automated payday commit: ${c.category}`,
        bucket: c.bucket,
        paymentMethod: c.paymentMode,
        isRecurring: true,
        date,
      });
    });

    setProfile((prev) => {
      const prof = prev.salaryProfile || defaultSalaryProfile;
      const updated = prof.recurringCommitments.map((c) => ({ ...c, isPaidThisMonth: true }));
      return { ...prev, salaryProfile: { ...prof, recurringCommitments: updated } };
    });

    addDeposit('wealth', `Executed Payday Financial Routine (${unpaid.length} commitments logged)`, 5);
  };

  const addImpulseItem = (item: Omit<ImpulseWishlistItem, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();
    const newItem: ImpulseWishlistItem = {
      ...item,
      id: `imp-${Date.now()}`,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'waiting',
    };
    setImpulseWishlist((prev) => [newItem, ...prev]);
  };

  const editImpulseItem = (id: string, updates: Partial<ImpulseWishlistItem>) => {
    setImpulseWishlist((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteImpulseItem = (id: string) => {
    setImpulseWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const resolveImpulseItem = (id: string, action: 'passed' | 'purchased') => {
    setImpulseWishlist((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          status: action,
          reason:
            action === 'passed'
              ? `Saved ${profile.currencySymbol}${i.price}! Resisted impulse purchase.`
              : `Purchased after 48-hour conscious deliberation.`,
        };
      })
    );

    if (action === 'passed') {
      const item = impulseWishlist.find((i) => i.id === id);
      const savedAmount = item ? item.price : 500;
      addDeposit('wealth', `Resisted impulse purchase of ${profile.currencySymbol}${savedAmount}`, 3);
      setProfile((prev) => ({
        ...prev,
        todayXp: prev.todayXp + 25,
        totalXp: prev.totalXp + 25,
      }));
    }
  };

  const updateTimeAllocation = (id: string, hours: number, minutes: number) => {
    setTimeAllocations((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hours, minutes } : t))
    );
  };

  const toggleLearningToday = (id: string) => {
    setLearning((prev) =>
      prev.map((l) => (l.id === id ? { ...l, completedToday: !l.completedToday } : l))
    );
    addDeposit('knowledge', 'Dedicated 20+ min to skill growth', 2);
  };

  const addLearningMinutes = (id: string, minutes: number) => {
    setLearning((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              todayMinutes: l.todayMinutes + minutes,
              timeThisMonthHours: parseFloat((l.timeThisMonthHours + minutes / 60).toFixed(1)),
              completedToday: true,
            }
          : l
      )
    );
  };

  const editLearning = (id: string, updates: Partial<LearningItem>) => {
    setLearning((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLearning = (id: string) => {
    setLearning((prev) => prev.filter((l) => l.id !== id));
  };

  const updateMind = (updates: Partial<MindMetrics>) => {
    setMind((prev) => ({ ...prev, ...updates }));
  };

  const addGoal = (data: Omit<Goal, 'id' | 'contributionRate'>) => {
    const newGoal: Goal = {
      ...data,
      id: `g-${Date.now()}`,
      contributionRate: 75,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const editGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addDeposit = (
    category: 'health' | 'wealth' | 'knowledge' | 'relationships',
    label: string,
    tokens: number
  ) => {
    const pillarMap: Record<string, Habit['pillar']> = {
      health: 'health',
      wealth: 'wealth',
      knowledge: 'productivity',
      relationships: 'lifestyle',
    };
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newDep: LifeBankDeposit = {
      id: `dep-${Date.now()}-${Math.random()}`,
      category,
      pillar: pillarMap[category] || 'health',
      label,
      tokens,
      time,
    };
    setDeposits((prev) => [newDep, ...prev]);
  };

  const toggleMorningPriority = (id: string) => {
    setMorningPriorities((prev) =>
      prev.map((mp) => (mp.id === id ? { ...mp, completed: !mp.completed } : mp))
    );
  };

  const addMorningPriority = (pillar: MorningPriority['pillar'], text: string) => {
    const newMp: MorningPriority = {
      id: `mp-${Date.now()}`,
      pillar,
      text,
      completed: false,
    };
    setMorningPriorities((prev) => [...prev, newMp]);
  };

  const editMorningPriority = (id: string, text: string) => {
    setMorningPriorities((prev) => prev.map((mp) => (mp.id === id ? { ...mp, text } : mp)));
  };

  const deleteMorningPriority = (id: string) => {
    setMorningPriorities((prev) => prev.filter((mp) => mp.id !== id));
  };

  const saveEveningReview = (review: EveningReview) => {
    setEveningReview(review);
    setMind((prev) => ({
      ...prev,
      mood: review.mood,
      energy: review.energy,
      stress: review.stress,
    }));
    addDeposit('health', 'Nightly mindfulness & reflection review completed', 2);
  };

  // AI Coach API or smart contextual fallback
  const sendCoachMessage = async (queryText: string) => {
    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCoachMessages((prev) => [...prev, userMsg]);
    setIsCoachTyping(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          userData: {
            profile,
            scores,
            health,
            dailyMoney,
            timeAllocations,
            habits: habits.map((h) => ({ name: h.name, completed: h.completed, streak: h.streak })),
            goals: goals.map((g) => ({ title: g.title, current: g.current, target: g.target })),
            impulseWishlist: impulseWishlist.map((i) => ({ product: i.product, price: i.price, status: i.status })),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: CoachMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'coach',
          text: data.text || data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionableSteps: data.actionableSteps || [],
          trendComparisons: data.trendComparisons || [],
        };
        setCoachMessages((prev) => [...prev, aiMsg]);
        setIsCoachTyping(false);
        return;
      }
    } catch {
      // Fallback to local intelligent rule engine
    }

    // Smart contextual heuristic fallback modeled directly after prompt spec:
    setTimeout(() => {
      let replyText = '';
      let steps: string[] = [];
      let trends: { label: string; previous: string; current: string }[] = [];

      const lower = queryText.toLowerCase();

      if (lower.includes('unproductive') || lower.includes('focus') || lower.includes('tired')) {
        const leakItem = timeAllocations.find((t) => t.isLeak);
        const leakMins = leakItem ? leakItem.hours * 60 + leakItem.minutes : 0;
        const hasLogs = health.sleepHours > 0 || leakMins > 0 || health.workoutMinutes > 0;
        if (hasLogs) {
          replyText = `Analyzing your logged behavioral data:
• Sleep duration recorded at ${Math.floor(health.sleepHours)}h ${Math.round((health.sleepHours % 1) * 60)}m (target is ${health.sleepTarget}h).
• Social media / screen leak recorded at ${Math.floor(leakMins / 60)}h ${leakMins % 60}m today.
• Physical workout: ${health.workoutMinutes}m recorded today.

High-leverage focus for tomorrow:`;
          steps = [
            'Protect your sleep window by winding down screens 45 minutes before bed',
            'Batch phone notifications twice daily to reclaim fragmented attention',
            'Pair your skill learning habit right after your morning or evening routine',
          ];
          trends = [
            { label: 'Sleep duration', previous: `${health.sleepTarget}h target`, current: `${Math.floor(health.sleepHours)}h ${Math.round((health.sleepHours % 1) * 60)}m` },
            { label: 'Screen time leak', previous: 'Target ≤ 1h', current: `${Math.floor(leakMins / 60)}h ${leakMins % 60}m` },
            { label: 'Workout time', previous: `${health.workoutTarget}m target`, current: `${health.workoutMinutes}m` },
          ];
        } else {
          replyText = `All your logs are currently clean and set to zero by default.
To unlock predictive productivity insights and detect sneaky time leaks:
• Check off completed keystone habits in Habits & Routine.
• Allocate hours in Today's 24-Hour Time Breakdown under Focus.
• Log your physical movement or hydration to generate real-time health data.`;
          steps = [
            'Check off your first keystone habit today',
            'Allocate your 24-hour time breakdown in Productivity',
            'Log water hydration to jumpstart your Life Score',
          ];
        }
      } else if (lower.includes('wealth') || lower.includes('money') || lower.includes('save') || lower.includes('budget')) {
        replyText = `Your financial ledger summary:
• Logged income: ${profile.currencySymbol}${dailyMoney.income.toLocaleString()}
• Logged expenses: ${profile.currencySymbol}${dailyMoney.spending.toLocaleString()}
• Logged savings: ${profile.currencySymbol}${dailyMoney.saved.toLocaleString()}
• Active impulse checks: ${impulseWishlist.length} item(s)
• Total net assets: ${profile.currencySymbol}${totalNetAssets.toLocaleString()}`;
        steps = [
          'Log your daily transactions to keep budget leaks visible',
          'Use the 48-Hour Impulse Check before making non-essential purchases',
          'Set up a recurring micro-investment deposit target',
        ];
      } else if (lower.includes('health') || lower.includes('sleep') || lower.includes('workout') || lower.includes('step')) {
        replyText = `Your health pillar score is ${scores.health}/100 today. You've walked ${health.steps.toLocaleString()} steps and drank ${health.waterLiters}L of water so far.`;
        steps = [
          'Drink a glass of water to hydrate',
          'Hit your daily step goal of 8,000 steps',
          'Aim to turn off screens 45 minutes before sleep',
        ];
      } else {
        replyText = `Analyzing your 5 life pillars: Your Daily Life Score is ${scores.overall}/100.
As you check off keystone habits and log your daily routine, your composite scores and capital deposits will grow dynamically.`;
        steps = [
          'Check off your pending keystone habits in Habits & Routine',
          'Hydrate with water and log physical activity',
          'Complete your evening review before winding down',
        ];
      }

      const fallbackMsg: CoachMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'coach',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionableSteps: steps,
        trendComparisons: trends.length > 0 ? trends : undefined,
      };

      setCoachMessages((prev) => [...prev, fallbackMsg]);
      setIsCoachTyping(false);
    }, 600);
  };

  const togglePrivacyMode = () => {
    setProfile((prev) => ({ ...prev, isPrivacyMode: !prev.isPrivacyMode }));
  };

  const setPinLock = (pin: string | null) => {
    setProfile((prev) => ({ ...prev, pinLock: pin }));
  };

  const verifyPin = (pin: string) => {
    return profile.pinLock === pin;
  };

  const resetAllData = () => {
    setProfile(initialProfile);
    setHabits(initialHabits);
    setHealth(initialHealthMetrics);
    setTransactions(initialTransactions);
    setInvestments(initialInvestments);
    setImpulseWishlist(initialImpulseWishlist);
    setTimeAllocations(initialTimeAllocations);
    setLearning(initialLearning);
    setMind(initialMind);
    setGoals(initialGoals);
    setDeposits(initialDeposits);
    setMorningPriorities(initialMorningPriorities);
    setEveningReview(initialEveningReview);
    setCoachMessages(initialCoachMessages);
  };

  const exportDataJson = () => {
    const data = {
      profile,
      habits,
      health,
      transactions,
      investments,
      impulseWishlist,
      timeAllocations,
      learning,
      mind,
      goals,
      deposits,
      morningPriorities,
      eveningReview,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.profile) setProfile(data.profile);
      if (data.habits) setHabits(data.habits);
      if (data.health) setHealth(data.health);
      if (data.transactions) setTransactions(data.transactions);
      if (data.investments) setInvestments(data.investments);
      if (data.impulseWishlist) setImpulseWishlist(data.impulseWishlist);
      if (data.timeAllocations) setTimeAllocations(data.timeAllocations);
      if (data.learning) setLearning(data.learning);
      if (data.mind) setMind(data.mind);
      if (data.goals) setGoals(data.goals);
      if (data.deposits) setDeposits(data.deposits);
      return true;
    } catch {
      return false;
    }
  };

  // Storage Snapshot Facilities
  const [storageSnapshots, setStorageSnapshots] = useState<StorageSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_snapshots`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'snap-demo-1',
          name: 'Baseline Routine Setup',
          timestamp: '2026-09-24 18:30',
          sizeBytes: 14200,
          itemCount: 48,
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_snapshots`, JSON.stringify(storageSnapshots));
    } catch {}
  }, [storageSnapshots]);

  const storageStats = React.useMemo<StorageFacilityStats>(() => {
    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY)) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16 approx
        }
      }
    } catch {}

    const totalCount =
      habits.length +
      transactions.length +
      investments.length +
      impulseWishlist.length +
      learning.length +
      goals.length +
      deposits.length +
      morningPriorities.length;

    const kb = parseFloat((totalBytes / 1024).toFixed(2));
    const quotaPercent = parseFloat(((totalBytes / (5 * 1024 * 1024)) * 100).toFixed(3)); // 5MB standard quota

    return {
      totalBytes,
      kb,
      itemsCount: totalCount,
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      quotaPercent,
      status: 'healthy',
    };
  }, [habits, transactions, investments, impulseWishlist, learning, goals, deposits, morningPriorities]);

  const createSnapshot = (name?: string) => {
    const json = exportDataJson();
    const snapId = `snap-${Date.now()}`;
    const newSnapshot: StorageSnapshot = {
      id: snapId,
      name: name?.trim() || `Auto-Save Restore Point`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      sizeBytes: json.length * 2,
      itemCount: storageStats.itemsCount,
    };
    try {
      localStorage.setItem(`${STORAGE_KEY}_snap_data_${snapId}`, json);
      setStorageSnapshots((prev) => [newSnapshot, ...prev]);
    } catch {}
  };

  const restoreSnapshot = (id: string): boolean => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_snap_data_${id}`);
      if (!data) return false;
      return importDataJson(data);
    } catch {
      return false;
    }
  };

  const deleteSnapshot = (id: string) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_snap_data_${id}`);
      setStorageSnapshots((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthReady,
        signInWithGoogle,
        switchAccount,
        logout,
        authNotification,
        dismissAuthNotification: () => setAuthNotification(null),
        profile,
        setProfile,
        habits,
        toggleHabit,
        addHabit,
        editHabit,
        deleteHabit,
        health,
        updateHealth,
        addWater,
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        investments,
        updateInvestment,
        impulseWishlist,
        addImpulseItem,
        editImpulseItem,
        deleteImpulseItem,
        resolveImpulseItem,
        timeAllocations,
        updateTimeAllocation,
        learning,
        toggleLearningToday,
        addLearningMinutes,
        editLearning,
        deleteLearning,
        mind,
        updateMind,
        goals,
        addGoal,
        editGoal,
        deleteGoal,
        deposits,
        addDeposit,
        morningPriorities,
        toggleMorningPriority,
        addMorningPriority,
        editMorningPriority,
        deleteMorningPriority,
        eveningReview,
        saveEveningReview,
        coachMessages,
        sendCoachMessage,
        isCoachTyping,
        scores,
        dailyMoney,
        totalNetAssets,
        currencySymbol: profile.currencySymbol || '₹',
        isPrivacyMode: profile.isPrivacyMode,
        togglePrivacyMode,
        setPinLock,
        verifyPin,
        resetAllData,
        exportDataJson,
        importDataJson,
        storageStats,
        storageSnapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        salaryProfile: profile.salaryProfile || defaultSalaryProfile,
        updateSalaryProfile,
        toggleRecurringCommitment,
        addRecurringCommitment,
        editRecurringCommitment,
        deleteRecurringCommitment,
        creditMonthlySalary,
        executePaydayRoutine,
        salariedMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
