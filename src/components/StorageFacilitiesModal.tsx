import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  HardDrive,
  Database,
  Download,
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  Server,
  Layers,
  Cloud,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface StorageFacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageFacilitiesModal: React.FC<StorageFacilitiesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    storageStats,
    storageSnapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    exportDataJson,
    importDataJson,
    currentUser,
    signInWithGoogle,
    switchAccount,
    logout,
  } = useApp();

  const [snapshotName, setSnapshotName] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [restoringSnapshot, setRestoringSnapshot] = useState<{ id: string; name: string } | null>(null);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    createSnapshot(snapshotName.trim() || undefined);
    setSnapshotName('');
    setFeedbackMsg('✓ Instant storage snapshot created & indexed!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleConfirmRestore = () => {
    if (!restoringSnapshot) return;
    const ok = restoreSnapshot(restoringSnapshot.id);
    if (ok) {
      setFeedbackMsg(`✓ State restored from snapshot: ${restoringSnapshot.name}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(`❌ Failed to read snapshot data.`);
    }
    setRestoringSnapshot(null);
  };

  const handleDownload = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow_lifeos_vault_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMsg('✓ Full data vault downloaded.');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJson(content);
        if (ok) {
          setFeedbackMsg('✓ Database file restored successfully!');
          setTimeout(() => setFeedbackMsg(null), 3000);
        } else {
          setFeedbackMsg('❌ Failed to parse backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

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
            className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl max-h-[90vh] overflow-y-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Storage Facilities &amp; Data Vault
                  </h2>
                  <p className="text-xs text-slate-500">
                    Continuous local persistence, versioned restore points, and export facilities.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Live Storage Health & Quota Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-400 block font-sans font-medium">
              Storage Used
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block tabular-nums">
              {storageStats.kb} KB
            </span>
            <span className="text-[10px] text-slate-500">
              ({storageStats.totalBytes.toLocaleString()} bytes)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-400 block font-sans font-medium">
              Entities Indexed
            </span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block tabular-nums">
              {storageStats.itemsCount} Records
            </span>
            <span className="text-[10px] text-slate-500">
              Habits, TXs, Goals, Mind
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-400 block font-sans font-medium">
              Quota Capacity
            </span>
            <span className="text-base font-bold text-emerald-700 mt-0.5 block tabular-nums">
              {storageStats.quotaPercent}%
            </span>
            <span className="text-[10px] text-slate-500">
              of 5.0 MB sandboxed
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase text-slate-400 block font-sans font-medium">
              Sync Status
            </span>
            <span className="text-base font-bold text-emerald-700 mt-0.5 block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy
            </span>
            <span className="text-[10px] text-slate-500">
              Saved {storageStats.lastSaved}
            </span>
          </div>
        </div>

        {/* Cloud Database (Firebase Firestore) Sync Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50/80 to-emerald-50/60 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Google Cloud Firestore Database
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800">
                  Provisioned
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentUser ? (
                  <span>
                    Connected to cloud database. Real-time auto-sync is <strong>Active</strong> for{' '}
                    <span className="font-semibold text-slate-800">{currentUser.email}</span>.
                  </span>
                ) : (
                  <span>
                    Sign in with Google to enable automatic cloud backup and multi-device sync with your Firestore instance.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
            {currentUser ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={switchAccount}
                  title="Switch to another Google account"
                  className="w-1/2 sm:w-auto px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-sky-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  <span>Switch Account</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-1/2 sm:w-auto px-3.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-300 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Snapshot / Restore Point Facilities */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Versioned Restore Points (Snapshots)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Capture frozen points in time. Roll back habits, financial assets, or routines whenever needed.
              </p>
            </div>
          </div>

          {/* Create Snapshot Input */}
          <form onSubmit={handleCreateSnapshot} className="flex gap-2">
            <input
              type="text"
              placeholder="Label this snapshot (e.g. 'Post-Paycheck Rebalance' or 'New Habits Quarter')"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Snapshot</span>
            </button>
          </form>

          {/* Snapshots Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {storageSnapshots.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No custom snapshots recorded yet. Create one above to protect your current life state.
              </div>
            ) : (
              storageSnapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{snap.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{snap.timestamp}</span>
                      <span>·</span>
                      <span>{(snap.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span>·</span>
                      <span>{snap.itemCount} entities</span>
                    </div>
                  </div>

                  {/* Actions by Symbols */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRestoringSnapshot({ id: snap.id, name: snap.name })}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                      title="Restore to this snapshot point"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                    <button
                      onClick={() => deleteSnapshot(snap.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Physical File Backup & Transfer */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-700" />
            <span>Physical Backup & Restore</span>
          </h3>
          <p className="text-xs text-slate-500">
            Export a full offline JSON file to your device or restore from a previous backup file.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownload}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download Vault File (.json)</span>
            </button>

            <label className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Upload Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Multi-User Cloud & Local Sovereignty Footer Notice */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Multi-User Cloud &amp; Local Isolation:</strong> Multiple users can sign in using their respective Google accounts. Each account connects to its own private, isolated document path in Google Cloud Firestore (<code className="text-slate-700 font-mono">/users/&#123;userId&#125;</code>) with client-side cache sandboxing.
          </p>
        </div>
      </motion.div>

      {/* Snapshot Restore Confirmation Modal */}
      {restoringSnapshot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRestoringSnapshot(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            className="relative bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Restore Snapshot?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Restore state to <span className="font-semibold text-slate-800">"{restoringSnapshot.name}"</span>? Current unsaved modifications will be replaced.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestoringSnapshot(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="w-1/2 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Restore
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )}
</AnimatePresence>
  );
};

