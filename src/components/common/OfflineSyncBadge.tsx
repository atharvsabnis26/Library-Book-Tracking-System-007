import React, { useState } from 'react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { useLibrary } from '../../context/LibraryContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  Trash2,
  HardDrive,
  Radio,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export const OfflineSyncBadge: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    effectiveIsOnline,
    pendingSyncQueue,
    pendingSyncCount,
    isSyncing,
    lastSyncedAt,
    toggleSimulatedOffline,
    syncNow,
    clearQueue,
    removeItemFromQueue
  } = useOfflineSync();

  const { addToast } = useLibrary();
  const [isOpen, setIsOpen] = useState(false);

  const handleManualSync = async () => {
    if (!effectiveIsOnline) {
      addToast('Cannot synchronize while offline. Please turn off simulated offline mode or connect to internet.', 'warning', 'Offline Mode');
      return;
    }
    const res = await syncNow();
    if (res.syncedCount > 0) {
      addToast(`Synchronized ${res.syncedCount} queued change(s) with remote storage!`, 'success', 'Sync Complete');
    } else {
      addToast('Data storage is fully up to date.', 'info', 'In Sync');
    }
  };

  return (
    <>
      {/* Header Sticky Badge Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
            !effectiveIsOnline
              ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
              : pendingSyncCount > 0
              ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/40 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20'
              : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
          }`}
          title="Click to view Local Storage & Offline Sync Status"
        >
          {!effectiveIsOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Offline Mode</span>
              {pendingSyncCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {pendingSyncCount}
                </span>
              )}
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : pendingSyncCount > 0 ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>{pendingSyncCount} Pending Sync</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Online (Synced)</span>
              <span className="sm:hidden">Online</span>
            </>
          )}
        </button>
      </div>

      {/* Sync Drawer / Inspection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${!effectiveIsOnline ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {!effectiveIsOnline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>Offline Sync & Service Worker Manager</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Monitors local storage changes, queues offline mutations, and auto-syncs.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-xs">
              {/* Status Banner & Simulation Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>Connection Status:</span>
                    <span className={effectiveIsOnline ? 'text-emerald-600 dark:text-emerald-400 font-mono font-bold' : 'text-amber-600 dark:text-amber-400 font-mono font-bold'}>
                      {effectiveIsOnline ? 'ONLINE' : 'OFFLINE (QUEUING DATA)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {effectiveIsOnline
                      ? 'Connected to web storage engine. Auto-sync active.'
                      : 'Changes made now will be saved locally in queue and flushed when reconnected.'}
                  </p>
                </div>

                <button
                  onClick={toggleSimulatedOffline}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 shrink-0 ${
                    isSimulatedOffline
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                      : 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                  }`}
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{isSimulatedOffline ? 'Go Online' : 'Simulate Offline Mode'}</span>
                </button>
              </div>

              {/* Service Worker Info Row */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">Service Worker Cache</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {'serviceWorker' in navigator ? 'Active (v1 Cache)' : 'Fallback LocalStorage'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">Last Server Sync</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Just Now'}
                  </span>
                </div>
              </div>

              {/* Pending Queue Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Queued Offline Mutations ({pendingSyncCount})</span>
                  </h4>

                  {pendingSyncCount > 0 && (
                    <button
                      onClick={clearQueue}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-mono"
                    >
                      <Trash2 className="w-3 h-3" /> Clear Queue
                    </button>
                  )}
                </div>

                {pendingSyncCount === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-80" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">All local mutations synchronized!</p>
                    <p className="text-[11px] text-slate-500">
                      Try clicking "Simulate Offline Mode" above and adding/issuing a book to test the sync queue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {pendingSyncQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 font-mono"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {item.actionType}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.description}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItemFromQueue(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                {effectiveIsOnline ? 'Ready for auto-flush' : 'Offline Mode Active'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || !effectiveIsOnline}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
