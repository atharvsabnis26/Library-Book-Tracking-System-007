import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import { ArrowDownLeft, Search, User, Calendar, BookOpen, CheckCircle2 } from 'lucide-react';

export const ReturnBookView: React.FC = () => {
  const { transactions, returnBook, queue } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');

  // Active loan transactions
  const activeTransactions = transactions.filter(t => t.type === 'Issue' && t.status === 'Active');

  const filtered = activeTransactions.filter(t => {
    const q = searchTerm.toLowerCase().trim();
    return (
      t.studentName.toLowerCase().includes(q) ||
      t.studentId.toLowerCase().includes(q) ||
      t.bookTitle.toLowerCase().includes(q) ||
      t.bookId.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Return Book Processing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Process active loans, restore book inventory copies, and check for pending FIFO queue requests.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student or book ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Active Loans Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Active Issued Loans ({filtered.length})
          </h4>
          <span className="text-xs text-slate-400 font-mono">Select transaction to return</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Txn ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Queue Waitlist</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active issued loans found matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(txn => {
                  const waitingForThisBook = queue.filter(
                    q => q.bookId === txn.bookId && q.status === 'Waiting'
                  ).length;

                  const isOverdue = new Date(txn.dueDate) < new Date();

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {txn.id}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{txn.studentName}</div>
                        <div className="text-xs font-mono text-slate-400">{txn.studentId}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{txn.bookTitle}</div>
                        <div className="text-xs font-mono text-slate-400">{txn.bookId}</div>
                      </td>

                      <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {txn.issueDate}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {txn.dueDate} {isOverdue && '(OVERDUE)'}
                        </span>
                      </td>

                      <td className="p-4">
                        {waitingForThisBook > 0 ? (
                          <Badge variant="amber">{waitingForThisBook} Waiting in Queue</Badge>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">None</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => returnBook(txn.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Return
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
