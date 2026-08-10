export interface PendingSyncItem {
  id: string;
  actionType: 'ADD_BOOK' | 'UPDATE_BOOK' | 'DELETE_BOOK' | 'ADD_STUDENT' | 'UPDATE_STUDENT' | 'DELETE_STUDENT' | 'ISSUE_BOOK' | 'RETURN_BOOK' | 'QUEUE_ADD' | 'RESET_DATA';
  description: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed';
}

const SYNC_QUEUE_KEY = 'library_pending_sync_queue';
const LAST_SYNC_KEY = 'library_last_synced_at';

// Load queue from localStorage
export const getPendingSyncQueue = (): PendingSyncItem[] => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading sync queue from storage', e);
    return [];
  }
};

// Save queue to localStorage
export const savePendingSyncQueue = (queue: PendingSyncItem[]) => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving sync queue to storage', e);
  }
};

// Add new mutation to offline sync queue
export const queueSyncAction = (
  actionType: PendingSyncItem['actionType'],
  description: string,
  payload: any
): PendingSyncItem => {
  const newItem: PendingSyncItem = {
    id: 'SYNC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    actionType,
    description,
    payload,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  const queue = getPendingSyncQueue();
  const updatedQueue = [newItem, ...queue];
  savePendingSyncQueue(updatedQueue);
  return newItem;
};

// Clear completed sync items
export const clearPendingSyncQueue = () => {
  localStorage.removeItem(SYNC_QUEUE_KEY);
};

// Remove single item from queue
export const removePendingSyncItem = (id: string) => {
  const queue = getPendingSyncQueue();
  const updated = queue.filter(item => item.id !== id);
  savePendingSyncQueue(updated);
};

// Get last synced timestamp
export const getLastSyncedAt = (): string | null => {
  return localStorage.getItem(LAST_SYNC_KEY);
};

// Update last synced timestamp
export const updateLastSyncedAt = () => {
  const now = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, now);
  return now;
};
