import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { HabitsView } from './components/HabitsView';
import { WealthView } from './components/WealthView';
import { ProductivityView } from './components/ProductivityView';
import { InsightsView } from './components/InsightsView';
import { SettingsModal } from './components/SettingsModal';
import { StorageFacilitiesModal } from './components/StorageFacilitiesModal';
import {
  Home,
  CheckSquare,
  Coins,
  BarChart3,
  Sparkles,
  Lock,
  User,
  HardDrive,
  AlertCircle,
  X,
  Activity,
  Target,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { profile, verifyPin, authNotification, dismissAuthNotification } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStorageOpen, setIsStorageOpen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(() => !!profile.pinLock);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(enteredPin)) {
      setIsLocked(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin('');
    }
  };

  // If PIN lock is active and locked
  if (isLocked && profile.pinLock) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200/90 rounded-3xl max-w-sm w-full p-8 text-center space-y-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">HabitFlow Protected</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your 4-digit security PIN to unlock your personal HabitFlow LifeOS.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <motion.div
              animate={pinError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value.replace(/\D/g, ''));
                  setPinError(false);
                }}
                className="w-full text-center text-2xl font-mono tracking-widest px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </motion.div>
            {pinError && (
              <span className="text-xs font-mono text-rose-600 font-semibold block">
                Incorrect PIN. Please try again.
              </span>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Unlock HabitFlow
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 md:pb-6">
      {/* Top Bar Contract Navigation in Light Tone */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStorage={() => setIsStorageOpen(true)}
      />

      {/* Auth / System Notification Banner */}
      <AnimatePresence>
        {authNotification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-amber-50 border-b border-amber-200"
          >
            <div className="px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 max-w-7xl mx-auto">
              <div className="flex items-center gap-2 flex-1">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{authNotification}</span>
              </div>
              <button
                onClick={dismissAuthNotification}
                className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Area with Smooth Animated Transitions */}
      <main className="flex-1 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {currentTab === 'dashboard' && <DashboardView onNavigate={(t) => setCurrentTab(t)} />}
            {currentTab === 'habits' && <HabitsView />}
            {currentTab === 'wealth' && <WealthView />}
            {currentTab === 'productivity' && <ProductivityView />}
            {currentTab === 'insights' && <InsightsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar (Optimized for one-hand thumb reach) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 flex items-center justify-around shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
            currentTab === 'dashboard' ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('habits')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
            currentTab === 'habits' ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Habits</span>
        </button>

        <button
          onClick={() => setCurrentTab('wealth')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
            currentTab === 'wealth' ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Wealth</span>
        </button>

        <button
          onClick={() => setCurrentTab('productivity')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
            currentTab === 'productivity' ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Focus</span>
        </button>

        <button
          onClick={() => setCurrentTab('insights')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
            currentTab === 'insights' ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Insights</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenStorage={() => setIsStorageOpen(true)}
      />

      {/* Storage Facilities Modal */}
      <StorageFacilitiesModal
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
