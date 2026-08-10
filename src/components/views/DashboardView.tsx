import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from '../common/Badge';
import {
  BookOpen,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  PlusCircle,
  Search,
  ArrowDownLeft,
  Cpu,
  User,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { books, transactions, queue, setActiveTab } = useLibrary();

  const totalBooks = books.reduce((acc, b) => acc + b.quantity, 0);
  const availableBooks = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const issuedBooks = totalBooks - availableBooks;
  const pendingRequests = queue.filter(q => q.status === 'Waiting').length;

  const recentlyAdded = books.slice(0, 4);
  const recentlyIssued = transactions
    .filter(t => t.type === 'Issue' && t.status === 'Active')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Total Inventory
          </p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {totalBooks}
          </h3>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">
            +12 new this week • {books.length} Titles
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Currently Issued
          </p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {issuedBooks}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-2">
            {totalBooks > 0 ? ((issuedBooks / totalBooks) * 100).toFixed(1) : '0'}% of collection
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Available Copies
          </p>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            {availableBooks}
          </h3>
          <p className="text-xs text-green-500 font-medium mt-2">
            Ready for instant issue
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Queue Length
          </p>
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            {pendingRequests}
          </h3>
          <p className="text-xs text-blue-500 dark:text-blue-400 font-medium mt-2">
            FIFO Processing
          </p>
        </div>
      </section>

      {/* Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Section: Recently Issued Books (2 Cols) */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Recently Issued Books</h2>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold uppercase tracking-wide"
            >
              View All History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {recentlyIssued.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No active issued loans recorded.
                    </td>
                  </tr>
                ) : (
                  recentlyIssued.map(txn => (
                    <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 font-mono">
                        {txn.studentId}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                        {txn.bookTitle}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {txn.issueDate}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {txn.dueDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="indigo">ACTIVE</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Section: DS Visualizer & Quick Operations (1 Col) */}
        <section className="col-span-1 flex flex-col space-y-4">
          {/* DS Visualizer Highlight Card */}
          <div className="bg-[#0f172a] rounded-xl p-4 text-white flex-1 relative overflow-hidden border border-slate-800 shadow-sm">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">DS Visualizer</h2>
                <button
                  onClick={() => setActiveTab('ds_visualizer')}
                  className="text-[10px] text-blue-300 hover:underline font-mono"
                >
                  Open Visualizer →
                </button>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Issue Queue (FIFO)</p>
                <div className="flex space-x-2">
                  <div className="flex-1 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-mono text-blue-300">
                    S-01
                  </div>
                  <div className="flex-1 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-mono text-blue-300">
                    S-02
                  </div>
                  <div className="flex-1 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] font-mono text-blue-300">
                    S-03
                  </div>
                  <div className="flex-1 h-8 bg-slate-800/50 rounded border border-dashed border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                    Empty
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Book Linked List</p>
                <div className="flex items-center space-x-1">
                  <div className="w-10 h-6 bg-blue-600 rounded text-[9px] font-bold flex items-center justify-center text-white">
                    B1
                  </div>
                  <div className="text-blue-400 text-xs">→</div>
                  <div className="w-10 h-6 bg-blue-600 rounded text-[9px] font-bold flex items-center justify-center text-white">
                    B2
                  </div>
                  <div className="text-blue-400 text-xs">→</div>
                  <div className="w-10 h-6 bg-blue-600 rounded text-[9px] font-bold flex items-center justify-center text-white">
                    B3
                  </div>
                  <div className="text-blue-400 text-xs">→</div>
                  <div className="text-[9px] text-slate-500 font-mono">NULL</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 italic font-serif leading-relaxed">
                  "The system uses Linked Lists for O(1) insertions of new book nodes and Queues to ensure fair FIFO student requesting."
                </p>
              </div>
            </div>
          </div>

          {/* Quick Operations Grid */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Quick Operations</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('issue')}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
              >
                Issue Book
              </button>
              <button
                onClick={() => setActiveTab('return')}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
              >
                Return Book
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
              >
                Add Member
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
              >
                Print Report
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
