import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ArrowUpRight, BookOpen, User, Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const IssueBookView: React.FC = () => {
  const { books, students, issueBook, addToWaitingQueue, setActiveTab } = useLibrary();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Default due date = today + 14 days
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedBook = books.find(b => b.id === selectedBookId);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId) {
      alert('Please select both a student and a book.');
      return;
    }

    const res = issueBook(selectedStudentId, selectedBookId, issueDate, dueDate);

    if (res.joinedQueue) {
      // Auto navigated to queue tab if desired or prompt
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Issue Book Transaction</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create a new loan record, decrement available inventory copies, or join FIFO queue if 0 copies remain.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('barcode_rfid')}
          className="px-4 py-2 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <span>📷 Scan Barcode / RFID Tag</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleIssueSubmit} className="space-y-5">
            {/* Student Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Select Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) — {s.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Select Book to Issue *
              </label>
              <select
                value={selectedBookId}
                onChange={e => setSelectedBookId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.id}) — {b.availableCopies} Copies Available
                  </option>
                ))}
              </select>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Return Due Date (14 Days)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  selectedBook && selectedBook.availableCopies > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                }`}
              >
                {selectedBook && selectedBook.availableCopies > 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Issue Book Now
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" /> Join Waiting Queue (FIFO)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Selected Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">Transaction Summary</h4>

            {/* Student details */}
            {selectedStudent && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 mb-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Student Profile</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedStudent.name}</div>
                <div className="text-xs text-slate-500">{selectedStudent.department}</div>
                <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 pt-1">
                  RFID Card: {selectedStudent.rfidCard}
                </div>
              </div>
            )}

            {/* Book details */}
            {selectedBook && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Book</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedBook.title}</div>
                <div className="text-xs text-slate-500">By {selectedBook.author}</div>
                <div className="pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Rack: <strong className="text-blue-600 dark:text-blue-400">{selectedBook.locationRack}</strong> • RFID: <strong className="text-amber-500">{selectedBook.rfidTag}</strong>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <Badge
                    variant={selectedBook.availableCopies > 0 ? 'success' : 'danger'}
                  >
                    {selectedBook.availableCopies} Available
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">{selectedBook.id}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
            <div className="font-bold font-mono text-indigo-300">Data Structures Effect:</div>
            <p>• Updates Book Array available Copies count</p>
            <p>• Pushes Transaction node into audit trail</p>
            {selectedBook && selectedBook.availableCopies === 0 && (
              <p className="text-amber-300 font-semibold">• Enqueues request into FIFO Waiting Queue</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
