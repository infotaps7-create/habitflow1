import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  X,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  HardDrive,
  Cloud,
  LogIn,
  LogOut,
  Users,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStorage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenStorage,
}) => {
  const {
    profile,
    setProfile,
    isPrivacyMode,
    togglePrivacyMode,
    resetAllData,
    currentUser,
    signInWithGoogle,
    switchAccount,
    logout,
  } = useApp();

  const [nameInput, setNameInput] = useState(profile.name);
  const [pinInput, setPinInput] = useState(profile.pinLock || '');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: nameInput.trim() || 'Kiran',
      pinLock: pinInput.trim().length === 4 ? pinInput.trim() : null,
    }));
    onClose();
  };

  const currencies = [
    { symbol: '₹', label: 'INR (₹)' },
    { symbol: '$', label: 'USD ($)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '£', label: 'GBP (£)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Settings &amp; Account Preferences
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Google Cloud Account & Firestore Sync */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{currentUser ? 'Cloud Firestore Connected' : 'Google Cloud Account'}</span>
                  {currentUser && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                  {currentUser
                    ? currentUser.email
                    : 'Sign in to auto-backup habits and ledger to private Firestore'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={switchAccount}
                    title="Switch to another Google account"
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-sky-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span>Switch User</span>
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-300 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Multiple users can sign in with different Google accounts. Each account is fully isolated.</span>
          </div>
        </div>

        {/* Profile & Name */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Currency Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map((c) => (
                <button
                  type="button"
                  key={c.symbol}
                  onClick={() => setProfile((prev) => ({ ...prev, currencySymbol: c.symbol }))}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                    profile.currencySymbol === c.symbol
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4-Digit Security PIN */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                4-Digit Security PIN Lock
              </label>
              {profile.pinLock && (
                <span className="text-[10px] font-mono text-emerald-700 font-bold">PIN Active</span>
              )}
            </div>
            <input
              type="password"
              maxLength={4}
              placeholder="e.g. 1234 (Leave blank to disable)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Protects sensitive health and wealth metrics with a lock screen.
            </span>
          </div>

          {/* Privacy Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Privacy Mode (Mask Figures)</div>
              <div className="text-[10px] text-slate-500">
                Obscures monetary amounts and assets with •••• for public spaces.
              </div>
            </div>
            <button
              type="button"
              onClick={togglePrivacyMode}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isPrivacyMode
                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>

        {/* Link to Storage Facilities */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">Storage Facilities & Vault</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenStorage();
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Manage Snapshots & Backups →
          </button>
        </div>

        {/* Reset Demo Data */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {!isConfirmingReset ? (
            <button
              type="button"
              onClick={() => setIsConfirmingReset(true)}
              className="py-1.5 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seed Demo Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl w-full justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Reset all metrics, habits, and balance?</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white rounded-lg border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setIsConfirmingReset(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};

