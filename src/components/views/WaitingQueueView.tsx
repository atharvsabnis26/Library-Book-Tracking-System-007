import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Layers,
  User,
  BookOpen,
  ArrowRightLeft
} from 'lucide-react';

export const WaitingQueueView: React.FC = () => {
  const { queue, books, students, addToWaitingQueue, removeFromQueue, processQueueForBook } = useLibrary();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '');

  // Filter queue items that are currently waiting
  const activeQueue = queue.filter(q => q.status === 'Waiting').sort((a, b) => a.position - b.position);
  const fulfilledQueue = queue.filter(q => q.status === 'Fulfilled');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId) return;
    addToWaitingQueue(selectedStudentId, selectedBookId);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* FIFO Explanation & Action Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 rounded-2xl p-6 border border-amber-800/40 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Data Structure: FIFO Queue
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">Book Reservation Waiting Queue</h3>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Enqueue Request</span>
          </button>
        </div>

        {/* Visual FIFO Lane Diagram */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 text-xs space-y-2">
          <div className="font-bold text-amber-300 flex items-center justify-between font-mono">
            <span>[FRONT (Next to serve)] ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ [REAR (Newest)]</span>
            <span>Active Items: {activeQueue.length}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {activeQueue.length === 0 ? (
              <span className="text-slate-500 italic">Queue is currently empty.</span>
            ) : (
              activeQueue.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {idx > 0 && <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />}
                  <div className="px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-700/60 text-slate-200 shrink-0 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                      #{item.position}
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs">{item.studentName}</div>
                      <div className="text-[10px] text-amber-300 truncate max-w-[120px]">{item.bookTitle}</div>
                    </div>
                  </div>
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Waiting Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Active FIFO Queue Requests ({activeQueue.length})
          </h4>
          <span className="text-xs text-slate-400 font-mono">First-In First-Out Processing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Queue Pos</th>
                <th className="p-4">Student</th>
                <th className="p-4">Book Requested</th>
                <th className="p-4">Request Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {activeQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No students currently waiting in queue.
                  </td>
                </tr>
              ) : (
                activeQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                            item.position === 1
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          #{item.position}
                        </span>
                        {item.position === 1 && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                            FRONT
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.studentName}</div>
                      <div className="text-xs text-slate-500">{item.studentEmail}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{item.bookTitle}</div>
                      <div className="text-xs font-mono text-slate-400">{item.bookId}</div>
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {item.requestDate}
                    </td>

                    <td className="p-4">
                      <Badge variant="amber">{item.status}</Badge>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => processQueueForBook(item.bookId)}
                        title="Process next request for this book"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Process Next
                      </button>

                      <button
                        onClick={() => removeFromQueue(item.id)}
                        title="Remove from queue"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enqueue Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enqueue Waiting Request (Push to REAR)"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Student
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Book Title
            </label>
            <select
              value={selectedBookId}
              onChange={e => setSelectedBookId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.id}) — {b.availableCopies} Copies Available
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-md shadow-amber-600/30"
            >
              Enqueue to Queue REAR
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
