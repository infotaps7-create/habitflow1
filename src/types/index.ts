export type PillarType = 'health' | 'wealth' | 'mind' | 'productivity' | 'lifestyle';

export interface Habit {
  id: string;
  name: string;
  pillar: PillarType;
  target: string;
  unit: string;
  completed: boolean;
  streak: number;
  consistency30Days: number; // e.g. 83%
  weeklyHistory: boolean[]; // 7 days [Mon...Sun]
  contributingGoalId?: string;
}

export interface HealthMetrics {
  sleepHours: number; // e.g. 7.5
  sleepTarget: number;
  waterLiters: number;
  waterTarget: number;
  steps: number;
  stepsTarget: number;
  workoutMinutes: number;
  workoutTarget: number;
  outdoorMinutes: number;
  outdoorTarget: number;
  junkFoodCount: number;
  weightKg: number;
  energyLevel: number; // 1-5
  screenTimeMinutes: number;
  screenTimeWeeklyAvg: number;
}

export type SalaryBucket = 'need' | 'want' | 'investment' | 'salary_inflow';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Salary Account' | 'Net Banking' | 'Auto-Debit' | 'Cash';

export interface RecurringCommitment {
  id: string;
  name: string;
  amount: number;
  category: string;
  bucket: 'need' | 'want' | 'investment';
  dueDay: number; // Day of month 1-31
  isPaidThisMonth: boolean;
  paymentMode: PaymentMethod;
}

export interface SalaryProfile {
  monthlyInHand: number;
  paydayDay: number; // e.g. 1st, 28th, 30th
  grossSalaryCTC?: number;
  epfMonthly?: number; // e.g. 3600 (employee + employer)
  taxTdsMonthly?: number; // e.g. 5000
  recurringCommitments: RecurringCommitment[];
}

export interface SalariedMetrics {
  monthlyInHand: number;
  grossSalaryCTC: number;
  epfMonthly: number;
  taxTdsMonthly: number;
  paydayDay: number;
  daysToPayday: number;
  daysElapsedInCycle: number;
  totalCycleDays: number;
  // 50-30-20 Rule metrics
  needsSpent: number;
  needsBudget: number; // 50%
  needsPercentOfBudget: number;
  wantsSpent: number;
  wantsBudget: number; // 30%
  wantsPercentOfBudget: number;
  investmentsTotal: number;
  investmentsBudget: number; // 20%
  investmentsPercentOfBudget: number;
  // Total cashflow & burn rate
  totalInflowThisMonth: number;
  totalExpensesThisMonth: number;
  totalInvestedThisMonth: number;
  currentCycleSavings: number;
  savingsRate: number; // %
  remainingDiscretionary: number;
  safeDailySpend: number;
  creditCardTotal: number;
  upiTotal: number;
  fixedCommitmentsTotal: number;
  fixedCommitmentsPaid: number;
}

export interface MoneyTransaction {
  id: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  amount: number;
  description: string;
  time: string;
  date?: string; // YYYY-MM-DD
  bucket?: SalaryBucket;
  paymentMethod?: PaymentMethod;
  isRecurring?: boolean;
}

export interface ImpulseWishlistItem {
  id: string;
  product: string;
  price: number;
  needScore: 'Must have' | 'Maybe' | 'Want only';
  canAfford: boolean;
  useOften: boolean;
  canWait48Hours: boolean;
  createdAt: string; // ISO
  expiresAt: string; // ISO (createdAt + 48h)
  status: 'waiting' | 'passed' | 'purchased';
  reason?: string;
}

export interface InvestmentAsset {
  id: string;
  category: 'Mutual Funds' | 'Stocks' | 'FD/RD' | 'Bonds' | 'Cash' | 'EPF / PF' | 'PPF' | 'NPS' | string;
  amount: number;
  returnRate: number; // e.g. 12%
  allocationPercent: number;
}

export interface TimeAllocation {
  id: string;
  category: string;
  hours: number;
  minutes: number;
  pillar: PillarType;
  color: string;
  isLeak?: boolean;
}

export interface LearningItem {
  id: string;
  title: string;
  type: 'book' | 'skill' | 'course';
  progressPercent: number;
  timeThisMonthHours: number;
  todayMinutes: number;
  completedToday: boolean;
}

export interface MindMetrics {
  mood: number; // 1-5
  energy: number; // 1-5
  stress: number; // 1-5
  highlight: string;
  gratitude: string;
  familyTimeMinutes: number;
}

export interface Goal {
  id: string;
  title: string;
  pillar: PillarType;
  current: number;
  target: number;
  unit: string;
  linkedHabits: string[];
  contributionRate: number; // e.g. 76%
  targetYear: string;
}

export interface LifeBankDeposit {
  id: string;
  pillar: PillarType;
  category: 'health' | 'wealth' | 'knowledge' | 'relationships';
  label: string;
  tokens: number;
  time: string;
}

export interface MorningPriority {
  id: string;
  pillar: PillarType;
  text: string;
  completed: boolean;
}

export interface EveningReview {
  mood: number;
  energy: number;
  stress: number;
  accomplishments: string[];
  whatCouldImprove: string;
  tomorrowFocus: string;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  title: string;
  avatarUrl: string;
  currencySymbol: string;
  level: number;
  levelTitle: string;
  todayXp: number;
  totalXp: number;
  consistencyStreakDays: number;
  isPrivacyMode: boolean;
  pinLock: string | null;
  salaryProfile?: SalaryProfile;
}

export interface LifeScores {
  overall: number;
  health: number;
  wealth: number;
  mind: number;
  productivity: number;
  lifestyle: number;
}

export interface StorageSnapshot {
  id: string;
  name: string;
  timestamp: string;
  sizeBytes: number;
  itemCount: number;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  actionableSteps?: string[];
  trendComparisons?: { label: string; previous: string; current: string }[];
  sources?: { title: string; uri: string }[];
  modelUsed?: string;
}
