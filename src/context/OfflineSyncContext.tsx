import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PendingSyncItem,
  getPendingSyncQueue,
  savePendingSyncQueue,
  queueSyncAction,
  clearPendingSyncQueue,
  removePendingSyncItem,
  getLastSyncedAt,
  updateLastSyncedAt
} from '../utils/syncManager';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveIsOnline: boolean;
  pendingSyncQueue: PendingSyncItem[];
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  toggleSimulatedOffline: () => void;
  recordOfflineAction: (
    actionType: PendingSyncItem['actionType'],
    description: string,
    payload: any
  ) => void;
  syncNow: () => Promise<{ success: boolean; syncedCount: number }>;
  clearQueue: () => void;
  removeItemFromQueue: (id: string) => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<PendingSyncItem[]>(() => getPendingSyncQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => getLastSyncedAt());

  const effectiveIsOnline = isOnline && !isSimulatedOffline;

  // Sync state with storage on mount and changes
  const refreshQueueState = useCallback(() => {
    setPendingSyncQueue(getPendingSyncQueue());
  }, []);

  // Monitor Network Online / Offline Events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker for offline asset caching & background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Library Service Worker registered successfully', reg.scope);
        })
        .catch((err) => {
          console.debug('Service Worker registration skipped or restricted in iframe environment', err);
        });

      // Listen for SW messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_TRIGGERED') {
          syncNow();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Record action in queue if offline or always track for audit trail
  const recordOfflineAction = useCallback((
    actionType: PendingSyncItem['actionType'],
    description: string,
    payload: any
  ) => {
    const newItem = queueSyncAction(actionType, description, payload);
    setPendingSyncQueue(prev => [newItem, ...prev]);
  }, []);

  // Flush and Synchronize Queue with Server
  const syncNow = useCallback(async () => {
    const currentQueue = getPendingSyncQueue();
    if (currentQueue.length === 0) {
      const now = updateLastSyncedAt();
      setLastSyncedAt(now);
      return { success: true, syncedCount: 0 };
    }

    setIsSyncing(true);

    // Simulate network server delay for synchronization
    await new Promise(resolve => setTimeout(resolve, 1200));

    clearPendingSyncQueue();
    setPendingSyncQueue([]);
    const now = updateLastSyncedAt();
    setLastSyncedAt(now);
    setIsSyncing(false);

    // Request Service Worker Background Sync tag if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        // @ts-ignore
        await reg.sync.register('sync-library-mutations');
      } catch (e) {
        // Fallback
      }
    }

    return { success: true, syncedCount: currentQueue.length };
  }, []);

  // Auto sync when connection returns from offline -> online
  useEffect(() => {
    if (effectiveIsOnline && pendingSyncQueue.length > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        syncNow();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [effectiveIsOnline, pendingSyncQueue.length, isSyncing, syncNow]);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline(prev => !prev);
  }, []);

  const clearQueue = useCallback(() => {
    clearPendingSyncQueue();
    setPendingSyncQueue([]);
  }, []);

  const removeItemFromQueue = useCallback((id: string) => {
    removePendingSyncItem(id);
    setPendingSyncQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveIsOnline,
        pendingSyncQueue,
        pendingSyncCount: pendingSyncQueue.length,
        isSyncing,
        lastSyncedAt,
        toggleSimulatedOffline,
        recordOfflineAction,
        syncNow,
        clearQueue,
        removeItemFromQueue
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
};
