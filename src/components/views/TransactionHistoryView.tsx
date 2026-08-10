import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import { History, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { transactions } = useLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'ISSUED' && t.type === 'Issue' && t.status === 'Active') ||
      (filterType === 'RETURNED' && t.type === 'Return' || t.status === 'Returned') ||
      (filterType === 'QUEUED' && t.type === 'Queue_Request');

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Transaction Audit History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable system event log for book issuance, returns, and queue requests.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {['ALL', 'ISSUED', 'RETURNED'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  filterType === type
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Transaction ID, Student, or Book Title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Txn ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Student</th>
                <th className="p-4">Book</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filtered.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {txn.id}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                        {txn.type === 'Issue' && (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> Issue
                          </>
                        )}
                        {txn.type === 'Return' && (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5 text-sky-500" /> Return
                          </>
                        )}
                        {txn.type === 'Queue_Request' && (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> Queue
                          </>
                        )}
                      </span>
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

                    <td className="p-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {txn.dueDate}
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          txn.status === 'Active'
                            ? 'info'
                            : txn.status === 'Returned'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
